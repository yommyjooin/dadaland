<script lang="ts">
	// 탐정 암호 해독: 네 개의 암호를 풀 때마다 비밀 글자를 하나씩 얻고, 마지막에 순서대로 맞춰요.
	type Stage = { title: string; how: string; reward: string };
	const STAGES: Stage[] = [
		{ title: '거꾸로 암호', how: '글자가 거꾸로 적혀 있어요. 뒤에서부터 읽어 보세요.', reward: '장' },
		{ title: '숫자 암호', how: '숫자표를 보고 숫자를 글자로 바꿔요. 순서대로 글자를 눌러요.', reward: '위' },
		{ title: '가짜 글자 암호', how: '빨간 글자는 범인이 끼워 넣은 가짜예요! 검은 글자만 읽어요.', reward: '탐' },
		{ title: '흔적 암호', how: '이 흔적을 남긴 작가님은 누구일까요? 작가 도감에 힌트가 있어요.', reward: '정' }
	];
	const KEY = ['열', '보', '쇠', '물', '상', '자', '다', '탐', '정'];
	const CODE = [2, 4, 5, 6];
	const FAKE = [['돋', false], ['개', true], ['보', false], ['구', true], ['기', false], ['리', true]] as const;

	let solved = $state<boolean[]>([false, false, false, false]);
	let wrong = $state<number | null>(null);
	let built = $state<string[]>([]);
	let order = $state<string[]>([]);
	let done = $state(false);
	try {
		const s = JSON.parse(localStorage.getItem('dada.cipher') ?? 'null');
		if (s) { solved = s.solved; done = s.done; }
	} catch {}
	function save() { try { localStorage.setItem('dada.cipher', JSON.stringify({ solved, done })); } catch {} }
	function answer(i: number, ok: boolean) {
		if (ok) { solved[i] = true; wrong = null; save(); }
		else { wrong = i; setTimeout(() => (wrong === i ? (wrong = null) : 0), 1200); }
	}
	function tapKey(n: number) {
		if (solved[1]) return;
		built = [...built, KEY[n - 1]];
		const want = CODE.map((c) => KEY[c - 1]);
		if (built.length === want.length) {
			const ok = built.join('') === want.join('');
			answer(1, ok);
			if (!ok) setTimeout(() => (built = []), 700);
		}
	}
	const got = $derived(STAGES.filter((_, i) => solved[i]).map((s) => s.reward));
	const tiles = ['탐', '장', '정', '위'];
	function tapTile(t: string) {
		if (done || order.includes(t)) return;
		order = [...order, t];
		if (order.length === 4) {
			if (order.join('') === '장위탐정') { done = true; save(); }
			else { wrong = 9; setTimeout(() => { order = []; wrong = null; }, 900); }
		}
	}
	function reset() { solved = [false, false, false, false]; done = false; order = []; built = []; save(); }
</script>

<p class="lead">범인이 남긴 암호 전보 네 장! 하나 풀 때마다 <b>비밀 글자</b>를 얻어요. 네 글자를 모아 암호를 완성해 봐요.</p>

