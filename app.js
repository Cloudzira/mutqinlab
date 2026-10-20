"use strict";
/* ============================================================
   Mushaf Tahfidz Pro — app.js
   Sumber data (gratis):
   • Teks & font mushaf Madinah QCF v4  → github.com/MohamadHajjRabee/quran-qcf4
   • Peta ayat→halaman, terjemahan Kemenag → api.quran.com (v4)
   • Audio per ayat                     → everyayah.com
   ============================================================ */
(() => {

/*DATA-START*/
// [nama latin, nama arab, jumlah ayat, halaman awal] — dicocokkan dengan Quran.com API & EveryAyah
const SURAH = [
  ["Al-Fatihah","الفاتحة",7,1],["Al-Baqarah","البقرة",286,2],["Ali 'Imran","آل عمران",200,50],["An-Nisa'","النساء",176,77],
  ["Al-Ma'idah","المائدة",120,106],["Al-An'am","الأنعام",165,128],["Al-A'raf","الأعراف",206,151],["Al-Anfal","الأنفال",75,177],
  ["At-Taubah","التوبة",129,187],["Yunus","يونس",109,208],["Hud","هود",123,221],["Yusuf","يوسف",111,235],
  ["Ar-Ra'd","الرعد",43,249],["Ibrahim","ابراهيم",52,255],["Al-Hijr","الحجر",99,262],["An-Nahl","النحل",128,267],
  ["Al-Isra'","الإسراء",111,282],["Al-Kahf","الكهف",110,293],["Maryam","مريم",98,305],["Ta-Ha","طه",135,312],
  ["Al-Anbiya'","الأنبياء",112,322],["Al-Hajj","الحج",78,332],["Al-Mu'minun","المؤمنون",118,342],["An-Nur","النور",64,350],
  ["Al-Furqan","الفرقان",77,359],["Asy-Syu'ara'","الشعراء",227,367],["An-Naml","النمل",93,377],["Al-Qasas","القصص",88,385],
  ["Al-Ankabut","العنكبوت",69,396],["Ar-Rum","الروم",60,404],["Luqman","لقمان",34,411],["As-Sajdah","السجدة",30,415],
  ["Al-Ahzab","الأحزاب",73,418],["Saba'","سبإ",54,428],["Fatir","فاطر",45,434],["Ya-Sin","يس",83,440],
  ["Ash-Shaffat","الصافات",182,446],["Sad","ص",88,453],["Az-Zumar","الزمر",75,458],["Ghafir","غافر",85,467],
  ["Fussilat","فصلت",54,477],["Asy-Syura","الشورى",53,483],["Az-Zukhruf","الزخرف",89,489],["Ad-Dukhan","الدخان",59,496],
  ["Al-Jatsiyah","الجاثية",37,499],["Al-Ahqaf","الأحقاف",35,502],["Muhammad","محمد",38,507],["Al-Fath","الفتح",29,511],
  ["Al-Hujurat","الحجرات",18,515],["Qaf","ق",45,518],["Adz-Dzariyat","الذاريات",60,520],["At-Tur","الطور",49,523],
  ["An-Najm","النجم",62,526],["Al-Qamar","القمر",55,528],["Ar-Rahman","الرحمن",78,531],["Al-Waqi'ah","الواقعة",96,534],
  ["Al-Hadid","الحديد",29,537],["Al-Mujadilah","المجادلة",22,542],["Al-Hasyr","الحشر",24,545],["Al-Mumtahanah","الممتحنة",13,549],
  ["Ash-Shaff","الصف",14,551],["Al-Jumu'ah","الجمعة",11,553],["Al-Munafiqun","المنافقون",11,554],["At-Taghabun","التغابن",18,556],
  ["At-Talaq","الطلاق",12,558],["At-Tahrim","التحريم",12,560],["Al-Mulk","الملك",30,562],["Al-Qalam","القلم",52,564],
  ["Al-Haqqah","الحاقة",52,566],["Al-Ma'arij","المعارج",44,568],["Nuh","نوح",28,570],["Al-Jinn","الجن",28,572],
  ["Al-Muzzammil","المزمل",20,574],["Al-Muddatstsir","المدثر",56,575],["Al-Qiyamah","القيامة",40,577],["Al-Insan","الانسان",31,578],
  ["Al-Mursalat","المرسلات",50,580],["An-Naba'","النبإ",40,582],["An-Nazi'at","النازعات",46,583],["'Abasa","عبس",42,585],
  ["At-Takwir","التكوير",29,586],["Al-Infitar","الإنفطار",19,587],["Al-Muthaffifin","المطففين",36,587],["Al-Insiqaq","الإنشقاق",25,589],
  ["Al-Buruj","البروج",22,590],["At-Tariq","الطارق",17,591],["Al-A'la","الأعلى",19,591],["Al-Ghasyiyah","الغاشية",26,592],
  ["Al-Fajr","الفجر",30,593],["Al-Balad","البلد",20,594],["Asy-Syams","الشمس",15,595],["Al-Lail","الليل",21,595],
  ["Ad-Duha","الضحى",11,596],["Asy-Syarh","الشرح",8,596],["At-Tin","التين",8,597],["Al-'Alaq","العلق",19,597],
  ["Al-Qadr","القدر",5,598],["Al-Bayyinah","البينة",8,598],["Az-Zalzalah","الزلزلة",8,599],["Al-'Adiyat","العاديات",11,599],
  ["Al-Qari'ah","القارعة",11,600],["At-Takatsur","التكاثر",8,600],["Al-'Asr","العصر",3,601],["Al-Humazah","الهمزة",9,601],
  ["Al-Fiil","الفيل",5,601],["Quraisy","قريش",4,602],["Al-Ma'un","الماعون",7,602],["Al-Kautsar","الكوثر",3,602],
  ["Al-Kafirun","الكافرون",6,603],["An-Nasr","النصر",3,603],["Al-Lahab","المسد",5,603],["Al-Ikhlas","الإخلاص",4,604],
  ["Al-Falaq","الفلق",5,604],["An-Nas","الناس",6,604]
];
// Halaman pertama tiap juz (mushaf Madinah 604 halaman)
const JUZ_START = [1,22,42,62,82,102,122,142,162,182,202,222,242,262,282,302,322,342,362,382,402,422,442,462,482,502,522,542,562,582];
// Nama folder qari di everyayah.com (sudah diverifikasi dari recitations.js)
const QARI = [
  { id: "Alafasy_128kbps",                 nama: "Mishary Rashid Alafasy" },
  { id: "Husary_128kbps",                  nama: "Mahmoud Khalil Al-Husary" },
  { id: "Husary_Muallim_128kbps",          nama: "Al-Husary (Mu'allim, untuk belajar)" },
  { id: "Minshawy_Murattal_128kbps",       nama: "Muhammad Siddiq Al-Minshawi" },
  { id: "Abdul_Basit_Murattal_192kbps",    nama: "Abdul Basit (Murattal)" },
  { id: "Abdurrahmaan_As-Sudais_192kbps",  nama: "Abdurrahman As-Sudais" },
  { id: "Saood_ash-Shuraym_128kbps",       nama: "Saud Asy-Syuraim" },
  { id: "MaherAlMuaiqly128kbps",           nama: "Maher Al-Muaiqly" },
  { id: "Hudhaify_128kbps",                nama: "Ali Al-Hudzaifi" },
  { id: "Abu_Bakr_Ash-Shaatree_128kbps",   nama: "Abu Bakr Asy-Syatiri" },
  { id: "Muhammad_Ayyoub_128kbps",         nama: "Muhammad Ayyub" },
  { id: "Yasser_Ad-Dussary_128kbps",       nama: "Yasser Ad-Dausari" },
  { id: "Nasser_Alqatami_128kbps",         nama: "Nasser Al-Qatami" },
  { id: "Salah_Al_Budair_128kbps",         nama: "Salah Al-Budair" },
  { id: "Abdullah_Matroud_128kbps",        nama: "Abdullah Matroud" },
  { id: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net", nama: "Ahmad Al-Ajmi" }
];
/*DATA-END*/

const PAGES = 604;
const JSON_URL  = "https://raw.githubusercontent.com/MohamadHajjRabee/quran-qcf4/main/pages/";
const FONT_URL  = "https://cdn.jsdelivr.net/gh/MohamadHajjRabee/quran-qcf4@main/fonts-woff2/";
const AUDIO_URL = "https://everyayah.com/data/";
const API       = "https://api.quran.com/api/v4";
const TRANSLATION_ID = 33; // Terjemahan Indonesia — Kementerian Agama RI
const GAP_EM = 0.12;       // jarak antar kata (em), harus sama dengan CSS .baris
const MOBILE_GAP_EM = 0.04;
const MIN_PITCH = 2.0;
const MOBILE_PITCH = 2.0;
const PAGE_LINES = 15;
const SHORT_LINE = 0.72;
const KEY = "mushaf_v2";
const PORTRAIT_PHONE = window.matchMedia("(max-width: 640px) and (orientation: portrait)");

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCDU5f4iBXSwlKYYJUO6bb72r1VBVLAg3I",
  authDomain: "mushafpro-e80e1.firebaseapp.com",
  projectId: "mushafpro-e80e1",
  storageBucket: "mushafpro-e80e1.firebasestorage.app",
  messagingSenderId: "416657395563",
  appId: "1:416657395563:web:842ee40f5e180c22bb862e"
};

/* ============================================================
   Utilitas
   ============================================================ */
const $ = id => document.getElementById(id);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const pad3 = n => String(n).padStart(3, "0");
const toAr = n => String(n).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const parseKey = k => k.split(":").map(Number);
const ord = k => { const [s, a] = parseKey(k); return s * 1000 + a; };
const idle = cb => ("requestIdleCallback" in window) ? requestIdleCallback(cb, { timeout: 2500 }) : setTimeout(cb, 400);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

function juzOf(p) { let j = 1; for (let i = 0; i < 30; i++) if (JUZ_START[i] <= p) j = i + 1; return j; }
function keysRange(s, a, b) { const out = []; for (let i = a; i <= b; i++) out.push(s + ":" + i); return out; }
function qariName() { return (QARI.find(q => q.id === S.settings.reciter) || QARI[0]).nama; }
function labelKey(k) { const [s, a] = parseKey(k); return `QS ${SURAH[s - 1][0]} : ${a}`; }

function h(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
function icon(id, extra) {
  const NS = "http://www.w3.org/2000/svg";
  const s = document.createElementNS(NS, "svg");
  s.setAttribute("class", "ik" + (extra ? " " + extra : ""));
  s.setAttribute("aria-hidden", "true");
  const u = document.createElementNS(NS, "use");
  u.setAttribute("href", "#i-" + id);
  s.appendChild(u);
  return s;
}

async function fetchJson(url, tries = 2) {
  let err;
  for (let i = 0; i <= tries; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    } catch (e) { err = e; if (i < tries) await sleep(350 * (i + 1)); }
  }
  throw err;
}

/* Catatan galat ringkas, dipakai oleh "Salin info diagnostik" di Pengaturan. */
const LOGBUF = [];
function logDiag(kind, msg) {
  LOGBUF.push(new Date().toISOString().slice(11, 19) + " " + kind + ": " + String(msg).slice(0, 220));
  if (LOGBUF.length > 25) LOGBUF.shift();
}
window.addEventListener("error", e => logDiag("error", `${e.message} @${String(e.filename || "").split("/").pop()}:${e.lineno}`));
window.addEventListener("unhandledrejection", e => logDiag("promise", e.reason && (e.reason.message || e.reason)));
{ const w0 = console.warn; console.warn = (...a) => { logDiag("warn", a.map(String).join(" ")); w0.apply(console, a); }; }

const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* penyimpanan penuh / diblokir */ } },
  raw(k) { try { return localStorage.getItem(k); } catch { return null; } },
  del(k) { try { localStorage.removeItem(k); } catch { /* abaikan */ } }
};

