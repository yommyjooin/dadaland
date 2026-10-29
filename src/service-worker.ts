/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// 푸시 알림만 다뤄요. 캐시는 하지 않아서 배포하면 바로 새 버전이 떠요.
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('install', () => sw.skipWaiting());
sw.addEventListener('activate', (e) => e.waitUntil(sw.clients.claim()));

sw.addEventListener('push', (e) => {
	let d: { title?: string; body?: string; url?: string; tag?: string } = {};
	try { d = e.data?.json() ?? {}; } catch { d = { body: e.data?.text() }; }
	const opts: NotificationOptions & Record<string, unknown> = {
		body: d.body ?? '',
		tag: d.tag,
		renotify: true,
		icon: '/icons/icon-192.png',
		badge: '/icons/badge-96.png',
		vibrate: [200, 100, 200],
		data: { url: d.url ?? '/staff' }
	};
	e.waitUntil(sw.registration.showNotification(d.title ?? '다다랜드', opts));
});

sw.addEventListener('notificationclick', (e) => {
	e.notification.close();
	const url = (e.notification.data?.url as string) ?? '/staff';
	e.waitUntil((async () => {
		const wins = await sw.clients.matchAll({ type: 'window', includeUncontrolled: true });
		for (const w of wins) {
			await w.focus();
			await w.navigate(url).catch(() => {});
			return;
		}
		await sw.clients.openWindow(url);
	})());
});
