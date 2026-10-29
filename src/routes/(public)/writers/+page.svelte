<script lang="ts">
	import { WRITERS } from '$lib/writers';
	let met = $state<string[]>([]);
	try { met = JSON.parse(localStorage.getItem('dada.writers') ?? '[]'); } catch {}
	function toggle(id: string) {
		met = met.includes(id) ? met.filter((x) => x !== id) : [...met, id];
		try { localStorage.setItem('dada.writers', JSON.stringify(met)); } catch {}
	}
</script>

<p class="lead">보물열쇠 탐정단 보물상자에서 만나는 성북의 작가님들이에요. 내가 연 상자의 작가님을 찾아 <b>만났어요</b> 도장을 찍어 봐요!</p>
<p class="count tnum">만난 작가님 {met.length} / {WRITERS.length}</p>

<div class="list">
	{#each WRITERS as w, i}
		<article class="file" style="--r:{i % 2 ? 0.8 : -0.8}deg">
			<span class="clip" aria-hidden="true"></span>
			<header>
				<img src={w.face} alt="{w.name} 작가 그림" width="76" height="76" />
				<div>
					<span class="no">작가 파일 0{i + 1}</span>
					<h2>{w.name} <small class="tnum">{w.years}</small></h2>
					<span class="role">{w.role}</span>
				</div>
			</header>
			<p>{w.who}</p>
			<div class="sb"><b>성북과의 인연</b><p>{w.seongbuk}</p></div>
			<p class="works"><b>대표작</b> {w.works.join(' ')}</p>
			<div class="clue">
				<img src={w.clue.img} alt="" width="44" height="44" />
				<span><b>남긴 흔적 · {w.clue.label}</b><small>{w.clue.note}</small></span>
			</div>
			<button class="meet" class:on={met.includes(w.id)} onclick={() => toggle(w.id)} aria-pressed={met.includes(w.id)}>
				{met.includes(w.id) ? '만났어요!' : '이 작가님 상자를 열었어요'}
			</button>
		</article>
	{/each}
</div>

<p class="foot">작가님의 한 문장은 보물상자 속 카드에서 직접 찾아보세요. 숨은그림찾기에도 네 작가님과 흔적이 숨어 있어요. <a href="/hidden">숨은그림찾기 →</a></p>

<style>
	.lead { color: #f6e9cf; font-size: 16px; margin: 4px 0 6px; word-break: keep-all; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.35); }
	.lead b { color: #ffd98a; }
	.count { color: #f3dfb8; font-weight: 700; margin: 0 0 14px; }
	.list { display: grid; gap: 22px; }
	.file { position: relative; background: #f7efd9; padding: 18px 16px 16px; transform: rotate(var(--r)); box-shadow: 2px 6px 12px rgba(30, 15, 5, 0.38); border-top: 6px solid #c99f5f; }
	.clip { position: absolute; top: -12px; right: 22px; width: 14px; height: 34px; border: 3px solid #8c8c8c; border-radius: 8px; }
	header { display: flex; gap: 12px; align-items: center; margin-bottom: 8px; }
	header img { width: 76px; height: 76px; border-radius: 12px; border: 2px solid #6b3f22; background: #f2e2c0; flex: none; }
	.no { font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #8a5a12; }
	h2 { margin: 0; font-size: 24px; }
	h2 small { font-size: 13px; color: #7a6a58; margin-left: 4px; }
	.role { font-size: 13px; color: #4a3424; }
	p { margin: 6px 0; font-size: 15px; line-height: 1.55; word-break: keep-all; }
	.sb { background: #fffaf0; border-left: 3px solid #2f6e3c; padding: 6px 10px; margin: 8px 0; }
	.sb b { font-size: 13px; color: #2f6e3c; }
	.sb p { margin: 2px 0 0; }
	.works b { font-size: 13px; color: #8a5a12; margin-right: 4px; }
	.clue { display: flex; gap: 10px; align-items: center; margin: 8px 0 12px; }
	.clue img { border-radius: 50%; flex: none; }
	.clue b { display: block; font-size: 14px; }
	.clue small { font-size: 13px; color: #6c5a48; }
	.meet { width: 100%; padding: 11px; border-radius: 8px; border: 2px dashed #8a5a12; background: transparent; color: #6b3f22; font-weight: 700; font-size: 15px; }
	.meet.on { border: 3px solid #b3261e; color: #b3261e; background: #fff1ee; font-family: var(--display); font-size: 18px; transform: rotate(-2deg); }
	.foot { color: #f6e9cf; font-size: 14px; margin-top: 20px; word-break: keep-all; }
	.foot a { color: #ffd98a; font-weight: 700; }
</style>
