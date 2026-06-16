/* DTM Service Worker v13 — Network-First, Always Fresh */

const CACHE_NAME = 'dtm-nf-v13';

self.addEventListener('install', function(e) {
  /* Take over immediately — no waiting */
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      /* Delete ALL old caches */
      return Promise.all(names.map(function(n) { return caches.delete(n); }));
    }).then(function() {
      /* Claim all open PWA windows immediately */
      return self.clients.claim();
    })
  );
});

/* Network-First for every request:
   Always tries the network first.
   Falls back to cache ONLY if offline.
   This means every open = fresh HTML from server. */
self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request.clone()).then(function(resp) {
      /* Got network response — cache it for offline fallback */
      if (resp && resp.status === 200) {
        var respClone = resp.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, respClone);
        });
      }
      return resp;
    }).catch(function() {
      /* Network failed — serve from cache (offline mode) */
      return caches.match(e.request);
    })
  );
});
