/* Service worker „MeTalk”.
 *
 * Dwie niezależne pamięci offline:
 *  - APLIKACJA (index.html, app.js, style.css, ikony…) – nazwa zależy od APP_VERSION z version.js.
 *    Podbij APP_VERSION tylko przy zmianie kodu/wyglądu aplikacji.
 *  - SŁOWNIK (dictionary/: pliki słów i obrazki) – jedna stała pamięć, uzupełniana na bieżąco.
 *    Zmiana słownika NIE wymaga zmiany wersji aplikacji (podbija się "dictionaryVersion" w pliku słów).
 */
importScripts('version.js');
var APP_CACHE = 'moje-slowa-app-' + APP_VERSION;
var DICT_CACHE = 'moje-slowa-dict';
var FILES = [
  './',
  'index.html',
  'style.css',
  'app.js',
  'version.js',
  'speech.js',
  'manifest.webmanifest',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(APP_CACHE).then(function (cache) {
      return cache.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        // usuń stare pamięci aplikacji (także sprzed podziału: "moje-slowa-v11", "moje-slowa-0.18"…)
        if (k.indexOf('moje-slowa-') === 0 && k !== APP_CACHE && k !== DICT_CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function isDictionary(url) { return url.pathname.indexOf('/dictionary/') !== -1; }
function isWordFile(url) { return isDictionary(url) && /\.json$/.test(url.pathname); }

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pliki słów: najpierw sieć (nowe słowa od razu), bez sieci – ostatnia zapisana wersja.
  if (isWordFile(url)) {
    event.respondWith(
      fetch(req, { cache: 'no-cache' }).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          event.waitUntil(caches.open(DICT_CACHE).then(function (c) { return c.put(req, copy); }));
        }
        return res;
      }).catch(function () {
        return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || Response.error(); });
      })
    );
    return;
  }

  // Obrazki słownika i pliki aplikacji: z pamięci, w tle odświeżenie (stale-while-revalidate).
  var cacheName = isDictionary(url) ? DICT_CACHE : APP_CACHE;
  event.respondWith(
    caches.open(cacheName).then(function (cache) {
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
