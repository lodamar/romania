// Rotta dei Carpazi — cache offline. Cambia VERSION a ogni aggiornamento del sito.
const VERSION = 'rotta-v1';
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png',
  './fonts/plex-cond-600.woff2', './fonts/plex-cond-700.woff2',
  './fonts/plex-serif-400.woff2', './fonts/plex-serif-600.woff2',
  './fonts/plex-mono-400.woff2', './fonts/plex-mono-600.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    // pagina: prima la rete (per gli aggiornamenti), poi la copia salvata
    e.respondWith(
      fetch(req).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('./index.html', copy)); return r; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }
  // font e icone: prima la cache
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
