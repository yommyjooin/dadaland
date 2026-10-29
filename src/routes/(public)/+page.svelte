<script lang="ts">
	import { onMount } from 'svelte';
	import { live } from '$lib/live.svelte';
	import FloorPlan from '$lib/components/FloorPlan.svelte';
	import Pin from '$lib/components/Pin.svelte';

	let board: HTMLDivElement;
	let pins = $state<{ x: number; y: number }[]>([]);
	const busy = $derived(Object.values(live.status).filter((s) => s.status !== 'ok').length);

	// 압정 위치를 읽어서 빨간 실을 그려요.
	function measure() {
		if (!board) return;
		const r = board.getBoundingClientRect();
		pins = [...board.querySelectorAll<HTMLElement>('[data-string]')]
			.sort((a, b) => Number(a.dataset.string) - Number(b.dataset.string))
			.map((el) => {
				const p = el.getBoundingClientRect();
				return { x: p.left + p.width / 2 - r.left, y: p.top - r.top };
			});
	}
	onMount(() => {
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(board);
		document.fonts?.ready.then(measure);
		return () => ro.disconnect();
	});
	const path = $derived(
		pins.length > 1
			? pins.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `Q${(pins[i - 1].x + p.x) / 2},${Math.max(pins[i - 1].y, p.y) + 46} ${p.x},${p.y}`)).join(' ')
			: ''
	);
</script>