<div class="bag" aria-label="얻은 비밀 글자">
	{#each STAGES as s, i}<span class="slot" class:on={solved[i]}>{solved[i] ? s.reward : '?'}</span>{/each}
</div>

{#each STAGES as s, i}
	<section class="tele" class:ok={solved[i]} class:shake={wrong === i}>
		<header><span>전보 {i + 1}</span><b>{s.title}</b>{#if solved[i]}<em>해독!</em>{/if}</header>
		<p class="how">{s.how}</p>

		{#if i === 0}
			<p class="code big">정탐 입신</p>
			<div class="opts">
				{#each [['탐정 신입', false], ['신입 탐정', true], ['입신 정탐', false]] as [t, ok]}
					<button disabled={solved[0]} class:right={solved[0] && ok} onclick={() => answer(0, ok as boolean)}>{t}</button>
				{/each}
			</div>
		{:else if i === 1}
			<div class="key">{#each KEY as k, n}<button disabled={solved[1]} onclick={() => tapKey(n + 1)}><small>{n + 1}</small>{k}</button>{/each}</div>
			<p class="code big tnum">{CODE.join('  ')}</p>
			<p class="built">{solved[1] ? '보물상자' : built.join('') || '숫자표에서 글자를 순서대로 눌러요'}</p>
		{:else if i === 2}
			<p class="code big">{#each FAKE as [c, f]}<span class:fake={f}>{c}</span>{/each}</p>
			<div class="opts">
				{#each [['개구리', false], ['돋보기', true], ['보기돋', false]] as [t, ok]}
					<button disabled={solved[2]} class:right={solved[2] && ok} onclick={() => answer(2, ok as boolean)}>{t}</button>
				{/each}
			</div>
		{:else}
			<div class="trace"><img src="/hidden/item8.jpg" alt="갈대 그림" width="88" height="88" /></div>
			<div class="opts four">
				{#each [['이육사', false], ['한용운', false], ['박완서', false], ['신경림', true]] as [t, ok]}
					<button disabled={solved[3]} class:right={solved[3] && ok} onclick={() => answer(3, ok as boolean)}>{t}</button>
				{/each}
			</div>
			<a class="hint" href="/writers">작가 도감 보러 가기 →</a>
		{/if}
		{#if solved[i]}<p class="gain">비밀 글자 <b>{s.reward}</b> 획득!</p>{/if}
	</section>
{/each}

<section class="final" class:shake={wrong === 9}>
	<header><b>마지막 암호</b></header>
	{#if got.length < 4}
		<p class="how">전보 네 장을 모두 풀면 열려요. ({got.length}/4)</p>
	{:else if !done}
		<p class="how">비밀 글자를 알맞은 순서로 눌러 우리 동네 탐정 이름을 완성해요.</p>
		<div class="tiles">{#each tiles as t}<button disabled={order.includes(t)} onclick={() => tapTile(t)}>{t}</button>{/each}</div>
		<p class="built big">{order.join('') || '_ _ _ _'}</p>
	{:else}
		<div class="stamp">암호 해독 완료</div>
		<p class="win">너는 이제 <b>장위 탐정</b>!<br />다다탐정사무소 장위지부에 온 걸 환영해요.</p>
		<button class="again" onclick={reset}>처음부터 다시</button>
	{/if}
</section>

<style>
	.lead { color: #f6e9cf; font-size: 16px; margin: 4px 0 10px; word-break: keep-all; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35); }
	.lead b { color: #ffd98a; }
	.bag { display: flex; gap: 8px; justify-content: center; margin: 0 0 18px; }
	.slot { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; background: #3a2318; color: #8a7360; border: 2px dashed #8a7360; border-radius: 8px; font-family: var(--display); font-size: 26px; }
	.slot.on { background: #fff3a8; color: #b3261e; border: 2px solid #b3261e; }
	.tele, .final { position: relative; background: #f3ead2; padding: 14px 14px 14px; margin-bottom: 18px; box-shadow: 2px 6px 12px rgba(30, 15, 5, 0.38);
		background-image: repeating-linear-gradient(180deg, transparent 0 29px, #0000000f 29px 30px); }
	.tele:nth-of-type(odd) { transform: rotate(-0.6deg); } .tele:nth-of-type(even) { transform: rotate(0.6deg); }
	.tele.ok { background-color: #eef5e6; }
	header { display: flex; align-items: baseline; gap: 8px; border-bottom: 2px solid #6b3f22; padding-bottom: 6px; }
	header span { font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: #8a5a12; }
	header b { font-family: var(--display); font-weight: 400; font-size: 20px; }
	header em { margin-left: auto; font-style: normal; color: #b3261e; border: 2px solid #b3261e; padding: 0 8px; transform: rotate(-6deg); font-weight: 700; }
	.how { font-size: 15px; margin: 8px 0; word-break: keep-all; }
	.code { text-align: center; font-family: var(--display); letter-spacing: 0.2em; margin: 10px 0; }
	.big { font-size: 32px; }
	.fake { color: #c0392b; }
	.opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
	.opts.four { grid-template-columns: repeat(2, 1fr); }
	.opts button, .key button, .tiles button { padding: 12px 6px; border-radius: 8px; border: 2px solid #c9b48c; background: #fff; color: #2b1a12; font-size: 17px; font-weight: 700; }
	.opts button.right { border-color: #2f7d40; background: #e6f2e0; color: #2f6e3c; }
	button:disabled { opacity: 0.55; }
	.opts button.right:disabled { opacity: 1; }
	.key { display: grid; grid-template-columns: repeat(9, 1fr); gap: 4px; }
	.key button { padding: 6px 0 8px; font-size: 18px; display: flex; flex-direction: column; align-items: center; }
	.key small { font-size: 11px; color: #8a5a12; font-weight: 700; }
	.built { text-align: center; color: #6b3f22; min-height: 1.5em; font-weight: 700; margin: 4px 0; }
	.trace { display: flex; justify-content: center; margin: 6px 0 10px; }
	.trace img { border-radius: 50%; border: 3px solid #6b3f22; }
	.hint { display: block; text-align: right; margin-top: 8px; color: #2f6e3c; font-weight: 700; font-size: 14px; }
	.gain { margin: 10px 0 0; text-align: center; color: #2f6e3c; font-weight: 700; }
	.gain b { color: #b3261e; font-size: 20px; }
	.final { background-color: #fff3a8; text-align: center; }
	.final header { justify-content: center; }
	.tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-top: 8px; }
	.tiles button { font-family: var(--display); font-size: 26px; }
	.stamp { display: inline-block; margin: 14px 0 6px; border: 4px solid #b3261e; color: #b3261e; padding: 6px 16px; font-family: var(--display); font-size: 26px; transform: rotate(-6deg); }
	.win { font-size: 17px; margin: 6px 0; }
	.win b { color: #b3261e; font-family: var(--display); font-size: 22px; }
	.again { border: 0; background: none; text-decoration: underline; color: #6b3f22; margin-top: 6px; }
	.shake { animation: shake 0.35s; }
	@keyframes shake { 25% { translate: -6px 0; } 50% { translate: 6px 0; } 75% { translate: -3px 0; } }
	@media (prefers-reduced-motion: reduce) { .shake { animation: none; } }
</style>
