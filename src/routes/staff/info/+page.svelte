<script lang="ts">
	import { D } from '$lib/schedule';
	import { live, ago } from '$lib/live.svelte';
	import { me } from '$lib/me.svelte';
	import FloorPlan from '$lib/components/FloorPlan.svelte';
	import PushCard from '$lib/components/PushCard.svelte';
	let body = $state('');
	let sending = $state(false);
	async function post(e: SubmitEvent) {
		e.preventDefault();
		const t = body.trim();
		if (!t) return;
		sending = true;
		if (await live.post(t, me.name)) body = '';
		sending = false;
	}
</script>

<section class="stack">
	<PushCard />
	<h1>안내</h1>

	<div class="card" id="notices">
		<h2>공지</h2>
		{#if live.enabled}
			<form onsubmit={post} class="post">
				<label for="nb" class="small muted">{me.name ? `${me.name} 이름으로 올라가요` : '내 일정 탭에서 이름을 먼저 골라 주세요'}</label>
				<div class="row">
					<input id="nb" maxlength="300" placeholder="예) 책갈피 공방 재료 보충 완료, 13시 점심 간식 대기실에 있어요" bind:value={body} />
					<button class="btn primary" disabled={sending || !body.trim()}>올리기</button>
				</div>
			</form>
			{#if live.notices.length}
				<ul class="nl">{#each live.notices as n}<li><p>{n.body}</p><small class="muted">{n.author ?? '익명'} · {ago(n.created_at)}</small></li>{/each}</ul>
			{:else}<p class="muted small">아직 공지가 없어요.</p>{/if}
		{:else}
			<p class="muted small">실시간 기능이 연결되지 않았어요. 공지는 단톡방을 봐 주세요.</p>
		{/if}
	</div>

	<div class="card">
		<h2>운영 규칙</h2>
		<dl>{#each D.rules as r}<dt>{r[0]}</dt><dd>{r[1]}</dd>{/each}</dl>
	</div>

	<div class="card">
		<h2>당일 흐름</h2>
		<ul class="flow">{#each D.flow as f}<li><span class="tnum">{f[0]}</span>{f[1]}</li>{/each}</ul>
	</div>

	<div class="card">
		<h2>신입 탐정 5가지 수칙</h2>
		<p class="small muted">아이들에게 이렇게 안내해요. “탐정 수칙 하나! 천천히 움직이기~”</p>
		<ol>{#each D.detectiveRules as r}<li>{r}</li>{/each}</ol>
	</div>

	<div class="card">
		<h2>공간 배치도</h2>
		<FloorPlan showStatus />
	</div>
</section>

<style>
	h1 { font-size: 26px; }
	h2 { font-size: 18px; margin-bottom: 8px; color: var(--brown); }
	.row { display: flex; gap: 8px; margin-top: 4px; }
	.row input { flex: 1; min-width: 0; font: inherit; padding: 10px 12px; border: 1px solid var(--line); border-radius: 10px; }
	.btn:disabled { opacity: 0.5; }
	.nl { list-style: none; margin: 12px 0 0; padding: 0; }
	.nl li { padding: 10px 0; border-top: 1px solid var(--line); }
	.nl p { margin: 0; }
	dl { display: grid; grid-template-columns: 64px 1fr; gap: 8px 10px; margin: 0; }
	dt { font-weight: 700; color: var(--brown); }
	dd { margin: 0; }
	.flow { list-style: none; padding: 0; margin: 0; }
	.flow li { display: grid; grid-template-columns: 104px 1fr; padding: 4px 0; }
	ol { margin: 6px 0 0; }
	.card p { margin: 0 0 6px; }
</style>
