import { supabase } from './supabase';

export type Status = 'ok' | 'busy' | 'help';
export type BoothStatus = { booth: string; status: Status; note: string | null; updated_by: string | null; updated_at: string };
export type BreakRow = { name: string; state: 'out' | 'back'; updated_at: string };
export type Notice = { id: number; body: string; author: string | null; created_at: string };

class Live {
	enabled = !!supabase;
	connected = $state(false);
	status = $state<Record<string, BoothStatus>>({});
	breaks = $state<Record<string, BreakRow>>({});
	notices = $state<Notice[]>([]);
	error = $state<string | null>(null);
	#started = false;

	async start() {
		if (!supabase || this.#started) return;
		this.#started = true;
		const [s, b, n] = await Promise.all([
			supabase.from('booth_status').select('*'),
			supabase.from('breaks').select('*'),
			supabase.from('notices').select('*').order('created_at', { ascending: false }).limit(30)
		]);
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
			.subscribe((st) => (this.connected = st === 'SUBSCRIBED'));
	}

	async setStatus(booth: string, status: Status, by: string | null, note: string | null = null) {
		if (!supabase) return false;
		const row = { booth, status, note, updated_by: by, updated_at: new Date().toISOString() };
		this.status = { ...this.status, [booth]: row };
		const { error } = await supabase.from('booth_status').upsert(row);
		if (error) this.error = '상태를 저장하지 못했어요. 다시 눌러 주세요.';
		return !error;
	}
	async setBreak(name: string, state: 'out' | 'back') {
		if (!supabase) return false;
		const row = { name, state, updated_at: new Date().toISOString() };
		this.breaks = { ...this.breaks, [name]: row };
		const { error } = await supabase.from('breaks').upsert(row);
		if (error) this.error = '휴식 체크를 저장하지 못했어요. 다시 눌러 주세요.';
		return !error;
	}
	async post(body: string, author: string | null) {
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
