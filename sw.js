/* ============================================
   SERVICE WORKER — Style Sportif
   ============================================ */

const CACHE_NAME = "style-sportif-v1";

// Fichye ki sere nan cache
const ASSETS = [
  "./",
  "./index.html",
  "./visitor.html",
  "./admin.html",
  "./manifest.json"
];

/* ============================================
   INSTALL — Sere fichye yo nan cache
   ============================================ */
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker: enstale");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn("Kèk fichye pa sere:", err);
      });
    })
  );
  self.skipWaiting();
});

/* ============================================
   ACTIVATE — Netwaye ansyen cache yo
   ============================================ */
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker: aktif");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => {
            console.log("🗑 Efase ansyen cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

/* ============================================
   FETCH — Estrateji "network first, cache fallback"
   ============================================ */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Sèlman jere GET
  if (req.method !== "GET") return;

  // Pa entèfere ak Firebase, PeerJS, elatriye
  const url = new URL(req.url);
  if (
    url.hostname.includes("firebase") ||
    url.hostname.includes("firebaseio") ||
    url.hostname.includes("peerjs") ||
    url.hostname.includes("unpkg.com") ||
    url.hostname.includes("gstatic.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    return; // Kite navigatè a jere l nòmalman
  }

  event.respondWith(
    fetch(req)
      .then((response) => {
        // Sere yon kopi nan cache
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return response;
      })
      .catch(() => {
        // Si entènèt pa mache, chèche nan cache
        return caches.match(req).then((cached) => {
          if (cached) return cached;
          // Si pa gen anyen, retounen yon paj oflline
          if (req.mode === "navigate") {
            return caches.match("./visitor.html");
          }
        });
      })
  );
});

/* ============================================
   MESSAGE — Pou fèmisyon SW
   ============================================ */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
