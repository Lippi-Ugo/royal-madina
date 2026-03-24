// Service Worker pour PWA Royal Madina

const CACHE_NAME = 'royal-madina-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
];

// Installation
self.addEventListener('install', event => {
    console.log('🔧 Service Worker en installation...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Activation
self.addEventListener('activate', event => {
    console.log('✅ Service Worker activé');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Suppression ancien cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch strategy: network first, cache fallback
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                return caches.match(event.request).then(response => {
                    return response || new Response('Offline', { status: 503 });
                });
            })
    );
});
