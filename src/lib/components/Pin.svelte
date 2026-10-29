<script lang="ts">
	let { color = '#c0392b' }: { color?: string } = $props();
</script>

<span class="pin" style="--c:{color}" aria-hidden="true"></span>

<style>
	.pin { position: absolute; top: -9px; left: 50%; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%; z-index: 3;
		background: radial-gradient(circle at 35% 30%, #fff8 0 18%, var(--c) 22% 70%, #0004 100%);
		box-shadow: 1px 3px 3px rgba(0, 0, 0, 0.35); }
</style>
