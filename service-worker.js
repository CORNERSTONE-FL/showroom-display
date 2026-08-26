const SHELL_CACHE = "cornerstone-showroom-shell-v3";
const RUNTIME_CACHE = "cornerstone-showroom-runtime-v3";
const APP_SHELL = [
    "./",
    "./index.html",
    "./manifest.webmanifest",
    "./favicon.svg",
    "./favicon-32.png",
    "./favicon-192.png",
    "./favicon-512.png",
    "./apple-touch-icon.png",
    "./assets/showroom-hero-960.webp",
    "./assets/showroom-hero-1600.webp",
    "./assets/showroom-hero-2400.webp",
    "./assets/showroom-hero-1600.jpg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
            .then(() => self.clients.claim()),
    );
});

async function trimCache(cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries)).map((key) => cache.delete(key)));
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return (await caches.match(request)) || caches.match("./index.html");
    }
}

async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);
    const network = fetch(request)
        .then(async (response) => {
            if (response.ok || response.type === "opaque") {
                const cache = await caches.open(RUNTIME_CACHE);
                await cache.put(request, response.clone());
                await trimCache(RUNTIME_CACHE, 24);
            }
            return response;
        })
        .catch(() => cached);
    return cached || network;
}

self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET") return;

    if (request.mode === "navigate") {
        event.respondWith(networkFirst(request));
        return;
    }

    if (["image", "font", "style"].includes(request.destination)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }

    if (new URL(request.url).origin === self.location.origin) {
        event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
    }
});
