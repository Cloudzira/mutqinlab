/* ============================================================
   MutqinLab — ai.js  ·  Mutqin AI
   Asisten hafalan & murojaah. Percakapan dikirim ke /api/ai (Cloudflare Pages Function),
   yang menyimpan API key Google AI Studio di sisi server.
   Konteks yang ikut terkirim hanya ANGKA ringkasan rencana (tanpa nama/email).
   ============================================================ */
(() => {
"use strict";
const M = window.MP; if (!M) return;
const $ = id => document.getElementById(id);
const STORE = "mp_ai_chat", MAXLEN = 1200, KEEP = 24;
const ic = n => `<svg class="ik" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const ask = o => window.mpConfirm ? window.mpConfirm(o) : Promise.resolve(confirm(o.message || o.title));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TABS = { g: "Beranda", z: "Ziyadah", m: "Murojaah", t: "Tes", mushaf: "Mushaf" };
const CHIPS = [
  "Dari mana saya mulai menghafal?",
  "Jelaskan rencana dan target harian saya",
  "Hafalan saya cepat lupa, apa penyebabnya?",
  "Antrean murojaah menumpuk, bagaimana?",
  "Bagaimana menghafal ayat yang mirip?",
  "Apa beda Lupa, Ragu, dan Mutqin?"
];
const ERR = {
  login_required: "Masuk dengan Google dulu untuk memakai Mutqin AI.",
  quota: "Batas pertanyaan hari ini sudah habis. Silakan lanjutkan besok, insya Allah.",
  busy: "Layanan AI sedang ramai. Coba lagi sebentar lagi.",
  not_configured: "Mutqin AI belum diaktifkan oleh pengelola aplikasi.",
  config: "Mutqin AI sedang bermasalah (konfigurasi). Mohon beri tahu pengelola.",
  upstream: "Layanan AI tidak dapat dihubungi. Periksa koneksi, lalu coba lagi.",
  blocked: "Maaf, pertanyaan itu tidak dapat dijawab. Coba ubah kalimatnya.",
  empty: "Jawaban kosong. Coba tanyakan dengan cara lain.",
  too_large: "Pesan terlalu panjang.",
  bad_request: "Pesan tidak valid.",
  forbidden: "Akses ditolak.",
  net: "Tidak ada koneksi internet."
};

let msgs = [], busy = false, ctrl = null, built = false, left = null;

try { const s = JSON.parse(localStorage.getItem(STORE) || "[]"); if (Array.isArray(s)) msgs = s.filter(x => x && (x.r === "u" || x.r === "a") && typeof x.t === "string").slice(-KEEP); } catch (e) {}
const save = () => { try { localStorage.setItem(STORE, JSON.stringify(msgs.slice(-KEEP))); } catch (e) {} };

/* ---------- pemformat jawaban (aman: escape dulu, lalu penanda terbatas) ---------- */
function inline(s) {
  let h = esc(s);
  h = h.replace(/\*\*([^*\n]+)\*\*/g, "<b>$1</b>");
  h = h.replace(/\[QS\s+(\d{1,3})\s*:\s*(\d{1,3})\]/g, (m, a, b) => {
    const s1 = +a, a1 = +b, su = M.SURAH[s1 - 1];
    if (!su || a1 < 1 || a1 > su[2]) return "";
    return `<button type="button" class="ai-ref" data-s="${s1}" data-a="${a1}">${ic("book")}QS ${esc(su[0])} ${a1}</button>`;
  });
  h = h.replace(/\[\[tab:(g|z|m|t|mushaf)\]\]/g, (m, k) => `<button type="button" class="ai-tab" data-tab="${k}">${ic("right")}Buka ${TABS[k]}</button>`);
  return h;
}
function fmt(text) {
  const out = []; let list = null;
  const close = () => { if (list) { out.push(`</${list}>`); list = null; } };
  for (const raw of String(text).split(/\n/)) {
    const line = raw.replace(/\s+$/, "");
    let m;
    if ((m = line.match(/^\s*[-*•]\s+(.*)$/))) { if (list !== "ul") { close(); out.push("<ul>"); list = "ul"; } out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)$/))) { if (list !== "ol") { close(); out.push("<ol>"); list = "ol"; } out.push(`<li>${inline(m[1])}</li>`); }
    else if (!line.trim()) close();
    else { close(); out.push(`<p>${inline(line.replace(/^#{1,4}\s+/, "**") + (/^#{1,4}\s+/.test(line) ? "**" : ""))}</p>`); }
  }
  close(); return out.join("");
}

/* ---------- DOM ---------- */
function build() {
  if (built) return; built = true;
  const fab = document.createElement("button");
  fab.id = "aiFab"; fab.type = "button"; fab.className = "ai-fab"; fab.setAttribute("aria-label", "Buka Mutqin AI");
  fab.innerHTML = `${ic("spark")}<span>Mutqin AI</span>`;
  document.body.append(fab);

  const d = document.createElement("dialog");
  d.id = "dlgAI"; d.className = "modal ai-modal"; d.setAttribute("aria-labelledby", "aiTitle");
  d.innerHTML = `<div class="modal-box ai-box">
    <header class="modal-head ai-head">
      <div class="ai-ttl"><span class="ai-logo">${ic("spark")}</span><div><h2 id="aiTitle">Mutqin AI</h2><small>Asisten hafalan &amp; murojaah · Beta</small></div></div>
      <div class="ai-hact">
        <button id="aiClear" class="icon-btn kecil" type="button" aria-label="Mulai percakapan baru" title="Percakapan baru">${ic("trash")}</button>
        <button class="icon-btn kecil" type="button" data-close aria-label="Tutup">${ic("x")}</button>
      </div>
    </header>
    <p class="ai-warn">${ic("alert")}<span>AI bisa keliru. Untuk bacaan, tajwid, dan hukum, rujuk guru bersanad. Jangan kirim data pribadi.</span></p>
    <div class="ai-log" id="aiLog" role="log" aria-live="polite" tabindex="0"></div>
    <div class="ai-chips" id="aiChips"></div>
    <div class="ai-input">
      <textarea id="aiIn" rows="1" maxlength="${MAXLEN}" aria-label="Pertanyaan untuk Mutqin AI"></textarea>
      <button id="aiSend" class="ai-send" type="button" aria-label="Kirim">${ic("send")}</button>
    </div>
    <div class="ai-foot"><span id="aiLeft"></span><span id="aiCnt">0/${MAXLEN}</span></div>
  </div>`;
  document.body.append(d);

  /* Tombol bisa digeser; saat dilepas otomatis menempel ke tepi kiri/kanan agar tidak menghalangi tengah layar.
     Yang disimpan: sisi (l/r) dan tinggi relatif, jadi tetap pas di ukuran layar/orientasi lain. */
  const POS = "mutqin.ai.fabpos.v2", OLDPOS = "mutqin.ai.fabpos.v1", GAP = 10;
  let pos = null;
  try {
    pos = JSON.parse(localStorage.getItem(POS) || "null");
    if (!pos) { const o = JSON.parse(localStorage.getItem(OLDPOS) || "null"); if (o && typeof o.x === "number" && typeof o.y === "number") pos = { side: o.x < .5 ? "l" : "r", y: o.y }; }
  } catch (e) {}
  if (!pos || (pos.side !== "l" && pos.side !== "r") || typeof pos.y !== "number") pos = null;
  const VW = () => document.documentElement.clientWidth || innerWidth;     // lebar area tampak TANPA scrollbar (innerWidth ikut menghitung scrollbar di laptop)
  const VH = () => document.documentElement.clientHeight || innerHeight;
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
  const probe = document.createElement("div");            // pembaca safe-area (notch / gesture bar)
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)";
  document.body.append(probe);
  const bounds = () => {
    const c = getComputedStyle(probe), w = fab.offsetWidth, h = fab.offsetHeight;
    return {
      minX: GAP + (parseFloat(c.paddingLeft) || 0), maxX: VW() - w - GAP - (parseFloat(c.paddingRight) || 0),
      minY: GAP + (parseFloat(c.paddingTop) || 0), maxY: VH() - h - GAP - (parseFloat(c.paddingBottom) || 0)
    };
  };
  const put = (x, y) => { fab.style.right = "auto"; fab.style.bottom = "auto"; fab.style.left = x + "px"; fab.style.top = y + "px"; };
  const dock = (side, cy, animate) => {
    const bd = bounds(), h = fab.offsetHeight;
    if (animate) { fab.classList.add("snap"); clearTimeout(dock.t); dock.t = setTimeout(() => fab.classList.remove("snap"), 320); }
    put(side === "l" ? bd.minX : bd.maxX, clamp(cy * VH() - h / 2, bd.minY, bd.maxY));
  };
  const placeSaved = () => {
    if (!pos || !fab.offsetWidth) return;                   // belum pernah digeser: pakai posisi bawaan CSS (kanan bawah) / sedang disembunyikan
    dock(pos.side, pos.y, false);
  };
  let drag = null, moved = false, justDragged = false;
  fab.addEventListener("pointerdown", e => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const r = fab.getBoundingClientRect();
    drag = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top }; moved = false;
    fab.classList.remove("snap"); try { fab.setPointerCapture(e.pointerId); } catch (_) {}   // tangkap sejak awal: seretan cepat tidak terlepas
  });
  fab.addEventListener("pointermove", e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy;
    if (!moved) {
      if (Math.hypot(dx, dy) < 8) return;                                        // masih dianggap ketukan biasa
      moved = true; fab.classList.add("drag");
    }
    const bd = bounds();
    put(clamp(drag.ox + dx, bd.minX, bd.maxX), clamp(drag.oy + dy, bd.minY, bd.maxY));
  });
  const endDrag = e => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    if (moved) {
      const r = fab.getBoundingClientRect();
      pos = { side: (r.left + r.width / 2) < VW() / 2 ? "l" : "r", y: (r.top + r.height / 2) / VH() };
      try { localStorage.setItem(POS, JSON.stringify(pos)); } catch (_) {}
      dock(pos.side, pos.y, true);                                               // menempel ke tepi terdekat
      justDragged = true; setTimeout(() => { justDragged = false; }, 60);
    }
    drag = null; moved = false; fab.classList.remove("drag");
  };
  fab.addEventListener("pointerup", endDrag);
  fab.addEventListener("pointercancel", endDrag);
  addEventListener("resize", placeSaved);
  addEventListener("orientationchange", () => setTimeout(placeSaved, 200));
  placeSaved();
  if (window.ResizeObserver) new ResizeObserver(() => { if (!drag) placeSaved(); }).observe(fab);   // saat tombol muncul setelah splash/dialog
  fab.addEventListener("click", () => { if (justDragged) return; open(); });
  $("aiSend").addEventListener("click", () => (busy ? stop() : send()));
  $("aiClear").addEventListener("click", async () => {
    if (busy) stop();
    if (msgs.length && !(await ask({ title: "Mulai percakapan baru?", message: "Riwayat percakapan di perangkat ini akan dihapus dan tidak bisa dikembalikan.", okText: "Hapus percakapan", cancelText: "Batal", icon: "trash" }))) return;
    msgs = []; save(); render();
  });
  const ta = $("aiIn");
  ta.addEventListener("input", () => { grow(); $("aiCnt").textContent = `${ta.value.length}/${MAXLEN}`; });
  ta.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing && window.matchMedia("(pointer: fine)").matches) { e.preventDefault(); send(); }
  });
  $("aiChips").addEventListener("click", e => { const b = e.target.closest("[data-q]"); if (b) send(b.dataset.q); });
  $("aiLog").addEventListener("click", e => {
    const r = e.target.closest(".ai-ref");
    if (r) { go("mushaf"); M.jumpToVerse(+r.dataset.s, +r.dataset.a); return; }
    const t = e.target.closest(".ai-tab"); if (t) { go(t.dataset.tab); return; }
    if (e.target.closest("[data-login]")) M.signIn();
  });
  /* Jendela mengikuti area yang benar-benar terlihat (visualViewport): saat keyboard layar muncul, tinggi jendela
     menyusut dan menempel di atas keyboard sehingga kolom ketik & jawaban tidak tertutup. */
  const vv = window.visualViewport;
  let fitRaf = 0;
  const reset = () => { d.classList.remove("kb"); ["height", "maxHeight", "top", "bottom", "marginTop", "marginBottom"].forEach(k => { d.style[k] = ""; }); };
  const fit = () => {
    fitRaf = 0;
    if (!d.open || !vv) return;
    const kb = innerHeight - vv.height > 120 && vv.scale < 1.05;    // selisih besar = keyboard (bukan sekadar bilah alamat)
    const was = d.classList.contains("kb");
    if (!kb) { if (was) { reset(); scroll(); } return; }
    const h = Math.max(220, vv.height - 12);
    d.classList.add("kb");
    d.style.height = h + "px"; d.style.maxHeight = h + "px";
    d.style.top = (vv.offsetTop + 6) + "px"; d.style.bottom = "auto"; d.style.marginTop = "0"; d.style.marginBottom = "0";
    if (!was) scroll();
  };
  const queueFit = () => { if (!fitRaf) fitRaf = requestAnimationFrame(fit); };
  if (vv) { vv.addEventListener("resize", queueFit); vv.addEventListener("scroll", queueFit); }
  ta.addEventListener("focus", () => { setTimeout(() => { fit(); scroll(); }, 300); });
  ta.addEventListener("blur", () => setTimeout(queueFit, 150));
  d.addEventListener("close", () => { if (busy) stop(); reset(); });
  document.addEventListener("mp-auth", () => { if (d.open) render(); });
}
function go(tab) {
  $("dlgAI").close();
  const b = document.querySelector(`#viewbar [data-view="${tab}"]`); if (b) b.click();
}
function grow() { const t = $("aiIn"); t.style.height = "auto"; t.style.height = Math.min(120, t.scrollHeight) + "px"; }
function signedIn() { return !!(M.user && M.user()); }

