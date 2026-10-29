<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import { live, STATUS_LABEL } from '$lib/live.svelte';
	import { BOOTHS, TEAM_COLOR } from '$lib/schedule';
	import { PUBLIC_BOOTHS } from '$lib/public';
	import FloorPlan from '$lib/components/FloorPlan.svelte';
	let qr = $state('');
	let flash = $state(false);
	let prev = 0;
	onMount(async () => {
		qr = await QRCode.toDataURL(location.origin + '/', { margin: 1, width: 360, color: { dark: '#3a2318', light: '#ffffff' } });
	});
	$effect(() => {
		const n = live.detectives;
		if (prev && n > prev) {
			flash = true;
			setTimeout(() => (flash = false), 2600);
		}
		prev = n;
	});
	const pb = Object.fromEntries(PUBLIC_BOOTHS.map((b) => [b.key, b.title]));
</script>

<svelte:head><title>다다랜드 전광판</title></svelte:head>

<div class="board">
	<section class="left">
		<p class="kicker">다다탐정사무소 장위지부</p>
		<h1>오늘 탄생한<br />신입 탐정</h1>
		<p class="num tnum" class:pop={flash}>{live.detectives}<span>명</span></p>
		{#if flash}<p class="new">방금 제 {live.detectives}호 탐정 탄생!</p>{/if}
		<div class="qr">
			{#if qr}<img src={qr} alt="다다랜드 참여자 페이지 QR" />{/if}
			<p>폰으로 찍으면<br /><b>부스 상황 · 탐정 퀴즈 · 임명장</b></p>
		</div>
	</section>
	<section class="right">
		<FloorPlan showStatus />
		<div class="st">
			{#each BOOTHS as b}
				{@const s = live.cur(b.key)?.status ?? 'ok'}
				<div class="row" style="--t:{TEAM_COLOR[b.team]}">
					<span class="k"></span><span class="n">{pb[b.key]}</span>
					{#if s !== 'ok'}<span class="chip busy"><i></i>조금 기다려요</span>{/if}
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	:global(body) { background: #3a2318; }
	.board { min-height: 100vh; display: grid; grid-template-columns: minmax(280px, 0.9fr) 1.6fr; gap: 28px; padding: 32px max(24px, env(safe-area-inset-right, 0px)) 32px max(24px, env(safe-area-inset-left, 0px)); color: #f6e9cf; background: radial-gradient(ellipse at 20% 10%, #5a3622, #2a170e 70%); }
	@media (max-width: 860px) { .board { grid-template-columns: 1fr; } }
	.kicker { color: #e6b85c; font-weight: 700; letter-spacing: 0.12em; margin: 0; }
	h1 { font-size: clamp(34px, 4.6vw, 64px); color: #fff; margin-top: 8px; }
	.num { font-family: var(--display); font-size: clamp(110px, 16vw, 220px); line-height: 1; color: #e6b85c; margin: 18px 0 0; }
	.num span { font-size: 0.3em; color: #f6e9cf; margin-left: 8px; }
	.num.pop { animation: pop 0.8s ease; }
	@keyframes pop { 0% { transform: scale(1); } 40% { transform: scale(1.12); } 100% { transform: scale(1); } }
	@media (prefers-reduced-motion: reduce) { .num.pop { animation: none; } }
	.new { font-size: 24px; font-weight: 700; color: #fff; background: #b3261e; display: inline-block; padding: 6px 14px; border-radius: 10px; }
	.qr { display: flex; gap: 16px; align-items: center; margin-top: 26px; }
	.qr img { width: 150px; height: 150px; border-radius: 12px; background: #fff; padding: 8px; }
	.qr p { margin: 0; font-size: 18px; }
	.qr b { color: #e6b85c; }
	.right { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
	.st { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
	.row { display: grid; grid-template-columns: 30px 1fr auto; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.95); color: var(--ink); border-radius: 10px; padding: 8px 10px; }
	.k { width: 12px; height: 12px; border-radius: 50%; background: var(--t); flex: none; }
	.n { font-weight: 700; font-size: 15px; }
</style>