/* ============================================================
   State & penyimpanan
   ============================================================ */
const OPT = {
  theme: ["auto", "light", "dark", "sepia"],
  hideMode: ["normal", "blur", "first"],
  audioMode: ["page", "ayah", "range", "surah"],
  repeatAyah: [1, 2, 3, 5, 7, 10, 0],
  repeatRange: [1, 2, 3, 5, 10, 0],
  speed: [0.6, 0.75, 0.9, 1, 1.1, 1.25, 1.5],
  gap: [0, 1, 2, 3, -1]
};

function defaults() {
  return {
    page: 1,
    bookmarks: [],   // { page, surah, juz, ts }
    memorized: {},   // { "12": timestamp }
    settings: {
      theme: "dark", width: 700, hideMode: "normal", reciter: QARI[0].id,
      speed: 1, repeatAyah: 1, repeatRange: 1, gap: 0, audioMode: "page",
      autoReveal: true, showTranslation: true, wake: false
    },
    updatedAt: 0,
    tahfidz: sanT()
  };
}

/* ---- Data program tahfidz (SRS per ayat, rencana, log) — ikut tersinkron ---- */
function sanT(t) {
  const o = { items: {}, log: {}, goal: 5, plan: null, cl: {}, md: {} };
  if (!t || typeof t !== "object") return o;
  const nn = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
  if (t.items && typeof t.items === "object") for (const [k, v] of Object.entries(t.items)) {
    const [s, a] = k.split(":").map(Number);
    if (!(s >= 1 && s <= 114 && a >= 1 && a <= SURAH[s - 1][2]) || !v || typeof v !== "object") continue;
    o.items[k] = { s, a, r: nn(v.r), i: nn(v.i, 1), e: clamp(nn(v.e, 2.3), 1.3, 3), d: nn(v.d), l: nn(v.l), u: nn(v.u), ...(v.x ? { x: 1 } : {}) };
  }
  for (const f of ["log", "md"]) if (t[f] && typeof t[f] === "object") for (const [d, n] of Object.entries(t[f])) if (nn(n) > 0) o[f][d] = nn(n);
  if (t.cl && typeof t.cl === "object") for (const [d, a] of Object.entries(t.cl)) if (Array.isArray(a)) o.cl[d] = a.slice(0, 6).map(Boolean);
  o.goal = [3, 5, 10, 20].includes(Number(t.goal)) ? Number(t.goal) : 5;
  const p = t.plan;
  if (p && typeof p === "object" && nn(p.f) >= 1 && nn(p.t) <= 114 && nn(p.f) <= nn(p.t)) {
    const f = Math.round(nn(p.f)), tt = Math.round(nn(p.t));
    o.plan = { f, fa: clamp(Math.round(nn(p.fa, 1)), 1, SURAH[f - 1][2]), t: tt, ta: clamp(Math.round(nn(p.ta, SURAH[tt - 1][2])), 1, SURAH[tt - 1][2]),
      o: p.o === "f" ? "f" : "b", dl: nn(p.dl), mins: clamp(nn(p.mins, 30), 5, 480), lv: [1, 2, 3].includes(Number(p.lv)) ? Number(p.lv) : 2,
      off: clamp(Math.round(nn(p.off, 1)), 0, 2), tm: ["s", "p", "m"].includes(p.tm) ? p.tm : "s", gu: p.gu ? 1 : 0, te: p.te ? 1 : 0, ti: p.ti ? 1 : 0,
      st: nn(p.st), base: nn(p.base), pd: Math.max(1, nn(p.pd, 1)), pu: nn(p.pu) };
  }
  return o;
}
function mergeT(a, b) {
  const o = sanT(a); b = sanT(b);
  for (const [k, v] of Object.entries(b.items)) { const x = o.items[k]; if (!x || v.u > x.u) o.items[k] = v; }
  for (const f of ["log", "md"]) for (const [d, n] of Object.entries(b[f])) o[f][d] = Math.max(o[f][d] || 0, n);
  if (b.plan && (!o.plan || b.plan.pu > o.plan.pu)) o.plan = b.plan;
  return o;
}

function pickSettings(s) {
  const out = {};
  for (const k in OPT) if (OPT[k].includes(s[k])) out[k] = s[k];
  if (QARI.some(q => q.id === s.reciter)) out.reciter = s.reciter;
  const w = Number(s.width);
  if (w >= 480 && w <= 960) out.width = Math.round(w);
  for (const k of ["autoReveal", "showTranslation", "wake"]) if (typeof s[k] === "boolean") out[k] = s[k];
  return out;
}

function sanitize(o) {
  const b = defaults();
  if (!o || typeof o !== "object") return b;
  const page = Math.round(Number(o.page != null ? o.page : o.halaman_terakhir));
  if (page >= 1 && page <= PAGES) b.page = page;
  if (Array.isArray(o.bookmarks)) {
    const seen = new Map();
    o.bookmarks.forEach(x => {
      const p = Math.round(Number(x && x.page));
      if (!(p >= 1 && p <= PAGES)) return;
      const cur = seen.get(p);
      const ts = Number(x.ts) || 0;
      if (!cur || ts > cur.ts) seen.set(p, { page: p, surah: String(x.surah || "").slice(0, 80), juz: juzOf(p), ts });
    });
    b.bookmarks = [...seen.values()];
  }
  if (o.memorized && typeof o.memorized === "object") {
    for (const [k, v] of Object.entries(o.memorized)) {
      const p = Number(k);
      if (p >= 1 && p <= PAGES) b.memorized[p] = Number(v) || 1;
    }
  }
  if (o.settings && typeof o.settings === "object") Object.assign(b.settings, pickSettings(o.settings));
  b.updatedAt = Number(o.updatedAt) || Date.parse(o.updated_at) || 0;
  b.tahfidz = sanT(o.tahfidz);
  return b;
}

