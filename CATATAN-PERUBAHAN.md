# MutqinLab — catatan perubahan

## Reset target & Mutqin AI untuk tamu (v26)
- **Tombol Reset target ziyadah** (kanan atas tab Ziyadah): membatalkan ayat yang ditandai hafal *hari ini* dan mengembalikan sesi ke langkah awal. Konfirmasi + tombol **Urungkan**.
- **Tombol Reset target murojaah** (kanan atas tab Murojaah): mengeluarkan semua ayat dari jadwal murojaah (rencana tidak berubah). Konfirmasi + tombol **Urungkan**. Memakai tombstone `x`/`u` sehingga aman untuk sinkronisasi antar perangkat.
- **Mutqin AI tanpa login Google, dibatasi 3 pertanyaan** per perangkat (total). Server (`functions/api/ai.js`) mengenali tamu lewat header `X-Guest-Id` (acak, dibuat di browser) dan menambah batas harian per IP sebagai pengaman. Variabel baru (opsional): `AI_GUEST_LIMIT` (default 3), `AI_GUEST_IP_DAILY` (default 30). Disarankan memasang KV `AI_KV` agar hitungan tamu andal. Setelah jatah habis, jendela AI mengajak masuk dengan Google.
- Panduan dan Kebijakan Privasi diperbarui. Service worker v26.

## Perbaikan audio di HP (v25)
- **Putar dimulai langsung saat ditekan.** Sebelumnya suara baru dimulai setelah beberapa proses menunggu (mis. memuat halaman mushaf), padahal aturan autoplay peramban HP hanya mengizinkan `play()` yang dipicu langsung oleh sentuhan. Kini sumber audio dimuat dan diputar seketika; tampilan halaman menyusul.
- **Penjaga macet 7 detik.** Di jaringan seluler, sambungan ke server audio kadang menggantung tanpa galat (tampak "memutar" tetapi senyap). Kini bila 7 dtk belum ada suara, aplikasi otomatis pindah ke sumber cadangan berikutnya.
- **Sumber cadangan ditambah** (host berbeda, untuk qari Alafasy): `verses.quran.com` dan `verses.quran.foundation`, selain everyayah.com dan cdn.islamic.network. Bila semua gagal, muncul pesan yang menjelaskan kemungkinan jaringan memblokir sumber audio.
- Perbaikan logika: kegagalan ganda/lama tidak lagi melompati sumber cadangan; penolakan autoplay ditangani terpisah (pesan "Ketuk tombol putar sekali lagi") dan tidak dianggap sumber rusak.
- Berkas WAV senyap untuk "membuka kunci" audio diganti yang valid (sebelumnya kosong sehingga bisa ditolak peramban HP).
- "Salin info diagnostik" kini memuat status audio dan riwayat kegagalan sumber.

## Revisi Mutqin AI (v24)
- Warna **biru-ungu** Mutqin AI dikembalikan dan dipakai di **semua tema** (tombol, avatar, gelembung pengguna, tombol kirim, penanda) agar identitas visual AI jelas dan mudah dibedakan dari komponen aplikasi lain.
- Placeholder kolom ketik: **"Tanyakan apa saja di sini.."** (saat belum masuk tetap "Masuk dulu untuk bertanya").

