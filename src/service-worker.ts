/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { base, build, files, version } from '$service-worker';

const CACHE_NAME = `interesit-cache-v${version}`;

// Assets to precache during install (Vite build output + static assets)
const PRECACHE_ASSETS = [...build, ...files];

self.addEventListener('install', (event: ExtendableEvent) => {
	event.waitUntil(
		(async () => {
			const cache = await caches.open(CACHE_NAME);
			await cache.addAll(PRECACHE_ASSETS);
			await self.skipWaiting();
		})()
	);
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(
		(async () => {
			const cacheKeys = await caches.keys();
			const deletions = cacheKeys.map((key) => {
				if (key !== CACHE_NAME) {
					return caches.delete(key);
				}
				return Promise.resolve(false);
			});
			await Promise.all(deletions);
			await self.clients.claim();
		})()
	);
});

async function handleAssetFetch(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);
	if (cachedResponse) {
		return cachedResponse;
	}

	const networkResponse = await fetch(request);
	if (networkResponse.ok) {
		await cache.put(request, networkResponse.clone());
	}
	return networkResponse;
}

async function handleNavigationFetch(request: Request): Promise<Response> {
	const cache = await caches.open(CACHE_NAME);

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			await cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		const cachedPage = await cache.match(request);
		if (cachedPage) {
			return cachedPage;
		}

		const appShell =
			(await cache.match(base || '/')) ??
			(await cache.match('./')) ??
			(await cache.match('/index.html'));

		if (appShell) {
			return appShell;
		}

		throw error;
	}
}

self.addEventListener('fetch', (event: FetchEvent) => {
	const { request } = event;

	if (request.method !== 'GET') {
		return;
	}

	const url = new URL(request.url);

	if (url.origin !== self.location.origin) {
		return;
	}

	if (request.mode === 'navigate') {
		event.respondWith(handleNavigationFetch(request));
		return;
	}

	const isStaticAsset = build.includes(url.pathname) || files.includes(url.pathname);
	if (isStaticAsset) {
		event.respondWith(handleAssetFetch(request));
		return;
	}

	event.respondWith(handleAssetFetch(request));
});
