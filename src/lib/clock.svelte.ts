import { D, toMin } from './schedule';

/** Event-day clock. Off the event day (or when preview is on), a chosen preview time is used. */
class Clock {
	real = $state(new Date());
	preview = $state(false);
	previewMin = $state(13 * 60 + 10);

	constructor() {
		if (typeof window !== 'undefined') {
			setInterval(() => (this.real = new Date()), 15_000);
			try {
				const v = localStorage.getItem('dada.preview');
				if (v) this.previewMin = Number(v);
			} catch {}
		}
	}
	get isEventDay() {
		const d = this.real;
		const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
		return iso === D.date;
	}
	get usingPreview() {
		return this.preview || !this.isEventDay;
	}
	get min() {
		return this.usingPreview ? this.previewMin : this.real.getHours() * 60 + this.real.getMinutes();
	}
	setPreview(m: number) {
		this.previewMin = m;
		try {
			localStorage.setItem('dada.preview', String(m));
		} catch {}
	}
}
export const clock = new Clock();
export const eventStart = toMin('11:20');
