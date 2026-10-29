<script lang="ts">
	import { BOOTHS, TEAM_COLOR, TEAM_NAME, holders, slotAt } from '$lib/schedule';
	import { clock } from '$lib/clock.svelte';
	import StatusChip from '$lib/components/StatusChip.svelte';
	const idx = $derived(Math.min(Math.max(slotAt(clock.min), 0), 10));
	const teams = ['A', 'B', 'C'];
</script>

<section class="stack">
	<h1>부스</h1>
	{#each teams as t}
		<h2 class="th" style="color:{TEAM_COLOR[t]}">{TEAM_NAME[t]}</h2>
		<div class="list">
			{#each BOOTHS.filter((b) => b.team === t) as b}
				<a class="card it" href="/staff/booths/{encodeURIComponent(b.key)}" style="--t:{TEAM_COLOR[t]}">
					<span class="k">{b.key}</span>
					<span><b>{b.name}</b><small class="muted">지금 {holders(b.key, idx).join(', ') || '무인'}</small></span>
					<StatusChip booth={b.key} />
				</a>
			{/each}
		</div>
	{/each}
</section>

<style>
	h1 { font-size: 26px; }
	.th { font-size: 17px; margin-top: 4px; }
	.list { display: flex; flex-direction: column; gap: 8px; }
	.it { display: grid; grid-template-columns: 40px 1fr auto; gap: 10px; align-items: center; text-decoration: none; padding: 12px 14px; }
	.k { width: 36px; height: 36px; border-radius: 50%; background: var(--t); color: #fff; font-family: var(--display); display: flex; align-items: center; justify-content: center; font-size: 18px; }
	small { display: block; }
</style>
