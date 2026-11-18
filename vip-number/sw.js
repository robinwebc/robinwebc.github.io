/* App shell only. Operator answers are never cached. */
var CACHE = "vip-finder-v1";
var ASSETS = [
  "/vip-number/",
  "/vip-number/index.html",
  "/vip-number/css/app.css",
  "/vip-number/js/score.js",
  "/vip-number/js/generate.js",
  "/vip-number/js/app.js",
  "/vip-number/manifest.webmanifest",
  "/vip-number/favicon.svg",
  "/vip-number/icons/icon-192.png",
  "/vip-number/icons/icon-512.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return cache.addAll(ASSETS);
  }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) { return key !== CACHE; }).map(function (key) {
      return caches.delete(key);
    }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (event) {
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.indexOf("/vip-number/") !== 0) return;
  if (event.request.method !== "GET") return;
  event.respondWith(fetch(event.request).then(function (res) {
    if (res && res.ok) {
      var copy = res.clone();
      caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(event.request).then(function (hit) {
      return hit || caches.match("/vip-number/");
    });
  }));
});
