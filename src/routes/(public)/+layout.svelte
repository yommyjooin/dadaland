<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();
	const tabs = [
		{ href: '/', label: '지금 부스' },
		{ href: '/mission', label: '내 미션' },
		{ href: '/quiz', label: '탐정 퀴즈' },
		{ href: '/badge', label: '임명장' }
	];
	const active = (h: string) => (h === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(h));
</script>

<div class="pub">
	<header>
		<a href="/" class="brand">
			<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="#d7ecf3" stroke="#6b3f22" stroke-width="5" /><rect x="24" y="24" width="7" height="15" rx="3" transform="rotate(-45 27 31)" fill="#6b3f22" /></svg>
			<span>다다탐정사무소<small>장위지부 · 다다랜드</small></span>
		</a>
	</header>
	<main>{@render children()}</main>
	<nav aria-label="메뉴">
		{#each tabs as t}<a href={t.href} aria-current={active(t.href) ? 'page' : undefined}>{t.label}</a>{/each}
	</nav>
</div>

<style>
	.pub { min-height: 100vh; background: #f6eedd radial-gradient(ellipse at 50% 0%, #fdf8ec 0%, #f3e7cf 70%) fixed; }
	header { padding: calc(14px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) 6px max(16px, env(safe-area-inset-left, 0px)); max-width: 720px; margin: 0 auto; }
	.brand { display: inline-flex; gap: 10px; align-items: center; text-decoration: none; }
	.brand svg { width: 34px; height: 34px; }
	.brand span { font-family: var(--display); font-size: 20px; line-height: 1.1; color: var(--ink); }
	.brand small { display: block; font-family: var(--body); font-size: 12px; color: var(--mute); }
	main { max-width: 720px; margin: 0 auto; padding: 8px max(16px, env(safe-area-inset-right, 0px)) calc(86px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
	nav { position: fixed; left: 0; right: 0; bottom: 0; display: grid; grid-template-columns: repeat(4, 1fr); background: #3a2318; padding-bottom: env(safe-area-inset-bottom, 0px); z-index: 5; }
	nav a { color: #e9d9bd; text-decoration: none; text-align: center; padding: 14px 2px; font-weight: 700; font-size: 15px; }
	nav a[aria-current='page'] { color: #fff; box-shadow: inset 0 -4px 0 #e6b85c; }
</style>
