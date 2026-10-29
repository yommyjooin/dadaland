<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();
	const isHome = $derived(page.url.pathname === '/');
	const titles: Record<string, string> = { '/hidden': '보너스 미션 · 숨은그림찾기', '/quiz': '신입 탐정 시험', '/badge': '신입 탐정 임명장', '/status': '현장 무전 기록' };
	const title = $derived(titles[page.url.pathname] ?? '');
</script>

<div class="desk">
	{#if !isHome}
		<header class="tabbar">
			<a href="/" class="back">← 사건 보드</a>
			<span class="tab">{title}</span>
		</header>
	{/if}
	<main class:home={isHome}>{@render children()}</main>
</div>

<style>
	.desk { min-height: 100vh; min-height: 100dvh;
		background-color: #8b5e3c;
		background-image:
			radial-gradient(rgba(60, 30, 10, 0.35) 1px, transparent 1.5px),
			radial-gradient(rgba(255, 220, 170, 0.18) 1px, transparent 1.6px),
			radial-gradient(ellipse at 50% 0%, #a8774f, #7a4f31 75%);
		background-size: 7px 7px, 11px 11px, 100% 100%;
		background-position: 0 0, 3px 5px, 0 0; }
	.tabbar { position: sticky; top: 0; z-index: 10; display: flex; align-items: flex-end; gap: 10px;
		padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 0 max(16px, env(safe-area-inset-left, 0px));
		background: #6e4426; box-shadow: 0 2px 0 #4d2e18; }
	.back { color: #f3dfb8; text-decoration: none; font-weight: 700; padding-bottom: 10px; font-size: 15px; white-space: nowrap; }
	.tab { background: #e9d3a6; color: #3a2318; font-weight: 700; padding: 9px 14px 8px; border-radius: 10px 10px 0 0; font-size: 15px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
		box-shadow: inset 0 2px 0 #f5e6c6; }
	main { max-width: 720px; margin: 0 auto; padding: 18px max(16px, env(safe-area-inset-right, 0px)) calc(32px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
	main.home { padding-top: calc(18px + env(safe-area-inset-top, 0px)); }
</style>
