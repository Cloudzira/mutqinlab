/* ============================================================
   MutqinLab — tahfidz.js
   Program hafalan terpandu: Rencana · Ziyadah · Murojaah · Tes
   Terhubung ke mesin mushaf/audio lewat window.MP (dibuat di app.js).
   Data tersimpan di S.tahfidz → ikut tersinkron lewat Firebase.
   ============================================================ */
(() => {
"use strict";
const M = window.MP; if (!M) return;
const $ = id => document.getElementById(id);
const DAY = 864e5, pad = n => String(n).padStart(2, "0");
const SU = M.SURAH, nm = s => SU[s - 1][0], nAy = s => SU[s - 1][2], K = (s, a) => s + ":" + a;
const TD = () => M.S.tahfidz, today = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / DAY);
const live = k => { const i = TD().items[k]; return !!i && !i.x; };
const mine = () => Object.values(TD().items).filter(i => !i.x);
const dueList = () => Object.entries(TD().items).filter(([, i]) => !i.x && i.d <= today()).sort((a, b) => a[1].d - b[1].d);
const shuf = a => [...a].sort(() => Math.random() - .5), rg = (a, b) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
const DN = d => new Date(d * DAY).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
function save() { const t = TD(), keep = today() - 14; for (const f of ["cl", "md"]) for (const d in t[f]) if (+d < keep) delete t[f][d]; M.persist(); renderMisi(); }
const act = () => { const L = TD().log, t = today(); L[t] = (L[t] || 0) + 1; };
const streak = () => { const L = TD().log; let d = today(), c = 0; if (!L[d]) d--; while (L[d]) { c++; d--; } return c; };
const mk = (s, a) => ({ s, a, r: 0, i: 1, e: 2.3, d: today() + 1, l: 0, u: Date.now() });

/* ---------- SRS (SM-2 yang disederhanakan) ---------- */
function nx(it, q) {
  const n = { ...it };
  if (q == 0) { n.l++; n.r = 0; n.i = 1; n.e = Math.max(1.3, n.e - .2); }
  else if (q == 1) { n.i = Math.max(1, Math.round(n.i * 1.2)); n.e = Math.max(1.3, n.e - .05); n.r++; }
  else { n.i = n.r == 0 ? 3 : n.r == 1 ? 7 : Math.round(n.i * n.e); n.e = Math.min(3, n.e + .05); n.r++; }
  n.d = today() + n.i; n.u = Date.now(); return n;
}

/* ---------- Rencana: unit ayat, cakupan, kalkulasi ---------- */
const LV = { 1: 1.6, 2: 1, 3: .75 };
const rng = P => `${nm(P.f)} ${P.fa} – ${nm(P.t)} ${P.ta}`;
function units(P) {
  const r = rg(P.f, P.t), o = []; if (P.o == "b") r.reverse();
  r.forEach(s => { const n = nAy(s), a0 = s == P.f ? P.fa : 1, a1 = s == P.t ? Math.min(n, P.ta) : n; for (let a = a0; a <= a1; a++) o.push({ s, a }); });
  return o;
}
const scope = P => mine().filter(i => (i.s > P.f || i.s == P.f && i.a >= P.fa) && (i.s < P.t || i.s == P.t && i.a <= P.ta));
function calc(P, done) {
  const U = units(P), total = U.length, rem = Math.max(0, total - done), act_ = Math.floor(Math.max(0, P.dl - today()) * (7 - P.off) / 7),
    m = Math.min(act_, Math.max(5, Math.round(act_ * .15))), z = Math.max(1, act_ - m),
    mpa = 3.5 * LV[P.lv] * (P.gu ? .9 : 1) * (P.ti ? 1 : 1.15), mx = Math.max(1, Math.min(30, Math.floor(P.mins * .6 / mpa))),
    pd = Math.max(1, Math.ceil(rem / z)), need = Math.min(480, Math.ceil(pd * mpa / .6)),
    fin = today() + Math.ceil((Math.ceil(rem / mx) + m) * 7 / (7 - P.off));
  return { U, total, rem, act: act_, m, z, mpa, mx, pd, ok: pd <= mx, need, fin };
}
function targetKeys() {
  const P = TD().plan; if (!P) return [];
  return calc(P, scope(P).length).U.filter(u => !live(K(u.s, u.a))).slice(0, P.pd).map(u => K(u.s, u.a));
}

/* ---------- Teks & terjemahan ayat (Quran.com API, di-cache) ---------- */
const VC = {};
async function vtxt(s) {
  if (VC[s]) return VC[s];
  const r = await M.fetchJson(`${M.API}/quran/verses/uthmani?chapter_number=${s}`);
  return (VC[s] = r.verses.map(v => v.text_uthmani));
}
function hydrate() {
  document.querySelectorAll("#thBody [data-txt]").forEach(e => {
    const [s, a] = e.dataset.txt.split(":").map(Number);
    vtxt(s).then(v => { e.textContent = v[a - 1] || ""; }).catch(() => { e.textContent = "Perlu internet untuk memuat teks ayat"; });
  });
  document.querySelectorAll("#thBody [data-tr]").forEach(e => {
    M.getTranslation(e.dataset.tr).then(t => { e.textContent = t; }).catch(() => { e.textContent = "Terjemahan belum tersedia"; });
  });
}

/* ---------- Pembantu tampilan ---------- */
function ic(n, x = "") { return `<svg class="ik ${x}" aria-hidden="true"><use href="#i-${n}"/></svg>`; }
const lbl = t => String(t).replace(/^@([\w-]+) /, (m, n) => ic(n));
const C = (h, x = "") => `<section class="thc ${x}">${h}</section>`;
const B = (d, t, x = "", extra = "") => `<button type="button" class="thbtn ${x}" data-do="${d}" ${extra}>${lbl(t)}</button>`;
const bar = (l, n, t, c = "") => `<div><div class="thbl"><span>${l}</span><span>${n}/${t}</span></div><div class="bar"><i class="${c}" style="width:${t ? Math.min(100, n / t * 100) : 0}%"></i></div></div>`;
const fl = (l, h) => `<label class="thf"><span>${l}</span>${h}</label>`;
const sel = (k, o, v) => `<select data-k="${k}">${o.map(([a, b]) => `<option value="${a}"${a == v ? " selected" : ""}>${b}</option>`).join("")}</select>`;
const num = (k, v, mx) => `<input type="number" inputmode="numeric" min="1" max="${mx}" value="${v}" data-k="${k}">`;
const ckb = (k, t, v) => `<label class="thck"><input type="checkbox" data-k="${k}"${v ? " checked" : ""}><span>${t}</span></label>`;
const chip = (d, t, x = "") => `<button type="button" class="thchip" data-do="${d}" ${x}>${lbl(t)}</button>`;
const SO = SU.map((x, i) => [i + 1, (i + 1) + ". " + x[0]]);

/* ---------- Wizard Rencana (4 langkah) ---------- */
let view = "mushaf", W = null, editing = false, zs = -1, zStart = 0, zMin = 20, mi = today(), rev = false, Q = null;
function wInit() { W = { st: 1, P: { f: 78, fa: 1, t: 114, ta: nAy(114), o: "b", dl: today() + 90, mins: 30, lv: 2, off: 1, tm: "s", gu: 0, te: 0, ti: 1, ...(TD().plan || {}) } }; }
function wset(k, v) {
  const P = W.P;
  if (["f", "t", "fa", "ta", "dl", "mins", "lv", "off"].includes(k)) { v = +v; if (k == "dl" && !(v > 0)) return; }
  P[k] = v;
  if (k == "f") P.fa = 1; if (k == "t") P.ta = nAy(P.t);
  if (k == "fa") P.fa = Math.max(1, Math.min(nAy(P.f), v || 1)); if (k == "ta") P.ta = Math.max(1, Math.min(nAy(P.t), v || 1));
  render();
}
const okTgt = P => P.f < P.t || (P.f == P.t && P.fa <= P.ta);
function vWiz() {
  if (!W) wInit();
  const P = W.P, st = W.st, TT = ["Target", "Waktu", "Kondisimu", "Ringkasan"]; let b = "";
  if (st == 1) {
    const tot = units(P).length;
    b = `<p class="thp"><b>Apa yang ingin kamu hafal?</b></p>
    <div class="throw">${[["Juz 30", 78, 114], ["Juz 29", 67, 77], ["Juz 28", 58, 66]].map(x => chip("pre", x[0], `data-f="${x[1]}" data-t="${x[2]}"`)).join("")}</div>
    <div class="thg2">${fl("Mulai dari surat", sel("f", SO, P.f))}${fl("Ayat ke-", num("fa", P.fa, nAy(P.f)))}</div>
    <div class="thg2">${fl("Sampai surat", sel("t", SO, P.t))}${fl("Ayat ke-", num("ta", P.ta, nAy(P.t)))}</div>
    ${fl("Urutan menghafal", sel("o", [["b", "Mundur — dari surat akhir ke awal (mudah untuk pemula)"], ["f", "Maju — sesuai urutan mushaf"]], P.o))}
    <p class="thp ${okTgt(P) ? "ok" : "err"}">${okTgt(P) ? `${ic("target")} ${rng(P)} · ${tot} ayat` : "Titik akhir harus berada setelah titik mulai"}</p>`;
  } else if (st == 2) {
    b = `<p class="thp"><b>Kapan targetnya selesai, dan berapa waktumu?</b></p>
    ${fl("Batas waktu (deadline)", `<input type="date" data-k="dl" value="${new Date(P.dl * DAY).toISOString().slice(0, 10)}">`)}
    <div class="throw">${[[30, "1 bulan"], [90, "3 bulan"], [180, "6 bulan"], [365, "1 tahun"]].map(x => chip("dl", x[1], `data-n="${x[0]}"`)).join("")}</div>
    <p class="thp kecil">${DN(P.dl)} · ${P.dl - today()} hari lagi</p>
    ${fl("Waktu yang bisa kamu sediakan setiap hari", sel("mins", [15, 30, 45, 60, 90, 120, 180, 240, 300, 480].map(x => [x, x + " menit"]), P.mins))}
    ${fl("Hari libur per pekan", sel("off", [[0, "Tidak libur (setiap hari)"], [1, "1 hari per pekan"], [2, "2 hari per pekan"]], P.off))}
    <p class="thp kecil">Pilih waktu yang benar-benar bisa dijaga. Lebih baik sedikit tapi rutin.</p>`;
  } else if (st == 3) {
    b = `<p class="thp"><b>Ceritakan kondisimu agar rencananya pas.</b></p>
    ${fl("Kemampuan saat ini", sel("lv", [[1, "Belum lancar membaca Al-Qur'an"], [2, "Lancar membaca, belum punya hafalan"], [3, "Berpengalaman menghafal"]], P.lv))}
    ${fl("Waktu terbaik untuk menghafal", sel("tm", [["s", "Setelah Subuh"], ["p", "Pagi / siang"], ["m", "Malam hari"]], P.tm))}
    ${ckb("gu", "Punya ustaz/ustazah untuk setoran rutin", P.gu)}${ckb("te", "Punya teman hafalan / komunitas", P.te)}${ckb("ti", "Tidur cukup (7 jam atau lebih)", P.ti)}`;
  } else {
    const d = scope(P).length, c = calc(P, d), mn = Math.min(480, Math.ceil(c.need / 15) * 15);
    b = `<p class="thp"><b>Periksa ringkasan rencanamu</b></p>
    <div class="thgrid">${[["Total target", c.total + " ayat"], ["Sudah hafal", d + " ayat"], ["Hari aktif tersisa", c.act + " hari"], ["Target harian", c.pd + " ayat/hari"]].map(x => `<div><small>${x[0]}</small><b>${x[1]}</b></div>`).join("")}</div>
    <p class="thp">${ic("target")} ${rng(P)}</p><p class="thp kecil">±${c.m} hari terakhir dipakai khusus untuk memantapkan hafalan (fase Mutqin), tanpa ayat baru.</p>
    ${c.ok ? `<p class="thp ok">${ic("check")} Realistis: ${c.pd} ayat/hari masih dalam kapasitasmu (±${c.mx} ayat/hari).</p>`
      : `<p class="thp warn">${ic("alert")} Butuh ${c.pd} ayat/hari, sedangkan kapasitasmu ±${c.mx}. Pilih penyesuaian:</p><div class="throw">${chip("dl", "@calendar Perpanjang ke " + DN(c.fin), `data-abs="${c.fin}"`)}${chip("mins", "@clock Naikkan jadi " + mn + " mnt/hari", `data-n="${mn}"`)}</div>`}`;
  }
  return C(`<div class="thhead"><h3 class="thh">Susun Rencana Hafalan</h3>${TD().plan ? B("cancel", "Batal", "sec kecil") : ""}</div>
    <p class="thp kecil">Isi 4 langkah singkat (±1 menit). Aplikasi menghitung sisanya untukmu.</p>
    <div class="thsteps">${TT.map((x, i) => `<span class="${i + 1 == st ? "sel" : i + 1 < st ? "lalu" : ""}">${i + 1}. ${x}</span>`).join("")}</div>
    <div class="thform">${b}</div>
    <div class="throw">${st > 1 ? B("wgo", "@left Kembali", "sec", 'data-d="-1"') : ""}${st < 4 ? B("wgo", `Lanjut ${ic("right")}`, "lebar", 'data-d="1"') : B("wsave", "@check Mulai Rencana", "lebar")}</div>`);
}
function wsave() {
  const P = { ...W.P };
  if (!(P.dl > today())) return M.toast("Cek tanggal deadline");
  const d = scope(P).length, c = calc(P, d); P.st = today(); P.base = d; P.pd = c.ok ? c.pd : c.mx; P.pu = Date.now();
  TD().plan = P; editing = false; W = null; save(); render();
}
function replan() { const P = TD().plan, d = scope(P).length, c = calc(P, d); P.st = today(); P.base = d; P.pd = c.ok ? c.pd : c.mx; P.pu = Date.now(); save(); render(); M.toast("Rencana disusun ulang dari hari ini"); }

/* ---------- Motivasi & tips ---------- */
const MO = [["Dan sungguh, telah Kami mudahkan Al-Qur'an untuk peringatan, maka adakah orang yang mau mengambil pelajaran?", "QS. Al-Qamar: 17"], ["Maka sesungguhnya bersama kesulitan ada kemudahan.", "QS. Al-Insyirah: 5"], ["Sebaik-baik kalian adalah yang belajar Al-Qur'an dan mengajarkannya.", "HR. Bukhari (makna)"], ["Amal yang paling dicintai Allah adalah yang paling konsisten, meski sedikit.", "HR. Bukhari & Muslim (makna)"], ["Hafalan bukan soal bakat, tapi soal hadir setiap hari. Satu ayat yang diulang lebih berharga dari sepuluh ayat yang dilupakan.", "Prinsip konsistensi"], ["Lupa itu normal: otak membuang yang tak diulang. Murojaah memberi tahu otak bahwa ini penting.", "Sains memori"], ["Rantai harianmu adalah investasi. Jangan putus dua hari berturut-turut.", "Psikologi kebiasaan"], ["Setiap ayat yang kamu hafal adalah tabungan yang tidak bisa dicuri.", "Penyemangat"]];
const TP = ["Pakai satu mushaf yang sama: letak ayat di halaman membantu memori visual.", "Hafalan baru paling kuat setelah Subuh dan diulang sebelum tidur — tidur mengunci memori.", "Murojaah dulu, ziyadah kemudian. Jangan tambah hafalan saat antrean menumpuk.", "Baca artinya satu kali saja — makna menjadi jangkar ingatan.", "Hafalkan per ayat, lalu sambungkan dengan ayat sebelumnya.", "Menguji diri tanpa melihat jauh lebih efektif daripada membaca ulang berkali-kali.", "Beri tahu satu teman target pekananmu: akuntabilitas menaikkan konsistensi.", "Saat jenuh, kecilkan target hari itu (aturan 5 menit), tapi jangan nol.", "Istirahat 5 menit setiap 25 menit menghafal agar fokus terjaga."];
const moti = () => { const m = MO[mi % MO.length], t = TP[(mi * 2 + 1) % TP.length]; return C(`<div class="thhead"><p class="thquote">“${m[0]}”</p>${B("mnext", "↻", "sec kecil")}</div><span class="thsrc">— ${m[1]}</span><p class="thp">${ic("bulb")} <b>Tips:</b> ${t}</p>`, "moti emas"); };

/* ---------- Rencana: dasbor harian ---------- */
function vG() {
  const P = TD().plan; if (!P || editing) return vWiz();
  const t = today(), sc = scope(P), done = sc.length, c = calc(P, done), el = Math.floor(Math.max(0, t - P.st) * (7 - P.off) / 7),
    exp = Math.min(c.total, P.base + el * P.pd), due = dueList().length, mt = sc.filter(i => i.i >= 7).length,
    UL = c.U.filter(u => !live(K(u.s, u.a))), td = UL.slice(0, P.pd), gap = exp - done, st = gap <= 0 ? 0 : gap / Math.max(1, exp) <= .2 ? 1 : 2,
    L = TD().log, l7 = rg(0, 6).filter(o => L[t - o]).length, Z = Math.round(P.mins * .6), R = P.mins - Z, cl = TD().cl[t] || [],
    tm = { s: "Setelah Subuh", p: "Pagi/siang", m: "Malam" }[P.tm], w = Math.max(1, P.pd * (7 - P.off)),
    lab = u => nm(u.s) + " " + u.a, g = new Date().getHours(),
    sal = g < 4 ? "Selamat malam" : g < 11 ? "Selamat pagi" : g < 15 ? "Selamat siang" : g < 18 ? "Selamat sore" : "Selamat malam", D = [];
  if (st) {
    if (l7 < 7 - P.off - 1) D.push(`Konsistensi turun (${l7} dari ${7 - P.off} hari aktif pekan ini). Tetapkan "kapan-di mana-apa", tempel pada rutinitas tetap (${tm.toLowerCase()}), dan pakai aturan 5 menit minimal agar rantai tidak putus.`);
    if (due > 10 && due > done * .2) D.push(`Murojaah menumpuk (${due} ayat). Hentikan ziyadah baru sampai antrean < 10: ingatan yang tidak diulang meluruh.`);
    if (P.pd >= c.mx * .9) D.push(`Beban ziyadah (${P.pd} ayat/hari) mendekati batas kapasitasmu (${c.mx}). Beban berlebih memicu lupa dan jenuh.`);
    if (done > 10 && mt / done < .4) D.push(`Baru ${Math.round(mt / done * 100)}% ayat yang stabil (interval ≥7 hari). Perbanyak tes tanpa melihat dan jaga tidur ≥7 jam.`);
    if (!P.te) D.push("Cari teman setoran: akuntabilitas sosial menaikkan konsistensi.");
    if (!P.gu) D.push("Setorkan hafalan ke ustaz/ustazah agar tajwid & makhraj terkoreksi.");
  }
  const tasks = [`${tm}: niat ikhlas, wudhu, doa memohon kemudahan; baca target hari ini 3× dari mushaf (talqin) — ±${Math.round(Z * .25)} mnt`,
    td.length ? `Ziyadah ${td.length} ayat (${lab(td[0])}${td.length > 1 ? " → " + lab(td[td.length - 1]) : ""}): pahami arti, dengar, tikrar, lalu uji — ±${Math.round(Z * .75)} mnt` : `Fase Mutqin: sambung antar-ayat & antar-surat tanpa melihat, lalu kerjakan Tes — ±${Z} mnt`,
    `Murojaah antrean SRS: ${due} ayat — ±${R} mnt`, "Sebelum tidur: ulang ayat baru 3× tanpa melihat"];
  const wk = []; for (let k = 0; k < 6 && k * w < UL.length; k++) wk.push(`Pekan ${k + 1}: ${lab(UL[k * w])} → ${lab(UL[Math.min((k + 1) * w, UL.length) - 1])}`);
  const goal = TD().goal || 5, tl = L[t] || 0, wkv = rg(0, 6).map(o => L[t - 6 + o] || 0), mxv = Math.max(goal, ...wkv);
  const zdone = mine().filter(i => i.r == 0 && i.i == 1 && i.d == t + 1).length, pct = c.total ? Math.round(done / c.total * 100) : 0,
    zok = !td.length || zdone >= P.pd, mok = due == 0,
    stTxt = done >= c.total && c.total ? "Semua ayat sudah masuk — fokus Mutqin" : ["Sesuai rencana", "Sedikit tertinggal", "Tertinggal"][st];
  return `<div class="thhead"><div><p class="thp kecil">${sal} · ${ic("flame")} ${streak()} hari berturut-turut</p><h2 class="thh besar">Misi hari ini</h2></div>${B("edit", ic("sliders"), "sec kecil", 'aria-label="Ubah rencana"')}</div>` +
    C(`<div class="herotop"><div class="thring" style="--p:${pct}"><b>${pct}%</b><small>hafal</small></div>
      <div class="herotxt"><span class="pill">${ic(st ? "alert" : "check")} ${stTxt}</span><p class="thp">${ic("target")} <b>${rng(P)}</b></p><p class="thp kecil">${done} dari ${c.total} ayat · deadline ${DN(P.dl)}</p></div></div>
      <div class="tiles">
        <button type="button" class="tile${zok ? " done" : ""}" data-do="goz"><i>${ic("cap")}</i><span><b>Ziyadah</b><small>${td.length ? `${zdone}/${P.pd} ayat hari ini` : "Selesai"}</small></span><em>${ic(zok ? "check" : "right")}</em></button>
        <button type="button" class="tile${mok ? " done" : ""}" data-do="gom"><i>${ic("repeat")}</i><span><b>Murojaah</b><small>${due ? due + " ayat menunggu" : "Antrean bersih"}</small></span><em>${ic(mok ? "check" : "right")}</em></button>
        <button type="button" class="tile" data-do="got"><i>${ic("target")}</i><span><b>Tes</b><small>Uji sambung ayat</small></span><em>${ic("right")}</em></button>
      </div>
      <details><summary>${ic("info")} Lihat perhitungan</summary><p class="thp kecil">${c.total} ayat − ${done} hafal = ${c.rem} sisa · ${c.act} hari aktif → ${c.z} hari ziyadah + ${c.m} hari Mutqin · ${c.mpa.toFixed(1)} mnt/ayat · kapasitas ${c.mx} ayat/hari (60% ziyadah, 40% murojaah) → target ${P.pd} ayat/hari</p></details>`, "emas hero") +
    (!c.ok ? C(`<p class="thp warn">${ic("alert")} Butuh ${c.pd} ayat/hari, kapasitasmu ±${c.mx}. Rencana ini belum realistis. Pilih salah satu:</p><div class="throw">${B("opt", "@calendar Perpanjang ke " + DN(c.fin), "sec kecil", 'data-k="d"')}${B("opt", "@clock Naikkan jadi " + c.need + " mnt/hari", "sec kecil", 'data-k="m"')}</div>`, "emas") : "") +
    C(`<h3 class="thh">${ic("list")} Panduan Hari Ini</h3>${tasks.map((x, i) => `<button type="button" class="thtask${cl[i] ? " selesai" : ""}" data-do="chk" data-i="${i}"><i>${ic(cl[i] ? "check" : "circle")}</i><span>${x}</span></button>`).join("")}`) +
    (st ? C(`<h3 class="thh">${ic("search")} Evaluasi: terlambat ${gap} ayat</h3>${D.map(x => `<p class="thp">• ${x}</p>`).join("")}${B("replan", "@refresh Susun ulang dari hari ini", "emas")}`) : "") + moti() +
    C(`<h3 class="thh">${ic("chart")} Aktivitas</h3>${bar("Target hari ini", Math.min(tl, goal), goal, "ok")}${bar("Seharusnya hari ini", exp, c.total, "em")}${bar("Mutqin (interval ≥7 hari)", mt, c.total, "ok")}<div class="thchart">${wkv.map((n, i) => `<div title="${n}"><i class="${i == 6 ? "hari" : ""}" style="height:${n / mxv * 100}%"></i>${new Date((t - 6 + i) * DAY).toLocaleDateString("id-ID", { weekday: "narrow", timeZone: "UTC" })}</div>`).join("")}</div>
      <div class="thgrid"><div><small>Ayat dalam SRS</small><b>${mine().length}</b></div><div><small>Antrean murojaah</small><b>${due}</b></div></div>`) +
    C(`<details><summary>${ic("map")} Peta Jalan</summary>${wk.map(x => `<p class="thp">${x}</p>`).join("")}${UL.length > 6 * w ? `<p class="thp kecil">… ±${Math.ceil(UL.length / w)} pekan ziyadah</p>` : ""}<p class="thp ok">${ic("flag")} Fase Mutqin (±${c.m} hari terakhir): tanpa ayat baru — sambung surat, tes, dan murojaah. Mutqin = semua ayat interval ≥7 hari dan skor tes ≥90%.</p></details>`) +
    C(`<details><summary>${ic("bulb")} Ilmu di balik rencana ini</summary><ul><li><b>Syar'i:</b> niat ikhlas, wudhu, doa, satu mushaf tetap, tajwid benar, setoran ke ustaz/ustazah.</li><li><b>Kognitif:</b> spaced repetition, retrieval practice, chunking per ayat, memahami arti, tidur untuk konsolidasi.</li><li><b>Psikologi:</b> target kecil harian, implementation intention, streak, akuntabilitas teman.</li><li><b>Teknologi:</b> jadwal SRS, audio berulang, pengukuran kemajuan, penyusunan ulang rencana otomatis.</li></ul></details>`);
}

/* ---------- Ziyadah: sesi hafalan baru ---------- */
const ZS = [["Talqin", "Dengarkan ayat target 3× sambil melihat teks dan mushaf, ikuti dengan suara pelan.", "@play Putar 3×"],
  ["Pahami", "Baca terjemah dan tangkap kata kunci — makna menjadi jangkar ingatan.", `Saya paham, lanjut ${ic("right")}`],
  ["Tikrar", "Ulangi tiap ayat 10× dalam 2 putaran lewat audio sampai lancar tanpa melihat. Kualitas lebih penting dari kecepatan.", "@repeat Putar tikrar"],
  ["Uji", "Teks ditutup. Lantunkan dari ingatan lewat mode giliran-Anda, ketuk teks untuk mengecek.", "@mic Latih giliran saya"],
  ["Sambung", "Lantunkan ayat sebelumnya + ayat target berurutan tanpa melihat. Jika lancar, tandai hafal — murojaah pertama besok.", "@check Tandai hafal"]];
function vZ() {
  const P = TD().plan;
  if (!P) return C(`<h3 class="thh">Susun rencana dulu</h3><p class="thp">Ziyadah dipandu dari target hariannya. Isi 4 langkah singkat di tab Beranda.</p>${B("gog", "Buka Beranda")}`);
  const ks = targetKeys(); zMin = Math.round(P.mins * .6);
  if (!ks.length) return C(`<h3 class="thh">${ic("cap")} Ziyadah</h3><p class="thp ok">Semua ayat dalam target sudah masuk jadwal murojaah. Fokuskan waktu pada Murojaah dan Tes.</p>${B("gom", "Ke Murojaah")}`);
  const f = ks[0].split(":").map(Number), l = ks[ks.length - 1].split(":").map(Number);
  return C(`<div class="thhead"><h3 class="thh">${ic("cap")} Sesi Ziyadah</h3><span id="thTimer" class="thp kecil"></span></div>
    <p class="thp">Target sesi: <b>${nm(f[0])} ${f[1]}${ks.length > 1 ? " – " + nm(l[0]) + " " + l[1] : ""}</b> (${ks.length} ayat)</p>
    <div class="thsteps">${ZS.map((x, i) => `<span class="${i == zs ? "sel" : i < zs ? "lalu" : ""}">${i + 1}. ${x[0]}</span>`).join("")}</div>
    ${zs < 0 ? B("zstep", "@play Mulai Sesi Ziyadah", "penuh", 'data-d="1"') : `<p class="thp">${ZS[zs][1]}</p>
      <div class="throw">${B("zstep", ic("left"), "sec", 'data-d="-1"')}${B("zact", ZS[zs][2], "lebar")}${B("zstep", ic("right"), "sec", 'data-d="1"')}</div>
      ${zs == 3 ? B("zopen", "@book Uji langsung di mushaf (mode tutup)", "sec penuh") : ""}`}`) +
    ks.map(k => { const [s, a] = k.split(":").map(Number); return `<div class="thayat"><span class="no">${nm(s)} · ${a}</span><div class="thar${zs == 3 ? " blur" : ""}" data-txt="${k}"><i class="skl"></i></div>${zs == 1 ? `<p class="tht" data-tr="${k}"><i class="skl" style="width:60%"></i></p>` : ""}</div>`; }).join("");
}
function zact() {
  const ks = targetKeys(); if (!ks.length) return;
  if (zs == 0) M.startPlayback(ks, { repeatAyah: 3, repeatRange: 1, gap: 0 });
  else if (zs == 1) { zs = 2; render(); }
  else if (zs == 2) M.startPlayback(ks, { repeatAyah: 10, repeatRange: 2, gap: 0 });
  else if (zs == 3) M.startPlayback(ks, { repeatAyah: 3, repeatRange: 1, gap: -1 });
  else {
    ks.forEach(k => { if (!live(k)) { const [s, a] = k.split(":").map(Number); TD().items[k] = mk(s, a); } });
    M.hardStop && M.hardStop(true); act(); zs = -1; zStart = 0; save(); render(); badge(); M.toast("Alhamdulillah! Murojaah pertama besok (setelah tidur).");
  }
}

/* ---------- Murojaah: sambung ayat + SRS ---------- */
function vM() {
  const due = dueList(), t = today(), dn = TD().md[t] || 0;
  const guide = C(`<div class="thhead"><h3 class="thh">${ic("repeat")} Sesi Murojaah</h3><span class="thp kecil">sisa ${due.length} ayat · ±${Math.ceil(due.length * .4)} mnt</span></div>${bar("Selesai hari ini", dn, due.length + dn, "ok")}
    <ol><li><b>Murojaah dulu</b>, baru ziyadah: otak segar dan antrean tidak menumpuk.</li><li><b>Lantunkan dulu</b> lanjutan ayat dengan suara, baru ketuk "Tampilkan".</li><li><b>Nilai jujur:</b> Mutqin bila lancar tanpa ragu, Ragu bila sempat tersendat, Lupa bila gagal — baca ayatnya, ulang 3×, lalu nilai.</li><li>Antrean di atas 20? Cicil ±20 ayat per sesi dan tunda ziyadah.</li></ol><p class="thp kecil">⌨️ Pintasan: <b>Spasi</b> tampilkan · <b>1 / 2 / 3</b> nilai</p>`);
  if (!due.length) return guide + C(`<p class="thp ok">Alhamdulillah, tidak ada murojaah hari ini</p>${B("goz", "Lanjut Ziyadah", "sec")}`);
  const [k, it] = due[0], pk = it.a > 1 ? K(it.s, it.a - 1) : null;
  return guide + C(`<div class="thhead"><b>${nm(it.s)} · ayat ${it.a}</b><span class="thp kecil">${due.length} ▸</span></div>
    <p class="thp kecil">Lanjutkan ayat setelah ini:</p>${pk ? `<div class="thar" data-txt="${pk}"><i class="skl"></i></div>` : `<p class="thp">(Awal surat)</p>`}
    ${!rev ? B("rv", "Tampilkan Jawaban", "penuh") : `<div class="thar" data-txt="${k}"><i class="skl"></i></div><p class="tht" data-tr="${k}"><i class="skl" style="width:60%"></i></p>
      <div class="throw">${B("ply", "@volume Dengar", "sec kecil", `data-k="${k}"`)}${B("opn", "@book Buka di mushaf", "sec kecil", `data-k="${k}"`)}</div>
      <div class="thrate">${[0, 1, 2].map(q => `<button type="button" class="r${q}" data-do="rate" data-k="${k}" data-q="${q}">${["Lupa", "Ragu", "Mutqin"][q]}<small>${nx(it, q).i} hari</small></button>`).join("")}</div>`}`);
}

/* ---------- Tes sambung ayat ---------- */
function vT() {
  if (!Q) { const n = mine().filter(i => i.a > 1).length;
    return C(`<h3 class="thh">${ic("target")} Tes Sambung Ayat</h3><p class="thp">Pilih ayat yang benar setelah ayat yang ditampilkan. Soal diambil dari hafalanmu; jawaban salah dijadwalkan murojaah hari ini.</p>${n < 3 ? '<p class="thp warn">Masukkan minimal 3 ayat (bukan ayat pertama surat) ke jadwal hafalan dulu.</p>' : B("tstart", "Mulai Tes", "penuh")}`); }
  if (Q.i >= Q.q.length) { const n = Q.q.length;
    return C(`<div class="skor">${Q.sc}/${n}</div><p class="thp" style="text-align:center">${Q.sc >= n * .8 ? "MasyaAllah! Pertahankan." : "Terus murojaah, in syaa Allah mutqin."}</p>${B("tstart", "Ulangi Tes", "penuh")}`); }
  const q = Q.q[Q.i], dn = Q.a !== null;
  return C(`<div class="thhead"><b>${nm(q.s)}</b><span class="thp kecil">${Q.i + 1}/${Q.q.length}</span></div><div class="thar" data-txt="${K(q.s, q.a - 1)}"><i class="skl"></i></div><p class="thp kecil">Ayat setelahnya adalah…</p>
    ${q.o.map(x => `<button type="button" class="thq${dn ? (x == q.a ? " benar" : x == Q.a ? " salah" : "") : ""}" data-do="tans" data-x="${x}"><div class="thar" data-txt="${K(q.s, x)}"><i class="skl"></i></div></button>`).join("")}
    ${dn ? B("tnext", `Lanjut ${ic("right")}`, "penuh") : ""}`);
}

/* ---------- Navigasi & aksi ---------- */
const R = { g: vG, z: vZ, m: vM, t: vT };
function render() { if (view === "mushaf") return; $("thBody").innerHTML = R[view](); hydrate(); }
function setView(v) {
  view = v; rev = false; document.body.dataset.view = v; try { localStorage.setItem("mp_view", v); } catch (e) {} renderMisi(); $("tahfidz").hidden = v === "mushaf";
  document.querySelectorAll("#viewbar [data-view]").forEach(b => { if (b.dataset.view === v) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
  if (v !== "mushaf") { render(); window.scrollTo(0, 0); }
}
function badge() { const n = dueList().length, e = $("thDot"); e.hidden = !n; e.textContent = n > 99 ? "99+" : n; }
const A = {
  pre: d => { const P = W.P; P.f = +d.f; P.fa = 1; P.t = +d.t; P.ta = nAy(+d.t); render(); },
  dl: d => wset("dl", d.abs ? +d.abs : today() + +d.n), mins: d => wset("mins", d.n),
  wgo: d => { const P = W.P, n = +d.n || +d.d;
    if (n > 0) { if (W.st == 1 && !okTgt(P)) return M.toast("Titik akhir harus setelah titik mulai"); if (W.st == 2 && !(P.dl > today())) return M.toast("Pilih tanggal deadline setelah hari ini"); }
    W.st = Math.max(1, Math.min(4, W.st + n)); render(); },
  wsave, cancel: () => { editing = false; W = null; render(); }, edit: () => { editing = true; W = null; render(); }, replan,
  opt: d => { const P = TD().plan, c = calc(P, scope(P).length); if (d.k == "d") P.dl = c.fin; else P.mins = c.need; replan(); },
  chk: d => { const t = today(), a = TD().cl[t] || []; a[+d.i] = !a[+d.i]; TD().cl[t] = a; save(); render(); if ([0, 1, 2, 3].every(x => a[x])) M.toast("MasyaAllah! Semua tugas hari ini selesai"); },
  goz: () => setView("z"), got: () => setView("t"), gom: () => setView("m"), gog: () => setView("g"), mnext: () => { mi++; render(); },
  zstep: d => { zs = Math.max(0, Math.min(4, zs + +d.d)); if (!zStart) zStart = Date.now(); render(); }, zact,
  zopen: () => { const [s, a] = targetKeys()[0].split(":").map(Number); M.setHideMode("blur"); setView("mushaf"); M.jumpToVerse(s, a); },
  rv: () => { rev = true; render(); },
  ply: d => M.startPlayback([d.k], { repeatAyah: 1, repeatRange: 1, gap: 0 }),
  opn: d => { const [s, a] = d.k.split(":").map(Number); setView("mushaf"); M.jumpToVerse(s, a); },
  rate: d => { navigator.vibrate && navigator.vibrate(12); const it = TD().items[d.k]; if (!it) return; TD().items[d.k] = nx(it, +d.q); TD().md[today()] = (TD().md[today()] || 0) + 1; act(); rev = false; save(); render(); badge(); M.toast("Tercatat · berikutnya " + TD().items[d.k].i + " hari lagi"); },
  tstart: () => { const pool = shuf(mine().filter(i => i.a > 1)).slice(0, 10);
    Q = { i: 0, sc: 0, a: null, q: pool.map(it => ({ s: it.s, a: it.a, o: shuf([it.a, ...shuf(rg(1, nAy(it.s)).filter(x => x != it.a && x != it.a - 1)).slice(0, 3)]) })) }; render(); },
  tans: d => { if (Q.a !== null) return; navigator.vibrate && navigator.vibrate(12); const q = Q.q[Q.i]; Q.a = +d.x;
    if (Q.a == q.a) Q.sc++; else { const k = K(q.s, q.a), it = TD().items[k]; if (it && !it.x) { TD().items[k] = { ...it, r: 0, d: today(), l: it.l + 1, u: Date.now() }; save(); badge(); } }
    render(); },
  tnext: () => { Q.i++; Q.a = null; if (Q.i >= Q.q.length) { act(); save(); } render(); }
};
document.addEventListener("click", e => {
  const v = e.target.closest("#viewbar [data-view]"); if (v) { setView(v.dataset.view); return; }
  const b = e.target.closest("#thBody [data-do]"); if (b && A[b.dataset.do]) { A[b.dataset.do](b.dataset); return; }
  const g = e.target.closest("#misi [data-go]"); if (g) { setView(g.dataset.go); return; }
  const x = e.target.closest("#misi [data-x]"); if (x) { try { localStorage.setItem("mp_misi_x", "1"); } catch (er) {} $("misi").hidden = true; return; }
  const ar = e.target.closest("#thBody .thar.blur"); if (ar) ar.classList.toggle("show");
});
document.addEventListener("change", e => {
  const el = e.target.closest("#thBody [data-k]"); if (!el || !W) return;
  let v = el.type === "checkbox" ? +el.checked : el.value; if (el.type === "date") v = Math.floor(Date.parse(v) / DAY);
  wset(el.dataset.k, v);
});

/* ---------- Misi hari ini di halaman Mushaf (jembatan ke program) ---------- */
function renderMisi() {
  const e = $("misi"); if (!e) return; const P = TD().plan;
  if (!P) { let off = false; try { off = !!localStorage.getItem("mp_misi_x"); } catch (er) {}
    if (off) { e.hidden = true; return; }
    e.innerHTML = `<span class="mi">${ic("target")}</span><div><b>Hafalan lebih terarah</b><small>Susun rencana dalam 1 menit</small></div><button type="button" class="thbtn kecil" data-go="g">Mulai</button><button type="button" class="x" data-x="1" aria-label="Tutup">${ic("x")}</button>`; e.hidden = false; return; }
  e.innerHTML = `<span class="mi">${ic("flame")} ${streak()}</span><div><b>Misi hari ini</b><small>Ziyadah ${targetKeys().length} ayat · Murojaah ${dueList().length} ayat</small></div><button type="button" class="thbtn kecil" data-go="g">Buka</button>`; e.hidden = false;
}
document.addEventListener("keydown", e => {
  if (view !== "m" || e.target.closest("input,select,textarea,dialog")) return; const d = dueList()[0]; if (!d) return;
  if ((e.key === " " || e.key === "Enter") && !rev) { e.preventDefault(); A.rv(); }
  else if (rev && ["1", "2", "3"].includes(e.key)) A.rate({ k: d[0], q: String(+e.key - 1) });
});

/* ---------- Jam, tanggal Hijriah, hitung mundur target ---------- */
let hj = "", hjd = -1;
function tick() {
  if ($("tahfidz").hidden) return;
  const n = new Date(), d = today(); $("thClk").textContent = n.toLocaleTimeString("en-GB");
  if (hjd != d || !hj) { hjd = d; try { hj = n.toLocaleDateString("id-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }); } catch { hj = ""; } }
  $("thHij").textContent = n.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }) + (hj ? " · " + hj : "");
  const P = TD().plan, c = $("thCdn");
  if (P) { const ms = (P.dl + 1) * DAY + n.getTimezoneOffset() * 6e4 - n.getTime();
    if (ms <= 0) c.textContent = "Deadline terlewat";
    else { const dd = Math.floor(ms / DAY), r = ms % DAY; c.textContent = `Target ${dd} hari ${pad(Math.floor(r / 36e5))}:${pad(Math.floor(r / 6e4) % 60)}:${pad(Math.floor(r / 1e3) % 60)}`; c.classList.toggle("dekat", dd < 7); } }
  else c.textContent = "";
  const z = $("thTimer"); if (z && zStart) { const q = Math.floor((Date.now() - zStart) / 1e3); z.textContent = `${pad(Math.floor(q / 60))}:${pad(q % 60)} / ${zMin} mnt`; }
}

window.TH = { refresh() { badge(); renderMisi(); render(); } };
document.body.dataset.view = "mushaf"; badge(); tick(); setInterval(tick, 1000);
{ let v = "g"; try { v = localStorage.getItem("mp_view") || "g"; } catch (e) {} setView(["mushaf", "g", "z", "m", "t"].includes(v) ? v : "g"); }
})();
