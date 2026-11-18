# MutqinLab — catatan perubahan

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