function bubble(r, html, cls = "") { return `<div class="ai-msg ${r === "u" ? "me" : "bot"} ${cls}">${r === "a" ? `<span class="ai-av">${ic("spark")}</span>` : ""}<div class="ai-b">${html}</div></div>`; }
function welcome() {
  return bubble("a", `<p><b>Assalamu'alaikum!</b> Saya Mutqin AI, pendamping hafalanmu di MutqinLab.</p><p>Saya bisa membantu menjelaskan fitur aplikasi, membaca rencana dan kemajuanmu, serta memberi saran menghafal dan murojaah berdasarkan dalil dan praktik para guru tahfidz. Untuk bacaan dan tajwid, tetap setor ke guru bersanad.</p>`);
}
function render() {
  const log = $("aiLog"), li = signedIn();
  let h = welcome();
  if (!li) h += bubble("a", `<p>Untuk menjaga kuota gratis agar adil bagi semua pengguna, Mutqin AI hanya bisa dipakai setelah <b>masuk dengan Google</b>. Progres hafalanmu tetap milikmu.</p><button type="button" class="ai-login" data-login>${ic("user")}Masuk dengan Google</button>`);
  h += msgs.map(m => bubble(m.r, m.r === "u" ? `<p>${esc(m.t).replace(/\n/g, "<br>")}</p>` : fmt(m.t) || "<p>…</p>", m.err ? "err" : "")).join("");
  log.innerHTML = h;
  $("aiChips").hidden = !li || msgs.length > 0 || busy;
  $("aiChips").innerHTML = CHIPS.map(q => `<button type="button" data-q="${esc(q)}">${esc(q)}</button>`).join("");
  $("aiIn").disabled = !li; $("aiSend").disabled = !li;
  $("aiIn").placeholder = li ? "" : "Masuk dulu untuk bertanya";
  $("aiLeft").textContent = li && left != null ? `Sisa pertanyaan hari ini: ${left}` : "";
  scroll();
}
function scroll() { const l = $("aiLog"); l.scrollTop = l.scrollHeight; }

