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
	const title = $derived(score === QUIZ.length ? '퀴즈왕 탐정' : score >= 6 ? '눈썰미 탐정' : score >= 4 ? '꼼꼼한 탐정' : '씩씩한 견습 탐정');
</script>


{#if !finished}
	<p class="muted tnum">{i + 1} / {QUIZ.length}</p>
	<div class="card qcard">
		<h2>{q.q}</h2>
		<div class="opts">
			{#each q.options as o, n}
				<button class:right={picked !== null && n === q.answer} class:wrong={picked === n && n !== q.answer} disabled={picked !== null && picked !== n && n !== q.answer} onclick={() => pick(n)}>{o}</button>
			{/each}
		</div>
		{#if picked !== null}
			<p class="why"><b>{picked === q.answer ? '정답!' : '아쉬워요!'}</b> {q.why}</p>
			<button class="btn primary" onclick={next}>{i + 1 === QUIZ.length ? '결과 보기' : '다음 문제'}</button>
		{/if}
	</div>
{:else}
	<div class="result">
		<p class="kicker">탐정 퀴즈 결과</p>
		<p class="score tnum">{score} / {QUIZ.length}</p>
		<h2>{title}</h2>
		<p>단서를 잘 살폈어요! 이제 진짜 사건을 해결하러 가 볼까요?</p>
		<div class="row">
			<button class="btn" onclick={again}>다시 풀기</button>
			<a class="btn primary" href="/status">지금 부스 보기</a>
		</div>
	</div>
{/if}

<style>
	.qcard h2 { font-size: 21px; margin-bottom: 14px; }
	.opts { display: grid; gap: 8px; }
	.opts button { text-align: left; padding: 14px; border-radius: 12px; border: 2px solid var(--line); background: #fff; font-weight: 700; color: var(--ink); font-size: 17px; }
	.opts button.right { border-color: #2f7d40; background: #eaf4e6; color: #2f6e3c; }
	.opts button.wrong { border-color: #c0392b; background: #fbe9e7; color: #a5281b; }
	.opts button:disabled { opacity: 0.45; }
	.why { background: var(--tint); border-radius: 10px; padding: 10px 12px; }
	.qcard .btn { margin-top: 4px; }
	.result { background: #3a2318; color: #f6e9cf; border-radius: 18px; padding: 24px 20px; text-align: center; margin-top: 10px; }
	.kicker { margin: 0; color: #e6b85c; font-weight: 700; letter-spacing: 0.1em; font-size: 13px; }
	.score { font-family: var(--display); font-size: 54px; margin: 6px 0 0; color: #fff; }
	.result h2 { color: #e6b85c; font-size: 26px; }
	.row { display: flex; gap: 8px; justify-content: center; margin-top: 12px; flex-wrap: wrap; }
	.row .btn { text-decoration: none; }
	.result .btn.primary { background: #e6b85c; border-color: #e6b85c; color: #3a2318; }
</style>
