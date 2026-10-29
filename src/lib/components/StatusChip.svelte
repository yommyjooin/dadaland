<script lang="ts">
	import { live, STATUS_LABEL } from '$lib/live.svelte';
	let { booth }: { booth: string } = $props();
	const s = $derived(live.cur(booth)?.status ?? 'ok');
</script>

{#if live.enabled}<span class="chip {s}"><i></i>{STATUS_LABEL[s]}</span>{/if}