## Penyelarasan warna, tema, dan Mutqin AI
- **Audit warna semua tema** (terang, gelap, sepia, emas hitam, emas putih). Semua teks kini lolos kontras WCAG AA (≥ 4,5:1). Perbaikan: teks emas di tema terang/sepia/emas putih dipakai versi lebih gelap (token baru `--emas-teks`), teks redup & label sekunder dipertegas, warna "berhasil/bahaya" di terang & sepia dipertegas, hijau tombol di tema gelap dan emas tombol di Emas Putih diperdalam agar teks putih terbaca.
- **Mutqin AI tidak lagi biru-ungu**: tombol, avatar, gelembung pengguna, tombol kirim, dan penanda kini memakai warna tema yang sedang aktif (zamrud di terang/gelap, cokelat-zaitun di sepia, emas di tema emas), sehingga serasi di semua tempat.
- **Tombol tema di bilah atas dihapus.** Tema diganti lewat Pengaturan, kini berupa **dropdown** (Otomatis, Terang, Gelap, Sepia, Emas Hitam, Emas Putih).
- Placeholder "Tanya soal hafalan, murojaah, atau fitur…" di kolom ketik Mutqin AI dihapus (petunjuk "Masuk dulu untuk bertanya" tetap tampil hanya saat belum masuk).
- Komentar header `style.css` diperbarui (palet final ada di akhir `tahfidz.css`). Pengetahuan Mutqin AI (`prompt.js`) disesuaikan: tema kini di Pengaturan. Service worker v23.

## Mutqin AI: tombol menempel ke tepi & jendela anti-tertutup-keyboard
- Tombol **Mutqin AI** tetap bisa digeser, tetapi saat dilepas otomatis **menempel ke tepi kiri atau kanan** (mana yang lebih dekat) dengan animasi halus, sehingga tidak menghalangi konten di tengah. Ketinggian dibatasi di dalam layar dan menghormati safe-area (notch/gesture bar). Posisi (sisi + tinggi relatif) diingat per perangkat dan tetap pas saat layar diputar. Posisi lama otomatis dikonversi.
- Jendela percakapan kini mengikuti **visualViewport**: saat keyboard layar muncul, tinggi jendela menyusut dan menempel di atas keyboard (kolom ketik & jawaban terakhir tetap terlihat); peringatan & saran pertanyaan disembunyikan sementara agar ruang percakapan maksimal.
- Di layar sentuh, keyboard tidak langsung terbuka saat jendela dibuka, dan ditutup otomatis setelah kirim agar jawaban terbaca penuh. Ukuran huruf kolom ketik 16px di layar sentuh agar iOS tidak memperbesar halaman saat difokuskan.
- Service worker v22.

## Mutqin AI (baru)
- Tombol mengambang **Mutqin AI** + jendela percakapan (`ai.js`, `ai.css`). Wajib masuk Google; jawaban di-stream; riwayat 24 pesan terakhir tersimpan lokal.
- Backend: `functions/api/ai.js` (Cloudflare Pages Function) — API key Google AI Studio sebagai Secret `GEMINI_API_KEY`, verifikasi Firebase ID token, batas harian per akun (KV `AI_KV`), model utama + cadangan.
- Otak asisten: `functions/_lib/prompt.js` — pengetahuan lengkap fitur MutqinLab (akurat sesuai kode), rujukan terbatas yang boleh dikutip (ayat, hadis berikut nomor, karya ulama, riset belajar), praktik tradisi tahfidz yang diberi label "bukan dalil", aturan anti-karang dalil, batas fatwa/tajwid, dan penanganan pengguna tertekan.
- Konteks pengguna: `TH.aiContext()` di `tahfidz.js` mengirim ringkasan ANGKA rencana (tanpa nama/email).
- Penanda interaktif di jawaban: `[QS 54:17]` membuka ayat di mushaf; `[[tab:m]]` pindah tab.
- Panduan: tab baru "Mutqin AI". Privasi: bagian Mutqin AI (termasuk catatan bahwa tingkat gratis Gemini dapat dipakai Google untuk meningkatkan produk). Service worker v17.
- Setup: lihat `SETUP-MUTQIN-AI.md` (di luar zip).

