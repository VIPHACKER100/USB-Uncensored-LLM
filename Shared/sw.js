const CACHE = 'usb-llm-v2';

const VENDOR_PATHS = [
  '/vendor/marked.min.js',
  '/vendor/dompurify.min.js',
  '/vendor/highlight.min.js',
  '/vendor/highlight-github-dark.min.css',
  '/vendor/fa-all.min.css',
  '/vendor/Inter-Regular.woff2',
  '/vendor/Inter-Medium.woff2',
  '/vendor/Inter-SemiBold.woff2',
  '/vendor/Inter-Bold.woff2',
  '/vendor/JetBrainsMono-Regular.woff2',
  '/vendor/JetBrainsMono-Medium.woff2',
  '/vendor/fa-solid-900.woff2',
  '/vendor/fa-regular-400.woff2',
  '/css/styles.css',
  '/js/core.js',
  '/js/api.js',
  '/js/markdown.js',
  '/js/chat.js',
  '/js/ui.js',
  '/js/app.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(VENDOR_PATHS.map(p => new Request(p, {credentials: 'same-origin'}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  const path = url.pathname;

  if (path === '/' || path === '/index.html') {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(r => {
      const clone = r.clone();
      caches.open(CACHE).then(cache => cache.put(e.request, clone));
      return r;
    }))
  );
});