function loadState() {
  const saved = LS.get(KEY, null);
  if (saved && typeof saved === "object") return sanitize(saved);
  // Migrasi dari versi lama (kunci quran_*)
  const old = defaults();
  const p = Number(LS.raw("quran_halaman"));
  if (p >= 1 && p <= PAGES) old.page = p;
  try {
    const bm = JSON.parse(LS.raw("quran_bookmarks") || "[]");
    if (Array.isArray(bm)) old.bookmarks = sanitize({ bookmarks: bm.map(b => ({ page: b && b.halaman, surah: b && b.surah, ts: 1 })) }).bookmarks;
  } catch { /* abaikan */ }
  const t = LS.raw("quran_tema");
  if (t === "light" || t === "dark") old.settings.theme = t;
  return old;
}

let S = loadState();
let userNavigated = false;
let deferredInstallPrompt = null;
let appInstalled = false;

const cloudQueue = debounce(() => cloudPushNow(), 2000);
function persist() {
  S.updatedAt = Date.now();
  LS.set(KEY, S);
  cloudQueue();
}

/* ============================================================
   Elemen & model halaman
   ============================================================ */
const els = {};
["teks","kSurah","kJuz","kNo","kaki","navLabel","userStatus","authBtn","themeIcon",
 "btnAbout","dlgAbout","splash","btnBookmark","btnBookmarks","btnMemo","btnProgress","btnTheme","btnSettings","btnNavOpen","btnMoreActions","actionItems","btnInstall","modeGroup",
 "ayatSheet","asKey","asText","asPlay","asDrill","asFrom","asClose",
 "player","plBar","plPrev","plPlay","plPlayIcon","plNext","plStop","plTitle","plSub","plMore","plPanel",
 "selQari","selMode","rngWrap","rngSurah","rngFrom","rngTo","selRepAyat","selRepRange","selSpeed","selGap",
 "dlgNav","tabSurat","tabJuz","tabAyat","panSurat","panJuz","panAyat","navSearch","listSurat","gridJuz","ayatSurah","ayatNo","ayatGo",
 "dlgBm","bmList","bmAdd","dlgPrg","prgText","prgBar","prgPct","prgJuz","prgMark",
 "dlgSet","setWidth","setWidthVal","setReveal","setTrans","setWake","btnExport","btnImport","btnReset","btnDiag","fileImport","toasts","frame"
].forEach(id => { els[id] = $(id); });

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

function syncInstallButton() {
  els.btnInstall.hidden = appInstalled || isStandalone();
}

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredInstallPrompt = e;
  syncInstallButton();
});

window.addEventListener("appinstalled", () => {
  appInstalled = true;
  deferredInstallPrompt = null;
  syncInstallButton();
  toast("Mushaf Tahfidz Pro berhasil diinstal");
});

async function installApp() {
  if (deferredInstallPrompt) {
    const prompt = deferredInstallPrompt;
    deferredInstallPrompt = null;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") toast("Permintaan instal dikirim");
    return;
  }

  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|android/i.test(ua);
  if (ios && safari) {
    toast("Safari: ketuk Bagikan, lalu pilih Tambahkan ke Layar Utama.", { ms: 8000 });
  } else if (safari) {
    toast("Safari: pilih File, lalu Tambahkan ke Dock.", { ms: 8000 });
  } else {
    toast("Buka menu browser lalu pilih Instal aplikasi atau Tambahkan ke layar utama.", { ms: 8000 });
  }
}

const cur = { page: 0, verses: [], verseSet: new Set(), words: new Map(), surahs: [], sel: null };
let token = 0;
let playingKey = null;
let highlightKey = null;

const dataCache = new Map();   // halaman → Promise<json>
const fontCache = new Map();   // nama font → Promise<FontFace>
const pageIndex = new Map();   // halaman → Set<verse_key>
const vpCache = new Map();     // verse_key → halaman
const trCache = new Map();     // verse_key → terjemahan

function indexPage(no, data) {
  const set = new Set();
  data.lines.forEach(l => l.words.forEach(w => { if (w.verse_key) set.add(w.verse_key); }));
  pageIndex.set(no, set);
}

function loadPage(no) {
  if (!dataCache.has(no)) {
    const p = fetchJson(JSON_URL + pad3(no) + ".json").then(d => {
      if (!d || !Array.isArray(d.lines)) throw new Error("Format halaman tidak valid");
      indexPage(no, d);
      return d;
    });
    p.catch(() => dataCache.delete(no));
    dataCache.set(no, p);
  }
  return dataCache.get(no);
}

function loadFont(nama) {
  if (!fontCache.has(nama)) {
    const file = nama === "QCF4_QBSML" ? "QCF4_QBSML.woff2" : nama + "_W.woff2";
    const p = new FontFace(nama, `url(${FONT_URL}${file})`).load().then(ff => { document.fonts.add(ff); return ff; });
    p.catch(() => fontCache.delete(nama));
    fontCache.set(nama, p);
  }
  return fontCache.get(nama);
}

function fontsOf(data) {
  const s = new Set();
  data.lines.forEach(l => l.words.forEach(w => { if (w.type !== "surah_header" && w.font) s.add(w.font); }));
  return [...s];
}

/* ============================================================
   Render halaman
   ============================================================ */
async function render(no, tk) {
  els.teks.classList.add("memuat");
  let data;
  try {
    data = await loadPage(no);
    await Promise.all(fontsOf(data).map(loadFont));
  } catch (err) {
    console.warn("Gagal memuat halaman", no, err);
    if (tk === token) showError(no);
    return false;
  }
  if (tk !== token) return false;

  const frag = document.createDocumentFragment();
  const words = new Map();
  const verses = [];
  const firstSeen = new Set();

  data.lines.forEach(line => {
    const baris = h("div", "baris");
    const head = line.words.find(w => w.type === "surah_header");
    if (head) {
      baris.classList.add("header");
      const b = h("div", "banner");
      const id = head.sura || (data.surahs && data.surahs[0] && data.surahs[0].id);
      const nama = id && SURAH[id - 1] ? "سورة " + SURAH[id - 1][1] : head.text;
      b.appendChild(h("span", null, nama));
      baris.appendChild(b);
    } else {
      if (line.words.length && line.words.every(w => w.type === "bismillah")) baris.classList.add("basmalah");
      line.words.forEach(w => {
        const k = h("span", "kata", w.char);
        k.style.fontFamily = `"${w.font}"`;
        const key = w.verse_key;
        if (key) {
          k.dataset.v = key;
          if (!words.has(key)) { words.set(key, []); verses.push(key); }
          words.get(key).push(k);
        }
        if (w.type === "end") {
          k.classList.add("is-end");
          k.setAttribute("role", "button");
          k.tabIndex = 0;
          k.setAttribute("aria-label", "Ayat " + (key ? parseKey(key)[1] : ""));
        } else if (key && w.type !== "quarter" && !firstSeen.has(key)) {
          firstSeen.add(key);
          k.classList.add("is-first");
        }
        baris.appendChild(k);
      });
    }
    frag.appendChild(baris);
  });

  els.teks.replaceChildren(frag);
  els.teks.classList.remove("memuat");
  els.teks.classList.toggle("rata-tengah", no <= 2);

  cur.page = no;
  cur.verses = verses;
  cur.verseSet = new Set(verses);
  cur.words = words;
  cur.surahs = (data.surahs || []).map(s => ({ id: s.id, from: s.verse_start, to: s.verse_end }));
  if (!cur.surahs.length && verses.length) {
    const [s] = parseKey(verses[0]);
    cur.surahs = [{ id: s, from: 1, to: SURAH[s - 1][2] }];
  }

  lastW = els.teks.clientWidth;
  fit();
  applyHideMode();
  reapplyMarks();
  updateChrome();
  fillRangeControls();
  return true;
}

function showError(no) {
  els.teks.classList.remove("memuat");
  const box = h("div", "galat");
  box.append(h("p", null, `Halaman ${no} belum bisa dimuat. Periksa koneksi internet Anda lalu coba lagi.`));
  const b = h("button", null, "Coba lagi");
  b.type = "button";
  b.prepend(icon("refresh"));
  b.addEventListener("click", () => goto(S.page, { auto: true }));
  box.append(b);
  els.teks.replaceChildren(box);
}

/* ---- Pas halaman ----
  Ukur lebar glyph setelah font QCF siap. Tinggi kotak font QCF tidak mewakili tinggi
  visual glyph, jadi pitch baris memakai nilai desain yang stabil. */

const FIT_SLACK = 0.985;                    // sisakan 1,5% (baris tetap rata kiri-kanan lewat space-between)
const measureCtx = document.createElement("canvas").getContext("2d");

function lebarAlami(baris, fs) {
  let total = 0;
  const kids = baris.querySelectorAll(".kata");
  kids.forEach(k => {
    measureCtx.font = `${fs}px ${k.style.fontFamily || getComputedStyle(k).fontFamily}`;
    total += measureCtx.measureText(k.textContent).width;
  });
  const gap = baris.classList.contains("basmalah") ? 0.3 : (PORTRAIT_PHONE.matches ? MOBILE_GAP_EM : GAP_EM);
  return total + Math.max(0, kids.length - 1) * gap * fs;
}

function setVar(name, val) {
  if (els.teks.style.getPropertyValue(name) !== val) els.teks.style.setProperty(name, val);
}

