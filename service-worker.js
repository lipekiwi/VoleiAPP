
const CACHE_NAME = 'volei-app-v4-cache-v1';
const FILES = ['./index.html','./app.css','./app.js','./manifest.json','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install', evt => { evt.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', evt => { evt.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k=> k !== CACHE_NAME ? caches.delete(k) : Promise.resolve())))); self.clients.claim(); });
self.addEventListener('fetch', evt => { evt.respondWith(caches.match(evt.request).then(res => res || fetch(evt.request))); });
