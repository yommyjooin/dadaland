import { PEOPLE } from './schedule';
export function intervals(code: string) {
	const res: { from: number; to: number; name: string; team: string }[] = [];
	for (const p of PEOPLE) {
		let i = 0;
		while (i < 11) {
			if (p.slots[i] === code) {
				let j = i;
				while (j + 1 < 11 && p.slots[j + 1] === code) j++;
				res.push({ from: i, to: j, name: p.name, team: p.team });
				i = j + 1;
			} else i++;
		}
	}
	return res.sort((a, b) => a.from - b.from || a.name.localeCompare(b.name));
}
