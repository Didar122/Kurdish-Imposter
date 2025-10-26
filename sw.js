const CACHE_NAME = 'kurdish-imposter-v1';
const PRECACHE = [
  '/',
  '/index.html',
  '/icon.png',
  '/splash.png',
  '/wordDatabase.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // If the response is valid, clone and store it in the cache.
        if (!response || response.status !== 200) return response;
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Avoid caching opaque responses (cross-origin) unnecessarily
          cache.put(event.request, responseClone).catch(()=>{});
        });
        return response;
      }).catch(() => {
        // If network fails, try to serve index.html for navigations
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
