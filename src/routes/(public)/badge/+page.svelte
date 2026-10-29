<script lang="ts">
	import { live } from '$lib/live.svelte';
	import { drawCertificate } from '$lib/certificate';
	type Made = { name: string; no: number | null };
	let name = $state('');
	let busy = $state(false);
	let made = $state<Made | null>(null);
	let url = $state<string | null>(null);
	let canvas: HTMLCanvasElement;
	let history = $state<Made[]>([]);
	try {
		history = JSON.parse(localStorage.getItem('dada.badges') ?? '[]');
	} catch {}

	async function render(m: Made) {
		await drawCertificate(canvas, m.name, m.no);
		url = canvas.toDataURL('image/png');
		made = m;
	}
	async function make(e: SubmitEvent) {
		e.preventDefault();
		const n = name.trim().slice(0, 8);
		if (!n || busy) return;
		busy = true;
		// 같은 폰에서 같은 이름으로 다시 받으면 번호를 새로 받지 않아요 (숫자 부풀림 방지)
		const prev = history.find((h) => h.name === n && h.no);
		const no = prev ? prev.no : live.enabled ? await live.issueDetective() : null;
		const m = { name: n, no };
		history = [m, ...history.filter((h) => h.name !== n)].slice(0, 10);
		try {
			localStorage.setItem('dada.badges', JSON.stringify(history));
		} catch {}
		await render(m);
		busy = false;
		name = '';
	}
	async function share() {
		if (!url || !made) return;
		const blob = await (await fetch(url)).blob();
		const file = new File([blob], `신입탐정_${made.name}.png`, { type: 'image/png' });
		try {
			if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: '다다랜드 신입 탐정 임명장' });
		} catch {}
	}
	const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
</script>

<p class="lead">두 가지 사건을 모두 해결했다면, 이름을 넣고 나만의 임명장을 받아요.</p>

<form onsubmit={make} class="card form">
	<label for="nm">탐정 이름</label>
	<div class="row">
		<input id="nm" maxlength="8" placeholder="예) 김다다" bind:value={name} autocomplete="off" />
		<button class="btn primary" disabled={busy || !name.trim()}>{busy ? '만드는 중…' : '임명장 받기'}</button>
	</div>
	<p class="small muted">이름은 이 폰에서만 쓰여요. 서버에는 몇 번째 탐정인지만 기록돼요.</p>
</form>

<canvas bind:this={canvas} class:hidden={!url} aria-label={made ? `${made.name} 신입 탐정 임명장` : '임명장'}></canvas>

{#if url && made}
	<div class="actions">
		<a class="btn primary" href={url} download="신입탐정_{made.name}.png">사진으로 저장</a>
		{#if canShare}<button class="btn" onclick={share}>공유하기</button>{/if}
	</div>
	<p class="small center ondark">저장이 안 되면 임명장을 길게 눌러 저장해요.</p>
{/if}

{#if history.length > 1}
	<h2 class="sec">이 폰에서 만든 임명장</h2>
	<div class="hist">
		{#each history as h}
			<button class="btn" onclick={() => render(h)}>{h.name}{h.no ? ` · 제 ${h.no}호` : ''}</button>
		{/each}
	</div>
{/if}

<style>
	.form label { font-weight: 700; }
	.row { display: flex; gap: 8px; margin-top: 6px; }
	.row input { flex: 1; min-width: 0; font: inherit; font-size: 18px; padding: 12px; border: 2px solid var(--line); border-radius: 12px; }
	.btn:disabled { opacity: 0.5; }
	canvas { width: 100%; height: auto; display: block; margin-top: 16px; border-radius: 10px; box-shadow: 0 6px 20px rgba(58, 35, 24, 0.25); }
	canvas.hidden { display: none; }
	.actions { display: flex; gap: 8px; margin-top: 12px; }
	.actions .btn { flex: 1; text-align: center; text-decoration: none; }
	.center { text-align: center; }
	.lead { color: #f6e9cf; font-size: 17px; margin: 4px 0 14px; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35); word-break: keep-all; }
	.ondark { color: #f3dfb8; }
	.sec { font-size: 18px; margin: 20px 0 8px; color: #f6e9cf; }
	.hist { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
