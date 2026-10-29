<script lang="ts">
	// 피그마 '다다랜드 공간 배치 (30m×8m)' 초안을 기준으로 그린 동선 중심 약도. 1m = 10단위.
	import { live } from '$lib/live.svelte';
	import { PUBLIC_BOOTHS } from '$lib/public';
	let { highlight = null, showStatus = false, fit = false }: { highlight?: string | null; showStatus?: boolean; fit?: boolean } = $props();
	const SHORT = Object.fromEntries(PUBLIC_BOOTHS.map((b) => [b.key, b.short]));
	const C = { A: '#2d5aa8', B: '#2f6e3c', C: '#a8325f' };
	const BG = { A: '#e3ebfb', B: '#e1f1e3', C: '#f9e2ec' };
	type Z = { k: string; t: 'A' | 'B' | 'C'; x: number; y: number; w: number; h: number };
	const zones: Z[] = [
		{ k: '카', t: 'C', x: 12, y: 4, w: 36, h: 20 },
		{ k: '아', t: 'B', x: 54, y: 6, w: 34, h: 26 },
		{ k: '사', t: 'B', x: 98, y: 6, w: 38, h: 22 },
		{ k: '바', t: 'B', x: 142, y: 6, w: 28, h: 28 },
		{ k: '라', t: 'A', x: 196, y: 6, w: 34, h: 22 },
		{ k: '마', t: 'A', x: 196, y: 34, w: 34, h: 22 },
		{ k: '다', t: 'C', x: 236, y: 22, w: 26, h: 30 },
		{ k: '나', t: 'C', x: 264, y: 2, w: 28, h: 19 },
		{ k: '가', t: 'C', x: 268, y: 28, w: 24, h: 20 },
		{ k: '자', t: 'B', x: 116, y: 44, w: 30, h: 22 },
		{ k: '차', t: 'B', x: 56, y: 54, w: 54, h: 16 }
	];
</script>

<figure class="plan">
	<div class="scroll" class:fit>
		<svg viewBox="-12 -4 324 92" role="img" aria-label="다다랜드 공간 배치도: 오른쪽 입구에서 접수하고, 접수처가 알려주는 탐정단부터 두 사건을 해결한 뒤 왼쪽 임명식장을 지나 출구로 나가요.">
			<defs>
				<marker id="ar" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#b8862b" /></marker>
			</defs>
			<rect x="0" y="0" width="300" height="80" rx="3" fill="#fbf7ee" stroke="#6b3f22" stroke-width="0.8" />
			<!-- 숨은그림찾기 벽 -->
			<rect x="176" y="8" width="4" height="50" fill="#c9b79a" />
			<text x="182" y="62" class="lb">숨은그림찾기</text>
			<!-- 벤치 -->
			<rect x="186" y="72" width="60" height="7" rx="1" fill="#efe2c4" stroke="#d6c39b" stroke-width="0.4" />
			<text x="216" y="77.2" class="lb mid">벤치</text>
			<!-- 동선 -->
			<text x="213" y="-0.6" class="team" fill="#2d5aa8">A 동네방네 탐정단</text>
			<text x="110" y="-0.6" class="team" fill="#2f6e3c">B 보물열쇠 탐정단</text>
			<path d="M300 58 C 285 58, 280 50, 280 44 M14 14 C 6 18, 4 28, 0 32" fill="none" stroke="#b8862b" stroke-width="1.1" stroke-dasharray="2.5 2" marker-end="url(#ar)" />
			{#each zones as z}
				{@const st = live.status[z.k]?.status ?? 'ok'}
				<g class:hl={highlight === z.k}>
					<rect x={z.x} y={z.y} width={z.w} height={z.h} rx="3" fill={BG[z.t]} stroke={C[z.t]} stroke-width={highlight === z.k ? 1.6 : 0.6} />
					<text x={z.x + z.w / 2} y={z.y + z.h / 2 + 1.6} class="nm" fill={C[z.t]}>{SHORT[z.k]}</text>
					{#if showStatus && live.enabled && st !== 'ok'}
						<circle cx={z.x + z.w - 4} cy={z.y + 4} r="3" fill={st === 'help' ? '#c0392b' : '#d4901f'} />
					{/if}
				</g>
			{/each}
			<!-- 입구·출구 -->
			<rect x="298" y="50" width="6" height="16" fill="#a8325f" />
			<text x="304" y="47" class="door" fill="#a8325f">입구</text>
			<rect x="-4" y="24" width="6" height="16" fill="#6b3f22" />
			<text x="-6" y="21" class="door" fill="#6b3f22">출구</text>
		</svg>
	</div>
	<figcaption class="small muted">입구에서 접수 → 접수처에서 알려주는 탐정단부터 두 사건 해결 → 임명식장 → 출구. 현장 배치는 조금 달라질 수 있어요.</figcaption>
</figure>

<style>
	.plan { margin: 0; }
	.scroll { overflow-x: auto; background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 8px; }
	svg { display: block; width: 100%; min-width: 560px; height: auto; font-family: var(--body); }
	.fit svg { min-width: 0; }
		.nm { font-size: 4.6px; font-weight: 700; text-anchor: middle; }
	.team { font-size: 4.4px; font-weight: 700; text-anchor: middle; }
	.lb { font-size: 3.6px; fill: #8a7a62; }
	.mid { text-anchor: middle; }
	.door { font-size: 4.4px; font-weight: 700; text-anchor: middle; }
	figcaption { margin-top: 6px; }
</style>