function fit() {
  const W = els.teks.clientWidth;
  if (!W || !cur.page) return;
  const semua = $$(".baris", els.teks);
  if (!semua.length) return;
  const wpx = W + "px";
  semua.forEach(b => { if (b.style.width !== wpx) b.style.width = wpx; });

  // ---- cadangan: ukur DOM ----
  const isi = semua.filter(b => !b.classList.contains("header"));
  if (!isi.length) return;
  const baseFs = 100;
  const maks = Math.max(...isi.map(b => lebarAlami(b, baseFs)));
  if (!maks) return;
  const maxByWidth = baseFs * (W / maks) * FIT_SLACK;
  const pitch = PORTRAIT_PHONE.matches ? MOBILE_PITCH : MIN_PITCH;
  const maxByHeight = els.teks.clientHeight / (PAGE_LINES * pitch);
  const fs = clamp(Math.min(maxByWidth, maxByHeight || maxByWidth), 4, 96);
  els.teks.style.setProperty("--fs", fs + "px");
  setVar("--pitch", String(pitch));
  isi.forEach(b => {
    const pendek = !b.classList.contains("basmalah") && lebarAlami(b, fs) < W * SHORT_LINE;
    b.classList.toggle("pendek", pendek);
  });
}
const fitSoon = (() => { let raf = 0; return () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); }; })();

// Hanya satu pemicu: lebar kolom berubah (jendela diubah / lebar halaman di Pengaturan).
let lastW = 0;
new ResizeObserver(() => {
  const w = els.teks.clientWidth;
  if (cur.page && w && w !== lastW) { lastW = w; fitSoon(); }
}).observe(els.teks);

/* ============================================================
   Navigasi halaman
   ============================================================ */
async function goto(no, opts = {}) {
  no = Math.round(Number(no));
  if (!(no >= 1 && no <= PAGES)) return false;
  const tk = ++token;
  if (!opts.auto) userNavigated = true;
  if (!opts.keepAudio) hardStop(true);
  S.page = no;
  persist();
  const ok = await render(no, tk);
  if (ok && tk === token) prefetchNeighbours(no);
  return ok;
}

function prefetchNeighbours(no) {
  if (navigator.connection && navigator.connection.saveData) return;
  idle(() => {
    [no + 1, no - 1].forEach(n => {
      if (n < 1 || n > PAGES) return;
      loadPage(n).then(d => Promise.all(fontsOf(d).map(loadFont))).catch(() => {});
    });
  });
}

function updateChrome() {
  const p = cur.page || S.page;
  const names = cur.surahs.map(s => SURAH[s.id - 1][0]);
  els.kSurah.textContent = names.join(" · ");
  els.kJuz.textContent = "Juz " + juzOf(p);
  els.kNo.textContent = toAr(p);
  els.kaki.classList.toggle("hafal", !!S.memorized[p]);
  els.navLabel.textContent = (names[0] || "Pilih surat") + " · " + p;
  els.btnBookmark.setAttribute("aria-pressed", String(S.bookmarks.some(b => b.page === p)));
  els.btnMemo.setAttribute("aria-pressed", String(!!S.memorized[p]));
  els.btnMemo.title = S.memorized[p] ? "Batalkan tanda hafal (M)" : "Tandai halaman ini sudah hafal (M)";
  document.title = `Hal. ${p} · ${names[0] || "Mushaf"} — Mushaf Tahfidz Pro`;
}

/* ============================================================
   Mode hafalan, pemilihan & penandaan ayat
   ============================================================ */
function applyHideMode() {
  const m = S.settings.hideMode;
  els.teks.classList.toggle("m-blur", m === "blur");
  els.teks.classList.toggle("m-first", m === "first");
  $$(".kata.terbuka", els.teks).forEach(k => k.classList.remove("terbuka"));
  $$("#modeGroup button").forEach(b => b.setAttribute("aria-checked", String(b.dataset.mode === m)));
}

function setHideMode(m) {
  if (!OPT.hideMode.includes(m)) return;
  S.settings.hideMode = m;
  persist();
  applyHideMode();
}

function isHiddenWord(k) {
  const m = S.settings.hideMode;
  if (k.classList.contains("is-end") || k.classList.contains("terbuka")) return false;
  if (m === "blur") return true;
  if (m === "first") return !k.classList.contains("is-first");
  return false;
}

function toggleVerse(key) {
  const ws = cur.words.get(key) || [];
  const open = ws.every(w => w.classList.contains("terbuka"));
  ws.forEach(w => w.classList.toggle("terbuka", !open));
}
function revealVerse(key) { (cur.words.get(key) || []).forEach(w => w.classList.add("terbuka")); }

function clearSel() {
  if (cur.sel) (cur.words.get(cur.sel) || []).forEach(w => w.classList.remove("sel"));
  cur.sel = null;
}
function selectVerse(key, opts = {}) {
  clearSel();
  cur.sel = key;
  (cur.words.get(key) || []).forEach(w => w.classList.add("sel"));
  setHighlight(key);
  if (opts.sheet !== false) showSheet(key);
}
function setHighlight(key) {
  if (highlightKey && highlightKey !== key) (cur.words.get(highlightKey) || []).forEach(w => w.classList.remove("putar"));
  highlightKey = key;
  if (key) (cur.words.get(key) || []).forEach(w => w.classList.add("putar"));
}
function markPlaying(key) {
  const changed = key !== playingKey;
  playingKey = key;
  if (key && changed) setHighlight(key);
}
function reapplyMarks() {
  if (cur.sel) {
    if (cur.words.has(cur.sel)) (cur.words.get(cur.sel)).forEach(w => w.classList.add("sel"));
    else { cur.sel = null; els.ayatSheet.hidden = true; }
  }
  if (highlightKey && cur.words.has(highlightKey)) (cur.words.get(highlightKey)).forEach(w => w.classList.add("putar"));
}

els.teks.addEventListener("click", e => {
  const k = e.target.closest(".kata");
  if (!k || !els.teks.contains(k)) return;
  const key = k.dataset.v;
  if (k.classList.contains("is-end")) {
    if (key) { toggleVerse(key); selectVerse(key); }
    return;
  }
  if (isHiddenWord(k)) { k.classList.add("terbuka"); return; }
  if (key) selectVerse(key);
});
els.teks.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("is-end")) {
    e.preventDefault();
    e.target.click();
  }
});

/* ---- Kartu ayat + terjemahan ---- */
function cleanHtml(htmlStr) {
  const d = new DOMParser().parseFromString(String(htmlStr).replace(/<sup[^>]*>.*?<\/sup>/gi, ""), "text/html");
  return (d.body.textContent || "").trim();
}
async function getTranslation(key) {
  if (trCache.has(key)) return trCache.get(key);
  const r = await fetchJson(`${API}/quran/translations/${TRANSLATION_ID}?verse_key=${encodeURIComponent(key)}`, 1);
  const t = r && r.translations && r.translations[0] ? cleanHtml(r.translations[0].text) : "";
  if (!t) throw new Error("kosong");
  trCache.set(key, t);
  return t;
}
async function showSheet(key) {
  els.asKey.textContent = labelKey(key);
  els.ayatSheet.hidden = false;
  if (!S.settings.showTranslation) { els.asText.textContent = ""; return; }
  els.asText.textContent = "Memuat terjemahan…";
  try {
    const t = await getTranslation(key);
    if (cur.sel === key) els.asText.textContent = t;
  } catch {
    if (cur.sel === key) els.asText.textContent = "Terjemahan belum tersedia (periksa koneksi internet).";
  }
}
function closeSheet() { els.ayatSheet.hidden = true; clearSel(); }

els.asClose.addEventListener("click", closeSheet);
els.asPlay.addEventListener("click", () => { if (cur.sel) startPlayback([cur.sel], { repeatRange: 1 }); });
els.asDrill.addEventListener("click", () => { if (cur.sel) startPlayback([cur.sel], { repeatAyah: 5, gap: -1, repeatRange: 1 }); });
els.asFrom.addEventListener("click", () => {
  if (!cur.sel) return;
  const [s, a] = parseKey(cur.sel);
  startPlayback(keysRange(s, a, SURAH[s - 1][2]));
});

/* ============================================================
   Penanda (bookmark) & progres hafalan
   ============================================================ */
function toggleBookmark() {
  const p = cur.page || S.page;
  const i = S.bookmarks.findIndex(b => b.page === p);
  if (i >= 0) {
    const [rm] = S.bookmarks.splice(i, 1);
    persist(); updateChrome(); renderBookmarks();
    toast("Penanda dihapus", { action: { label: "Urungkan", fn: () => { S.bookmarks.push(rm); persist(); updateChrome(); renderBookmarks(); } } });
  } else {
    S.bookmarks.push({ page: p, surah: cur.surahs.map(s => SURAH[s.id - 1][0]).join(" · "), juz: juzOf(p), ts: Date.now() });
    persist(); updateChrome(); renderBookmarks();
    toast(`Halaman ${p} disimpan sebagai penanda`);
  }
}