<div class="board" bind:this={board}>
	<div class="plate">
		<span>다다탐정사무소</span>
		<small>장위지부 · 신입 탐정 모집 중</small>
	</div>

	<!-- 1. 현장 지도 -->
	<div class="paper map" data-string="1">
		<Pin />
		<span class="tape l"></span><span class="tape r"></span>
		<p class="cap"><b>현장 지도</b> 오른쪽 입구에서 시작해 왼쪽 출구로!</p>
		<FloorPlan showStatus fit />
	</div>

	<div class="row">
		<!-- 2. 숨은그림찾기 봉투 -->
		<a class="envelope" href="/hidden" data-string="2">
			<Pin color="#2d5aa8" />
			<span class="flap"></span>
			<span class="label">쉬어 가는 놀이</span>
			<strong>숨은그림찾기</strong>
			<span class="small">기다리는 동안 해 봐요.<br />꼭 안 해도 괜찮아요!</span>
			<span class="stamp">자유 참여</span>
		</a>

		<!-- 3. 시험지 -->
		<a class="exam" href="/quiz" data-string="3">
			<Pin color="#2f6e3c" />
			<span class="clip"></span>
			<span class="label">신입 탐정 시험</span>
			<ol><li>탐정 수칙 하나는?</li><li>볼풀에는 몇 명까지?</li><li>차례가 밀리면?</li></ol>
			<span class="go">8문제 풀기 →</span>
		</a>
	</div>

	<div class="row">
		<!-- 4. 무전 기록 -->
		<a class="radio" href="/status" data-string="4">
			<Pin color="#b8862b" />
			<span class="label">현장 무전</span>
			<strong>{busy ? `${busy}곳이 붐벼요` : '모든 부스 원활'}</strong>
			<span class="small">어디가 한산한지 보고 가요</span>
			{#if live.enabled}<span class="live" class:on={live.connected}>● 실시간</span>{/if}
		</a>

		<!-- 5. 신분증 -->
		<a class="idcard" href="/badge" data-string="5">
			<Pin color="#a8325f" />
			<span class="photo" aria-hidden="true"></span>
			<span class="txt"><span class="label">두 사건 해결 후</span><strong>임명장 받기</strong>
				{#if live.enabled}<span class="small">오늘 신입 탐정 <b class="tnum">{live.detectives}</b>명</span>{/if}</span>
		</a>
	</div>

	<div class="note">
		<span class="tape c"></span>
		<b>신입 탐정 수칙</b>
		<p>하나, 천천히 움직이기 · 둘, 동료 탐정 배려하기 · 셋, 도구 소중히 · 넷, 어려우면 요원 호출 · 다섯, 끝까지 임무 완수!</p>
	</div>

	{#if path}
		<svg class="strings" aria-hidden="true"><path d={path} /></svg>
	{/if}
</div>

<style>
	.board { position: relative; display: flex; flex-direction: column; gap: 26px; }
	.strings { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; overflow: visible; }
	.strings path { fill: none; stroke: #c0392b; stroke-width: 2.2; stroke-linecap: round; filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.35)); }

	.plate { align-self: center; text-align: center; padding: 10px 26px 9px; border-radius: 6px;
		background: linear-gradient(180deg, #e9c46a, #b8862b 55%, #8a6114); color: #3a2318;
		box-shadow: inset 0 1px 0 #fff6, 0 4px 0 #5a3a10, 0 8px 14px rgba(0, 0, 0, 0.35); }
	.plate span { display: block; font-family: var(--display); font-size: 26px; letter-spacing: 0.08em; text-shadow: 0 1px 0 #f6dc9a; }
	.plate small { font-weight: 700; font-size: 12px; letter-spacing: 0.12em; }

	.paper, .envelope, .exam, .radio, .idcard, .note { position: relative; z-index: 2; text-decoration: none; color: #2b1a12; box-shadow: 2px 6px 12px rgba(30, 15, 5, 0.38); }
	.label { display: block; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #8a5a12; }
	strong { display: block; word-break: keep-all; font-family: var(--display); font-weight: 400; font-size: 23px; line-height: 1.15; margin: 4px 0 6px; }

	.map { background: #fbf6ea; padding: 14px 12px 12px; transform: rotate(-0.8deg); }
	.map .cap { font-size: 14px; margin: 2px 4px 8px; }
	.map .cap b { font-family: var(--display); font-weight: 400; font-size: 19px; margin-right: 6px; }
	.map :global(.scroll) { border: 0; padding: 0; background: transparent; }
	.map :global(figure figcaption) { display: none; }
	.tape { position: absolute; width: 70px; height: 22px; background: rgba(240, 228, 190, 0.75); box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15); z-index: 3; }
	.tape.l { top: -8px; left: -14px; transform: rotate(-32deg); }
	.tape.r { bottom: -8px; right: -14px; transform: rotate(-32deg); }
	.tape.c { top: -11px; left: 50%; margin-left: -35px; transform: rotate(3deg); }

	.row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
	@media (max-width: 380px) { .row { grid-template-columns: 1fr; } }

	.envelope { display: block; background: #d9b77e linear-gradient(160deg, #e4c58f, #c99f5f); padding: 46px 14px 16px; border-radius: 3px; transform: rotate(1.6deg); overflow: hidden; }
	.flap { position: absolute; left: 0; right: 0; top: 0; height: 40px; background: #c69a58; clip-path: polygon(0 0, 100% 0, 50% 100%); box-shadow: inset 0 -2px 0 #0001; }
	.stamp { position: absolute; right: 12px; top: 14px; z-index: 3; transform: rotate(-12deg); border: 2px solid #b3261e; color: #b3261e; font-weight: 700; font-size: 12px; padding: 1px 6px; border-radius: 4px; opacity: 0.85; }
	.small { display: block; font-size: 13px; line-height: 1.35; color: #4a3424; }

	.exam { display: block; background: #fff repeating-linear-gradient(180deg, transparent 0 23px, #dbe6f2 23px 24px); padding: 18px 14px 14px 22px; transform: rotate(-1.4deg); border-left: 2px solid #f0b6b0; }
	.clip { position: absolute; top: -12px; right: 18px; width: 16px; height: 40px; border: 3px solid #9aa3ad; border-radius: 8px; border-bottom-color: transparent; }
	.exam ol { margin: 6px 0 8px; padding-left: 18px; font-size: 14px; line-height: 24px; }
	.go { font-weight: 700; color: #2f6e3c; }

	.radio { display: block; background: #f6f1df; padding: 16px 14px 14px; border-radius: 2px; transform: rotate(-1deg);
		background-image: repeating-linear-gradient(90deg, transparent 0 12px, #0000000a 12px 13px); }
	.live { display: inline-block; margin-top: 6px; font-size: 12px; font-weight: 700; color: var(--mute); }
	.live.on { color: #c0392b; }

	.idcard { display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: center; background: #fdfbf6; border-radius: 10px; padding: 16px 12px 12px; transform: rotate(1.2deg);
		border-top: 8px solid #a8325f; }
	.photo { width: 40px; height: 50px; border-radius: 4px; background: #e9e2d4 url('/favicon.svg') center/34px no-repeat; border: 1px dashed #b6a78f; }
	.idcard strong { font-size: 20px; word-break: keep-all; }
	.txt { min-width: 0; }

	.note { background: #fff3a8; padding: 18px 16px 14px; transform: rotate(0.6deg); }
	.note b { font-family: var(--display); font-weight: 400; font-size: 18px; }
	.note p { margin: 4px 0 0; font-size: 14.5px; line-height: 1.55; }

	a.envelope, a.exam, a.radio, a.idcard { transition: transform 0.15s; }
	a.envelope:active, a.exam:active, a.radio:active, a.idcard:active { transform: rotate(0deg) scale(0.98); }
	@media (prefers-reduced-motion: reduce) { a { transition: none; } }
</style>
