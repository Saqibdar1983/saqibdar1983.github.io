/* DTM Service Worker — v8 — Network First, always fresh */
const CACHE_NAME = 'dtm-v9';
const SHELL = ['/index.html', '/manifest.json', '/sw.js'];

/* Install — cache shell files */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(SHELL))
  );
  self.skipWaiting(); /* activate immediately */
});

/* Activate — delete ALL old caches */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    )
  );
  self.clients.claim(); /* take control of all tabs immediately */
});

/* Fetch — Network FIRST, cache fallback for offline only */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  /* Always go to network first — never serve stale HTML */
  e.respondWith(
    fetch(e.request)
      .then(res => {
        /* Update cache with fresh response */
        const clone = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request)) /* offline fallback */
  );
});
