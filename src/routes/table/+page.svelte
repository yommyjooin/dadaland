<script lang="ts">
	import { PEOPLE, SLOTS, TEAM_NAME, TEAM_COLOR, segments, label, slotAt, BOOTH, TEAM_BG } from '$lib/schedule';
	import { clock } from '$lib/clock.svelte';
	const idx = $derived(slotAt(clock.min));
	const groups = ['A', 'B', 'C', '알바'];
	function tone(code: string) {
		if (BOOTH[code]) return `background:${TEAM_BG[BOOTH[code].team]};color:${TEAM_COLOR[BOOTH[code].team]}`;
		if (code === '휴') return 'background:var(--Rbg);color:#5f5e57;outline:1px dashed #8a897f;outline-offset:-1px';
		if (code === '지') return 'background:var(--Sbg);color:#8a5a00';
		return 'color:var(--mute)';
	}
</script>

<section class="stack">
	<h1>전체 타임테이블</h1>
	<p class="muted small">옆으로 밀어서 보세요. 빨간 선이 지금 시간이에요.</p>
	<div class="scroll">
		<table>
			<thead><tr><th class="n"></th>{#each SLOTS.slice(0, 11) as s, i}<th class:cur={i === idx}>{s}</th>{/each}</tr></thead>
			<tbody>
				{#each groups as g}
					<tr class="g"><th colspan="12" style="color:{TEAM_COLOR[g]}">{TEAM_NAME[g]}</th></tr>
					{#each PEOPLE.filter((p) => p.team === g) as p}
						<tr>
							<th class="n">{p.name}</th>
							{#each segments(p) as s}
								<td colspan={s.to - s.from + 1} class:cur={idx >= s.from && idx <= s.to}><div style={tone(s.code)}>{label(s.code, p.name)}</div></td>
							{/each}
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	</div>
</section>

<style>
	h1 { font-size: 26px; }
	.scroll { overflow-x: auto; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; }
	table { border-collapse: separate; border-spacing: 0; min-width: 980px; width: 100%; table-layout: fixed; font-size: 13px; }
	th { text-align: left; color: var(--mute); font-size: 12px; padding: 8px 4px; font-weight: 700; }
	th.cur { color: #c0392b; }
	th.n { position: sticky; left: 0; background: var(--paper); z-index: 1; width: 86px; color: var(--ink); font-size: 14px; padding-left: 10px; }
	tr.g th { padding-top: 12px; font-size: 13px; position: sticky; left: 0; }
	td { padding: 2px; }
	td div { border-radius: 6px; padding: 8px 6px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	td.cur div { box-shadow: inset 0 0 0 2px #c0392b; }
</style>
