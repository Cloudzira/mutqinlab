/* ============================================================
   Mutqin AI — Cloudflare Pages Function  (POST /api/ai)
   - API key Google AI Studio disimpan sebagai SECRET di Cloudflare (tidak pernah sampai ke browser).
   - Pengguna yang masuk (Firebase ID token terverifikasi): batas harian per akun.
   - TAMU (tanpa login): hanya AI_GUEST_LIMIT pertanyaan (default 3) per perangkat, seumur hidup; plus batas harian per IP
     sebagai pengaman bila ID perangkat diakali. Perangkat dikenali lewat header X-Guest-Id (acak, dibuat di browser).
   - Batas panjang pesan.
   - Respons di-stream ke klien sebagai SSE sederhana: data: {"t":"..."} … data: {"done":true}
   Variabel lingkungan:
     GEMINI_API_KEY        (wajib, Secret)
     GEMINI_MODEL          (opsional, default gemini-3.8-flash)
     GEMINI_FALLBACK_MODEL (opsional, default gemini-3.5-flash-lite) — dicoba bila model utama gagal
     FIREBASE_API_KEY      (opsional, default = apiKey publik proyek Firebase MutqinLab)
     AI_DAILY_LIMIT        (opsional, default 30 pertanyaan/pengguna/hari)
     AI_GUEST_LIMIT        (opsional, default 3 pertanyaan per perangkat tamu, total — bukan per hari)
     AI_GUEST_IP_DAILY     (opsional, default 30 pertanyaan tamu/IP/hari; longgar karena banyak HP seluler berbagi satu IP)
     ALLOWED_ORIGINS       (opsional, daftar origin tambahan dipisah koma)
     AI_THINKING           (opsional, default "low". Tingkat "berpikir" model Gemini 3.x: minimal | low | medium | high.
                            Makin rendah makin cepat. Isi "off" untuk tidak mengirim pengaturan ini.)
     AI_DEBUG              (opsional, isi "1" untuk menampilkan alasan error dari Google di respons;
                            lihat di DevTools > Network > ai > Response. Matikan/hapus setelah selesai.)
   Binding opsional: AI_KV (Workers KV) untuk penghitung kuota harian yang tahan antar-instans.
   ============================================================ */
import { buildSystem } from "../_lib/prompt.js";

const DEFAULT_FIREBASE_KEY = "AIzaSyCDU5f4iBXSwlKYYJUO6bb72r1VBVLAg3I";
const DEFAULT_MODEL = "gemini-3.8-flash";
const DEFAULT_FALLBACK = "gemini-3.5-flash-lite";
const MAX_CHARS = 1200;      // panjang satu pesan pengguna
const MAX_MSGS = 12;         // riwayat yang dikirim ke model
const MAX_BODY = 24 * 1024;  // ukuran body permintaan

const json = (obj, status = 200, extra = {}) =>
  new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra } });

/* ---------- verifikasi Firebase ID token (tanpa library) ---------- */
async function verifyUser(token, env, site) {
  try {
    const key = env.FIREBASE_API_KEY || DEFAULT_FIREBASE_KEY;
    const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "Content-Type": "application/json", Referer: site + "/" }, body: JSON.stringify({ idToken: token })
    });
    if (!r.ok) return null;
    const d = await r.json();
    const u = d && d.users && d.users[0];
    return u && u.localId ? String(u.localId) : null;
  } catch { return null; }
}

/* ---------- batas harian ---------- */
const mem = new Map(); // cadangan bila KV tidak dipasang (per-instans, kurang andal)
function quotaKey(uid) {
  const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10); // hari WIB
  return `ai:${day}:${uid}`;
}
async function takeQuota(uid, env) {
  const limit = Math.max(1, parseInt(env.AI_DAILY_LIMIT || "30", 10) || 30);
  const key = quotaKey(uid);
  let used = 0;
  if (env.AI_KV) {
    used = parseInt((await env.AI_KV.get(key)) || "0", 10) || 0;
    if (used >= limit) return { ok: false, limit, left: 0 };
    await env.AI_KV.put(key, String(used + 1), { expirationTtl: 172800 });
  } else {
    used = mem.get(key) || 0;
    if (used >= limit) return { ok: false, limit, left: 0 };
    mem.set(key, used + 1);
    if (mem.size > 5000) mem.clear();
  }
  return { ok: true, limit, left: limit - used - 1 };
}
/* Kembalikan 1 kuota bila permintaan gagal karena kesalahan server/Google (bukan salah pengguna). */
async function refundQuota(uid, env) {
  try {
    const key = quotaKey(uid);
    if (env.AI_KV) {
      const used = parseInt((await env.AI_KV.get(key)) || "0", 10) || 0;
      if (used > 0) await env.AI_KV.put(key, String(used - 1), { expirationTtl: 172800 });
    } else {
      const used = mem.get(key) || 0;
      if (used > 0) mem.set(key, used - 1);
    }
  } catch { /* abaikan */ }
}

