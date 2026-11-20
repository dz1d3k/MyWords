/* Service worker „Moje Słowa”.
 * PODBIJ VERSION przy każdej zmianie plików aplikacji lub vocabulary.json. */
var VERSION = 'v6';
var CACHE = 'moje-slowa-' + VERSION;
var FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'vocabulary.json',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'images/zool.svg',
  'images/cool-spot.svg',
  'images/swinka.svg',
  'images/baranek.svg',
  'images/psi-patrol.svg',
  'images/youtube.svg',
  'images/zelki.svg',
  'images/trampolina.svg',
  'images/sala-zabaw.svg'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf('moje-slowa-') === 0 && k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Odpowiedź z cache, a w tle pobranie świeżej wersji (stale-while-revalidate).
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (res && res.ok && res.type === 'basic') cache.put(req, res.clone());
          return res;
        }).catch(function () { return null; });

        if (cached) {
          event.waitUntil(network);
          return cached;
        }
        return network.then(function (res) {
          if (res) return res;
          if (req.mode === 'navigate') {
            return cache.match('index.html').then(function (r) { return r || Response.error(); });
          }
          return Response.error();
        });
      });
    })
  );
});
