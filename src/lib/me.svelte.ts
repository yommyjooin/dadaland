class Me {
	name = $state<string | null>(null);
	constructor() {
		if (typeof window !== 'undefined') {
			try {
				this.name = localStorage.getItem('dada.me');
			} catch {}
		}
	}
	set(n: string | null) {
		this.name = n;
		try {
			n ? localStorage.setItem('dada.me', n) : localStorage.removeItem('dada.me');
		} catch {}
	}
}
export const me = new Me();
