<script lang="ts">
	import { live, ago } from '$lib/live.svelte';
	const latest = $derived(live.notices[0]);
</script>

{#if latest}
	<a class="notice" href="/staff/info#notices">
		<b>공지</b><span>{latest.body}</span><small class="muted">{ago(latest.created_at)}</small>
	</a>
{/if}

<style>
	.notice { display: grid; grid-template-columns: auto 1fr auto; gap: 8px; align-items: center; text-decoration: none;
		background: #fff4d8; border: 1px solid #ecd9a8; border-radius: 12px; padding: 10px 12px; }
	b { color: var(--brown); }
	span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
