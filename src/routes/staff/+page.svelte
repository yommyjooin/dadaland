<script lang="ts">
	import { me } from '$lib/me.svelte';
	import { clock } from '$lib/clock.svelte';
	import { live, ago } from '$lib/live.svelte';
	import NoticeBar from '$lib/components/NoticeBar.svelte';
	import { PEOPLE, TEAM_NAME, TEAM_COLOR, TEAM_BG, SLOTS, toMin, fmt, segments, label, slotAt, handIn, handOut, BOOTH, supportOf } from '$lib/schedule';

	const person = $derived(PEOPLE.find((p) => p.name === me.name));
	const segs = $derived(person ? segments(person) : []);
	const idx = $derived(slotAt(clock.min));
	const curSeg = $derived(segs.find((s) => idx >= s.from && idx <= s.to));
	const nextSeg = $derived(curSeg ? segs[segs.indexOf(curSeg) + 1] : idx < 0 ? segs[0] : undefined);
	const left = $derived(curSeg ? toMin(SLOTS[curSeg.to + 1]) - clock.min : null);
	const groups = ['A', 'B', 'C', '알바'];
	const brk = $derived(me.name ? live.breaks[me.name] : undefined);

	function tone(code: string) {
		if (BOOTH[code]) return { bg: TEAM_BG[BOOTH[code].team], fg: TEAM_COLOR[BOOTH[code].team] };
		if (code === '휴') return { bg: 'var(--Rbg)', fg: '#5f5e57' };
		if (code === '지') return { bg: 'var(--Sbg)', fg: '#8a5a00' };
		return { bg: '#f2efe8', fg: 'var(--mute)' };
	}
	function hint(code: string, from: number, to: number) {
		if (!me.name) return '';
		if (code === '지') return '5분 넘게 기다리는 부스가 있으면 그쪽 먼저';
		const a = handIn(me.name, code, from), b = handOut(me.name, code, to);
		return [a && `${a}에게 인수`, b && `${b}에게 인계`].filter(Boolean).join(' · ');
	}
</script>

{#if !person}
	<section class="stack">
		<h1>내 이름을 골라 주세요</h1>
		<p class="muted small">한 번 고르면 이 폰에서 기억해요.</p>
		{#each groups as g}
			<div>
				<h2 class="gh" style="color:{TEAM_COLOR[g]}">{TEAM_NAME[g]}</h2>
				<div class="names">
					{#each PEOPLE.filter((p) => p.team === g) as p}
						<button class="btn" onclick={() => me.set(p.name)}>{p.name}</button>
					{/each}
				</div>
			</div>
		{/each}
	</section>
{:else}
	<section class="stack">
		<NoticeBar />
		<div class="hello">
			<div>
				<h1>{person.name}</h1>
				<span class="muted small">{TEAM_NAME[person.team]}</span>
			</div>
			<button class="link small" onclick={() => me.set(null)}>이름 바꾸기</button>
		</div>

		{#if idx < 0}
			<div class="card now"><span class="muted small">운영 시작 전</span><h2>11:20 부스 운영 시작</h2>
				<p class="small muted">08:30 집합 · 10:00 시뮬레이션 · 10:30 점심 · 11:00 개막식</p></div>
		{:else if idx > 10}
			<div class="card now"><h2>오늘 운영 끝! 고생 많으셨어요</h2></div>
		{:else if curSeg}
			{@const t = tone(curSeg.code)}
			<div class="card now" style="--bg:{t.bg};--fg:{t.fg}">
				<span class="muted small">지금 · {SLOTS[curSeg.from]}–{SLOTS[curSeg.to + 1]}</span>
				<h2 class="big">{label(curSeg.code, person.name)}</h2>
				<p class="small">{hint(curSeg.code, curSeg.from, curSeg.to)}</p>
				{#if left !== null}<p class="left tnum">{SLOTS[curSeg.to + 1]}까지 <b>{left}분</b> 남았어요</p>{/if}
				{#if BOOTH[curSeg.code]}<a class="btn" href="/staff/booths/{encodeURIComponent(curSeg.code)}">대본 보기</a>{/if}
			</div>
		{/if}

		{#if nextSeg && idx <= 10}
			<div class="card next">
				<span class="muted small">다음 · {SLOTS[nextSeg.from]}부터</span>
				<h3>{label(nextSeg.code, person.name)}</h3>
				<p class="small muted">{hint(nextSeg.code, nextSeg.from, nextSeg.to)}</p>
			</div>
		{/if}

		{#if live.enabled && person.slots.includes('휴')}
			<div class="card brk">
				<div><b>휴식 체크</b>
					<p class="small muted">{brk ? `${brk.state === 'out' ? '휴식 중' : '복귀함'} · ${ago(brk.updated_at)}` : '쉬러 갈 때와 돌아올 때 눌러 주세요.'}</p></div>
				<div class="row">
					<button class="btn" disabled={brk?.state === 'out'} onclick={() => live.setBreak(person.name, 'out')}>휴식 출발</button>
					<button class="btn primary" disabled={brk?.state !== 'out'} onclick={() => live.setBreak(person.name, 'back')}>복귀</button>
				</div>
			</div>
		{/if}

		<h2 class="sec">오늘 내 일정</h2>
		<ol class="day">
			{#each segs as s}
				{#if s.code !== '-'}
					{@const t = tone(s.code)}
					<li class:cur={s === curSeg} class:rest={s.code === '휴'} style="--bg:{t.bg};--fg:{t.fg}">
						<span class="tm tnum">{SLOTS[s.from]}–{SLOTS[s.to + 1]}</span>
						<span class="lb">{label(s.code, person.name)}<small>{hint(s.code, s.from, s.to)}</small></span>
					</li>
				{:else}
					<li class="idle"><span class="tm tnum">{person.name === '김동주' ? '~15:00' : '11:00–12:00'}</span><span class="lb">{label('-', person.name)}</span></li>
				{/if}
			{/each}
		</ol>
	</section>
{/if}

<style>
	.gh { font-size: 18px; margin: 6px 0 8px; }
	.names { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 8px; }
	.names .btn { padding: 14px 8px; font-size: 17px; }
	.hello { display: flex; justify-content: space-between; align-items: flex-end; }
	.hello h1 { font-size: 30px; }
	.link { border: 0; background: none; color: var(--mute); text-decoration: underline; }
	.now { background: var(--bg, #fff); border-color: transparent; background: var(--bg); display: flex; flex-direction: column; gap: 4px; }
	.now .big { font-size: 28px; color: var(--fg); }
	.now p { margin: 0; }
	.left { font-size: 15px; } .left b { font-size: 20px; }
	.now .btn { align-self: flex-start; margin-top: 6px; }
	.next h3 { font-size: 20px; margin-top: 2px; }
	.next p { margin: 2px 0 0; }
	.brk { display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap; }
	.brk p { margin: 0; }
	.row { display: flex; gap: 8px; }
	.btn:disabled { opacity: 0.4; }
	.sec { font-size: 20px; margin-top: 8px; }
	.day { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
	.day li { display: grid; grid-template-columns: 104px 1fr; gap: 10px; align-items: center; background: var(--bg); border-radius: 10px; padding: 10px 12px; border: 2px solid transparent; }
	.day li.cur { border-color: var(--fg); }
	.day li.rest { border: 1px dashed #8a897f; }
	.day li.idle { background: #f2efe8; color: var(--mute); }
	.tm { font-size: 14px; font-weight: 700; }
	.lb { font-weight: 700; color: var(--fg); }
	.lb small { display: block; font-weight: 400; color: var(--mute); font-size: 12.5px; }
</style>
