<script lang="ts">
	import { BOOTH, SLOTS, TEAM_COLOR, TEAM_BG, TEAM_NAME, slotAt, toMin } from '$lib/schedule';
	import { intervals } from '$lib/booth';
	import { clock } from '$lib/clock.svelte';
	import { live, ago, STATUS_LABEL, type Status } from '$lib/live.svelte';
	import { me } from '$lib/me.svelte';
	let { data } = $props();
	const b = $derived(BOOTH[data.key]);
	const iv = $derived(b ? intervals(b.key) : []);
	const idx = $derived(slotAt(clock.min));
	const st = $derived(b ? live.status[b.key] : undefined);
	const span = toMin(SLOTS[11]) - toMin(SLOTS[0]);
	const pos = (i: number) => ((toMin(SLOTS[i]) - toMin(SLOTS[0])) / span) * 100;
	const lanes = $derived.by(() => {
		const L: (typeof iv)[] = [];
		for (const x of iv) {
			const lane = L.find((l) => l[l.length - 1].to < x.from);
			lane ? lane.push(x) : L.push([x]);
		}
		return L;
	});
	const nowPct = $derived(Math.min(100, Math.max(0, ((clock.min - toMin(SLOTS[0])) / span) * 100)));
	const statuses: Status[] = ['ok', 'busy', 'help'];
</script>

{#if !b}
	<p>부스를 찾을 수 없어요. <a href="/staff/booths">부스 목록</a></p>
{:else}
	<section class="stack" style="--t:{TEAM_COLOR[b.team]};--tb:{TEAM_BG[b.team]}">
		<a href="/staff/booths" class="muted small back">← 부스 목록</a>
		<div class="head">
			<span class="k">{b.key}</span>
			<div><h1>{b.name}</h1><span class="muted small">{TEAM_NAME[b.team]}{b.note ? ` · ${b.note}` : ''}</span></div>
		</div>

		{#if live.enabled}
			<div class="card">
				<div class="sh"><b>부스 상태</b>{#if st}<small class="muted">{st.updated_by ?? ''} · {ago(st.updated_at)}</small>{/if}</div>
				<div class="seg" role="group" aria-label="부스 상태">
					{#each statuses as s}
						<button class="chip {s}" aria-pressed={(st?.status ?? 'ok') === s} onclick={() => live.setStatus(b.key, s, me.name)}><i></i>{STATUS_LABEL[s]}</button>
					{/each}
				</div>
				<p class="small muted">5분 넘게 기다리는 팀이 생기면 '대기 많음', 사람이 더 필요하면 '도움 필요'. 지원 인원과 운영팀장 화면에 바로 떠요.</p>
			</div>
		{/if}

		<div class="card">
			<h2>담당 시간</h2>
			<div class="lanes">
				{#each lanes as l}
					<div class="lane">{#each l as x}<div class="blk" class:on={idx >= x.from && idx <= x.to} style="left:{pos(x.from)}%;width:{pos(x.to + 1) - pos(x.from)}%">{x.name}</div>{/each}</div>
				{/each}
				{#if idx >= 0 && idx <= 10}<div class="nowline" style="left:{nowPct}%"></div>{/if}
			</div>
			<div class="ax small muted tnum">{#each [0, 2, 4, 6, 8, 11] as i}<span style="left:{pos(i)}%">{SLOTS[i]}</span>{/each}</div>
			<ul class="iv">{#each iv as x}<li class:on={idx >= x.from && idx <= x.to}><span class="tnum">{SLOTS[x.from]}–{SLOTS[x.to + 1]}</span> <b>{x.name}</b></li>{/each}</ul>
		</div>

		<div class="card">
			<h2>대본</h2>
			<dl>{#each b.script as s}<dt>{s.label}</dt><dd>{s.text}</dd>{/each}</dl>
		</div>
		<div class="card chk"><b>수시로 확인</b><ul>{#each b.checks as c}<li>{c}</li>{/each}</ul></div>
	</section>
{/if}

<style>
	.back { text-decoration: none; }
	.head { display: flex; gap: 12px; align-items: center; }
	.k { width: 48px; height: 48px; flex: none; border-radius: 50%; background: var(--t); color: #fff; font-family: var(--display); font-size: 24px; display: flex; align-items: center; justify-content: center; }
	h1 { font-size: 26px; }
	h2 { font-size: 18px; margin-bottom: 8px; color: var(--t); }
	.sh { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
	.seg { display: flex; gap: 8px; flex-wrap: wrap; }
	.seg .chip { border: 2px solid transparent; padding: 8px 14px; font-size: 15px; opacity: 0.55; }
	.seg .chip[aria-pressed='true'] { opacity: 1; border-color: currentColor; }
	.card p { margin: 8px 0 0; }
	.lanes { position: relative; display: flex; flex-direction: column; gap: 4px; }
	.lane { position: relative; height: 32px; background: #f2efe8; border-radius: 8px; }
	.blk { position: absolute; top: 0; bottom: 0; background: var(--tb); border: 1px solid var(--t); color: var(--t); border-radius: 8px; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; overflow: hidden; white-space: nowrap; }
	.blk.on { background: var(--t); color: #fff; }
	.nowline { position: absolute; top: -4px; bottom: -4px; width: 2px; background: #c0392b; }
	.ax { position: relative; height: 18px; margin-top: 2px; }
	.ax span { position: absolute; transform: translateX(-50%); font-size: 11px; }
	.ax span:first-child { transform: none; } .ax span:last-child { transform: translateX(-100%); }
	.iv { list-style: none; padding: 0; margin: 8px 0 0; }
	.iv li { padding: 6px 0; border-bottom: 1px solid var(--line); }
	.iv li.on b { color: var(--t); }
	dl { display: grid; grid-template-columns: 76px 1fr; gap: 8px 10px; margin: 0; }
	dt { font-weight: 700; color: var(--t); font-size: 14px; }
	dd { margin: 0; font-size: 15px; }
	.chk ul { margin: 6px 0 0; padding-left: 18px; }
</style>
