<script lang="ts">
	import { page } from '$app/state';
	import cfg from '$lib/hidden.json';

	type Item = { id: string; no?: number; label: string; hint?: string; kind?: string; thumb?: string; x: number; y: number; r: number };
	const edit = page.url.searchParams.has('edit');
	let src = $state<string | null>(cfg.image);
	let W = $state(cfg.width), H = $state(cfg.height);
	let items = $state<Item[]>(cfg.items as Item[]);
	let found = $state<Record<string, boolean>>({});
	let misses = $state<{ x: number; y: number; t: number }[]>([]);
	let zoom = $state(1);
	let lensOn = $state(true);
	let lens = $state<{ x: number; y: number; px: number; py: number } | null>(null);
	let stage = $state<HTMLDivElement>();
	let down: { x: number; y: number } | null = null;
	const done = $derived(items.length > 0 && items.every((i) => found[i.id]));
	try { found = JSON.parse(localStorage.getItem('dada.hidden') ?? '{}'); } catch {}

	function toImg(e: PointerEvent) {
		const r = stage!.getBoundingClientRect();
		return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H, px: e.clientX - r.left, py: e.clientY - r.top };
	}
	function move(e: PointerEvent) {
		if (!lensOn) return;
		lens = toImg(e);
	}
	function start(e: PointerEvent) {
		down = { x: e.clientX, y: e.clientY };
		move(e);
	}
	function end(e: PointerEvent) {
		lens = null;
		if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) return (down = null);
		down = null;
		const p = toImg(e);
		if (edit) return addPoint(p.x, p.y);
		// 가까이 붙은 정답(이육사·청포도 등)은 탭한 곳에서 가장 가까운 것으로 판정해요.
		const hit = items
			.filter((i) => !found[i.id] && Math.hypot(i.x - p.x, i.y - p.y) <= i.r)
			.sort((a, b) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
		if (hit) {
			found = { ...found, [hit.id]: true };
			try { localStorage.setItem('dada.hidden', JSON.stringify(found)); } catch {}
			navigator.vibrate?.(30);
		} else {
			const m = { x: p.x, y: p.y, t: Date.now() };
			misses = [...misses, m];
			setTimeout(() => (misses = misses.filter((x) => x !== m)), 700);
		}
	}
	function reset() {
		found = {};
		try { localStorage.removeItem('dada.hidden'); } catch {}
	}

	// ---- 정답 위치 찍기 (?edit) ----
	let newLabel = $state('');
	function pickFile(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0];
		if (!f) return;
		const url = URL.createObjectURL(f);
		const img = new Image();
		img.onload = () => { W = img.naturalWidth; H = img.naturalHeight; src = url; };
		img.src = url;
	}
	function addPoint(x: number, y: number) {
		const label = newLabel.trim() || `항목 ${items.length + 1}`;
		items = [...items, { id: `i${items.length + 1}`, label, x: Math.round(x), y: Math.round(y), r: Math.round(Math.min(W, H) * 0.04) }];
		newLabel = '';
	}
	const json = $derived(JSON.stringify({ ...cfg, image: '/hidden/picture.jpg', width: W, height: H, items }, null, '\t'));
</script>

