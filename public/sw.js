const CACHE = "point-speak-v4";
const SHELL = ["/", "/demo", "/privacy", "/terms", "/assets/hero-blueprint-480.webp", "/favicon.svg"];
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);
  const html = await fetch("/").then((response) => response.text());
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  await cache.addAll(builtAssets);
  await self.skipWaiting();
}
self.addEventListener("install", (event) => event.waitUntil(precache()));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(() => event.request.mode === "navigate" ? caches.match("/") : Response.error())));
});