/* ---------- kuota TAMU (tanpa login) ---------- */
const GUEST_ID_RE = /^[A-Za-z0-9_-]{16,64}$/;
const GUEST_TTL = 400 * 86400;   // ~13 bulan
const kvN = async (key, env) => parseInt((env.AI_KV ? await env.AI_KV.get(key) : mem.get(key)) || "0", 10) || 0;
async function kvSet(key, n, ttl, env) {
  if (env.AI_KV) await env.AI_KV.put(key, String(Math.max(0, n)), { expirationTtl: ttl });
  else { mem.set(key, Math.max(0, n)); if (mem.size > 5000) mem.clear(); }
}
function guestKeys(gid, ip) {
  const day = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  return { dev: `aig:${gid}`, ip: `aigip:${day}:${ip || "?"}` };
}
async function takeGuestQuota(gid, ip, env) {
  const limit = Math.max(1, parseInt(env.AI_GUEST_LIMIT || "3", 10) || 3);
  const ipLimit = Math.max(limit, parseInt(env.AI_GUEST_IP_DAILY || "30", 10) || 30);
  const k = guestKeys(gid, ip);
  const [d, i] = [await kvN(k.dev, env), await kvN(k.ip, env)];
  if (d >= limit || i >= ipLimit) return { ok: false, limit, left: 0 };
  await kvSet(k.dev, d + 1, GUEST_TTL, env);
  await kvSet(k.ip, i + 1, 172800, env);
  return { ok: true, limit, left: limit - d - 1 };
}
async function refundGuestQuota(gid, ip, env) {
  try {
    const k = guestKeys(gid, ip);
    await kvSet(k.dev, (await kvN(k.dev, env)) - 1, GUEST_TTL, env);
    await kvSet(k.ip, (await kvN(k.ip, env)) - 1, 172800, env);
  } catch { /* abaikan */ }
}

/* ---------- sanitasi masukan ---------- */
function cleanMessages(raw) {
  if (!Array.isArray(raw)) return null;
  let m = raw
    .filter(x => x && (x.role === "user" || x.role === "assistant") && typeof x.text === "string")
    .map(x => ({ role: x.role === "user" ? "user" : "model", text: x.text.replace(/\u0000/g, "").trim().slice(0, x.role === "user" ? MAX_CHARS : 4000) }))
    .filter(x => x.text);
  m = m.slice(-MAX_MSGS);
  while (m.length && m[0].role !== "user") m.shift();
  if (!m.length || m[m.length - 1].role !== "user") return null;
  return m;
}

/* ---------- Gemini ---------- */
const THINK_LEVELS = ["minimal", "low", "medium", "high"];
function thinkingLevel(model, env) {
  // Gemini 3.x memakai "thinking" tingkat tinggi secara default -> jawaban sangat lama untuk chat.
  // Kita turunkan ke "low" (bisa diubah lewat AI_THINKING). Hanya dikirim untuk model seri 3.x/4.x.
  const v = String(env.AI_THINKING || "low").trim().toLowerCase();
  if (v === "off" || !THINK_LEVELS.includes(v)) return null;
  return /^gemini-[3-9]/.test(model) ? v : null;
}
function geminiBody(system, msgs, level) {
  const generationConfig = { maxOutputTokens: 4096 };
  if (level) generationConfig.thinkingConfig = { thinkingLevel: level };
  return JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: msgs.map(x => ({ role: x.role, parts: [{ text: x.text }] })),
    generationConfig
  });
}

async function callGemini(model, body, env) {
  return fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": env.GEMINI_API_KEY },
    body
  });
}

/* Ambil alasan error dari respons Google (dipotong, tanpa key) */
async function errorInfo(model, res) {
  let msg = "";
  try {
    const t = await res.text();
    try { const j = JSON.parse(t); msg = (j && j.error && j.error.message) || t; } catch { msg = t; }
  } catch { /* abaikan */ }
  return { model, status: res.status, message: String(msg).replace(/\s+/g, " ").slice(0, 300) };
}

