// This is a basic Service Worker placeholder.
// When deployed via Vercel/Vite, this file will be overwritten by the "real" offline caching worker.
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Claim clients immediately
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass through requests
});