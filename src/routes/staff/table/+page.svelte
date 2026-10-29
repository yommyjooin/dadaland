<script lang="ts">
	import { PEOPLE, SLOTS, TEAM_NAME, TEAM_COLOR, segments, label, slotAt, BOOTH, TEAM_BG, toMin, fmt } from '$lib/schedule';
	import { clock } from '$lib/clock.svelte';
	const idx = $derived(slotAt(clock.min));
	// 지금 시각을 표 위의 세로선 위치(칸 단위, 0~11)로
	const pos = $derived.by(() => {
		if (idx < 0 || idx > 10) return null;
		const a = toMin(SLOTS[idx]), b = toMin(SLOTS[idx + 1]);
		return idx + (clock.min - a) / (b - a);
	});
	let scroller = $state<HTMLDivElement>();
	let scrolled = false;
	$effect(() => {
		if (!scroller || pos === null || scrolled) return;
		scrolled = true;
		const colW = (scroller.scrollWidth - 86) / 11;
		scroller.scrollLeft = Math.max(0, 86 + pos * colW - scroller.clientWidth / 2);
	});
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
	<p class="muted small">옆으로 밀어서 보세요. 빨간 세로선이 지금 시간이에요.</p>
	<div class="scroll" bind:this={scroller}>
		<div class="inner">
		{#if pos !== null}
			<div class="now" style="left:calc(86px + (100% - 86px) * {pos} / 11)"><span class="tnum">{fmt(clock.min)}</span></div>
		{/if}
		<table>
			<thead><tr><th class="n"></th>{#each SLOTS.slice(0, 11) as s, i}<th class:cur={i === idx}>{s}</th>{/each}</tr></thead>
			<tbody>
				{#each groups as g}
					<tr class="g"><th colspan="12" style="color:{TEAM_COLOR[g]}"><span>{TEAM_NAME[g]}</span></th></tr>
					{#each PEOPLE.filter((p) => p.team === g) as p}
						<tr>
							<th class="n">{p.name}</th>
							{#each segments(p) as s}
								<td colspan={s.to - s.from + 1}><div style={tone(s.code)}><span>{label(s.code, p.name)}</span></div></td>
							{/each}
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
		</div>
	</div>
</section>

<style>
	h1 { font-size: 26px; }
	.scroll { overflow-x: auto; background: var(--paper); border: 1px solid var(--line); border-radius: 12px; }
	table { border-collapse: separate; border-spacing: 0; width: 100%; table-layout: fixed; font-size: 13px; }
	th { text-align: left; color: var(--mute); font-size: 12px; padding: 8px 4px; font-weight: 700; }
	th.cur { color: #c0392b; }
	th.n { position: sticky; left: 0; background: var(--paper); z-index: 3; width: 86px; color: var(--ink); font-size: 14px; padding-left: 10px; }
	tr.g th { padding-top: 12px; font-size: 13px; }
	tr.g th span { position: sticky; left: 10px; }
	td { padding: 2px; }
	td div { border-radius: 6px; padding: 8px 6px; font-weight: 700; white-space: nowrap; overflow: clip; }
	/* 길게 이어지는 칸은 옆으로 밀어도 부스 이름이 이름 칸 옆에 붙어 있게 */
	td div span { position: sticky; left: 94px; }
	.inner { position: relative; min-width: 980px; }
	.now { position: absolute; top: 30px; bottom: 0; width: 0; border-left: 2px solid #c0392b; z-index: 2; pointer-events: none; }
	.now span { position: absolute; top: -26px; left: 0; transform: translateX(-50%); background: #c0392b; color: #fff; font-size: 11px; font-weight: 700; padding: 1px 6px; border-radius: 999px; white-space: nowrap; }
</style>