/* Ubah SSE Gemini → SSE ringkas {"t": "..."} */
function transformStream(upstream, left) {
  const dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "", sent = false, finish = "", blocked = "";
  const emit = (c, o) => c.enqueue(enc.encode(`data: ${JSON.stringify(o)}\n\n`));
  const handle = (line, c) => {
    if (!line.startsWith("data:")) return;
    const s = line.slice(5).trim(); if (!s || s === "[DONE]") return;
    let j; try { j = JSON.parse(s); } catch { return; }
    if (j.promptFeedback && j.promptFeedback.blockReason) blocked = j.promptFeedback.blockReason;
    const cand = j.candidates && j.candidates[0];
    if (!cand) return;
    if (cand.finishReason) finish = cand.finishReason;
    const parts = (cand.content && cand.content.parts) || [];
    for (const p of parts) if (p.text && !p.thought) { sent = true; emit(c, { t: p.text }); }
  };
  return upstream.pipeThrough(new TransformStream({
    start(c) { emit(c, { meta: { left } }); },
    transform(chunk, c) {
      buf += dec.decode(chunk, { stream: true });
      let i; while ((i = buf.indexOf("\n")) >= 0) { handle(buf.slice(0, i).replace(/\r$/, ""), c); buf = buf.slice(i + 1); }
    },
    flush(c) {
      if (buf) handle(buf.replace(/\r$/, ""), c);
      if (!sent) emit(c, { error: blocked || finish === "SAFETY" ? "blocked" : "empty" });
      else emit(c, { done: true, finish });
    }
  }));
}

export async function onRequestPost({ request, env }) {
  if (!env.GEMINI_API_KEY) return json({ error: "not_configured" }, 503);
  const debug = String(env.AI_DEBUG || "") === "1";

  // hanya dari situs sendiri
  const origin = request.headers.get("Origin");
  if (origin) {
    const self = new URL(request.url).origin;
    const extra = String(env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
    if (origin !== self && !extra.includes(origin)) return json({ error: "forbidden" }, 403);
  }

  // identitas: akun Google (token) ATAU tamu (X-Guest-Id)
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  const ip = request.headers.get("CF-Connecting-IP") || "";
  let uid = null, gid = null;
  if (token) {
    uid = await verifyUser(token, env, new URL(request.url).origin);
    if (!uid) return json({ error: "login_required" }, 401);
  } else {
    gid = (request.headers.get("X-Guest-Id") || "").trim();
    if (!GUEST_ID_RE.test(gid)) return json({ error: "login_required" }, 401);
  }

  // body
  const len = parseInt(request.headers.get("Content-Length") || "0", 10);
  if (len > MAX_BODY) return json({ error: "too_large" }, 413);
  let data; try { data = JSON.parse((await request.text()).slice(0, MAX_BODY)); } catch { return json({ error: "bad_request" }, 400); }
  const msgs = cleanMessages(data && data.messages);
  if (!msgs) return json({ error: "bad_request" }, 400);

  // kuota (dihitung setelah masukan valid)
  const q = uid ? await takeQuota(uid, env) : await takeGuestQuota(gid, ip, env);
  if (!q.ok) return json({ error: uid ? "quota" : "guest_quota", limit: q.limit }, 429);

  const system = buildSystem(uid ? data.ctx : { ...(data.ctx || {}), masuk: false });
  const primary = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const fallback = (env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK).trim();

  // Coba satu model. Bila ditolak (400) padahal memakai pengaturan thinking, ulangi tanpa pengaturan itu.
  async function tryModel(model, attempts) {
    const level = thinkingLevel(model, env);
    try {
      let r = await callGemini(model, geminiBody(system, msgs, level), env);
      if (!r.ok && r.status === 400 && level) {
        attempts.push(await errorInfo(model + " (thinking " + level + ")", r));
        r = await callGemini(model, geminiBody(system, msgs, null), env);
      }
      if (r.ok) return r;
      attempts.push(await errorInfo(model, r));
    } catch (e) {
      attempts.push({ model, status: 0, message: "Gagal menghubungi Google: " + (e && e.message ? e.message : String(e)).slice(0, 200) });
    }
    return null;
  }

  // gagal: kembalikan kuota, catat di log Cloudflare, dan (bila AI_DEBUG=1) sertakan alasan
  const fail = async (error, status, details) => {
    if (uid) await refundQuota(uid, env); else await refundGuestQuota(gid, ip, env);
    console.error("Mutqin AI gagal:", error, JSON.stringify(details));
    return json(debug ? { error, detail: details } : { error }, status);
  };

  const attempts = [];
  const t0 = Date.now();
  let used = primary;
  let res = await tryModel(primary, attempts);
  if (!res && fallback && fallback !== primary) { used = fallback; res = await tryModel(fallback, attempts); }
  const ttfb = Date.now() - t0;   // waktu sampai Google mulai menjawab

  if (!res) {
    const s = attempts.map(a => a.status);
    if (s.length && s.every(x => x === 429)) return fail("busy", 503, attempts);
    if (s.some(x => x === 400 || x === 403 || x === 404)) return fail("config", 502, attempts);
    return fail("upstream", 502, attempts);
  }

  return new Response(transformStream(res.body, q.left), {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no", "X-AI-Remaining": String(q.left), "X-AI-Guest": uid ? "0" : "1", "X-AI-Model": used, "Server-Timing": `gemini;dur=${ttfb}` }
  });
}

export function onRequest() { return json({ error: "method_not_allowed" }, 405, { Allow: "POST" }); }
