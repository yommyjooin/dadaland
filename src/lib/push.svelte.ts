import { supabase } from './supabase';

// 휴대폰 잠금 화면 알림(웹 푸시). 아이폰은 '홈 화면에 추가'한 앱에서만 켤 수 있어요.
const VAPID = import.meta.env.PUBLIC_VAPID_KEY as string | undefined;

export type PushLevel = 'all' | 'help';
type State = 'checking' | 'unsupported' | 'ios-install' | 'off' | 'on' | 'denied' | 'no-server';

function b64ToBytes(s: string) {
	const pad = '='.repeat((4 - (s.length % 4)) % 4);
	const raw = atob((s + pad).replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const standalone = () => matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

class Push {
	state = $state<State>('checking');
	level = $state<PushLevel>('all');
	busy = $state(false);
	msg = $state<string | null>(null);

	async check() {
		if (!VAPID || !supabase) return (this.state = 'no-server');
		const ok = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
		if (!ok) return (this.state = isIOS() && !standalone() ? 'ios-install' : 'unsupported');
		if (Notification.permission === 'denied') return (this.state = 'denied');
		try { this.level = (localStorage.getItem('dada.pushLevel') as PushLevel) || 'all'; } catch {}
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		this.state = sub ? 'on' : 'off';
	}

	async #save(sub: PushSubscription, name: string | null) {
		const j = sub.toJSON();
		const { error } = await supabase!.rpc('save_push', {
			p_endpoint: sub.endpoint, p_p256dh: j.keys?.p256dh ?? '', p_auth: j.keys?.auth ?? '', p_name: name, p_level: this.level
		});
		if (error) throw error;
	}

	async enable(name: string | null) {
		this.busy = true; this.msg = null;
		try {
			const perm = await Notification.requestPermission();
			if (perm !== 'granted') { this.state = perm === 'denied' ? 'denied' : 'off'; return; }
			const reg = await navigator.serviceWorker.ready;
			const sub = (await reg.pushManager.getSubscription()) ??
				(await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(VAPID!) }));
			await this.#save(sub, name);
			this.state = 'on';
			this.msg = '알림을 켰어요.';
		} catch (e) {
			console.error(e);
			this.msg = '알림을 켜지 못했어요. 잠시 후 다시 눌러 주세요.';
		} finally { this.busy = false; }
	}

	/** 이름이나 받는 범위가 바뀌면 서버 정보도 맞춰요. */
	async sync(name: string | null) {
		if (this.state !== 'on') return;
		try { localStorage.setItem('dada.pushLevel', this.level); } catch {}
		const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
		if (sub) await this.#save(sub, name).catch(() => {});
	}

	async disable() {
		this.busy = true;
		try {
			const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
			if (sub) { await supabase!.rpc('remove_push', { p_endpoint: sub.endpoint }); await sub.unsubscribe(); }
			this.state = 'off'; this.msg = '알림을 껐어요.';
		} finally { this.busy = false; }
	}

	async test() {
		const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
		if (!sub) return;
		const r = await fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ type: 'test', endpoint: sub.endpoint }) }).catch(() => null);
		this.msg = r?.ok ? '테스트 알림을 보냈어요. 몇 초 안에 와요.' : '테스트 알림을 보내지 못했어요.';
	}
}
export const push = new Push();

/** 상태 변경·공지 뒤에 서버에 알림 요청 (실패해도 앱 동작엔 영향 없음) */
export function notify(body: { type: 'status'; booth: string } | { type: 'notice'; id: number }) {
	if (!VAPID) return;
	fetch('/api/notify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), keepalive: true }).catch(() => {});
}