<div class="sheet">
	<p class="where"><b>현장 그림은</b> {cfg.where}이에요. 폰으로도 똑같이 찾을 수 있어요.</p>
	<h1>{cfg.title}</h1>
	<p class="intro">{cfg.intro}</p>

	{#if edit}
		<div class="editor">
			<b>정답 위치 찍기</b>
			<input type="file" accept="image/*" onchange={pickFile} />
			<input placeholder="다음에 찍을 이름 (예: 김소월 작가의 안경)" bind:value={newLabel} />
			<p class="small">그림에서 정답 위치를 탭하면 목록에 추가돼요. 끝나면 아래 JSON을 src/lib/hidden.json 에 붙여넣고, 이미지를 static/hidden/picture.jpg 로 넣어요.</p>
			<textarea readonly rows="6">{json}</textarea>
		</div>
	{/if}

	{#if !src}
		<div class="wait">
			<strong>그림을 준비하고 있어요</strong>
			<p>행사 당일에 열려요. 먼저 현장 현수막에서 찾아보세요!</p>
		</div>
	{:else}
		<div class="tools">
			<div class="zoom" role="group" aria-label="확대">
				{#each [1, 2, 3] as z}<button class:on={zoom === z} onclick={() => (zoom = z)}>{z}배</button>{/each}
			</div>
			<button class="lensbtn" class:on={lensOn} onclick={() => (lensOn = !lensOn)} aria-pressed={lensOn}>돋보기 {lensOn ? '켜짐' : '꺼짐'}</button>
		</div>
		<div class="frame">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="stage" bind:this={stage} style="width:{zoom * 100}%;aspect-ratio:{W}/{H}"
				onpointerdown={start} onpointermove={(e) => down && move(e)} onpointerup={end} onpointercancel={() => (lens = null)}>
				<img src={src} alt="숨은그림찾기 그림" draggable="false" />
				{#each items as i}
					{#if found[i.id] || edit}
						<span class="ring" class:edit style="left:{(i.x / W) * 100}%;top:{(i.y / H) * 100}%;width:{((i.r * 2) / W) * 100}%"></span>
					{/if}
				{/each}
				{#each misses as m (m.t)}<span class="miss" style="left:{(m.x / W) * 100}%;top:{(m.y / H) * 100}%">✕</span>{/each}
				{#if lens}
					<span class="lens" style="left:{lens.px}px;top:{lens.py - 70}px;background-image:url({src});background-size:{zoom * 250}% auto;background-position:{(lens.x / W) * 100}% {(lens.y / H) * 100}%"></span>
				{/if}
			</div>
		</div>
	{/if}

	{#if items.length}
		<h2>찾아야 할 것 <span class="tnum">{items.filter((i) => found[i.id]).length} / {items.length}</span></h2>
		{#each [['author', '작가님 4명'], ['clue', '작가님의 흔적 4개']] as [k, t]}
			<p class="kind">{t}</p>
			<ul class="list">
				{#each items.filter((i) => (i.kind ?? 'author') === k) as i}
					<li class:ok={found[i.id]}>
						{#if i.thumb}<img src={i.thumb} alt="" />{/if}
						<span><b>{i.no}. {i.label}</b>{#if i.hint}<small>{i.hint}</small>{/if}</span>
						{#if found[i.id]}<span class="got">찾음</span>{/if}
					</li>
				{/each}
			</ul>
		{/each}
	{/if}

	{#if done}
		<div class="solved">
			<span class="stampbig">다 찾았다</span>
			<p>모두 찾았어요! 눈썰미 최고 탐정이에요.</p>
			<button class="link" onclick={reset}>처음부터 다시</button>
		</div>
	{/if}
</div>

<style>
	.sheet { background: #fbf6ea; padding: 16px 14px 18px; box-shadow: 2px 6px 12px rgba(30, 15, 5, 0.38); }
	.where { margin: 0 0 12px; font-size: 14.5px; background: #fff3a8; padding: 10px 12px; }
	.wait { border: 2px dashed #c9b993; padding: 28px 16px; text-align: center; }
	.wait strong { font-family: var(--display); font-weight: 400; font-size: 22px; }
	.wait p { margin: 6px 0 0; color: var(--mute); }
	.tools { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
	.zoom { display: flex; border: 2px solid #3a2318; border-radius: 8px; overflow: hidden; }
	.zoom button, .lensbtn { border: 0; background: #fff; padding: 7px 12px; font-weight: 700; color: #3a2318; }
	.zoom button.on { background: #3a2318; color: #fff; }
	.lensbtn { border: 2px solid #3a2318; border-radius: 8px; }
	.lensbtn.on { background: #e6b85c; }
	.frame { overflow: auto; max-height: 70vh; border: 3px solid #3a2318; background: #222; -webkit-overflow-scrolling: touch; }
	.stage { position: relative; touch-action: pan-x pan-y; user-select: none; -webkit-user-select: none; }
	.stage img { display: block; width: 100%; height: 100%; pointer-events: none; }
	.ring { position: absolute; aspect-ratio: 1; transform: translate(-50%, -50%) rotate(-8deg); border: 3px solid #c0392b; border-radius: 50% 46% 52% 48%; box-shadow: 0 0 0 2px #fff8; }
	.ring.edit { border-style: dashed; border-color: #2d5aa8; }
	.miss { position: absolute; transform: translate(-50%, -50%); color: #c0392b; font-weight: 700; font-size: 22px; text-shadow: 0 0 3px #fff; animation: fade 0.7s forwards; }
	@keyframes fade { to { opacity: 0; transform: translate(-50%, -80%); } }
	.lens { position: absolute; width: 120px; height: 120px; margin-left: -60px; margin-top: -60px; border-radius: 50%; pointer-events: none; z-index: 4;
		border: 8px solid #6b3f22; box-shadow: 0 0 0 2px #c9a15a, 0 6px 16px rgba(0, 0, 0, 0.45); background-repeat: no-repeat; background-color: #fff; }
	h2 { font-size: 19px; margin: 16px 0 8px; display: flex; justify-content: space-between; }
	h1 { font-size: 26px; margin: 4px 0 2px; }
	.intro { margin: 0 0 12px; font-size: 14.5px; color: #4a3424; }
	.kind { margin: 10px 0 6px; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; color: #8a5a12; }
	.list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
	.list li { position: relative; display: flex; gap: 8px; align-items: center; background: #fff; border: 1px solid #e3d8c3; padding: 6px 8px; }
	.list img { width: 44px; height: 44px; border-radius: 50%; flex: none; }
	.list b { display: block; font-size: 15px; }
	.list small { display: block; font-size: 11.5px; color: var(--mute); line-height: 1.3; }
	.list li.ok { background: #f3faf0; border-color: #b9d9b0; }
	.list li.ok img { filter: grayscale(0.2); }
	.got { position: absolute; right: 6px; top: 4px; transform: rotate(-10deg); color: #b3261e; border: 2px solid #b3261e; font-size: 11px; font-weight: 700; padding: 0 4px; border-radius: 3px; }
	.solved { margin-top: 16px; text-align: center; padding: 16px; border: 2px dashed #c0392b; }
	.stampbig { display: inline-block; transform: rotate(-8deg); border: 4px double #b3261e; color: #b3261e; font-family: var(--display); font-size: 30px; padding: 2px 16px; }
	.link { border: 0; background: none; text-decoration: underline; color: var(--mute); }
	.editor { display: grid; gap: 6px; background: #e3ebfb; padding: 10px; margin-bottom: 12px; }
	.editor input, .editor textarea { font: inherit; font-size: 13px; }
	@media (prefers-reduced-motion: reduce) { .miss { animation: none; } }
</style>
