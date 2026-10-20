/* Mushaf Tahfidz Pro — service worker
  • Cangkang aplikasi (HTML/CSS/JS): JARINGAN DULU, cache hanya sebagai cadangan luring.
     Dengan begitu pembaruan kode selalu langsung terpakai (tidak ada versi lama yang "menempel").
   • Data halaman, font, terjemahan: cache-first (tidak berubah) → bisa dibaca luring setelah dibuka sekali
   • Audio (everyayah.com) & Firebase: tidak disentuh */
const VERSION = "v8";
const SHELL_CACHE = "mushaf-shell-" + VERSION;
const DATA_CACHE = "mushaf-data-" + VERSION;
const SHELL = ["./", "index.html", "style.css", "app.js", "tahfidz.js", "tahfidz.css", "manifest.webmanifest", "icon.svg"];

const DATA_HOSTS = [
  "raw.githubusercontent.com",
  "cdn.jsdelivr.net",
  "api.quran.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com"
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

const cacheable = res => res && (res.ok || res.type === "opaque");

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // data eksternal: cache-first
  if (DATA_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.open(DATA_CACHE).then(async cache => {
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (cacheable(res)) cache.put(req, res.clone());
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
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        } catch (err) {
          const hit = await cache.match(req, { ignoreSearch: true });
          if (hit) return hit;
          throw err;
        }
      })
    );
  }
  // selain itu (audio, Firebase, dll.): langsung ke jaringan
});
