<script lang="ts">
	import { live, ago } from '$lib/live.svelte';
	import { BOOTH, TEAM_COLOR } from '$lib/schedule';
	import { PUBLIC_BOOTHS, PUBLIC_STATUS } from '$lib/public';
	const groups = [
		{ name: 'C 콧물탐정단', keys: ['가', '나', '다'] },
		{ name: 'A 동네방네 탐정단', keys: ['라', '마'] },
		{ name: 'B 보물열쇠 탐정단', keys: ['바', '사', '아', '자', '차'] },
		{ name: '마지막 임무', keys: ['카'] }
	];
	const pb = Object.fromEntries(PUBLIC_BOOTHS.map((b) => [b.key, b]));
</script>

<div class="log">
	<p class="head">현장 무전 기록 {#if live.enabled}<span class:on={live.connected}>● {live.connected ? '수신 중' : '연결 중'}</span>{/if}</p>
	{#if !live.enabled}<p class="off">무전은 행사 당일(10/31)에 켜져요.</p>
	{:else}<p class="off">운영요원이 ‘붐벼요’라고 알린 부스만 표시돼요. 표시가 없으면 평소대로 진행 중이에요.</p>{/if}
	{#each groups as g}
		<h2>{g.name}</h2>
		<ul>
			{#each g.keys as k}
				{@const st = live.cur(k)}
				{@const s = PUBLIC_STATUS[st?.status ?? 'ok']}
				<li style="--t:{TEAM_COLOR[BOOTH[k].team]}">
					<span class="k"></span>
					<span class="tx"><b>{pb[k].title}</b><small>{pb[k].desc}</small></span>
					{#if live.enabled && st && st.status !== 'ok'}<span class="s {s.tone}">{s.label}<small>{ago(st.updated_at)}</small></span>{/if}
				</li>
			{/each}
		</ul>
	{/each}
</div>

<style>
	.log { background: #f6f1df; padding: 18px 16px; box-shadow: 2px 6px 12px rgba(30, 15, 5, 0.38);
		background-image: repeating-linear-gradient(180deg, transparent 0 27px, #0000000d 27px 28px); }
	.head { font-weight: 700; letter-spacing: 0.06em; color: #8a5a12; margin: 0; display: flex; justify-content: space-between; }
	.head span { color: var(--mute); font-size: 13px; } .head span.on { color: #c0392b; }
	.off { color: var(--mute); }
	h2 { font-size: 17px; margin: 16px 0 6px; }
	ul { list-style: none; padding: 0; margin: 0; }
	li { display: grid; grid-template-columns: 10px 1fr auto; gap: 10px; align-items: center; padding: 9px 0; border-bottom: 1px dashed #c9b993; }
	.k { width: 10px; height: 10px; border-radius: 50%; background: var(--t); flex: none; }
	.tx small { display: block; color: var(--mute); font-size: 13px; }
	.s { font-weight: 700; font-size: 14px; text-align: right; }
	.s small { display: block; font-weight: 400; color: var(--mute); font-size: 11px; }
	.s.ok { color: #2f7d40; } .s.busy { color: #b7791f; }
</style>
