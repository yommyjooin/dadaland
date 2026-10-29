<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { live } from '$lib/live.svelte';
	let { children } = $props();
	onMount(() => {
		live.start();
	});
</script>

{@render children()}

{#if live.demo}
	<button class="demo" onclick={() => { try { sessionStorage.removeItem('dada.demo'); } catch {} location.href = location.pathname; }}>
		데모 데이터 · 끄기
	</button>
{/if}

<style>
	.demo { position: fixed; top: calc(10px + env(safe-area-inset-top, 0px)); right: max(10px, env(safe-area-inset-right, 0px)); z-index: 20; border: 0; background: #e6b85c; color: #3a2318; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 999px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2); }
</style>
