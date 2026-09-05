// EYT Academy Service Worker - Passive & Resilient
const CACHE_VERSION = 'eyt-cache-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// We do not intercept page navigations, auth routes, or API calls.
// This prevents 408 errors and redirect interference with Next.js & Supabase.
self.addEventListener('fetch', (event) => {
  // Pure pass-through: let browser handle all requests natively
  return;
});
