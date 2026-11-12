# Latihan Enigma

Ada 10 latihan yang bisa dikerjakan di [simulator](https://ramantyads.github.io/Enigma-Simulator/), dari yang paling gampang sampai yang paling sulit. Kunci jawabannya ada di bagian paling bawah. Semua jawaban dihitung langsung dengan engine simulator ini.

Versi interaktifnya ada di simulator: buka panel **Setting → Belajar → Latihan**. Kuncinya terpasang otomatis dan jawabanmu langsung dicek.

## Cara memasang kunci

Pengaturan ada di panel **Setting → Kunci harian**:

- **Reflector (UKW):** dropdown paling atas.
- **Rotor:** ada 3 kolom (Kiri, Tengah, Kanan), masing-masing punya 3 baris:
  1. dropdown nama rotor (I–V)
  2. dropdown ring, misalnya "A (01)"
  3. posisi awal, diubah dengan tombol ▲▼
- **Plugboard:** ketik pasangan huruf, misalnya `AB CD EF`, lalu tekan **Enter**. Kalau latihannya menulis "kosong", hapus semua isinya lalu tekan Enter.

**Wajib:** setelah semua kunci terpasang, klik **Reset ke posisi awal** sebelum mulai mengetik. Mengganti rotor atau ring tidak otomatis mereset posisi rotor.

Cara membaca notasinya: `Rotor I-II-III` berarti Kiri = I, Tengah = II, Kanan = III. `Ring AAA` dan `Posisi awal KOP` dibaca dengan urutan yang sama, kiri-tengah-kanan. Huruf X dipakai sebagai pengganti spasi.

## Level 1: Pemanasan

**Latihan 1: dekripsi pertama**
- Kunci: UKW-B · Rotor I-II-III · Ring AAA · Posisi awal AAA · Plugboard kosong
- Ketik ciphertext berikut: `IDBM`

**Latihan 2: pesan yang lebih panjang**
- Kuncinya sama dengan Latihan 1. Klik Reset dulu.
- Ketik ciphertext berikut: `JLBGH WHAUT UX`

## Level 2: Ganti satu bagian kunci

**Latihan 3: posisi awal berbeda**
- Kunci: UKW-B · Rotor I-II-III · Ring AAA · **Posisi awal KOP** · Plugboard kosong
- Ketik ciphertext berikut: `TGKGG KCUOZ ABTDB`

**Latihan 4: pakai plugboard**
- Kunci: UKW-B · Rotor I-II-III · Ring AAA · Posisi awal AAA · **Plugboard `AB CD EF`**
- Ketik ciphertext berikut: `VJTDALJ`

**Latihan 5: urutan rotor dan ring berbeda**
- Kunci: UKW-B · **Rotor II-IV-V** · **Ring BUL** · Posisi awal XYZ · Plugboard kosong
- Ketik ciphertext berikut: `VYBSG BQCHT KCCW`

## Level 3: Kunci lengkap

**Latihan 6: semua setting diganti**
- Kunci: **UKW-C** · Rotor V-III-I · Ring CCC · Posisi awal NIH · Plugboard `QW ER TY UI OP`
- Ketik ciphertext berikut: `OONFX YNFTK EICMV`

**Latihan 7: giliran kamu mengenkripsi**
- Kunci: UKW-B · Rotor IV-I-II · Ring AAA · Posisi awal BOS · Plugboard `HO JK`
- Ketik pesan biasa `ENIGMA`. Ciphertext apa yang keluar?

## Level 4: Memahami cara kerja mesin

**Latihan 8: sengaja lupa Reset**
1. Kerjakan Latihan 1: pasang kuncinya, klik Reset, lalu ketik `IDBM`.
2. **Jangan klik Reset.** Ketik `IDBM` sekali lagi.
3. Apa yang keluar, dan kenapa? Lihat "Posisi rotor sekarang" di bagian Status.

**Latihan 9: anomali double-step**
- Kunci: UKW-B · Rotor I-II-III · Ring AAA · **Posisi awal ADU**
- Klik Reset, lalu tekan huruf apa saja 4 kali. Catat "Posisi rotor sekarang" setiap selesai menekan. Perhatikan rotor tengah.

**Latihan 10: prosedur kunci pesan zaman perang**

Dulu operator tidak mengenkripsi seluruh pesan dengan posisi awal harian. Mereka memilih 3 huruf acak sebagai kunci pesan, mengenkripsi 3 huruf itu, lalu mengirimkannya di depan pesan.

- Kunci harian: UKW-B · Rotor I-II-III · Ring AAA · Plugboard `AB CD`
- Pesan yang diterima: indikator `WZA IYK`, isi `LHPMY EHYNR CZKS`

Langkahnya:
1. Set posisi awal ke **WZA**, klik Reset, lalu ketik `IYK`. Hasilnya adalah kunci pesan.
2. Set posisi awal ke kunci pesan tersebut, klik Reset, lalu ketik isi pesannya.

---

## Kunci jawaban

| No | Jawaban |
|---|---|
| 1 | `HALO` |
| 2 | `SELAMATXPAGI` (selamat pagi) |
| 3 | `KOPIXSUDAHXSIAP` (kopi sudah siap) |
| 4 | `RAHASIA` |
| 5 | `TEMUXDIXKANTIN` (temu di kantin) |
| 6 | `MAKANXSIANGXYUK` (makan siang yuk) |
| 7 | `TWTYNT` |
| 8 | Hasilnya `DVJN`. Rotor sudah bergeser dari AAA ke AAE, jadi mesin tidak lagi mulai dari titik yang sama dengan pengirim. |
| 9 | `ADV → AEW → BFX → BFY`. Dari AEW ke BFX, rotor tengah maju dua kali berturut-turut (D → E → F). Itulah yang disebut double-step. |
| 10 | Kunci pesan: `SUN`. Isi pesan: `SANDIXBERHASIL` (sandi berhasil). |

## Kalau jawaban tidak cocok

- Lupa klik **Reset**.
- Plugboard belum di-Enter, atau masih ada kabel dari latihan sebelumnya.
- Rotor Kiri dan Kanan tertukar.
- Ring dan posisi awal tertukar barisnya: ring ada di dropdown kedua, posisi awal ada di baris ▲▼.