## Panduan penggunaan (baru)
- `panduan.js` + gaya di `tahfidz.css`: popup panduan rinci dengan 7 bagian — Alur · Mushaf · Beranda (perencanaan) · Ziyadah · Murojaah · Tes · Tentang.
- Satu tombol info (ⓘ) di bilah atas membuka panduan, langsung ke bagian sesuai tab aktif. Dialog "Tentang" digabung menjadi tab terakhir "Tentang" (referensi + medsos Kurniapedia); tombol (?) dan tombol "Panduan" terpisah dihapus.
- Splash screen: teks Arab di bawah judul MutqinLab dihapus.
- Pengguna baru melihatnya otomatis satu kali; pengguna lama yang sudah punya rencana/hafalan tidak diganggu.
- Isi mengikuti rumus aplikasi: pembagian 60% ziyadah / 40% murojaah, fase Mutqin ±15% hari terakhir, 5 langkah ziyadah, interval SRS (3 → 7 hari → ×kemudahan), arti Lupa/Ragu/Mutqin, impor hafalan lama, dan cara kerja Tes.
- Service worker v14 (panduan.js masuk cache luring).

## Persiapan launching
- `og-image.png` (1200×630) + meta Open Graph/Twitter/canonical di `index.html` agar link tampil rapi saat dibagikan ke WhatsApp dll.
  **PENTING:** ganti `https://mutqinlab.pages.dev` di `index.html` (og:url, og:image, twitter:image, canonical) dengan domain produksi sebenarnya.
- `privasi.html`: kebijakan privasi (tertaut dari footer dan tab Tentang). Service worker v15.
- **Hapus akun & data cloud** (Pengaturan → Data; hanya tampil saat sudah masuk): konfirmasi → verifikasi ulang Google → hapus dokumen `progres_hafalan/{uid}` → hapus akun Firebase Auth. Sinkronisasi dijeda selama proses agar dokumen tidak tertulis ulang. Data lokal tidak ikut terhapus. Service worker v16.
- Tab Tentang: ringkasan privasi + catatan bahwa aplikasi tidak menggantikan talaqqi.

## Bar jam
- Jam, tanggal, dan hitung mundur target kini statis: tiap digit berlebar tetap sehingga baris tidak bergeser mengikuti detik.

## Media sosial
- Ikon YouTube diganti tautan situs https://kurniapedia.my.id (ikon globe) di dialog Tentang.
- Bilah atas pada layar ≤480px menyembunyikan teks nama merek agar tombol muat.

## Perbaikan bug
- Pintasan keyboard mushaf (Spasi, 1/2/3, B, M, panah) tidak lagi aktif di tab Beranda/Ziyadah/Murojaah/Tes (sebelumnya Spasi di Murojaah ikut memutar audio dan B/M menandai halaman tersembunyi).
- Audio dari panel tahfidz tidak lagi memuat halaman mushaf di belakang layar.
- "Lupa" di Murojaah kini diulang lagi di sesi yang sama; antrean diurutkan stabil.
- Penghitung ziyadah memakai hari pembuatan (`c`), bukan tebakan dari interval.
- Setelah target ziyadah tercapai tampil kartu "selesai" (tidak lagi menampilkan batch besok), ada tombol "Tambah ayat lagi".
- Interval SRS dibatasi 365 hari; jam berhenti saat tab tersembunyi.

## Fitur baru
- Impor hafalan lama ke jadwal murojaah (dibagi bertahap, bisa diurungkan / dikeluarkan).
- Unduh seluruh mushaf untuk mode luring (Pengaturan → Mode luring).
- Prakiraan beban murojaah 7 hari di Beranda.
- Pintasan PWA (?v=m, ?v=mushaf) dan toast "Versi baru siap".

## Arsitektur / performa
- Ikon PNG (192, 512, maskable, apple-touch) + manifest diperbarui; icon.svg dari 10 KB jadi 2 KB.
- Font Awesome dimuat malas (hanya dialog Tentang), dengan fallback teks.
- Service worker v13: cache data tidak diberi versi (unduhan luring aman saat update), fallback navigasi luring.
- Sinkron Firestore: perpindahan halaman ditunda 20 dtk, dorongan identik dilewati, flush saat aplikasi disembunyikan.
- `_headers` (Cloudflare Pages) dan `firestore.rules`.
