# Enigma Simulator

Simulator 3D mesin Enigma I (3 rotor) yang berjalan di browser. Mesinnya bisa diputar, di-zoom, diketik, dan dilihat jalur arusnya.

**Coba langsung:** https://ramantyads.github.io/Enigma-Simulator/

## Fitur

- Mesin 3D interaktif: tombol turun, rotor berputar, lampu menyala
- Enkripsi akurat: rotor I–V, reflector UKW-A/B/C, ring setting, posisi awal, plugboard, termasuk anomali double-stepping
- Mode X-ray: jalur arus dari tombol ke lampu terlihat menyala, ada opsi slow motion
- Tutup rotor bisa dibuka
- Plugboard 3D: klik dua soket untuk mencolok kabel, klik colokan untuk mencabut. Kabel menjuntai ke meja seperti mesin asli
- Suara klik mekanis untuk tombol, rotor, setting, dan colokan
- Misi: dekripsi contoh pesan dari buku panduan Enigma (Wikipedia Jerman)
- Latihan interaktif: 10 latihan bertahap, jawaban dicek otomatis dan progres tersimpan
- Demo cara Turing memecahkan Enigma: geser crib di sepanjang ciphertext dan lihat posisi yang mustahil
- Lembar kunci bulanan: kata sandi yang sama selalu menghasilkan tabel kunci yang sama, bisa dicetak
- Putar output sebagai kode Morse
- Salin link pesan: link berisi kunci dan ciphertext, penerima tinggal mengetik untuk membacanya
- Preset kamera: Operator, Rotor, Plugboard, Samping
- Catatan input/output dalam kelompok 5 huruf

## Cara pakai

1. Ketik di keyboard laptop atau klik tombol di mesin.
2. Atur kunci di panel **Setting**: rotor, ring, posisi awal, plugboard.
3. Untuk mendekripsi: klik **Reset ke posisi awal**, lalu ketik ciphertext dengan setting yang sama.

Klik rotor untuk memutarnya (Shift+klik untuk mundur). Mesin dibuka dengan kunci contoh dari Wikipedia (10 kabel plugboard).

Mau belajar dekripsi? Coba 10 latihan bertahap beserta kunci jawabannya di [LATIHAN.md](LATIHAN.md).

## Pengembangan

```bash
npm install
npm run dev    # http://localhost:5173/Enigma-Simulator/
npm test       # test engine enkripsi
npm run build
```

Setiap push ke `main` otomatis di-deploy ke GitHub Pages lewat GitHub Actions.

Stack: Vite, React, TypeScript, React Three Fiber, drei, Zustand, Vitest.

Engine enkripsi ada di [`src/engine/enigma.ts`](src/engine/enigma.ts), terpisah dari kode 3D. Rencana lengkap ada di [PRD.md](PRD.md).
