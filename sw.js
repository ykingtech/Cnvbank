const CACHE_NAME = 'cnv-bank-v3'; // Version එක v3 ලෙස වෙනස් කළා
const urlsToCache = ['./index.html', './manifest.json'];

// 1. Install Event (Force update)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // පරණ එක නවත්තලා අලුත් එක ගන්න කියනවා
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// 2. Activate Event (Clean old caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // පරණ Cache මකන්න
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event (Network First Strategy)
// මුලින් ඉන්ටර්නෙට් එකෙන් අලුත් එක බලනවා, බැරි නම් විතරක් පරණ එක ගන්නවා.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // අලුත් එකක් ආවොත් Cache එක Update කරනවා
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // ඉන්ටර්නෙට් නැත්නම් පරණ එක
  );
});
