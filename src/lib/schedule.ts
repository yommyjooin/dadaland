import data from './data.json';

export type Person = { team: string; name: string; slots: string[] };
export type Booth = {
	key: string;
	name: string;
	team: string;
	script: { label: string; text: string }[];
	checks: string[];
	note: string;
};

export const D = data;
export const SLOTS: string[] = data.slots; // 12 boundaries 11:20 … 17:00
export const PEOPLE: Person[] = data.people;
export const BOOTHS: Booth[] = data.booths;
export const BOOTH = Object.fromEntries(BOOTHS.map((b) => [b.key, b])) as Record<string, Booth>;
export const TEAM_NAME: Record<string, string> = data.teams;

export const TEAM_COLOR: Record<string, string> = {
	A: '#2d5aa8',
	B: '#2f6e3c',
	C: '#a8325f',
	알바: '#8a5a12'
};
export const TEAM_BG: Record<string, string> = {
	A: '#e3ebfb',
	B: '#e1f1e3',
	C: '#f9e2ec',
	알바: '#fff3d6'
};

export const toMin = (hhmm: string) => {
	const [h, m] = hhmm.split(':').map(Number);
	return h * 60 + m;
};
export const fmt = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
const B = SLOTS.map(toMin);

/** slot index for a minute-of-day: -1 before 11:20, 11 after 17:00 */
export function slotAt(min: number): number {
	if (min < B[0]) return -1;
	for (let i = 0; i < 11; i++) if (min < B[i + 1]) return i;
	return 11;
}

export function label(code: string, name?: string): string {
	if (BOOTH[code]) return BOOTH[code].name;
	if (code === '휴') return '휴식 30분';
	if (code === '지') return `지원 · ${supportOf(name)}`;
	if (code === '-') return name === '김동주' ? '15:00 도착' : '휴식 (11–12시)';
	return code;
}
export const supportOf = (name?: string) =>
	(name && (data.supportDefault as Record<string, string>)[name]) || '책갈피 공방';

export type Seg = { from: number; to: number; code: string };
export function segments(p: Person): Seg[] {
	const out: Seg[] = [];
	let i = 0;
	while (i < 11) {
		let j = i;
		while (j + 1 < 11 && p.slots[j + 1] === p.slots[i]) j++;
		out.push({ from: i, to: j, code: p.slots[i] });
		i = j + 1;
	}
	return out;
}

export const holders = (code: string, i: number) =>
	PEOPLE.filter((p) => p.slots[i] === code).map((p) => p.name);

/** who hands this booth to `name` at slot i (and who receives it at slot j+1) */
export function handIn(name: string, code: string, i: number): string | null {
	if (i <= 0 || !BOOTH[code]) return null;
	const prev = holders(code, i - 1),
		cur = holders(code, i);
	const out = prev.filter((x) => !cur.includes(x));
	const inn = cur.filter((x) => !prev.includes(x));
	const k = inn.indexOf(name);
	return k >= 0 && out[k] ? out[k] : null;
}
export function handOut(name: string, code: string, j: number): string | null {
	if (j + 1 > 10 || !BOOTH[code]) return null;
	const prev = holders(code, j),
		cur = holders(code, j + 1);
	const out = prev.filter((x) => !cur.includes(x));
	const inn = cur.filter((x) => !prev.includes(x));
	const k = out.indexOf(name);
	return k >= 0 && inn[k] ? inn[k] : null;
}

export function teamOfCode(code: string): string | null {
	if (BOOTH[code]) return BOOTH[code].team;
	return null;
}
