<script lang="ts">
	import { MISSION } from '$lib/public';
	let done = $state<Record<string, boolean>>({});
	try {
		done = JSON.parse(localStorage.getItem('dada.mission') ?? '{}');
	} catch {}
	const count = $derived(MISSION.filter((m) => done[m.id]).length);
	function toggle(id: string) {
		done = { ...done, [id]: !done[id] };
		try {
			localStorage.setItem('dada.mission', JSON.stringify(done));
		} catch {}
	}
</script>

<h1>내 탐정 미션</h1>
<p class="muted">하나씩 끝낼 때마다 눌러서 체크해요. 이 폰에 저장돼요.</p>

<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax={MISSION.length} aria-valuenow={count}>
	<span style="width:{(count / MISSION.length) * 100}%"></span>
</div>
<p class="prog tnum"><b>{count}</b> / {MISSION.length}</p>

<ul>
	{#each MISSION as m}
		<li>
			<button class:on={done[m.id]} onclick={() => toggle(m.id)} aria-pressed={!!done[m.id]}>
				<span class="box" aria-hidden="true">{done[m.id] ? '✓' : ''}</span>
				<span>{m.label}</span>
			</button>
		</li>
	{/each}
</ul>

{#if count === MISSION.length}
	<div class="done">
		<h2>모든 사건 해결!</h2>
		<p>이제 진짜 신입 탐정이에요. 임명장을 만들어 볼까요?</p>
		<a class="btn primary" href="/badge">임명장 만들기</a>
	</div>
{/if}

<style>
	h1 { font-size: 26px; margin-top: 6px; }
	.bar { height: 14px; background: #e9dcc3; border-radius: 999px; overflow: hidden; margin-top: 10px; }
	.bar span { display: block; height: 100%; background: linear-gradient(90deg, #b8862b, #e6b85c); transition: width 0.3s; }
	.prog { margin: 4px 0 10px; text-align: right; color: var(--mute); }
	.prog b { color: var(--brown); font-size: 18px; }
	ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 8px; }
	button { width: 100%; display: flex; gap: 12px; align-items: center; text-align: left; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 14px; font-weight: 700; color: var(--ink); }
	button.on { background: #eaf4e6; border-color: #b9d9b0; color: #2f6e3c; }
	.box { width: 26px; height: 26px; border-radius: 8px; border: 2px solid currentColor; display: inline-flex; align-items: center; justify-content: center; flex: none; }
	.done { margin-top: 18px; background: #3a2318; color: #f6e9cf; border-radius: 16px; padding: 18px; text-align: center; }
	.done h2 { color: #e6b85c; font-size: 24px; }
	.done .btn { text-decoration: none; display: inline-block; margin-top: 8px; background: #e6b85c; border-color: #e6b85c; color: #3a2318; }
	@media (prefers-reduced-motion: reduce) { .bar span { transition: none; } }
</style>