function open() {
  build(); const d = $("dlgAI"); if (d.open) return;
  render(); d.showModal();
  if (signedIn() && window.matchMedia("(pointer: fine)").matches) setTimeout(() => $("aiIn").focus({ preventScroll: true }), 60);   // di layar sentuh, jangan langsung membuka keyboard
}

function setBusy(b) {
  busy = b; const s = $("aiSend");
  s.innerHTML = b ? ic("stop") : ic("send"); s.setAttribute("aria-label", b ? "Berhenti" : "Kirim"); s.classList.toggle("stop", b);
  $("aiChips").hidden = b || msgs.length > 0;
}
function stop() { if (ctrl) ctrl.abort(); }

async function send(text) {
  if (busy) return;
  const ta = $("aiIn"); const q = (text != null ? text : ta.value).trim().slice(0, MAXLEN);
  if (!q) return;
  if (!signedIn()) { render(); return; }
  if (!navigator.onLine) { M.toast(ERR.net); return; }
  msgs.push({ r: "u", t: q }); msgs.push({ r: "a", t: "" }); ta.value = ""; grow(); $("aiCnt").textContent = `0/${MAXLEN}`;
  save(); render(); setBusy(true);
  if (window.matchMedia("(pointer: coarse)").matches) ta.blur();   // tutup keyboard agar jawaban terlihat penuh
  const bot = msgs[msgs.length - 1];
  let ctx = null; try { ctx = window.TH && window.TH.aiContext ? window.TH.aiContext() : null; } catch (e) {}
  const history = [];
  for (const m of msgs.slice(0, -1)) {            // gabungkan giliran berurutan dengan peran sama (mis. setelah error)
    if (m.err || !m.t) { if (m.r === "a") continue; }
    if (!m.t) continue;
    const role = m.r === "u" ? "user" : "assistant", last = history[history.length - 1];
    if (last && last.role === role) last.text += "\n" + m.t; else history.push({ role, text: m.t });
  }
  while (history.length > 12) history.shift();
  ctrl = new AbortController();
  let paint = 0; const repaint = () => { paint = 0; const el = $("aiLog").lastElementChild; if (el) { el.querySelector(".ai-b").innerHTML = fmt(bot.t) + (busy ? '<span class="ai-dots"><i></i><i></i><i></i></span>' : ""); scroll(); } };
  const fail = k => { bot.t = ERR[k] || ERR.upstream; bot.err = true; };
  try {
    const token = await M.idToken();
    if (!token) { fail("login_required"); throw 0; }
    const res = await fetch("/api/ai", { method: "POST", signal: ctrl.signal, headers: { "Content-Type": "application/json", Authorization: "Bearer " + token }, body: JSON.stringify({ messages: history, ctx }) });
    if (!res.ok) { let k = "upstream"; try { k = (await res.json()).error || k; } catch (e) {} fail(k); if (k === "quota") left = 0; throw 0; }
    const rd = res.body.getReader(), dec = new TextDecoder(); let buf = "", gotErr = null;
    for (;;) {
      const { value, done } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true });
      let i; while ((i = buf.indexOf("\n\n")) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 2);
        if (!line.startsWith("data:")) continue;
        let j; try { j = JSON.parse(line.slice(5)); } catch (e) { continue; }
        if (j.t) { bot.t += j.t; if (!paint) paint = requestAnimationFrame(repaint); }
        else if (j.meta && j.meta.left != null) left = j.meta.left;
        else if (j.error) gotErr = j.error;
      }
    }
    if (!bot.t) fail(gotErr || "empty");
  } catch (e) {
    if (e && e.name === "AbortError") { if (!bot.t) { bot.t = "(dihentikan)"; bot.err = true; } }
    else if (e !== 0) { if (!bot.t) fail("net"); }
  } finally {
    ctrl = null; if (paint) cancelAnimationFrame(paint);
    setBusy(false); save(); render();
  }
}

/* ---------- inisialisasi: tombol mengambang muncul setelah splash ---------- */
function init() { build(); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
window.MutqinAI = { open };
})();
