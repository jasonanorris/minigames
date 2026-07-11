const CACHE_NAME = "minigames-app-v0.44";

const APP_SHELL = [
  "./",
  "index.html",
  "manifest.json",
  "assets/css/styles.css",
  "assets/js/app.js",
  "assets/js/version.js",
  "assets/js/games/index.js",
  "assets/js/games/tap-race.js",
  "assets/js/games/reaction-time.js",
  "assets/js/games/memory-grid.js",
  "assets/js/games/quick-math.js",
  "assets/js/games/the-wheel.js",
  "assets/images/retroHandheld3b.png",
  "assets/images/dpad.png",
  "assets/images/startselect.png",
  "assets/images/aButton.png",
  "assets/images/bButton.png",
  "assets/images/game.png",
  "assets/icons/icon.svg",
  "assets/icons/apple-touch-icon.png",
  "assets/icons/icon-192.png",
  "assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(installAppShell());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (requestUrl.origin === self.location.origin) {
    event.respondWith(cacheFirstAsset(request));
  }
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return (await cache.match(request)) || cache.match("index.html");
  }
}

async function cacheFirstAsset(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function cacheAppShell() {
  const cache = await caches.open(CACHE_NAME);
  const results = await Promise.allSettled(
    APP_SHELL.map(async (path) => {
      const response = await fetch(path, { cache: "reload" });

      if (!response.ok) {
        throw new Error(`Could not cache ${path}: ${response.status}`);
      }

      await cache.put(path, response);
    })
  );
  const failedAssets = results.filter((result) => result.status === "rejected");

  if (failedAssets.length > 0) {
    console.error("MiniGames service worker install failed.", failedAssets);
    throw new Error("MiniGames app shell cache failed.");
  }
}

async function installAppShell() {
  await cacheAppShell();
  const cacheNames = await caches.keys();
  const hasLegacyCache = cacheNames.some((cacheName) => {
    const match = cacheName.match(/^minigames-app-v0\.(\d{2})$/);
    return match && Number(match[1]) <= 16;
  });

  if (hasLegacyCache) {
    await self.skipWaiting();
  }
}
