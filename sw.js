/* MutqinLab — service worker
  • Cangkang aplikasi (HTML/CSS/JS): JARINGAN DULU, cache hanya sebagai cadangan luring.
    Pembaruan kode langsung terpakai; saat luring aplikasi tetap terbuka dari cache.
  • Data mushaf, font, terjemahan, ikon: cache-first (tidak berubah) → bisa dibaca luring.
    Cache data TIDAK diberi nomor versi supaya hasil "Unduh seluruh mushaf" tidak hilang saat aplikasi diperbarui.
  • Audio (everyayah.com) & Firebase: tidak disentuh. */
const VERSION = "v22";
const SHELL_CACHE = "mushaf-shell-" + VERSION;
const DATA_CACHE = "mushaf-data";   // harus sama dengan DATA_CACHE di app.js
const SHELL = [
  "./", "index.html", "style.css", "app.js", "tahfidz.js", "panduan.js", "ai.js", "ai.css", "dialog.js", "dialog.css", "privasi.html", "tahfidz.css", "manifest.webmanifest",
  "icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

const DATA_HOSTS = [
  "raw.githubusercontent.com",
  "cdn.jsdelivr.net",
  "api.quran.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdnjs.cloudflare.com"
];

self.addEventListener("install", e => {
  // cache: "reload" → ambil dari jaringan, bukan dari cache HTTP browser
  e.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => Promise.all(SHELL.map(u => fetch(new Request(u, { cache: "reload" })).then(r => { if (r.ok) return c.put(u, r); }).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("mushaf-") && k !== SHELL_CACHE && k !== DATA_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const cacheable = res => res && (res.status === 200 || res.type === "opaque");

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || req.headers.has("range")) return;
  const url = new URL(req.url);

  // data eksternal: cache-first
  if (DATA_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (cacheable(res)) cache.put(req, res.clone()).catch(() => {});
        return res;
      })
    );
    return;
  }

  // cangkang aplikasi: jaringan dulu (selalu revalidasi), cache sebagai cadangan luring
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(SHELL_CACHE).then(async cache => {
        try {
          const res = await fetch(req, { cache: "no-cache" });
          if (res && res.status === 200) cache.put(req, res.clone()).catch(() => {});
          return res;
        } catch (err) {
          const hit = await cache.match(req, { ignoreSearch: true });
          if (hit) return hit;
          if (req.mode === "navigate") { const home = await cache.match("index.html"); if (home) return home; }
          throw err;
        }
      })
    );
  }
  // selain itu (audio, Firebase, dll.): langsung ke jaringan
});