function renderBookmarks() {
  const ul = els.bmList;
  ul.replaceChildren();
  if (!S.bookmarks.length) { ul.append(h("li", "kosong", "Belum ada penanda. Ketuk ikon penanda untuk menyimpan halaman.")); return; }
  [...S.bookmarks].sort((a, b) => a.page - b.page).forEach(bm => {
    const li = h("li");
    const it = h("button", "item" + (bm.page === cur.page ? " aktif" : ""));
    it.type = "button";
    const no = h("span", "no", String(bm.page));
    const nm = h("span", "nm");
    nm.append(h("b", null, bm.surah || "Halaman " + bm.page), h("small", null, `Halaman ${bm.page} · Juz ${bm.juz} · ${new Date(bm.ts || Date.now()).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`));
    it.append(no, nm);
    it.addEventListener("click", () => { els.dlgBm.close(); goto(bm.page); });
    const del = h("button", "btn-hapus");
    del.type = "button";
    del.setAttribute("aria-label", "Hapus penanda halaman " + bm.page);
    del.append(icon("trash"));
    del.addEventListener("click", () => {
      S.bookmarks = S.bookmarks.filter(b => b.page !== bm.page);
      persist(); updateChrome(); renderBookmarks();
      toast("Penanda dihapus", { action: { label: "Urungkan", fn: () => { S.bookmarks.push(bm); persist(); updateChrome(); renderBookmarks(); } } });
    });
    li.append(it, del);
    ul.append(li);
  });
}

function toggleMemo() {
  const p = cur.page || S.page;
  if (S.memorized[p]) { delete S.memorized[p]; toast(`Tanda hafal halaman ${p} dicabut`); }
  else { S.memorized[p] = Date.now(); toast(`Halaman ${p} ditandai hafal. Barakallahu fiik!`); }
  persist(); updateChrome();
  if (els.dlgPrg.open) renderProgress();
}

function juzRange(j) { return [JUZ_START[j - 1], (JUZ_START[j] || PAGES + 1) - 1]; }
function renderProgress() {
  const total = Object.keys(S.memorized).length;
  els.prgText.textContent = `${total} / ${PAGES} halaman`;
  els.prgPct.textContent = (total / PAGES * 100).toFixed(total && total < 60 ? 1 : 0).replace(".", ",") + "%";
  els.prgBar.style.width = (total / PAGES * 100) + "%";
  els.prgJuz.replaceChildren();
  for (let j = 1; j <= 30; j++) {
    const [a, b] = juzRange(j);
    let n = 0;
    for (let p = a; p <= b; p++) if (S.memorized[p]) n++;
    const len = b - a + 1;
    const li = h("li");
    const it = h("button", "item" + (juzOf(cur.page || S.page) === j ? " aktif" : ""));
    it.type = "button";
    const nm = h("span", "nm");
    const bar = h("div", "bar"); const fill = h("i"); fill.style.width = (n / len * 100) + "%"; bar.append(fill);
    nm.append(h("b", null, "Juz " + j), bar);
    it.append(h("span", "no", String(j)), nm, h("span", "cnt", `${n}/${len}`));
    it.addEventListener("click", () => { els.dlgPrg.close(); goto(a); });
    li.append(it);
    els.prgJuz.append(li);
  }
  els.prgMark.textContent = S.memorized[cur.page || S.page] ? "Cabut tanda hafal halaman ini" : "Tandai halaman ini hafal";
}

/* ============================================================
   Navigasi: surat · juz · ayat
   ============================================================ */
const norm = s => s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, "");

function buildNavigator() {
  // daftar surat
  const frag = document.createDocumentFragment();
  SURAH.forEach((s, i) => {
    const li = h("li"); li.dataset.q = norm(`${i + 1} ${s[0]} ${s[1]}`);
    const b = h("button", "item"); b.type = "button"; b.dataset.page = s[3];
    const nm = h("span", "nm"); nm.append(h("b", null, s[0]), h("small", null, `${s[2]} ayat · hal. ${s[3]}`));
    b.append(h("span", "no", String(i + 1)), nm, h("span", "ar", s[1]));
    b.addEventListener("click", () => { els.dlgNav.close(); goto(s[3]); });
    li.append(b); frag.append(li);
  });
  els.listSurat.replaceChildren(frag);

  // grid juz
  els.gridJuz.replaceChildren();
  for (let j = 1; j <= 30; j++) {
    const b = h("button", null, String(j)); b.type = "button";
    b.setAttribute("aria-label", `Juz ${j}, halaman ${JUZ_START[j - 1]}`);
    b.addEventListener("click", () => { els.dlgNav.close(); goto(JUZ_START[j - 1]); });
    els.gridJuz.append(b);
  }

  // pilihan surat (ayat & rentang)
  SURAH.forEach((s, i) => {
    els.ayatSurah.append(new Option(`${i + 1}. ${s[0]}`, i + 1));
  });
}

function filterSurat() {
  const raw = els.navSearch.value.trim();
  const q = norm(raw);
  const m = raw.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
  $$(".lompat-ayat", els.listSurat).forEach(e => e.remove());
  $$("li[data-q]", els.listSurat).forEach(li => { li.hidden = !!q && !li.dataset.q.includes(q); });
  if (m) {
    const s = Number(m[1]), a = Number(m[2]);
    if (s >= 1 && s <= 114) {
      const li = h("li", "lompat-ayat");
      const b = h("button", "item lompat", `Buka QS ${SURAH[s - 1][0]} ayat ${a}`); b.type = "button";
      b.addEventListener("click", () => jumpToVerse(s, a));
      li.append(b);
      els.listSurat.prepend(li);
      $$("li[data-q]", els.listSurat).forEach(x => { x.hidden = true; });
    }
  }
}

function openNav(tab) {
  const aktif = cur.surahs[0] ? cur.surahs[0].id : 1;
  $$("#listSurat li[data-q] .item").forEach((b, i) => b.classList.toggle("aktif", i + 1 === aktif));
  $$("#gridJuz button").forEach((b, i) => b.classList.toggle("aktif", i + 1 === juzOf(cur.page || S.page)));
  els.ayatSurah.value = aktif;
  setTab(tab || "surat");
  els.navSearch.value = ""; filterSurat();
  els.dlgNav.showModal();
  if ((tab || "surat") === "surat" && !window.matchMedia("(pointer: coarse)").matches) els.navSearch.focus({ preventScroll: true });
}

function setTab(name) {
  const map = { surat: ["tabSurat", "panSurat"], juz: ["tabJuz", "panJuz"], ayat: ["tabAyat", "panAyat"] };
  Object.entries(map).forEach(([k, [t, p]]) => {
    const on = k === name;
    els[t].setAttribute("aria-selected", String(on));
    els[t].tabIndex = on ? 0 : -1;
    els[p].hidden = !on;
  });
}

async function versePage(key) {
  const [s, a] = parseKey(key);
  if (a === 1) return SURAH[s - 1][3];
  for (const n of [cur.page + 1, cur.page - 1]) if (pageIndex.get(n) && pageIndex.get(n).has(key)) return n;
  if (vpCache.has(key)) return vpCache.get(key);
  const r = await fetchJson(`${API}/verses/by_key/${encodeURIComponent(key)}`, 1);
  const p = r && r.verse && r.verse.page_number;
  if (!(p >= 1 && p <= PAGES)) throw new Error("halaman tidak ditemukan");
  vpCache.set(key, p);
  return p;
}

async function jumpToVerse(s, a) {
  const total = SURAH[s - 1][2];
  if (!(a >= 1 && a <= total)) { toast(`${SURAH[s - 1][0]} hanya memiliki ${total} ayat`); return; }
  const key = s + ":" + a;
  els.dlgNav.close();
  try {
    const p = await versePage(key);
    await goto(p);
    if (cur.words.has(key)) selectVerse(key, { sheet: false });
  } catch {
    toast("Tidak bisa mencari halaman ayat (luring). Membuka awal surat.");
    goto(SURAH[s - 1][3]);
  }
}

/* ============================================================
   Mesin audio
   ============================================================ */
const au = new Audio();
au.preload = "auto";
const pre = new Audio();     // elemen cadangan untuk memuat ayat berikutnya lebih awal
pre.preload = "auto"; pre.muted = true;

const P = { queue: [], i: 0, ra: 0, rr: 0, tk: 0, active: false, paused: false, inGap: false,
            startPage: 1, ov: {}, gapTimer: null, resume: null };
const eff = k => (P.ov[k] !== undefined ? P.ov[k] : S.settings[k]);
const audioUrl = key => { const [s, a] = parseKey(key); return `${AUDIO_URL}${S.settings.reciter}/${pad3(s)}${pad3(a)}.mp3`; };

