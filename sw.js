// Michael's Hub service worker. Bump VERSION on every release (also bump ?v=N on assets).
const VERSION = 'v8';
const CACHE = 'sports-shell-' + VERSION;
const SHELL = [
  './', 'index.html', 'scores.html', 'calendar.html', 'playoffs.html', 'tech.html', 'packages.html',
  'customize.html', 'team.html',
  'ou-football.html', 'osu-football.html', 'ou-basketball.html', 'osu-basketball.html',
  'thunder.html', 'nfl.html', 'rankings.html',
  'common.css?v=8', 'common.js?v=8', 'config.js?v=8', 'theme-boot.js?v=8', 'schedule.js?v=8', 'manifest.json?v=8', 'tech-watch.json?v=8',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png?v=8', 'icons/favicon-32.png?v=8', 'icons/favicon.ico?v=8'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('sports-shell-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Only handle our own origin. ESPN, Open-Meteo, NWS, and any other cross-origin API calls go straight to the network, never cached.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  const isPage = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    // Network-first so new releases show up; fall back to cache offline.
    e.respondWith(
      fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
    );
    return;
  }
  // Static assets: stale-while-revalidate.
  e.respondWith(
    caches.open(CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }))
  );
});
