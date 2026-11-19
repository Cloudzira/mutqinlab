/* ============================================================
   Mutqin AI — Cloudflare Pages Function  (POST /api/ai)
   - API key Google AI Studio disimpan sebagai SECRET di Cloudflare (tidak pernah sampai ke browser).
   - Hanya pengguna yang sudah masuk (Firebase ID token terverifikasi) yang boleh memakai.
   - Batas harian per pengguna (KV bila tersedia) + batas panjang pesan.
   - Respons di-stream ke klien sebagai SSE sederhana: data: {"t":"..."} … data: {"done":true}
   Variabel lingkungan:
     GEMINI_API_KEY        (wajib, Secret)
     GEMINI_MODEL          (opsional, default gemini-3.8-flash)
     GEMINI_FALLBACK_MODEL (opsional, default gemini-3.5-flash-lite) — dicoba bila model utama gagal
     FIREBASE_API_KEY      (opsional, default = apiKey publik proyek Firebase MutqinLab)
     AI_DAILY_LIMIT        (opsional, default 30 pertanyaan/pengguna/hari)
     ALLOWED_ORIGINS       (opsional, daftar origin tambahan dipisah koma)
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
function geminiBody(system, msgs) {
  // Catatan: model seri 3.x memakai "thinking" yang ikut dihitung sebagai token keluaran,
  // jadi batasnya dibuat lebih longgar (4096). Suhu/topP dibiarkan default agar cocok untuk 2.5 maupun 3.x.
  return JSON.stringify({
    systemInstruction: { parts: [{ text: system }] },
    contents: msgs.map(x => ({ role: x.role, parts: [{ text: x.text }] })),
    generationConfig: { maxOutputTokens: 4096 }
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

  // login wajib
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "login_required" }, 401);
  const uid = await verifyUser(token, env, new URL(request.url).origin);
  if (!uid) return json({ error: "login_required" }, 401);

  // body
  const len = parseInt(request.headers.get("Content-Length") || "0", 10);
  if (len > MAX_BODY) return json({ error: "too_large" }, 413);
  let data; try { data = JSON.parse((await request.text()).slice(0, MAX_BODY)); } catch { return json({ error: "bad_request" }, 400); }
  const msgs = cleanMessages(data && data.messages);
  if (!msgs) return json({ error: "bad_request" }, 400);

  // kuota (dihitung setelah masukan valid)
  const q = await takeQuota(uid, env);
  if (!q.ok) return json({ error: "quota", limit: q.limit }, 429);

  const body = geminiBody(buildSystem(data.ctx), msgs);
  const primary = (env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  const fallback = (env.GEMINI_FALLBACK_MODEL || DEFAULT_FALLBACK).trim();

  // gagal: kembalikan kuota, catat di log Cloudflare, dan (bila AI_DEBUG=1) sertakan alasan
  const fail = async (error, status, details) => {
    await refundQuota(uid, env);
    console.error("Mutqin AI gagal:", error, JSON.stringify(details));
    return json(debug ? { error, detail: details } : { error }, status);
  };

  const attempts = [];
  let res = null;

  // percobaan 1: model utama
  try {
    const r1 = await callGemini(primary, body, env);
    if (r1.ok) res = r1;
    else attempts.push(await errorInfo(primary, r1));
  } catch (e) {
    attempts.push({ model: primary, status: 0, message: "Gagal menghubungi Google: " + (e && e.message ? e.message : String(e)).slice(0, 200) });
  }

  // percobaan 2: model cadangan (untuk error apa pun pada model utama)
  if (!res && fallback && fallback !== primary) {
    try {
      const r2 = await callGemini(fallback, body, env);
      if (r2.ok) res = r2;
      else attempts.push(await errorInfo(fallback, r2));
    } catch (e) {
      attempts.push({ model: fallback, status: 0, message: "Gagal menghubungi Google: " + (e && e.message ? e.message : String(e)).slice(0, 200) });
    }
  }

  if (!res) {
    const s = attempts.map(a => a.status);
    if (s.length && s.every(x => x === 429)) return fail("busy", 503, attempts);
    if (s.some(x => x === 400 || x === 403 || x === 404)) return fail("config", 502, attempts);
    return fail("upstream", 502, attempts);
  }

  return new Response(transformStream(res.body, q.left), {
    status: 200,
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no", "X-AI-Remaining": String(q.left) }
  });
}

export function onRequest() { return json({ error: "method_not_allowed" }, 405, { Allow: "POST" }); }