function buildQueue() {
  const mode = S.settings.audioMode;
  const pv = cur.verses;
  if (!pv.length) return [];
  if (mode === "page") return pv.slice();
  if (mode === "ayah") return [cur.sel || pv[0]];
  if (mode === "range") {
    const s = Number(els.rngSurah.value) || cur.surahs[0].id;
    const total = SURAH[s - 1][2];
    let a = clamp(parseInt(els.rngFrom.value, 10) || 1, 1, total);
    let b = clamp(parseInt(els.rngTo.value, 10) || a, 1, total);
    if (b < a) [a, b] = [b, a];
    return keysRange(s, a, b);
  }
  const [s, a] = parseKey(cur.sel || pv[0]);
  return keysRange(s, a, SURAH[s - 1][2]);
}

// iOS/Safari hanya mengizinkan audio bila play() dipicu langsung oleh sentuhan pengguna.
// Elemen audio "dibuka kuncinya" sekali dengan WAV senyap, lalu bisa dipakai ulang untuk semua ayat.
const SILENT = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
let unlocked = false;
function unlockAudio() {
  if (unlocked) return;
  unlocked = true;
  au.src = SILENT;
  au.play().catch(() => {});
}
const isSilent = () => au.src.startsWith("data:");

function clearGap() { clearTimeout(P.gapTimer); P.gapTimer = null; P.resume = null; P.inGap = false; P.paused = false; }

function hardStop(resetUi) {
  P.tk++; P.active = false; P.queue = []; P.i = 0; P.ra = 0; P.rr = 0; P.ov = {};
  clearGap();
  try { au.pause(); } catch { /* abaikan */ }
  markPlaying(null);
  els.plBar.style.width = "0%";
  if (resetUi) ui();
}

async function startPlayback(queue, ov = {}) {
  if (!queue.length) { toast("Tidak ada ayat untuk diputar."); return; }
  unlockAudio();
  hardStop(false);
  P.queue = queue; P.ov = ov; P.active = true; P.startPage = cur.page;
  const my = ++P.tk;
  setSessionHandlers();
  await playCurrent(my);
}

async function playCurrent(my) {
  if (my !== P.tk || !P.active) return;
  const key = P.queue[P.i];
  await ensureVisible(key, my);
  if (my !== P.tk || !P.active) return;
  markPlaying(key);
  if (S.settings.autoReveal) revealVerse(key);
  clearGap();
  const rate = Number(S.settings.speed) || 1;
  au.src = audioUrl(key);
  au.defaultPlaybackRate = rate; au.playbackRate = rate;
  au.preservesPitch = true;
  try {
    await au.play();
  } catch (err) {
    if (my !== P.tk) return;
    if (err && err.name === "AbortError") return;
    toast("Audio tidak dapat diputar. Periksa koneksi internet atau ganti qari.");
    hardStop(true);
    return;
  }
  if (my !== P.tk) return;
  ui(); mediaMeta(key); prefetchNext();
}

async function ensureVisible(key, my) {
  if (cur.verseSet.has(key)) return;
  let p = null;
  try { p = await versePage(key); } catch { /* lanjut ke langkah manual */ }
  if (my !== P.tk) return;
  if (p && p !== cur.page) { await goto(p, { keepAudio: true, auto: true }); return; }
  if (!p) {
    for (let g = 0; g < 6 && !cur.verseSet.has(key); g++) {
      const last = cur.verses.length ? ord(cur.verses[cur.verses.length - 1]) : 0;
      const t = ord(key) > last ? cur.page + 1 : cur.page - 1;
      if (t < 1 || t > PAGES) break;
      await goto(t, { keepAudio: true, auto: true });
      if (my !== P.tk) return;
    }
  }
}

function prefetchNext() {
  const repA = Number(eff("repeatAyah"));
  if (repA === 0 || P.ra + 1 < repA) return;
  const nxt = P.queue[P.i + 1];
  if (nxt) { pre.src = audioUrl(nxt); try { pre.load(); } catch { /* abaikan */ } }
}

au.addEventListener("ended", () => {
  if (!P.active || isSilent()) return;
  const my = P.tk;
  P.ra++;
  const repA = Number(eff("repeatAyah"));
  const advance = async () => {
    if (my !== P.tk || !P.active) return;
    P.resume = null; P.inGap = false;
    if (repA === 0 || P.ra < repA) return playCurrent(my);
    P.ra = 0; P.i++;
    if (P.i >= P.queue.length) {
      P.rr++;
      const rr = Number(eff("repeatRange"));
      if (rr === 0 || P.rr < rr) {
        P.i = 0;
        if (cur.page !== P.startPage) await goto(P.startPage, { keepAudio: true, auto: true });
      } else { finish(); return; }
    }
    return playCurrent(my);
  };
  const g = Number(eff("gap"));
  const rate = Number(au.playbackRate) || 1;
  const ms = g < 0 ? Math.round(((au.duration || 2) / rate) * 1000) : g * 1000;
  if (ms > 0) {
    P.inGap = true; P.resume = advance; ui();
    P.gapTimer = setTimeout(() => { P.gapTimer = null; advance(); }, ms);
  } else advance();
});

au.addEventListener("play", ui);
au.addEventListener("pause", ui);
au.addEventListener("timeupdate", () => {
  if (au.duration > 0) els.plBar.style.width = (au.currentTime / au.duration * 100) + "%";
});
au.addEventListener("error", () => {
  if (!P.active || isSilent()) return;
  toast("Audio gagal dimuat. Periksa koneksi internet atau ganti qari.");
  hardStop(true);
});

function finish() { hardStop(true); toast("Pemutaran selesai"); }

function skip(d) {
  if (!P.active) return;
  const n = P.i + d;
  if (n < 0 || n >= P.queue.length) return;
  clearGap();
  P.i = n; P.ra = 0;
  playCurrent(++P.tk);
}

function togglePlay() {
  if (!P.active) { startPlayback(buildQueue()); return; }
  unlockAudio();
  if (P.inGap) {
    if (P.gapTimer) { clearTimeout(P.gapTimer); P.gapTimer = null; P.paused = true; }
    else if (P.paused && P.resume) { const f = P.resume; P.paused = false; f(); }
    ui();
    return;
  }
  if (au.paused) au.play().catch(() => {}); else au.pause();
}

function ui() {
  const playing = P.active && (P.inGap ? !P.paused : !au.paused);
  els.plPlayIcon.setAttribute("href", playing ? "#i-pause" : "#i-play");
  els.plPlay.setAttribute("aria-label", playing ? "Jeda" : "Putar");
  if (P.active && P.queue.length) {
    const key = P.queue[P.i];
    els.plTitle.textContent = labelKey(key);
    const repA = Number(eff("repeatAyah")), rr = Number(eff("repeatRange"));
    let sub = P.inGap ? "Giliran Anda: lantunkan ayat ini…" : `Ayat ${P.i + 1} dari ${P.queue.length}`;
    if (repA !== 1) sub += ` · ulang ${P.ra + 1}/${repA === 0 ? "∞" : repA}`;
    if (rr !== 1) sub += ` · putaran ${P.rr + 1}/${rr === 0 ? "∞" : rr}`;
    els.plSub.textContent = sub;
  } else {
    els.plTitle.textContent = "Murattal · " + qariName();
    els.plSub.textContent = "Siap diputar";
  }
}

function mediaMeta(key) {
  if (!("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: labelKey(key), artist: qariName(), album: "Mushaf Tahfidz Pro",
      artwork: [{ src: "icon.svg", sizes: "any", type: "image/svg+xml" }]
    });
  } catch { /* abaikan */ }
}
function setSessionHandlers() {
  if (!("mediaSession" in navigator)) return;
  const set = (a, f) => { try { navigator.mediaSession.setActionHandler(a, f); } catch { /* tidak didukung */ } };
  set("play", togglePlay); set("pause", togglePlay);
  set("previoustrack", () => skip(-1)); set("nexttrack", () => skip(1));
  set("stop", () => hardStop(true));
}

/* ---- Kontrol pemutar ---- */
els.plPlay.addEventListener("click", togglePlay);
els.plStop.addEventListener("click", () => hardStop(true));
els.plPrev.addEventListener("click", () => skip(-1));
els.plNext.addEventListener("click", () => skip(1));
els.plMore.addEventListener("click", () => {
  const open = els.plPanel.hidden;
  els.plPanel.hidden = !open;
  els.plMore.setAttribute("aria-expanded", String(open));
});

function fillRangeControls() {
  const prev = els.rngSurah.value;
  els.rngSurah.replaceChildren();
  cur.surahs.forEach(s => els.rngSurah.append(new Option(`${s.id}. ${SURAH[s.id - 1][0]}`, s.id)));
  if (prev && cur.surahs.some(s => String(s.id) === prev)) els.rngSurah.value = prev;
  syncRangeDefaults();
}
function syncRangeDefaults() {
  const id = Number(els.rngSurah.value) || (cur.surahs[0] && cur.surahs[0].id) || 1;
  const info = cur.surahs.find(s => s.id === id);
  const total = SURAH[id - 1][2];
  els.rngFrom.max = total; els.rngTo.max = total;
  els.rngFrom.value = info ? info.from : 1;
  els.rngTo.value = info ? info.to : total;
}
els.rngSurah.addEventListener("change", syncRangeDefaults);

