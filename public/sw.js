const VERSION = "tashin-portfolio-v3";
const SHELL = `${VERSION}-shell`;
const ASSETS = `${VERSION}-assets`;
const LOCAL_ASSETS = [
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/icons/favicon-32.png",
  "/images/profile.png",
  "/resume.pdf"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    await cache.addAll(["/", ...LOCAL_ASSETS].map(path => new Request(path, { cache: "reload" })));
    // The first page's bundles can load before the worker controls it.
    // Precache the referenced CSS/JS as well so the first offline reload works.
    const response = await cache.match("/");
    const html = await response.text();
    const bundles = [...html.matchAll(/(?:src|href)=["'](\/_next\/static\/[^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
      .map(match => match[1].replace(/&amp;/g, "&"));
    const images = [...html.matchAll(/(?:src|srcset|imagesrcset)=["']([^"']+)["']/gi)]
      .flatMap(match => match[1].split(",").map(source => source.trim().split(/\s+/)[0]))
      .map(source => source.replace(/&amp;/g, "&"))
      .filter(source => source.startsWith("/_next/image?"));
    const assets = await caches.open(ASSETS);
    await assets.addAll([...new Set([...bundles, ...images])].map(path => new Request(path, { cache: "reload" })));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("tashin-portfolio-") && ![SHELL, ASSETS].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

async function networkFirst(request, cacheName, navigation = false) {
  const cache = await caches.open(cacheName);
  try {
    // Revalidate mutable app-shell responses instead of accepting a stale
    // browser HTTP-cache entry after a deployment.
    const response = await fetch(request, { cache: "no-cache" });
    if (response.ok && (!navigation || response.headers.get("content-type")?.includes("text/html"))) {
      await cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    // The precached optimizer response is a broadly supported PNG. Next.js
    // varies it by Accept, which differs between precaching and <img> requests.
    const cached = await cache.match(request, { ignoreVary: new URL(request.url).pathname === "/_next/image" });
    if (cached) return cached;
    if (navigation) {
      const shell = await cache.match("/");
      if (shell) return shell;
    }
    return Response.error();
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Always try the network for GitHub. Keep its data out of persistent caches.
  if ((url.origin === self.location.origin && url.pathname.startsWith("/api/")) || url.hostname === "api.github.com") {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Handle these before navigation, including a directly opened/downloaded CV.
  if (LOCAL_ASSETS.includes(url.pathname)) {
    event.respondWith(networkFirst(request, SHELL));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, SHELL, true));
    return;
  }

  if (["style", "script", "image", "font"].includes(request.destination)) {
    if (url.pathname.startsWith("/_next/static/")) {
      event.respondWith((async () => {
        const cache = await caches.open(ASSETS);
        const cached = await cache.match(request);
        return cached || networkFirst(request, ASSETS);
      })());
    } else {
      // Revalidate local images/fonts whose URLs can stay the same across deploys.
      event.respondWith(networkFirst(request, ASSETS));
    }
  }
});
