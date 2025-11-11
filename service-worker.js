
const CACHE_NAME = 'volei-smart-cache-v1';
const FILES_TO_CACHE = [
  './index.html',
  './app.css',
  './app.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(caches.keys().then((keys) => Promise.all(keys.map(k => { if(k !== CACHE_NAME) return caches.delete(k); }))));
  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  evt.respondWith(caches.match(evt.request).then((res) => res || fetch(evt.request)));
});