function bindPlayerSettings() {
  QARI.forEach(q => els.selQari.append(new Option(q.nama, q.id)));
  const num = (el, key) => el.addEventListener("change", () => { S.settings[key] = Number(el.value); persist(); ui(); });
  els.selQari.addEventListener("change", () => {
    S.settings.reciter = els.selQari.value; persist(); ui();
    if (P.active) skip(0);
  });
  els.selMode.addEventListener("change", () => {
    S.settings.audioMode = els.selMode.value; persist();
    els.rngWrap.hidden = S.settings.audioMode !== "range";
  });
  num(els.selRepAyat, "repeatAyah");
  num(els.selRepRange, "repeatRange");
  num(els.selGap, "gap");
  els.selSpeed.addEventListener("change", () => {
    S.settings.speed = Number(els.selSpeed.value); persist();
    au.defaultPlaybackRate = S.settings.speed; au.playbackRate = S.settings.speed;
  });
}

/* ============================================================
   Tema, pengaturan, wake lock
   ============================================================ */
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const THEME_COLOR = { light: "#f5f6f2", dark: "#0b1210", sepia: "#e5dac5" };
function applyTheme() {
  const pref = S.settings.theme;
  const eff2 = pref === "auto" ? (mq.matches ? "dark" : "light") : pref;
  document.documentElement.dataset.theme = eff2;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLOR[eff2]);
  els.themeIcon.setAttribute("href", { auto: "#i-auto", light: "#i-sun", dark: "#i-moon", sepia: "#i-leaf" }[pref]);
  els.btnTheme.title = "Tema: " + { auto: "otomatis", light: "terang", dark: "gelap", sepia: "sepia" }[pref] + " (ketuk untuk mengganti)";
  $$('input[name="theme"]').forEach(r => { r.checked = r.value === pref; });
}
mq.addEventListener && mq.addEventListener("change", () => { if (S.settings.theme === "auto") applyTheme(); });

function applyWidth() {
  document.documentElement.style.setProperty("--w", S.settings.width + "px");
  els.setWidth.value = S.settings.width;
  els.setWidthVal.textContent = S.settings.width + " px";
  if (cur.page) fitSoon();
}

let wl = null;
async function syncWake() {
  try {
    if (S.settings.wake && "wakeLock" in navigator && document.visibilityState === "visible") {
      if (!wl) { wl = await navigator.wakeLock.request("screen"); wl.addEventListener("release", () => { wl = null; }); }
    } else if (wl) { await wl.release(); wl = null; }
  } catch { /* tidak didukung / ditolak */ }
}
document.addEventListener("visibilitychange", syncWake);

function syncControls() {
  const st = S.settings;
  els.selQari.value = st.reciter;
  els.selMode.value = st.audioMode;
  els.rngWrap.hidden = st.audioMode !== "range";
  els.selRepAyat.value = st.repeatAyah;
  els.selRepRange.value = st.repeatRange;
  els.selSpeed.value = st.speed;
  els.selGap.value = st.gap;
  els.setReveal.checked = st.autoReveal;
  els.setTrans.checked = st.showTranslation;
  els.setWake.checked = st.wake;
  applyTheme(); applyWidth();
  au.defaultPlaybackRate = st.speed; au.playbackRate = st.speed;
  ui();
}

async function copyDiag() {
  const rows = $$(".baris", els.teks);
  const k = els.teks.querySelector(".kata");
  let brave = false;
  try { brave = !!(navigator.brave && await navigator.brave.isBrave()); } catch { /* abaikan */ }
  const info = {
    app: "Mushaf Tahfidz Pro v5",
    ua: navigator.userAgent, brave, dpr: window.devicePixelRatio, viewport: `${innerWidth}x${innerHeight}`,
    page: cur.page, kolomW: els.teks.clientWidth, fs: els.teks.style.getPropertyValue("--fs"), pitch: els.teks.style.getPropertyValue("--pitch"),
    barisMeluber: rows.filter(r => r.scrollWidth > r.clientWidth + 1).length,
    fontKata: k ? getComputedStyle(k).fontFamily : null, lebarKataPertama: k ? Math.round(k.getBoundingClientRect().width * 100) / 100 : null,
    font: [...document.fonts].map(f => `${f.family}:${f.status}`),
    serviceWorker: !!(navigator.serviceWorker && navigator.serviceWorker.controller),
    catatan: LOGBUF
  };
  const text = JSON.stringify(info, null, 2);
  try { await navigator.clipboard.writeText(text); toast("Info diagnostik disalin. Tempel ke pesan Anda."); }
  catch { window.prompt("Salin teks diagnostik ini:", text); }
}

