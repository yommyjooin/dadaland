<script lang="ts">
	import { clock } from '$lib/clock.svelte';
	import { live, ago, STATUS_LABEL } from '$lib/live.svelte';
	import NoticeBar from '$lib/components/NoticeBar.svelte';
	import { BOOTHS, PEOPLE, SLOTS, TEAM_COLOR, TEAM_BG, holders, slotAt, toMin, label, supportOf } from '$lib/schedule';

	const idx = $derived(slotAt(clock.min));
	const shown = $derived(idx < 0 ? 0 : Math.min(idx, 10));
	const resting = $derived(PEOPLE.filter((p) => p.slots[shown] === '휴').map((p) => p.name));
	const support = $derived(PEOPLE.filter((p) => p.slots[shown] === '지'));
	const nextIdx = $derived(shown + 1 <= 10 ? shown + 1 : null);
	const changes = $derived(
		nextIdx === null
			? []
			: PEOPLE.filter((p) => p.slots[nextIdx] !== p.slots[shown]).map((p) => ({ name: p.name, to: p.slots[nextIdx], from: p.slots[shown] }))
	);
	const minsToNext = $derived(nextIdx === null ? null : toMin(SLOTS[nextIdx]) - clock.min);
	const alerts = $derived(BOOTHS.filter((b) => live.status[b.key] && live.status[b.key].status !== 'ok'));
</script>

<section class="stack">
	<NoticeBar />
	<h1>지금 현황 <span class="muted small tnum">{SLOTS[shown]}–{SLOTS[shown + 1]}{idx < 0 ? ' (시작 전)' : idx > 10 ? ' (종료)' : ''}</span></h1>

	{#if alerts.length}
		<div class="card alerts">
			{#each alerts as b}
				{@const s = live.status[b.key]}
				<a href="/staff/booths/{encodeURIComponent(b.key)}" class="al">
					<span class="chip {s.status}"><i></i>{STATUS_LABEL[s.status]}</span>
					<b>{b.key}. {b.name}</b>
					<small class="muted">{s.updated_by ?? ''} · {ago(s.updated_at)}</small>
				</a>
			{/each}
		</div>
	{/if}

	<div class="grid">
		{#each BOOTHS as b}
			{@const hs = holders(b.key, shown)}
			{@const st = live.status[b.key]?.status ?? 'ok'}
			<a class="bx {st}" href="/staff/booths/{encodeURIComponent(b.key)}" style="--t:{TEAM_COLOR[b.team]};--tb:{TEAM_BG[b.team]}">
				<span class="k">{b.key}</span>
				<span class="nm">{b.name}</span>
				<span class="who">{hs.length ? hs.join(', ') : '무인'}</span>
				{#if live.enabled && st !== 'ok'}<span class="chip {st}"><i></i>{STATUS_LABEL[st]}</span>{/if}
			</a>
		{/each}
	</div>

	<div class="two">
		<div class="card">
			<h3>휴식 중</h3>
			{#if resting.length}
				<ul>{#each resting as n}{@const br = live.breaks[n]}<li>{n}{#if br}<small class="muted"> · {br.state === 'out' ? '출발' : '복귀'} {ago(br.updated_at)}</small>{/if}</li>{/each}</ul>
			{:else}<p class="muted small">없음</p>{/if}
		</div>
		<div class="card">
			<h3>지원</h3>
			{#if support.length}
				<ul>{#each support as p}<li>{p.name} <small class="muted">기본: {supportOf(p.name)}</small></li>{/each}</ul>
			{:else}<p class="muted small">없음 (막히면 영애·기표 선생님께)</p>{/if}
		</div>
	</div>

	{#if nextIdx !== null}
		<div class="card">
			<h3>다음 교대 · {SLOTS[nextIdx]} {#if minsToNext !== null && minsToNext >= 0}<span class="muted small tnum">({minsToNext}분 뒤)</span>{/if}</h3>
			{#if changes.length}
				<ul class="chg">{#each changes as c}<li><b>{c.name}</b> {label(c.from, c.name)} → {label(c.to, c.name)}</li>{/each}</ul>
			{:else}<p class="muted small">이 시각엔 교대가 없어요.</p>{/if}
		</div>
	{/if}
</section>

<style>
	h1 { font-size: 24px; display: flex; gap: 8px; align-items: baseline; flex-wrap: wrap; }
	.alerts { display: flex; flex-direction: column; gap: 8px; border-color: #ecc3bc; }
	.al { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; text-decoration: none; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
	.bx { position: relative; display: flex; flex-direction: column; gap: 2px; text-decoration: none; background: var(--paper); border: 1px solid var(--line); border-left: 5px solid var(--t); border-radius: 12px; padding: 10px 12px; }
	.bx.busy { border-color: var(--busy); border-left-color: var(--busy); }
	.bx.help { border-color: var(--help); border-left-color: var(--help); background: #fff6f5; }
	.k { font-family: var(--display); color: var(--t); font-size: 18px; }
	.nm { font-size: 13px; color: var(--mute); }
	.who { font-weight: 700; font-size: 16px; }
	.bx .chip { align-self: flex-start; margin-top: 4px; }
	.two { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
	@media (max-width: 420px) { .two { grid-template-columns: 1fr; } }
	h3 { font-size: 17px; margin-bottom: 6px; }
	ul { margin: 0; padding-left: 18px; }
	.chg li { margin: 3px 0; font-size: 15px; }
	.card p { margin: 0; }
</style>
