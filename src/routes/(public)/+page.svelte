<script lang="ts">
	import { live } from '$lib/live.svelte';
	import { BOOTH, TEAM_COLOR } from '$lib/schedule';
	import { PUBLIC_BOOTHS, PUBLIC_STATUS } from '$lib/public';
	import FloorPlan from '$lib/components/FloorPlan.svelte';
	const steps = ['접수하고 탐정수첩 받기', '탐정 사진 찍기', '수첩 꾸미기', 'A팀 사건 + B팀 사건 해결', '탐정 임명식!'];
	const groups = [
		{ name: '신입 탐정 접수처', keys: ['가', '나', '다'] },
		{ name: 'A팀 · 동네방네 탐정단', keys: ['라', '마'] },
		{ name: 'B팀 · 보물열쇠 탐정단', keys: ['바', '사', '아', '자', '차'] },
		{ name: '마지막', keys: ['카'] }
	];
	const pb = Object.fromEntries(PUBLIC_BOOTHS.map((b) => [b.key, b]));
</script>

<section class="hero">
	<p class="kicker">탐정을 모집합니다</p>
	<h1>성북구의 사라진 비밀을<br />함께 찾아 주세요!</h1>
	{#if live.enabled}
		<p class="count">오늘 탄생한 신입 탐정 <b class="tnum">{live.detectives}</b>명</p>
	{/if}
</section>

<ol class="steps">
	{#each steps as s, i}<li><b>{i + 1}</b>{s}</li>{/each}
</ol>

<h2 class="sec">어디로 가면 될까요?</h2>
<FloorPlan showStatus />

<h2 class="sec">지금 부스 상황 {#if live.enabled}<span class="live" class:on={live.connected}>실시간</span>{/if}</h2>
{#if !live.enabled}<p class="muted small">실시간 정보는 행사 당일에 보여요.</p>{/if}

{#each groups as g}
	<h3 class="gh">{g.name}</h3>
	<div class="list">
		{#each g.keys as k}
			{@const s = PUBLIC_STATUS[live.status[k]?.status ?? 'ok']}
			<div class="bt" style="--t:{TEAM_COLOR[BOOTH[k].team]}">
				<span class="k">{k}</span>
				<span class="tx"><b>{pb[k].title}</b><small>{pb[k].desc}</small></span>
				{#if live.enabled}<span class="chip {s.tone}"><i></i>{s.label}</span>{/if}
			</div>
		{/each}
	</div>
{/each}

<div class="cta">
	<a class="btn primary" href="/mission">내 미션 체크하기</a>
	<a class="btn" href="/quiz">기다리는 동안 퀴즈</a>
</div>

<style>
	.hero { background: #3a2318; color: #f6e9cf; border-radius: 18px; padding: 22px 20px; margin-top: 6px; position: relative; overflow: hidden; }
	.hero::after { content: ''; position: absolute; right: -30px; top: -30px; width: 140px; height: 140px; border-radius: 50%; border: 14px solid rgba(230, 184, 92, 0.25); }
	.kicker { margin: 0; color: #e6b85c; font-weight: 700; letter-spacing: 0.1em; font-size: 13px; }
	h1 { font-size: 27px; margin: 6px 0 0; color: #fff; }
	.count { margin: 14px 0 0; font-size: 15px; }
	.count b { font-family: var(--display); font-size: 30px; color: #e6b85c; margin: 0 2px; }
	.steps { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 6px; }
	.steps li { display: flex; gap: 10px; align-items: center; background: rgba(255, 255, 255, 0.7); border-radius: 12px; padding: 9px 12px; font-weight: 700; }
	.steps b { width: 26px; height: 26px; border-radius: 50%; background: #6b3f22; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; flex: none; }
	.sec { font-size: 21px; margin: 22px 0 4px; display: flex; gap: 8px; align-items: center; }
	.live { font-family: var(--body); font-size: 12px; font-weight: 700; color: var(--mute); border: 1px solid var(--line); border-radius: 999px; padding: 1px 8px; }
	.live.on { color: #c0392b; border-color: #e7b3ab; }
	.live.on::before { content: '● '; }
	.gh { font-size: 15px; color: var(--mute); margin: 14px 0 6px; font-family: var(--body); font-weight: 700; }
	.list { display: grid; gap: 6px; }
	.bt { display: grid; grid-template-columns: 34px 1fr auto; gap: 10px; align-items: center; background: #fff; border-radius: 12px; padding: 10px 12px; border: 1px solid var(--line); }
	.k { width: 32px; height: 32px; border-radius: 50%; background: var(--t); color: #fff; font-family: var(--display); display: flex; align-items: center; justify-content: center; }
	.tx small { display: block; color: var(--mute); font-size: 13px; }
	.cta { display: flex; gap: 8px; margin-top: 18px; flex-wrap: wrap; }
	.cta .btn { text-decoration: none; flex: 1; text-align: center; min-width: 150px; }
</style>