function exportData() {
  const blob = new Blob([JSON.stringify({ app: "mushaf-tahfidz-pro", version: 2, exportedAt: new Date().toISOString(), ...S }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "mushaf-tahfidz-cadangan-" + new Date().toISOString().slice(0, 10) + ".json";
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
function importData(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const obj = JSON.parse(String(rd.result));
      if (!obj || typeof obj !== "object" || (obj.page == null && obj.bookmarks == null && obj.memorized == null)) throw new Error("bukan berkas cadangan");
      if (!confirm("Ganti data di perangkat ini dengan isi berkas cadangan?")) return;
      S = sanitize(obj);
      persist(); syncControls(); updateChrome(); renderBookmarks(); applyHideMode(); window.TH && window.TH.refresh();
      goto(S.page);
      toast("Cadangan berhasil diimpor");
    } catch { toast("Berkas cadangan tidak valid"); }
  };
  rd.readAsText(file);
}

/* ============================================================
   Toast
   ============================================================ */
function toast(msg, opt = {}) {
  const t = h("div", "toast");
  t.append(h("span", null, msg));
  if (opt.action) {
    const b = h("button", null, opt.action.label); b.type = "button";
    b.addEventListener("click", () => { opt.action.fn(); t.remove(); });
    t.append(b);
  }
  els.toasts.append(t);
  while (els.toasts.children.length > 3) els.toasts.firstChild.remove();
  setTimeout(() => t.remove(), opt.ms || 4200);
}

/* ============================================================
   Sinkronisasi awan (Firebase, dimuat malas — aplikasi tetap jalan tanpa ini)
   ============================================================ */
const Cloud = { ok: false, user: null, auth: null, db: null, provider: null, B: null, C: null };

async function cloudInit() {
  try {
    const base = "https://www.gstatic.com/firebasejs/10.8.0/";
    const [A, B, C] = await Promise.all([import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-firestore.js")]);
    const app = A.initializeApp(FIREBASE_CONFIG);
    Cloud.auth = B.getAuth(app); Cloud.db = C.getFirestore(app);
    Cloud.provider = new B.GoogleAuthProvider(); Cloud.B = B; Cloud.C = C; Cloud.ok = true;
    B.onAuthStateChanged(Cloud.auth, onAuth);
  } catch (e) {
    console.warn("Firebase tidak tersedia:", e);
    els.userStatus.textContent = "Luring";
    els.authBtn.disabled = true;
  }
}

function onAuth(user) {
  Cloud.user = user;
  if (user) {
    els.userStatus.textContent = (user.displayName || user.email || "Akun").split(" ")[0];
    els.authBtn.textContent = "Keluar";
    cloudPull();
  } else {
    els.userStatus.textContent = "Tamu";
    els.authBtn.textContent = "Masuk";
  }
}

async function toggleAuth() {
  if (!Cloud.ok) { toast("Sinkronisasi belum tersedia (luring)."); return; }
  try {
    if (Cloud.user) { await Cloud.B.signOut(Cloud.auth); toast("Anda telah keluar. Data tetap tersimpan di perangkat ini."); }
    else await Cloud.B.signInWithPopup(Cloud.auth, Cloud.provider);
  } catch (e) {
    if (e && e.code === "auth/popup-blocked") { try { await Cloud.B.signInWithRedirect(Cloud.auth, Cloud.provider); return; } catch { /* jatuh ke toast */ } }
    if (!e || e.code !== "auth/popup-closed-by-user") toast("Gagal masuk. Coba lagi.");
  }
}

function cloudRef() { return Cloud.C.doc(Cloud.db, "progres_hafalan", Cloud.user.uid); }

async function cloudPushNow() {
  if (!Cloud.ok || !Cloud.user) return;
  try {
    await Cloud.C.setDoc(cloudRef(), {
      halaman_terakhir: S.page, page: S.page, bookmarks: S.bookmarks, memorized: S.memorized,
      settings: S.settings, tahfidz: S.tahfidz, updatedAt: S.updatedAt, updated_at: new Date(S.updatedAt || Date.now()).toISOString()
    }, { merge: true });
  } catch (e) { console.warn("Gagal sinkron:", e); }
}

function mergeStates(local, cloud) {
  const out = sanitize(local);
  const bm = new Map();
  [...cloud.bookmarks, ...local.bookmarks].forEach(b => { const o = bm.get(b.page); if (!o || b.ts > o.ts) bm.set(b.page, b); });
  out.bookmarks = [...bm.values()];
  out.memorized = { ...cloud.memorized, ...local.memorized };
  const cloudNewer = cloud.updatedAt > local.updatedAt;
  out.page = cloudNewer ? cloud.page : local.page;
  out.settings = cloudNewer ? { ...local.settings, ...cloud.settings } : { ...local.settings };
  out.tahfidz = mergeT(local.tahfidz, cloud.tahfidz);
  out.updatedAt = Date.now();
  return out;
}

async function cloudPull() {
  try {
    const snap = await Cloud.C.getDoc(cloudRef());
    if (!snap.exists()) { await cloudPushNow(); return; }
    const cloud = sanitize(snap.data());
    const linked = LS.get("mushaf_uid", "") === Cloud.user.uid;
    let next;
    if (!linked) { next = mergeStates(S, cloud); LS.set("mushaf_uid", Cloud.user.uid); }
    else if (cloud.updatedAt > S.updatedAt) next = cloud;
    else { await cloudPushNow(); return; }
    const pageChanged = next.page !== S.page;
    S = next;
    LS.set(KEY, S);
    syncControls(); updateChrome(); renderBookmarks(); applyHideMode(); window.TH && window.TH.refresh();
    if (pageChanged && !userNavigated) goto(S.page, { auto: true });
    if (!linked) cloudPushNow();
    toast("Data tersinkron dari akun Anda");
  } catch (e) { console.warn("Gagal menarik data awan:", e); }
}

/* ============================================================
   Pengikatan event
   ============================================================ */
function bindUI() {
  // mode hafalan
  els.modeGroup.addEventListener("click", e => { const b = e.target.closest("button[data-mode]"); if (b) setHideMode(b.dataset.mode); });
  const closeActions = () => {
    els.actionItems.hidden = true;
    els.btnMoreActions.setAttribute("aria-expanded", "false");
  };
  els.btnMoreActions.addEventListener("click", () => {
    els.actionItems.hidden = !els.actionItems.hidden;
    els.btnMoreActions.setAttribute("aria-expanded", String(!els.actionItems.hidden));
  });
  els.actionItems.addEventListener("click", e => { if (e.target.closest("button")) closeActions(); });
  document.addEventListener("click", e => {
    if (!els.actionItems.hidden && !els.actionItems.contains(e.target) && !els.btnMoreActions.contains(e.target)) closeActions();
  });

  // aksi toolbar
  els.btnBookmark.addEventListener("click", toggleBookmark);
  els.btnBookmarks.addEventListener("click", () => { renderBookmarks(); els.dlgBm.showModal(); });
  els.bmAdd.addEventListener("click", () => { if (!S.bookmarks.some(b => b.page === cur.page)) toggleBookmark(); else toast("Halaman ini sudah ada di daftar penanda"); });
  els.btnMemo.addEventListener("click", toggleMemo);
  els.btnProgress.addEventListener("click", () => { renderProgress(); els.dlgPrg.showModal(); });
  els.prgMark.addEventListener("click", toggleMemo);
  els.btnSettings.addEventListener("click", () => els.dlgSet.showModal());
  els.btnAbout.addEventListener("click", () => els.dlgAbout.showModal());
  els.btnNavOpen.addEventListener("click", () => openNav("surat"));
  els.btnInstall.addEventListener("click", installApp);
  els.authBtn.addEventListener("click", toggleAuth);
  els.btnTheme.addEventListener("click", () => {
    const order = ["light", "dark", "sepia", "auto"];
    S.settings.theme = order[(order.indexOf(S.settings.theme) + 1) % order.length];
    persist(); applyTheme();
  });

  // dialog: tutup & klik latar
  document.addEventListener("click", e => {
    const c = e.target.closest("[data-close]");
    if (c) { const d = c.closest("dialog"); if (d) d.close(); return; }
    if (e.target instanceof HTMLDialogElement && e.target.classList.contains("modal")) e.target.close();
  });

  // navigator
  [["tabSurat", "surat"], ["tabJuz", "juz"], ["tabAyat", "ayat"]].forEach(([id, name]) => els[id].addEventListener("click", () => setTab(name)));
  $$('[role="tablist"] button').forEach(b => b.addEventListener("keydown", e => {
    const tabs = $$('[role="tablist"] button'); const i = tabs.indexOf(b);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.click(); n.focus();
    }
  }));
  els.navSearch.addEventListener("input", filterSurat);
  els.navSearch.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const first = els.listSurat.querySelector("li:not([hidden]) button");
    if (first) first.click();
  });
  els.ayatSurah.addEventListener("change", () => { els.ayatNo.max = SURAH[els.ayatSurah.value - 1][2]; });
  els.ayatGo.addEventListener("click", () => jumpToVerse(Number(els.ayatSurah.value), parseInt(els.ayatNo.value, 10)));
  els.ayatNo.addEventListener("keydown", e => { if (e.key === "Enter") els.ayatGo.click(); });

  // pengaturan
  $$('input[name="theme"]').forEach(r => r.addEventListener("change", () => { if (r.checked) { S.settings.theme = r.value; persist(); applyTheme(); } }));
  els.setWidth.addEventListener("input", () => { S.settings.width = Number(els.setWidth.value); applyWidth(); });
  els.setWidth.addEventListener("change", persist);
  els.setReveal.addEventListener("change", () => { S.settings.autoReveal = els.setReveal.checked; persist(); });
  els.setTrans.addEventListener("change", () => { S.settings.showTranslation = els.setTrans.checked; persist(); if (cur.sel && !els.ayatSheet.hidden) showSheet(cur.sel); });
  els.setWake.addEventListener("change", () => { S.settings.wake = els.setWake.checked; persist(); syncWake(); });
  els.btnExport.addEventListener("click", exportData);
  els.btnImport.addEventListener("click", () => els.fileImport.click());
  els.fileImport.addEventListener("change", () => { if (els.fileImport.files[0]) importData(els.fileImport.files[0]); els.fileImport.value = ""; });
  els.btnDiag.addEventListener("click", copyDiag);
  els.btnReset.addEventListener("click", () => {
    if (!confirm("Hapus semua penanda, progres hafalan, dan pengaturan di perangkat ini? Data di akun awan (jika ada) tidak ikut terhapus.")) return;
    hardStop(true);
    LS.del(KEY); LS.del("mushaf_uid");
    S = defaults(); S.page = cur.page || 1;
    syncControls(); applyHideMode(); updateChrome(); renderBookmarks();
    els.dlgSet.close();
    toast("Data lokal dihapus");
  });

  // pintasan papan ketik
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && !els.actionItems.hidden) { closeActions(); return; }
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    const tag = (e.target.tagName || "").toLowerCase();
    if (["input", "select", "textarea"].includes(tag) || document.querySelector("dialog[open]")) return;
    if (tag === "button" && (e.key === " " || e.key === "Enter")) return;
    switch (e.key) {
      case "ArrowLeft": goto(cur.page + 1); break;      // mushaf dibaca dari kanan: kiri = halaman berikutnya
      case "ArrowRight": goto(cur.page - 1); break;
      case " ": e.preventDefault(); togglePlay(); break;
      case "1": setHideMode("normal"); break;
      case "2": setHideMode("blur"); break;
      case "3": setHideMode("first"); break;
      case "b": case "B": toggleBookmark(); break;
      case "m": case "M": toggleMemo(); break;
      case "/": e.preventDefault(); openNav("surat"); break;
      case "Escape": if (!els.ayatSheet.hidden) closeSheet(); break;
      default: return;
    }
  });

  // geser untuk pindah halaman (geser ke kanan = halaman berikutnya, seperti membalik mushaf)
  let sx = 0, sy = 0, st = 0;
  els.frame.addEventListener("touchstart", e => { const t = e.changedTouches[0]; sx = t.clientX; sy = t.clientY; st = Date.now(); }, { passive: true });
  els.frame.addEventListener("touchend", e => {
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if (Date.now() - st > 700 || Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.6) return;
    goto(dx > 0 ? cur.page + 1 : cur.page - 1);
  }, { passive: true });

  // tinggi pemutar → variabel CSS
  new ResizeObserver(() => document.documentElement.style.setProperty("--player-h", els.player.offsetHeight + "px")).observe(els.player);
}

/* ============================================================
   Mulai
   ============================================================ */
async function init() {
  syncInstallButton();
  const standaloneQuery = window.matchMedia("(display-mode: standalone)");
  standaloneQuery.addEventListener && standaloneQuery.addEventListener("change", syncInstallButton);
  buildNavigator();
  bindPlayerSettings();
  bindUI();
  syncControls();
  applyHideMode();
  renderBookmarks();
  syncWake();
  cloudInit();
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
  try { await goto(S.page, { auto: true }); }
  finally {
    els.splash.classList.add("splash-hilang");
    setTimeout(() => { els.splash.hidden = true; }, 400);
  }
}
/* Jembatan untuk program tahfidz (tahfidz.js) */
window.MP = { get S() { return S; }, SURAH, API, QARI, persist, toast, fetchJson, getTranslation, jumpToVerse, setHideMode, startPlayback, hardStop, parseKey };

init();

})();
