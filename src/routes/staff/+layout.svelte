<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { clock } from '$lib/clock.svelte';
	import { live } from '$lib/live.svelte';
	import { fmt, toMin, SLOTS } from '$lib/schedule';
	let { children } = $props();

	onMount(() => {
		live.start();
	});

	const tabs = [
		{ href: '/staff', label: '내 일정' },
		{ href: '/staff/now', label: '지금' },
		{ href: '/staff/booths', label: '부스' },
		{ href: '/staff/table', label: '전체표' },
		{ href: '/staff/info', label: '안내' }
	];
	const isActive = (href: string) =>
		href === '/staff' ? page.url.pathname === '/staff' : page.url.pathname.startsWith(href);
	const start = toMin('08:30'),
		end = toMin(SLOTS[11]);
</script>

<header class="top">
	<a href="/staff" class="brand"><span class="mag" aria-hidden="true"></span>다다랜드 운영요원</a>
	<span class="time tnum" title={clock.usingPreview ? '미리보기 시간' : '현재 시간'}>
		{clock.usingPreview ? '미리보기 ' : ''}{fmt(clock.min)}
	</span>
</header>

{#if clock.usingPreview}
	<div class="preview">
		<label for="pv" class="small">
			{clock.isEventDay ? '미리보기 중이에요.' : '행사 당일(10/31)이 아니라서 시간을 골라 미리 볼 수 있어요.'}
			<b class="tnum">{fmt(clock.min)}</b>
		</label>
		<input id="pv" type="range" min={start} max={end} step="5" value={clock.previewMin}
			oninput={(e) => clock.setPreview(Number((e.currentTarget as HTMLInputElement).value))} />
		{#if clock.isEventDay}<button class="btn small" onclick={() => (clock.preview = false)}>실제 시간으로</button>{/if}
	</div>
{/if}

{#if live.error}<div class="err" role="alert">{live.error} <button onclick={() => (live.error = null)}>닫기</button></div>{/if}

<main>{@render children()}</main>

<nav class="tabs" aria-label="메뉴">
	{#each tabs as t}
		<a href={t.href} aria-current={isActive(t.href) ? 'page' : undefined}>{t.label}</a>
	{/each}
</nav>

<style>
	.top { position: sticky; top: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center;
		padding: calc(10px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 10px max(16px, env(safe-area-inset-left, 0px));
		background: var(--brown); color: #fff; }
	.brand { text-decoration: none; font-family: var(--display); font-size: 19px; display: flex; align-items: center; gap: 8px; }
	.mag { width: 18px; height: 18px; border: 3px solid #fff; border-radius: 50%; position: relative; }
	.mag::after { content: ''; position: absolute; width: 3px; height: 8px; background: #fff; right: -5px; bottom: -7px; transform: rotate(-45deg); border-radius: 2px; }
	.time { font-weight: 700; background: rgba(255, 255, 255, 0.16); padding: 3px 10px; border-radius: 999px; font-size: 14px; }
	.preview { background: #fff4d8; border-bottom: 1px solid #ecd9a8; padding: 8px max(16px, env(safe-area-inset-left, 0px)); display: flex; flex-wrap: wrap; gap: 6px 10px; align-items: center; }
	.preview input { flex: 1; min-width: 160px; accent-color: var(--brown); }
	.err { background: #fadad6; color: #8a2318; padding: 8px 16px; font-size: 14px; }
	.err button { border: 0; background: none; text-decoration: underline; color: inherit; }
	main { max-width: 720px; margin: 0 auto; padding: 16px max(16px, env(safe-area-inset-right, 0px)) calc(84px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
	.tabs { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: grid; grid-template-columns: repeat(5, 1fr);
		background: var(--paper); border-top: 1px solid var(--line); padding-bottom: env(safe-area-inset-bottom, 0px); }
	.tabs a { text-align: center; padding: 12px 2px; text-decoration: none; font-weight: 700; color: var(--mute); font-size: 15px; }
	.tabs a[aria-current='page'] { color: var(--brown); box-shadow: inset 0 3px 0 var(--brown); }
</style>
