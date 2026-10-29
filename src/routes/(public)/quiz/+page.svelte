<script lang="ts">
	import { QUIZ } from '$lib/public';
	let i = $state(0);
	let picked = $state<number | null>(null);
	let score = $state(0);
	const q = $derived(QUIZ[i]);
	const finished = $derived(i >= QUIZ.length);
	function pick(n: number) {
		if (picked !== null) return;
		picked = n;
		if (n === q.answer) score++;
	}
	function next() {
		picked = null;
		i++;
		if (i >= QUIZ.length) {
			try {
				localStorage.setItem('dada.quiz', String(Math.max(score, Number(localStorage.getItem('dada.quiz') ?? 0))));
			} catch {}
		}
	}
	function again() {
		i = 0; picked = null; score = 0;
	}
	const title = $derived(score === QUIZ.length ? '수칙 박사 탐정' : score >= 6 ? '눈썰미 탐정' : score >= 4 ? '꼼꼼한 탐정' : '씩씩한 견습 탐정');
</script>


{#if !finished}
	<div class="paper qcard">
		<div class="head"><span>신입 탐정 시험지</span><span class="tnum">{i + 1} / {QUIZ.length}</span></div>
		<div class="bar"><i style="width:{((i + (picked !== null ? 1 : 0)) / QUIZ.length) * 100}%"></i></div>
		<h2><span class="no">{i + 1}.</span> {q.q}</h2>
		<div class="opts">
			{#each q.options as o, n}
				<button data-n={"①②③④"[n]} class:right={picked !== null && n === q.answer} class:wrong={picked === n && n !== q.answer} disabled={picked !== null && picked !== n && n !== q.answer} onclick={() => pick(n)}>{o}</button>
			{/each}
		</div>
		{#if picked !== null}
			<p class="why"><span class="mark" class:x={picked !== q.answer}>{picked === q.answer ? "○" : "✕"}</span><b>{picked === q.answer ? '정답!' : '아쉬워요!'}</b> {q.why}</p>
			<button class="btn primary" onclick={next}>{i + 1 === QUIZ.length ? '결과 보기' : '다음 문제'}</button>
		{/if}
	</div>
{:else}
	<div class="paper result">
		<p class="kicker">신입 탐정 시험 결과</p>
		<p class="score tnum">{score} / {QUIZ.length}</p>
		<h2>{title}</h2>
		<p>수칙을 잘 알고 있네요! 안전하게 사건을 해결하러 가 볼까요?</p>
		<div class="row">
			<button class="btn" onclick={again}>다시 풀기</button>
			<a class="btn primary" href="/status">지금 부스 보기</a>
		</div>
	</div>
{/if}

<style>
	.paper { position: relative; margin-top: 14px; background: #fffdf6 repeating-linear-gradient(180deg, transparent 0 31px, #dbe6f2 31px 32px); border-left: 3px solid #f0b6b0; padding: 18px 16px 18px 20px; box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35); transform: rotate(-0.6deg); }
	.head { display: flex; justify-content: space-between; font-family: var(--display); color: #8a5a2b; font-size: 15px; letter-spacing: 0.06em; }
	.bar { height: 5px; background: #eadfca; border-radius: 3px; margin: 8px 0 14px; overflow: hidden; }
	.bar i { display: block; height: 100%; background: #2f6e3c; transition: width 0.3s; }
	.qcard h2 { font-size: 21px; line-height: 1.4; margin: 0 0 14px; color: #2b1b12; word-break: keep-all; }
	.no { color: #b3261e; }
	.opts { display: grid; gap: 8px; }
	.opts button { position: relative; text-align: left; padding: 12px 14px 12px 42px; border-radius: 6px; border: 1.5px solid #d9ccb4; background: #fff; color: #2b1b12; font-family: var(--body); font-size: 18px; }
	.opts button::before { content: attr(data-n); position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8a5a2b; font-size: 18px; }
	.opts button.right { border-color: #2f7d40; background: #eef6ea; }
	.opts button.right::after { content: ''; position: absolute; left: 6px; top: 50%; width: 30px; height: 30px; transform: translateY(-50%); border: 3px solid #c0392b; border-radius: 50%; }
	.opts button.wrong { border-color: #c0392b; background: #fbeeec; text-decoration: line-through; text-decoration-color: #c0392b; }
	.opts button:disabled { opacity: 0.4; }
	.why { position: relative; background: #fff6d6; border-radius: 4px; padding: 10px 12px 10px 44px; margin: 14px 0 10px; font-size: 16px; line-height: 1.5; word-break: keep-all; }
	.mark { position: absolute; left: 10px; top: 4px; font-size: 26px; color: #c0392b; font-weight: 700; }
	.why b { margin-right: 4px; }
	.qcard .btn { width: 100%; }
	.result { text-align: center; padding: 24px 20px; }
	.kicker { margin: 0; color: #8a5a2b; font-family: var(--display); letter-spacing: 0.1em; font-size: 14px; }
	.score { display: inline-block; font-family: var(--display); font-size: 52px; margin: 10px 0 4px; color: #b3261e; border: 4px solid #b3261e; border-radius: 50%; padding: 6px 18px; transform: rotate(-8deg); }
	.result h2 { color: #2b1b12; font-size: 26px; margin: 6px 0; }
	.result p { word-break: keep-all; }
	.row { display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
	.row .btn { text-decoration: none; }
</style>
