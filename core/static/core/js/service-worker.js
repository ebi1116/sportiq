const CACHE_NAME = 'sportiq-pwa-v4';
const APP_SHELL = [
  '/static/core/css/app.css',
  '/static/core/css/pwa.css',
  '/static/core/js/pwa.js',
  '/static/core/js/card_templates.js',
  '/static/core/img/pwa-192.png',
  '/static/core/img/pwa-512.png',
  '/static/core/img/pwa-maskable-512.png',
  '/static/core/img/pwa-apple-touch-icon.png',
  '/static/core/img/favicon.ico',
  '/offline/',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('sportiq-pwa-') && key !== CACHE_NAME).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/static/')) {
    event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
      if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
      return response;
    })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => {
      const offline = await caches.match('/offline/');
      return offline || new Response('You are offline. Reconnect to continue using SportIQ.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }));
  }
});
