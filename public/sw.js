const CACHE_NAME = 'ubatechcamp-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  // Vite will handle the hashing, but we can cache the main entry points
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Cache images and static assets
        const url = new URL(event.request.url);
        if (
          url.origin === self.location.origin &&
          (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|woff2?|ttf|css|js)$/) || 
           url.pathname.startsWith('/assets/'))
        ) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
});
