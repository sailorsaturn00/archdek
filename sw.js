// sw.js - Service Worker per ArchDek offline
const CACHE_NAME = 'archdek-v1-20260126';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/brutalism.json',  // I tuoi 100 siti!
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'  // Tile OSM
];

self.addEventListener('install', event => {
  self.skipWaiting();  // Attiva subito
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching ArchDek assets');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(name => 
          name !== CACHE_NAME && caches.delete(name)
        )
      )
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit → offline!
        if (response) return response;
        
        // Network fallback
        return fetch(event.request).catch(() => {
          // Offline fallback: pagina vuota
          return new Response('Offline - reload for new brutalist sites', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});
