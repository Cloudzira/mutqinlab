/* ============================================================
   MutqinLab — panduan.js
   Popup "Panduan Penggunaan" rinci, per tab:
   Alur · Mushaf · Beranda (rencana) · Ziyadah · Murojaah · Tes
   Dibuka dari tombol (?) di bilah atas, tombol "Panduan" di tab program,
   atau otomatis satu kali untuk pengguna baru.
   ============================================================ */
(() => {
"use strict";
const $ = id => document.getElementById(id);
const FLAG = "mp_guide_seen";

/* ---------- komponen kecil ---------- */
const ic = n => `<svg class="ik" aria-hidden="true"><use href="#i-${n}"/></svg>`;
const p = t => `<p>${t}</p>`;
const h = (icon, t) => `<h3 class="pg-h">${icon ? ic(icon) : ""}<span>${t}</span></h3>`;
const ul = a => `<ul class="pg-list">${a.map(x => `<li>${x}</li>`).join("")}</ul>`;
const note = (kind, t) => `<div class="pg-note ${kind}"><span class="pg-ni">${ic(kind == "warn" ? "alert" : kind == "ok" ? "check" : "bulb")}</span><div>${t}</div></div>`;
const steps = a => `<ol class="pg-steps">${a.map(([t, d]) => `<li><b>${t}</b><span>${d}</span></li>`).join("")}</ol>`;
const tbl = (head, rows) => `<div class="pg-tbl"><table><thead><tr>${head.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const go = (v, t) => `<button type="button" class="pg-go" data-pgview="${v}">${t} ${ic("right")}</button>`;

/* ---------- isi per tab ---------- */
const TABS = [
  { id: "alur", label: "Alur", icon: "map", title: "Alur belajar dalam 1 menit", html: () =>
    p("MutqinLab memandu hafalan dari nol sampai <b>mutqin</b> (kokoh). Cukup ikuti urutan berikut; aplikasi menghitung jadwal dan mengingatkan apa yang harus diulang.") +
    steps([
      ["1. Susun rencana (tab Beranda)", "Pilih target (surat/ayat), batas waktu, waktu harian, dan kondisimu. Aplikasi menghitung target ayat per hari."],
      ["2. Ziyadah — hafal ayat baru (tab Ziyadah)", "Ikuti 5 langkah: Talqin → Pahami → Tikrar → Uji → Sambung. Setelah lancar, tandai hafal."],
      ["3. Murojaah — ulang terjadwal (tab Murojaah)", "Setiap ayat yang ditandai hafal masuk jadwal ulang otomatis (besok, 3 hari, 7 hari, dst.). Nilai dirimu dengan jujur."],
      ["4. Tes — ukur kekuatan hafalan (tab Tes)", "Soal sambung ayat dari hafalanmu sendiri. Jawaban salah otomatis dijadwalkan murojaah hari itu juga."],
      ["5. Fase Mutqin", "Beberapa hari terakhir sebelum deadline tanpa ayat baru: fokus menyambung, tes, dan murojaah."],
      ["Bingung? Tanya Mutqin AI", "Tombol <b>Mutqin AI</b> di pojok kanan bawah siap menjelaskan fitur, rencana, dan teknik menghafal."]
    ]) +
    h("clock", "Urutan terbaik dalam satu hari") +
    ul(["<b>Murojaah dulu</b>, baru ziyadah — otak masih segar dan antrean tidak menumpuk.", "Ziyadah paling kuat <b>setelah Subuh</b>; ulangi ayat baru 3× tanpa melihat <b>sebelum tidur</b> (tidur mengunci memori).", "Hari tersibuk? Pakai <b>aturan 5 menit</b>: kecilkan targetnya, jangan nol. Rantai harian (🔥) jangan putus dua hari berturut-turut."]) +
    note("tip", "Tombol <b>ⓘ</b> di bilah atas membuka panduan ini kapan saja, langsung ke bagian sesuai tab yang sedang aktif. Data tersimpan di perangkatmu; masuk dengan Google untuk menyinkronkan antar perangkat.")
  },

  { id: "mushaf", label: "Mushaf", icon: "book", title: "Tab Mushaf — membaca, melatih, dan mendengar", html: () =>
    p("Mushaf Madinah 604 halaman. Di sinilah kamu membaca, menutup ayat untuk latihan, dan memutar audio per ayat.") +
    h("eye-off", "Tiga mode tampilan (tombol di bawah menu utama)") +
    tbl(["Mode", "Fungsi", "Kapan dipakai"], [
      ["<b>Normal</b> (1)", "Semua kata terlihat.", "Membaca & talqin awal."],
      ["<b>Tutup</b> (2)", "Semua kata tertutup; ketuk ayat untuk membukanya (dan melihat terjemahan).", "Menguji hafalan: lantunkan dulu, baru ketuk untuk mengecek."],
      ["<b>Kata awal</b> (3)", "Hanya kata pertama tiap ayat yang terlihat.", "Latihan sambung ayat — petunjuk minimal."]
    ]) +
    h("volume", "Mendengar & melatih per ayat") +
    ul([
      "<b>Ketuk tanda akhir ayat</b> (lingkaran bernomor) → muncul kartu ayat: <b>Putar ayat</b>, <b>Latih hafalan</b>, atau <b>Lanjut sampai akhir surat</b>.",
      "<b>Latih hafalan</b> memutar ayat, lalu memberi jeda sepanjang ayat agar kamu melantunkannya sendiri, diulang 5×.",
      "Tombol <b>▲</b> di pemutar membuka opsi: pilih <b>qari</b>, cakupan putar (halaman / ayat / rentang / sampai akhir surat), <b>ulang tiap ayat</b>, ulang seluruh rentang, <b>kecepatan</b> (0,6×–1,5×), dan <b>jeda antar ayat</b>.",
      "Mulai dengan kecepatan 0,75–0,9× saat tikrar; naikkan ke 1× setelah lancar."
    ]) +
    h("list", "Menu aksi halaman (⋯)") +
    ul(["<b>Penanda</b> (B) menyimpan halaman; <b>Daftar penanda</b> membukanya lagi.", "<b>Tandai hafal</b> (M) menandai satu halaman sudah hafal — hanya untuk catatan progres halaman.", "<b>Progres hafalan</b> menampilkan persentase total dan per juz."]) +
    h("compass", "Berpindah halaman") +
    ul(["Geser kiri/kanan, atau tombol panah ← →. Mushaf dibaca dari kanan, jadi <b>←</b> = halaman berikutnya.", "Tombol navigasi (/) untuk memilih <b>surat, juz, atau ayat</b>; bisa juga mengetik <b>2:255</b> di kolom cari.", "Pintasan keyboard: <b>Spasi</b> putar/jeda · <b>1 2 3</b> ganti mode · <b>B</b> penanda · <b>M</b> tandai hafal."]) +
    note("ok", "<b>Pengaturan (ikon slider)</b>: tema, lebar halaman, <i>buka ayat otomatis saat audio memutarnya</i>, terjemahan, jaga layar menyala, cadangan data, dan <b>unduh mushaf untuk mode luring</b> (sebaiknya lewat Wi-Fi).")
  },

  { id: "g", label: "Beranda", icon: "target", title: "Tab Beranda — merencanakan hafalan", html: () =>
    p("Beranda menyusun rencana lalu menjadi <b>dasbor harian</b>. Pertama kali dibuka, kamu mengisi 4 langkah singkat (±1 menit).") +
    h("sliders", "Mengisi 4 langkah rencana") +
    steps([
      ["1. Target", "Pilih cepat Juz 30 / 29 / 28 atau atur manual: surat & ayat awal sampai surat & ayat akhir. <b>Urutan mundur</b> (dari surat akhir ke awal) paling mudah untuk pemula karena surat-suratnya pendek; <b>maju</b> mengikuti urutan mushaf."],
      ["2. Waktu", "Tentukan <b>deadline</b> (tombol cepat 1 bulan–1 tahun), <b>menit per hari</b> yang benar-benar bisa kamu jaga, dan <b>hari libur per pekan</b> (0–2). Lebih baik sedikit tapi rutin."],
      ["3. Kondisimu", "Kemampuan membaca (belum lancar / lancar / berpengalaman), waktu terbaik menghafal, punya ustaz/ustazah, punya teman hafalan, dan tidur cukup. Semua ini memengaruhi perkiraan kecepatanmu."],
      ["4. Ringkasan", "Periksa total ayat, hari aktif, dan <b>target harian</b>. Aplikasi menilai apakah rencana realistis, lalu tekan <b>Mulai Rencana</b>."]
    ]) +
    h("info", "Bagaimana aplikasi menghitung") +
    ul([
      "Hari aktif = hari sampai deadline dikurangi hari libur.",
      "Sekitar <b>15% hari terakhir</b> (minimal 5 hari) dicadangkan untuk <b>fase Mutqin</b> tanpa ayat baru; sisanya hari ziyadah.",
      "Waktu harian dibagi <b>60% ziyadah</b> dan <b>40% murojaah</b>.",
      "Estimasi ±3,5 menit per ayat, disesuaikan: belum lancar ×1,6; berpengalaman ×0,75; punya ustaz/ustazah ×0,9; kurang tidur ×1,15.",
      "<b>Target harian</b> = ayat tersisa ÷ hari ziyadah. Kapasitas dibatasi maksimal 30 ayat per hari."
    ]) +
    note("warn", "Jika muncul <b>“Butuh X ayat/hari, kapasitasmu Y”</b>, rencana belum realistis. Pilih salah satu: <b>perpanjang deadline</b> ke tanggal yang disarankan, atau <b>naikkan menit per hari</b>. Jangan memaksakan — beban berlebih memicu lupa dan jenuh.") +
    h("flame", "Membaca dasbor “Misi hari ini”") +
    ul([
      "<b>Cincin persen</b> = ayat yang sudah masuk jadwal dibanding total target; lencana menunjukkan status: sesuai rencana / sedikit tertinggal / tertinggal.",
      "<b>Tiga kartu</b> (Ziyadah, Murojaah, Tes) langsung membuka tab masing-masing dan berubah hijau ✓ saat selesai.",
      "<b>Panduan Hari Ini</b>: daftar 4 tugas (talqin, ziyadah, murojaah, ulang sebelum tidur) yang bisa kamu centang.",
      "<b>Evaluasi</b> muncul bila tertinggal: aplikasi menyebut penyebabnya (konsistensi turun, murojaah menumpuk, beban terlalu berat, dsb.) dan tombol <b>Susun ulang dari hari ini</b> menghitung ulang sisa target.",
      "<b>Aktivitas</b>: grafik 7 hari, beban murojaah 7 hari ke depan, dan ayat yang sudah stabil (Mutqin).",
      "<b>Peta Jalan</b> memperlihatkan perkiraan ayat per pekan; <b>Lihat perhitungan</b> membuka rumus lengkapnya."
    ]) +
    h("sliders", "Mengubah rencana") +
    p("Ketuk ikon slider di kanan atas “Misi hari ini” untuk mengubah target, deadline, atau kondisimu kapan saja. Bar di atas halaman menampilkan <b>jam, tanggal Hijriah, dan hitung mundur</b> menuju deadline (merah bila kurang dari 7 hari).") +
    note("tip", "Sudah punya hafalan sebelum memakai aplikasi? Masukkan lewat <b>Murojaah → Sudah punya hafalan?</b> supaya ikut terjadwal dan dihitung sebagai “sudah hafal”.") +
    go("g", "Buka Beranda")
  },

  { id: "z", label: "Ziyadah", icon: "cap", title: "Tab Ziyadah — teknis menghafal ayat baru", html: () =>
    p("Ziyadah memandu sesi hafalan baru dengan <b>5 langkah</b>. Target sesi (mis. “An-Naba 1 – 5”) diambil otomatis dari rencanamu; ayatnya tampil di bawah, dan pewaktu menunjukkan lama sesi dibanding jatah menitmu.") +
    h("play", "Lima langkah sesi") +
    steps([
      ["1. Talqin", "Tekan <b>Putar 3×</b>. Dengarkan tiap ayat 3× sambil melihat teks/mushaf dan ikuti dengan suara pelan. Perhatikan tajwid, panjang-pendek, dan tempat berhenti."],
      ["2. Pahami", "Baca terjemah dan tangkap kata kunci tiap ayat. Makna menjadi jangkar ingatan. Setelah paham, tekan <b>Saya paham</b>."],
      ["3. Tikrar", "Tekan <b>Putar tikrar</b>: tiap ayat diulang <b>10×</b> dalam <b>2 putaran</b>. Ikuti bersuara sampai lancar tanpa melihat. Kualitas lebih penting dari kecepatan."],
      ["4. Uji", "Teks otomatis tertutup. Tekan <b>Latih giliran saya</b>: audio memutar ayat lalu memberi jeda sepanjang ayat agar kamu melantunkannya sendiri. Ketuk teks yang buram untuk mengecek. Tombol <b>Uji langsung di mushaf</b> membuka mode Tutup."],
      ["5. Sambung", "Lantunkan ayat sebelumnya + ayat target berurutan tanpa melihat. Jika lancar, tekan <b>Tandai hafal</b>."]
    ]) +
    p("Gunakan tombol ◀ ▶ untuk mundur/maju langkah bila perlu mengulang.") +
    h("check", "Setelah “Tandai hafal”") +
    ul([
      "Ayat masuk jadwal murojaah; <b>murojaah pertama besok</b> (setelah tidur).",
      "Bila target ziyadah hari ini sudah tercapai, muncul kartu <b>selesai</b>. Disarankan lanjut ke Murojaah; tombol <b>Tambah ayat lagi</b> hanya bila tenaga dan waktumu memang cukup.",
      "Jika semua ayat target sudah masuk jadwal, fokuskan waktu pada Murojaah dan Tes."
    ]) +
    h("bulb", "Tips teknis agar cepat kuat") +
    ul([
      "Hafalkan <b>per ayat</b>, lalu sambungkan dengan ayat sebelumnya. Ayat panjang: pecah menjadi 2–3 penggalan.",
      "Pakai <b>satu mushaf yang sama</b>; letak ayat di halaman membantu memori visual.",
      "Ulangi dengan bersuara — mulut dan telinga ikut menghafal. Saat tikrar, kecepatan 0,75–0,9× di pengaturan audio membantu ketelitian.",
      "Istirahat 5 menit tiap 25 menit agar fokus terjaga.",
      "Ayat sulit atau mirip (mutasyabihat)? Catat ayat pembeda di awal/akhirnya, lalu beri murojaah ekstra."
    ]) +
    note("warn", "<b>Jangan menambah ziyadah saat antrean murojaah menumpuk</b> (lebih dari ±10–20 ayat). Hafalan baru tanpa pengulangan akan cepat hilang. Murojaah dulu, ziyadah kemudian.") +
    note("tip", "Belum menyusun rencana? Tab ini akan mengarahkanmu ke Beranda terlebih dahulu.") +
    go("z", "Buka Ziyadah")
  },

  { id: "m", label: "Murojaah", icon: "repeat", title: "Tab Murojaah — teknis mengulang agar tidak lupa", html: () =>
    p("Murojaah memakai <b>pengulangan berjarak (SRS)</b>: ayat yang kuat diulang jarang, ayat yang lemah diulang sering. Kamu cukup mengerjakan antrean hari ini; aplikasi mengatur sisanya.") +
    h("repeat", "Cara menjalani satu ayat") +
    steps([
      ["1. Lihat ayat sebelumnya", "Aplikasi menampilkan <b>ayat sebelum</b> ayat yang diuji (atau “Awal surat”). Tugasmu: melantunkan <b>lanjutannya</b> dari ingatan, dengan suara."],
      ["2. Tampilkan jawaban", "Tekan <b>Tampilkan Jawaban</b> (atau <b>Spasi</b>). Muncul ayat yang benar beserta terjemah. Tombol <b>Dengar</b> memutar audio, <b>Buka di mushaf</b> melompat ke halamannya."],
      ["3. Nilai dengan jujur", "<b>Mutqin</b> bila lancar tanpa ragu · <b>Ragu</b> bila sempat tersendat · <b>Lupa</b> bila gagal. Tombol menampilkan kapan ayat muncul lagi."]
    ]) +
    h("clock", "Arti tiga penilaian") +
    tbl(["Nilai", "Akibat", "Yang perlu kamu lakukan"], [
      ["<b>Mutqin</b> (tombol 3)", "Interval naik: pertama 3 hari, lalu 7 hari, lalu makin panjang (maks. 365 hari).", "Lanjut ke ayat berikutnya."],
      ["<b>Ragu</b> (tombol 2)", "Interval naik sedikit (±1,2×) dan kemudahan ayat sedikit turun.", "Ulang ayatnya 1–2× lalu lanjut."],
      ["<b>Lupa</b> (tombol 1)", "Interval kembali ke awal dan ayat <b>diulang lagi di sesi yang sama</b>.", "Baca ayatnya, ulang <b>3×</b> sambil melihat, lalu nilai lagi."]
    ]) +
    p("Pintasan keyboard: <b>Spasi</b> atau <b>Enter</b> = tampilkan jawaban · <b>1 / 2 / 3</b> = Lupa / Ragu / Mutqin.") +
    h("flag", "Mengatur beban antrean") +
    ul([
      "Titik angka di tab Murojaah = jumlah ayat yang jatuh tempo hari ini.",
      "Antrean di atas <b>20 ayat</b>? Cicil ±20 ayat per sesi dan <b>tunda ziyadah</b> sampai antrean di bawah 10.",
      "Kerjakan murojaah di waktu yang sama tiap hari (mis. sebelum ziyadah atau setelah Subuh) supaya menjadi kebiasaan.",
      "Grafik <b>Beban murojaah 7 hari</b> di Beranda membantu melihat hari yang akan padat."
    ]) +
    h("upload", "Sudah punya hafalan lama? (di bagian bawah tab Murojaah)") +
    steps([
      ["Pilih rentang", "Tentukan <b>dari surat</b> dan <b>sampai surat</b> hafalanmu."],
      ["Atur ayat per hari", "Pilih 10 / 20 / 40 / 80 ayat per hari agar antrean tidak langsung menumpuk (aplikasi menampilkan perkiraan lama putaran pertama)."],
      ["Masukkan ke jadwal", "Tekan <b>Masukkan ke jadwal</b>. Salah pilih? Tekan <b>Urungkan</b> di notifikasi, atau <b>Keluarkan dari jadwal</b> (riwayat ulangan ayat itu ikut terhapus)."]
    ]) +
    note("ok", "<b>Target akhir (Mutqin):</b> semua ayat berinterval ≥ 7 hari dan skor tes ≥ 90%. Karena itu, nilai jujur lebih berharga daripada nilai bagus — menilai “Mutqin” padahal ragu hanya menunda lupa.") +
    go("m", "Buka Murojaah")
  },

  { id: "t", label: "Tes", icon: "check", title: "Tab Tes — menguji sambung ayat", html: () =>
    p("Tes mengukur apakah hafalanmu benar-benar menempel: kamu diminta memilih <b>ayat yang datang setelah</b> ayat yang ditampilkan.") +
    h("target", "Cara kerja") +
    steps([
      ["Syarat", "Perlu minimal <b>3 ayat</b> (bukan ayat pertama surat) di jadwal hafalanmu. Soal selalu diambil dari hafalanmu sendiri."],
      ["Mulai Tes", "Satu sesi berisi hingga <b>10 soal</b>. Satu ayat ditampilkan; pilih satu dari beberapa pilihan (umumnya empat) untuk ayat lanjutannya."],
      ["Jawaban", "Pilihan benar berwarna hijau, pilihan salah merah. Tekan <b>Lanjut</b> untuk soal berikutnya."],
      ["Skor", "Di akhir muncul skor. Skor ≥ 80% = bagus; di bawah itu perbanyak murojaah."]
    ]) +
    note("warn", "<b>Jawaban salah</b> otomatis menjadwalkan ayat itu untuk murojaah <b>hari ini juga</b>, sehingga kelemahanmu langsung ditangani.") +
    h("bulb", "Kapan dan bagaimana memakainya") +
    ul([
      "<b>Sekali atau dua kali sepekan</b>, atau setelah menyelesaikan satu surat/juz.",
      "Pilih jawaban <b>dari ingatan dulu</b> sebelum melihat pilihan — jangan menebak dari bentuk pilihan.",
      "Pada <b>fase Mutqin</b> (hari-hari terakhir menjelang deadline), perbanyak tes dan targetkan skor ≥ 90%.",
      "Ulangi tes sampai skor stabil tinggi; <b>Ulangi Tes</b> mengambil soal acak baru."
    ]) +
    go("t", "Buka Tes")
  },

  { id: "ai", label: "Mutqin AI", icon: "spark", title: "Mutqin AI — asisten hafalanmu", html: () =>
    p("Mutqin AI menjawab pertanyaan seputar <b>cara memakai MutqinLab</b>, <b>membaca rencana dan kemajuanmu</b>, serta <b>teknik menghafal dan murojaah</b>. Buka lewat tombol <b>Mutqin AI</b> di pojok kanan bawah.") +
    h("user", "Syarat & batas") +
    ul(["Perlu <b>masuk dengan Google</b> agar kuota gratis adil untuk semua pengguna.", "Ada <b>batas pertanyaan per hari</b>; sisanya tampil di bawah kolom ketik. Bila habis, lanjutkan besok.", "Satu pesan maksimal 1.200 karakter. Riwayat percakapan tersimpan di perangkatmu; tombol tempat sampah memulai percakapan baru."]) +
    h("bulb", "Contoh pertanyaan") +
    ul(["<b>Fitur:</b> “Bagaimana cara memasukkan hafalan lamaku ke jadwal?”, “Apa arti titik merah di tab Murojaah?”", "<b>Rencana:</b> “Jelaskan target harianku”, “Kenapa rencanaku dibilang tidak realistis?”, “Aku tertinggal, apa yang sebaiknya kulakukan?”", "<b>Teknik:</b> “Hafalanku cepat lupa”, “Cara membedakan ayat yang mirip”, “Bagaimana mengatur waktu saat sibuk?”"]) +
    h("info", "Cara membaca jawabannya") +
    ul(["Jawaban membedakan <b>dalil</b>, <b>praktik guru/lembaga tahfidz</b>, <b>riset belajar</b>, dan <b>saran praktis</b>.", "Tombol <b>QS …</b> membuka ayat langsung di mushaf; tombol <b>Buka …</b> pindah ke tab yang dimaksud.", "Mutqin AI melihat <b>ringkasan angka</b> rencanamu (target, sisa ayat, antrean murojaah, dsb.) agar saran sesuai kondisimu. Nama dan email tidak ikut dikirim."]) +
    note("warn", "<b>AI bisa keliru.</b> Mutqin AI bukan ustaz dan tidak memberi fatwa. Untuk <b>bacaan, tajwid, makhraj, dan hukum</b>, selalu rujuk guru yang bersanad. Jangan menulis data pribadi di percakapan.") +
    note("tip", "Pertanyaanmu diproses oleh layanan Gemini milik Google. Rinciannya ada di <a href=\"privasi.html\" target=\"_blank\" rel=\"noopener\">kebijakan privasi</a>.")
  },

  { id: "tentang", label: "Tentang", icon: "info", title: "Tentang MutqinLab", html: () =>
    p("Mushaf Madinah 604 halaman untuk membaca, menjaga, dan menguatkan hafalan Al-Qur'an, dilengkapi program tahfidz terpandu dengan jadwal murojaah otomatis.") +
    h("book", "Referensi") +
    ul(["Teks dan font mushaf: QCF v4, Mushaf Madinah.", "Peta halaman dan terjemahan Indonesia Kemenag: Quran.com API.", "Audio murattal: EveryAyah.com.", "Semua sumber gratis."]) +
    h("shield", "Privasi") +
    p("Data hafalanmu tersimpan di perangkat. Jika masuk dengan Google, progres disinkronkan ke akunmu sendiri. Tidak ada iklan dan data tidak dijual. <a href=\"privasi.html\" target=\"_blank\" rel=\"noopener\">Baca kebijakan privasi lengkap</a>. Ingin menghapus akun? Buka <b>Pengaturan → Data → Hapus akun &amp; data cloud</b> (tampil saat kamu sudah masuk).") +
    note("tip", "MutqinLab adalah alat bantu. Ia <b>tidak menggantikan talaqqi</b> kepada guru yang bersanad; mintalah guru mengoreksi bacaan dan tajwidmu.") +
    h("user", "Kurniapedia") +
    `<div class="about-social" aria-label="Media sosial Kurniapedia">
      <a href="https://instagram.com/kurniapedia" target="_blank" rel="noopener noreferrer" aria-label="Instagram Kurniapedia" title="Instagram"><i class="fa-brands fa-instagram" aria-hidden="true"></i><span class="lbl" aria-hidden="true">IG</span></a>
      <a href="https://tiktok.com/@kurniapedia" target="_blank" rel="noopener noreferrer" aria-label="TikTok Kurniapedia" title="TikTok"><i class="fa-brands fa-tiktok" aria-hidden="true"></i><span class="lbl" aria-hidden="true">TT</span></a>
      <a href="https://kurniapedia.my.id" target="_blank" rel="noopener noreferrer" aria-label="Website Kurniapedia" title="kurniapedia.my.id"><i class="fa-solid fa-globe" aria-hidden="true"></i><span class="lbl" aria-hidden="true">WEB</span></a>
    </div>`
  }
];

/* ---------- dialog ---------- */
let cur = "alur", built = false;

function build() {
  if (built) return; built = true;
  const d = document.createElement("dialog");
  d.id = "dlgGuide"; d.className = "modal pg-modal"; d.setAttribute("aria-labelledby", "pgTitle");
  d.innerHTML = `<div class="modal-box">
    <header class="modal-head">
      <h2 id="pgTitle">Panduan & Informasi</h2>
      <button class="icon-btn kecil" type="button" data-close aria-label="Tutup">${ic("x")}</button>
    </header>
    <div class="tabs pg-tabs" role="tablist" aria-label="Bagian panduan">
      ${TABS.map(t => `<button type="button" role="tab" id="pgt-${t.id}" data-pgtab="${t.id}" aria-selected="false" aria-controls="pgBody" tabindex="-1">${ic(t.icon)}<span>${t.label}</span></button>`).join("")}
    </div>
    <div class="modal-body pg-body" id="pgBody" role="tabpanel" tabindex="0"></div>
    <footer class="modal-foot pg-foot">
      <button type="button" class="pg-nav" id="pgPrev">${ic("left")}<span>Sebelumnya</span></button>
      <span class="pg-count" id="pgCount"></span>
      <button type="button" class="pg-nav pg-next" id="pgNext"><span>Berikutnya</span>${ic("right")}</button>
    </footer>
  </div>`;
  document.body.append(d);

  d.addEventListener("click", e => {
    const t = e.target.closest("[data-pgtab]"); if (t) { show(t.dataset.pgtab); return; }
    const v = e.target.closest("[data-pgview]");
    if (v) { const view = v.dataset.pgview; d.close(); const b = document.querySelector(`#viewbar [data-view="${view}"]`); if (b) b.click(); return; }
    if (e.target.closest("#pgPrev")) step(-1); else if (e.target.closest("#pgNext")) step(1);
  });
  // panah kiri/kanan antar tab (fase capture agar tidak bentrok dengan penanganan tablist lain)
  d.querySelector(".pg-tabs").addEventListener("keydown", e => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault(); e.stopPropagation();
    const i = TABS.findIndex(t => t.id === cur), n = TABS.length;
    const j = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + (e.key === "ArrowRight" ? 1 : n - 1)) % n;
    show(TABS[j].id); $("pgt-" + TABS[j].id).focus();
  }, true);
  d.addEventListener("close", () => { try { localStorage.setItem(FLAG, "1"); } catch (e) {} });
}

