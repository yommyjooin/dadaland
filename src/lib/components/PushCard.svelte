<script lang="ts">
	import { onMount } from 'svelte';
	import { push } from '$lib/push.svelte';
	import { me } from '$lib/me.svelte';
	let { compact = false }: { compact?: boolean } = $props();
	const kakao = typeof navigator !== 'undefined' && /KAKAOTALK/i.test(navigator.userAgent);
	const ios = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
	onMount(() => { push.check(); });
	let lastName: string | null | undefined;
	$effect(() => {
		const n = me.name;
		if (push.state === 'on' && lastName !== undefined && n !== lastName) push.sync(n);
		lastName = n;
	});
	function openOutside() {
		location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(location.href);
	}
	function setLevel(l: 'all' | 'help') { push.level = l; push.sync(me.name); }
</script>

{#if push.state !== 'checking' && push.state !== 'no-server' && !(compact && push.state === 'on')}
	<div class="card push" class:on={push.state === 'on'}>
		<div class="t"><span class="bell" aria-hidden="true">🔔</span><b>{push.state === 'on' ? '휴대폰 알림 켜짐' : '휴대폰 알림 받기'}</b></div>
		<p class="small muted">부스에서 <b>도움 필요</b>·<b>대기 많음</b>을 누르거나 공지가 올라오면, 앱을 닫아 둬도 잠금 화면으로 알려 드려요.</p>

		{#if kakao}
			<p class="small">카카오톡 안에서는 알림을 켤 수 없어요. {ios ? 'Safari' : 'Chrome'}로 열어 주세요.</p>
			<button class="btn primary" onclick={openOutside}>{ios ? 'Safari' : 'Chrome'}로 열기</button>
		{:else if push.state === 'ios-install'}
			<ol class="small steps">
				<li>Safari 아래쪽 <b>공유 버튼</b>(네모에 위 화살표)을 눌러요.</li>
				<li><b>홈 화면에 추가</b>를 눌러요.</li>
				<li>홈 화면에 생긴 <b>다다랜드</b> 아이콘으로 열어요.</li>
				<li>이름을 고르고 여기서 <b>알림 켜기</b>를 눌러요.</li>
			</ol>
			<p class="small muted">아이폰은 iOS 16.4 이상에서 홈 화면 앱으로만 알림을 받을 수 있어요.</p>
		{:else if push.state === 'unsupported'}
			<p class="small">이 브라우저는 알림을 지원하지 않아요. 아이폰은 Safari, 안드로이드는 Chrome으로 열어 주세요.</p>
		{:else if push.state === 'denied'}
			<p class="small">알림이 꺼져 있어요. 휴대폰 <b>설정 → 알림</b>에서 {ios ? '다다랜드' : 'Chrome'} 알림을 허용한 뒤 이 화면을 다시 열어 주세요.</p>
		{:else}
			<div class="lv" role="group" aria-label="받을 알림">
				<button class:sel={push.level === 'all'} onclick={() => setLevel('all')}>도움 필요 + 대기 많음 + 공지</button>
				<button class:sel={push.level === 'help'} onclick={() => setLevel('help')}>도움 필요 + 공지만</button>
			</div>
			{#if push.state === 'off'}
				<button class="btn primary" disabled={push.busy} onclick={() => push.enable(me.name)}>{push.busy ? '켜는 중…' : '알림 켜기'}</button>
			{:else}
				<div class="row">
					<button class="btn" onclick={() => push.test()}>테스트 알림 보내기</button>
					<button class="link small" disabled={push.busy} onclick={() => push.disable()}>알림 끄기</button>
				</div>
			{/if}
		{/if}
		{#if push.msg}<p class="small msg" role="status">{push.msg}</p>{/if}
	</div>
{/if}

<style>
	.push { border: 2px solid #e6b85c; background: #fffaf0; }
	.push.on { border-color: #b9d6b3; background: #f5faf3; }
	.t { display: flex; align-items: center; gap: 6px; font-size: 17px; }
	p { margin: 6px 0; }
	.steps { margin: 6px 0; padding-left: 20px; line-height: 1.6; }
	.lv { display: grid; gap: 6px; margin: 8px 0; }
	.lv button { text-align: left; padding: 9px 12px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; color: var(--ink); font-size: 14px; }
	.lv button.sel { border-color: var(--brown); background: #f6ecdc; font-weight: 700; }
	.row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
	.btn { width: auto; }
	.msg { color: #2f6e3c; }
</style>
