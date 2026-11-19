/* ============================================================
   MutqinLab — dialog.js  ·  Popup konfirmasi bertema (pengganti confirm() bawaan browser)
   Pemakaian:  const ya = await window.mpConfirm({ title, message, okText, cancelText, danger, icon });
   Mengembalikan true (setuju) atau false (batal / Esc / klik latar).
   ============================================================ */
(() => {
"use strict";
let dlg = null, resolver = null;

const ICON = { trash: "trash", alert: "alert", check: "check", x: "x" };
const svg = n => `<svg class="ik" aria-hidden="true"><use href="#i-${ICON[n] || "alert"}"/></svg>`;

function build() {
  if (dlg) return dlg;
  dlg = document.createElement("dialog");
  dlg.className = "modal mp-confirm";
  dlg.setAttribute("aria-labelledby", "mpcTitle");
  dlg.setAttribute("aria-describedby", "mpcMsg");
  dlg.innerHTML = `<div class="modal-box mpc-box">
    <div class="mpc-body">
      <span class="mpc-ico" id="mpcIco"></span>
      <h2 id="mpcTitle" class="mpc-title"></h2>
      <p id="mpcMsg" class="mpc-msg"></p>
    </div>
    <div class="mpc-act">
      <button type="button" class="mpc-btn mpc-cancel" id="mpcNo"></button>
      <button type="button" class="mpc-btn mpc-ok" id="mpcYes"></button>
    </div>
  </div>`;
  document.body.append(dlg);

  const done = v => { if (dlg.open) dlg.close(); settle(v); };
  dlg.querySelector("#mpcNo").addEventListener("click", () => done(false));
  dlg.querySelector("#mpcYes").addEventListener("click", () => done(true));
  dlg.addEventListener("cancel", e => { e.preventDefault(); done(false); });           // tombol Esc
  dlg.addEventListener("click", e => { if (e.target === dlg) done(false); });          // klik di luar kotak
  dlg.addEventListener("close", () => settle(false));
  return dlg;
}

function settle(v) { const r = resolver; resolver = null; if (r) r(v); }

window.mpConfirm = function (o) {
  o = o || {};
  const d = build();
  settle(false);                                   // tutup janji sebelumnya bila ada
  const danger = o.danger !== false;               // default: gaya "hapus" (merah lembut)
  d.classList.toggle("mpc-danger", danger);
  d.querySelector("#mpcIco").innerHTML = svg(o.icon || (danger ? "trash" : "alert"));
  d.querySelector("#mpcTitle").textContent = o.title || "Apakah Anda yakin?";
  d.querySelector("#mpcMsg").textContent = o.message || "";
  d.querySelector("#mpcMsg").hidden = !o.message;
  d.querySelector("#mpcNo").textContent = o.cancelText || "Batal";
  d.querySelector("#mpcYes").textContent = o.okText || "Ya, lanjutkan";
  return new Promise(res => {
    resolver = res;
    if (!d.open) d.showModal();
    setTimeout(() => d.querySelector(danger ? "#mpcNo" : "#mpcYes").focus({ preventScroll: true }), 30);   // aksi aman jadi fokus awal
  });
};
})();