function step(n) {
  const i = TABS.findIndex(t => t.id === cur), j = Math.max(0, Math.min(TABS.length - 1, i + n));
  show(TABS[j].id);
}

function show(id) {
  const t = TABS.find(x => x.id === id) || TABS[0]; cur = t.id;
  TABS.forEach(x => { const b = $("pgt-" + x.id), on = x.id === t.id; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; if (on && b.scrollIntoView) b.scrollIntoView({ block: "nearest", inline: "center" }); });
  const body = $("pgBody");
  body.setAttribute("aria-labelledby", "pgt-" + t.id);
  body.innerHTML = `<h2 class="pg-title">${t.title}</h2>${t.html()}`;
  body.scrollTop = 0;
  const i = TABS.indexOf(t);
  $("pgPrev").disabled = i === 0; $("pgNext").disabled = i === TABS.length - 1;
  $("pgCount").textContent = `${i + 1} / ${TABS.length}`;
}

/* tab aplikasi yang sedang aktif → bagian panduan yang relevan */
function currentSection() {
  const v = document.body.dataset.view;
  return TABS.some(t => t.id === v) ? v : v === "mushaf" ? "mushaf" : "alur";
}

function open(section) {
  build();
  const d = $("dlgGuide");
  if (d.open) { show(section || currentSection()); return; }
  show(section || currentSection());
  d.showModal();
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-guide]");
  if (!b) return;
  const s = b.dataset.guide;
  open(s && s !== "auto" ? s : undefined);
});

window.PG = { open };

/* Pengguna baru: tampilkan panduan satu kali setelah splash hilang */
(function first() {
  let seen = false; try { seen = !!localStorage.getItem(FLAG); } catch (e) { seen = true; }
  if (seen) return;
  // pengguna lama yang sudah punya rencana/hafalan tidak perlu dibuka otomatis
  try { const T = window.MP && window.MP.S && window.MP.S.tahfidz; if (T && (T.plan || Object.keys(T.items || {}).length)) { localStorage.setItem(FLAG, "1"); return; } } catch (e) {}
  const sp = $("splash");
  const go_ = () => setTimeout(() => { if (!document.querySelector("dialog[open]")) open("alur"); }, 600);
  if (!sp || sp.hidden) return go_();
  const mo = new MutationObserver(() => { if (sp.hidden) { mo.disconnect(); go_(); } });
  mo.observe(sp, { attributes: true, attributeFilter: ["hidden"] });
})();
})();
