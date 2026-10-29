import { supabase } from './supabase';

export type Status = 'ok' | 'busy' | 'help';
export type BoothStatus = { booth: string; status: Status; note: string | null; updated_by: string | null; updated_at: string };
export type BreakRow = { name: string; state: 'out' | 'back'; updated_at: string };
export type Notice = { id: number; body: string; author: string | null; created_at: string };

class Live {
	enabled = $state(!!supabase);
	/** ?demo 로 열면 서버 없이 예시 데이터로 움직여요 (포트폴리오·리허설용) */
	demo = $state(false);
	connected = $state(false);
	status = $state<Record<string, BoothStatus>>({});
	breaks = $state<Record<string, BreakRow>>({});
	notices = $state<Notice[]>([]);
	detectives = $state(0);
	lastDetectiveAt = $state<string | null>(null);
	error = $state<string | null>(null);
	#started = false;

	async start() {
		if (this.#started) return;
		if (typeof location !== 'undefined' && (new URLSearchParams(location.search).has('demo') || sessionStorage.getItem('dada.demo'))) {
			try { sessionStorage.setItem('dada.demo', '1'); } catch {}
			return this.#startDemo();
		}
		if (!supabase) return;
		this.#started = true;
		const [s, b, n, d] = await Promise.all([
			supabase.from('booth_status').select('*'),
			supabase.from('breaks').select('*'),
			supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(30),
			supabase.from('detectives').select('id', { count: 'exact', head: true })
		]);
		this.detectives = d.count ?? 0;
		if (s.error || b.error || n.error) this.error = '실시간 정보를 불러오지 못했어요. 새로고침해 주세요.';
		this.status = Object.fromEntries((s.data ?? []).map((r) => [r.booth, r]));
		this.breaks = Object.fromEntries((b.data ?? []).map((r) => [r.name, r]));
		this.notices = n.data ?? [];

		supabase
			.channel('dada')
			.on('postgres_changes', { event: '*', schema: 'public', table: 'booth_status' }, (p) => {
				const r = p.new as BoothStatus;
				if (r?.booth) this.status = { ...this.status, [r.booth]: r };
			})
			.on('postgres_changes', { event: '*', schema: 'public', table: 'breaks' }, (p) => {
				const r = p.new as BreakRow;
				if (r?.name) this.breaks = { ...this.breaks, [r.name]: r };
			})
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notices' }, (p) => {
				this.notices = [p.new as Notice, ...this.notices].slice(0, 30);
			})
			.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'detectives' }, (p) => {
				const r = p.new as { id: number; created_at: string };
				this.detectives = Math.max(this.detectives + 1, r.id ?? 0);
				this.lastDetectiveAt = r.created_at;
			})
			.subscribe((st) => (this.connected = st === 'SUBSCRIBED'));
	}

	#startDemo() {
		this.#started = true;
		this.demo = true;
		this.enabled = true;
		this.connected = true;
		const t = (m: number) => new Date(Date.now() - m * 60000).toISOString();
		this.status = {
			차: { booth: '차', status: 'busy', note: null, updated_by: '최소민', updated_at: t(3) },
			가: { booth: '가', status: 'busy', note: null, updated_by: '백승호', updated_at: t(6) },
			아: { booth: '아', status: 'help', note: null, updated_by: '김민경', updated_at: t(1) }
		};
		this.breaks = { 윤정민: { name: '윤정민', state: 'out', updated_at: t(12) }, 임서인: { name: '임서인', state: 'back', updated_at: t(2) } };
		this.notices = [
			{ id: 2, body: '책갈피 공방 매듭실 보충했어요. 운영 본부 박스 두 번째 칸에 있어요.', author: '장예진', created_at: t(4) },
			{ id: 1, body: '13:30부터 정희윤님이 접수처 대행해요.', author: '장예진', created_at: t(25) }
		];
		this.detectives = 42;
		setInterval(() => {
			this.detectives += 1;
			this.lastDetectiveAt = new Date().toISOString();
		}, 9000);
	}

	async setStatus(booth: string, status: Status, by: string | null, note: string | null = null) {
		if (this.demo) { this.status = { ...this.status, [booth]: { booth, status, note, updated_by: by, updated_at: new Date().toISOString() } }; return true; }
		if (!supabase) return false;
		const row = { booth, status, note, updated_by: by, updated_at: new Date().toISOString() };
		this.status = { ...this.status, [booth]: row };
		const { error } = await supabase.from('booth_status').upsert(row);
		if (error) this.error = '상태를 저장하지 못했어요. 다시 눌러 주세요.';
		return !error;
	}
	async setBreak(name: string, state: 'out' | 'back') {
		if (this.demo) { this.breaks = { ...this.breaks, [name]: { name, state, updated_at: new Date().toISOString() } }; return true; }
		if (!supabase) return false;
		const row = { name, state, updated_at: new Date().toISOString() };
		this.breaks = { ...this.breaks, [name]: row };
		const { error } = await supabase.from('breaks').upsert(row);
		if (error) this.error = '휴식 체크를 저장하지 못했어요. 다시 눌러 주세요.';
		return !error;
	}
	/** 신입 탐정 번호 발급. 이름은 서버에 보내지 않아요. */
	async issueDetective(): Promise<number | null> {
		if (this.demo) return ++this.detectives;
		if (!supabase) return null;
		const { data, error } = await supabase.from('detectives').insert({}).select('id').single();
		if (error || !data) {
			this.error = '탐정 번호를 받지 못했어요. 잠시 후 다시 눌러 주세요.';
			return null;
		}
		return data.id as number;
	}
	async post(body: string, author: string | null) {
		if (this.demo) { this.notices = [{ id: Date.now(), body, author, created_at: new Date().toISOString() }, ...this.notices]; return true; }
		if (!supabase) return false;
		const { error } = await supabase.from('notices').insert({ body, author });
		if (error) this.error = '공지를 올리지 못했어요. 다시 시도해 주세요.';
		return !error;
	}
}
export const live = new Live();

export const STATUS_LABEL: Record<Status, string> = { ok: '보통', busy: '대기 많음', help: '도움 필요' };
export const ago = (iso: string) => {
	const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
	return m < 1 ? '방금' : m < 60 ? `${m}분 전` : `${Math.floor(m / 60)}시간 전`;
};
