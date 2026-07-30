const CACHE = "lucas-pt-v18";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-180.png",
  "./data/dieta.json",
  "./data/receitas.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML (so updates show immediately when online),
// cache-first for static assets (icons/manifest) — offline-friendly.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const isHTML =
    e.request.mode === "navigate" ||
    (e.request.headers.get("accept") || "").includes("text/html");

  if (isHTML) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(e.request).then((r) => r || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match("./index.html"))
    )
  );
});
