import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { env as pub } from '$env/dynamic/public';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';
import { BOOTH } from '$lib/schedule';
import type { RequestHandler } from './$types';

export const prerender = false;

type Sub = { endpoint: string; p256dh: string; auth: string; name: string | null; level: 'all' | 'help' };
type Msg = { title: string; body: string; url: string; tag: string };
/** 받침에 맞춰 '로/으로' 붙이기 (보물상자로, 책갈피 공방으로) */
function ro(w: string) {
	const c = w.charCodeAt(w.length - 1) - 0xac00;
	if (c < 0 || c > 11171) return w + '로';
	const jong = c % 28;
	return w + (jong === 0 || jong === 8 ? '로' : '으로');
}
const FRESH_MS = 90_000; // 방금 바뀐 상태·공지만 알려요 (임의 호출로 스팸 못 보내게)

export const POST: RequestHandler = async ({ request, url }) => {
	const sbUrl = pub.PUBLIC_SUPABASE_URL, key = env.SUPABASE_SERVICE_ROLE_KEY;
	const vPub = pub.PUBLIC_VAPID_KEY, vPriv = env.VAPID_PRIVATE_KEY;
	if (!sbUrl || !key || !vPub || !vPriv) return json({ ok: false, reason: 'not configured' }, { status: 503 });
	webpush.setVapidDetails(env.VAPID_SUBJECT || url.origin, vPub, vPriv);
	const db = createClient(sbUrl, key, { auth: { persistSession: false } });

	const body = await request.json().catch(() => null);
	if (!body || typeof body.type !== 'string') return json({ ok: false }, { status: 400 });

	let msg: Msg, dedupe: string, actor: string | null = null, onlyHelp = false, only: string | null = null;

	if (body.type === 'status') {
		const { data: s } = await db.from('booth_status').select('*').eq('booth', String(body.booth)).maybeSingle();
		if (!s || s.status === 'ok' || Date.now() - new Date(s.updated_at).getTime() > FRESH_MS) return json({ ok: false, reason: 'stale' });
		const name = BOOTH[s.booth]?.name ?? s.booth;
		actor = s.updated_by;
		const help = s.status === 'help';
		onlyHelp = !help;
		msg = help
			? { title: `🆘 ${name} 도움 필요`, body: `${s.updated_by ? s.updated_by + '님이' : '운영요원이'} 도움을 요청했어요. 가까이 있는 분은 ${ro(name)} 가 주세요.`, url: `/staff/booths/${encodeURIComponent(s.booth)}`, tag: `b-${s.booth}` }
			: { title: `⏳ ${name} 대기 많음`, body: `${s.updated_by ? s.updated_by + '님이' : '운영요원이'} 알렸어요. 지원 중인 분은 여유 있으면 ${ro(name)} 가 주세요.`, url: `/staff/booths/${encodeURIComponent(s.booth)}`, tag: `b-${s.booth}` };
		dedupe = `status:${s.booth}:${s.status}`;
	} else if (body.type === 'notice') {
		const { data: n } = await db.from('notices').select('*').eq('id', Number(body.id)).maybeSingle();
		if (!n || Date.now() - new Date(n.created_at).getTime() > FRESH_MS) return json({ ok: false, reason: 'stale' });
		actor = n.author;
		msg = { title: `📢 공지${n.author ? ' · ' + n.author : ''}`, body: n.body, url: '/staff/info#notices', tag: `n-${n.id}` };
		dedupe = `notice:${n.id}`;
	} else if (body.type === 'test') {
		only = String(body.endpoint ?? '');
		msg = { title: '다다랜드 알림 테스트', body: '알림이 잘 와요! 행사 날 도움 요청·공지를 이렇게 알려 드려요.', url: '/staff', tag: 'test' };
		dedupe = `test:${only.slice(-40)}`;
	} else return json({ ok: false }, { status: 400 });

	// 같은 알림은 2분에 한 번만
	const { data: claimed } = await db.rpc('claim_push', { p_key: dedupe, p_seconds: 120 });
	if (!claimed) return json({ ok: true, skipped: 'duplicate' });

	let q = db.from('push_subs').select('endpoint,p256dh,auth,name,level');
	if (only) q = q.eq('endpoint', only);
	const { data: subs } = await q;
	const targets = ((subs ?? []) as Sub[]).filter((s) => only || ((!actor || s.name !== actor) && (!onlyHelp || s.level === 'all')));

	const payload = JSON.stringify(msg);
	const gone: string[] = [];
	let sent = 0;
	await Promise.all(targets.map(async (s) => {
		try {
			await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 300, urgency: 'high' });
			sent++;
		} catch (e) {
			const code = (e as { statusCode?: number }).statusCode;
			if (code === 404 || code === 410) gone.push(s.endpoint);
		}
	}));
	if (gone.length) await db.from('push_subs').delete().in('endpoint', gone);
	return json({ ok: true, sent });
};
