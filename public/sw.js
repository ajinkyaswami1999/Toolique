const CACHE_NAME = 'toolique-static-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/favicon-512x512.png'
];

// Install Service Worker and cache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate SW and clear older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept requests and fetch Cache-First for assets, fallback to Network
self.addEventListener('fetch', (event) => {
  // Avoid caching non-HTTP requests (like chrome extensions or post requests)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith('https://fonts.')) {
    return;
  }

  // Avoid caching API fetches directly (let runtime handle network fallback)
  if (event.request.url.includes('/api.github.com/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch new copy in background to keep cache updated
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {/* ignore background update failures */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch((err) => {
        // Fallback for document pages if offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw err;
      });
    })
  );
});
