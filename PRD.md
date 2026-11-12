# PRD — Enigma 3D Simulator

| | |
|---|---|
| **Status** | Draft v0.1 |
| **Tanggal** | 12 November 2026 |
| **Tipe** | Proyek pribadi, publik (GitHub Pages) |

---

## 1. Ringkasan

Simulator mesin Enigma I (3 rotor) berbasis web 3D yang realistis. Pengguna duduk "di depan" mesin di atas meja kerja, bisa memutar dan zoom kamera, menekan tombol, melihat rotor berputar dan lampu menyala, serta melihat jalur arus listrik di dalam mesin. Enkripsinya harus **akurat secara historis**: hasilnya identik dengan mesin asli untuk setting yang sama.

## 2. Tujuan

1. **Seru dimainkan.** Terasa seperti mengoperasikan mesin sungguhan, bukan form input/output.
2. **Akurat.** Engine lulus test vector mesin asli, termasuk anomali double-stepping.
3. **Mudah dipahami.** Orang awam bisa melihat *bagaimana* satu huruf berubah jadi huruf lain (mode X-ray).
4. **Bisa dibagikan.** Cukup kirim link, terbuka di browser desktop maupun HP.

### Bukan tujuan (v1)

- Enigma M4 (4 rotor, Angkatan Laut) atau varian lain
- Simulasi Bombe / pemecahan kode otomatis
- Backend, akun pengguna, multiplayer
- Model 3D hasil scan/Blender dengan detail museum

## 3. Target pengguna

| Pengguna | Kebutuhan |
|---|---|
| Pemilik proyek | Eksperimen, belajar 3D web, bangga memamerkan hasilnya |
| Pengunjung umum (teman, kolega) | Buka link, langsung bisa coba tanpa membaca manual |
| Penggemar sejarah/kriptografi | Setting lengkap dan hasil yang bisa dicocokkan dengan sumber sejarah |

## 4. Pengalaman pengguna

### 4.1 Alur utama

1. Buka halaman → **intro sinematik**: kamera turun ke meja, tutup kotak kayu terbuka (bisa di-skip).
2. Kamera berhenti di **tampilan Operator**. Muncul petunjuk singkat: "Ketik sesuatu".
3. Pengguna mengetik → tombol turun, rotor kanan berputar, satu lampu menyala, huruf tercatat di kertas.
4. Pengguna membuka **panel Setting** untuk mengganti rotor, ring, posisi, dan plugboard.
5. Pengguna mencoba **mode X-ray** untuk melihat jalur arus.
6. Pengguna menyalin hasil atau membuat **link share**.

### 4.2 Kamera

- Orbit bebas (putar, zoom, geser) dengan batas supaya kamera tidak menembus meja atau terlalu jauh.
- Preset kamera dengan transisi halus:
  - **Operator**: pandangan dari depan-atas, seperti duduk di kursi
  - **Rotor**: close-up jendela dan roda rotor
  - **Plugboard**: bagian depan bawah
  - **X-ray**: sudut yang memperlihatkan seluruh jalur sinyal

### 4.3 Komponen mesin yang interaktif

| Komponen | Interaksi | Feedback |
|---|---|---|
| Keyboard (26 tombol, layout QWERTZU asli) | Keyboard fisik atau klik/tap | Tombol turun, suara "clack" |
| Lampboard (26 lampu) | — | Lampu menyala selama tombol ditekan, cahayanya menerangi sekitar |
| Rotor (3 buah) | Scroll/drag roda untuk mengubah posisi | Huruf di jendela berubah, suara klik |
| Tutup dalam | Klik untuk buka/tutup | Rotor terlihat dan bisa ditukar |
| Plugboard | Drag kabel antar soket (fase 4); sebelumnya lewat panel | Kabel terpasang secara visual |
| Kertas catatan | — | Output ditulis dalam kelompok 5 huruf |

Catatan: hanya satu tombol boleh aktif sekaligus, sama seperti mesin asli.

### 4.4 Mode X-ray

- Casing kayu dan penutup menjadi semi-transparan.
- Saat tombol ditekan, garis bercahaya berjalan: tombol → plugboard → rotor kanan → tengah → kiri → reflector → kiri → tengah → kanan → plugboard → lampu.
- Tiap titik menampilkan label huruf (misal `A → plugboard → F → rotor III → ...`).
- Ada opsi **slow motion** untuk melihat tahap demi tahap.

### 4.5 Panel Setting

- Reflector: UKW-B (default), UKW-A, UKW-C
- Rotor: pilih 3 dari I–V beserta urutannya (kiri, tengah, kanan)
- Ring setting (Ringstellung): A–Z per rotor
- Posisi awal (Grundstellung): A–Z per rotor
- Plugboard: 0–13 pasangan, default 10 (praktik umum Wehrmacht)
- Tombol **Reset ke posisi awal** dan **Hapus catatan**

### 4.6 Fitur tambahan

- **Misi "Pesan dari 1941"**: pengguna diberi kunci harian dan ciphertext historis asli, lalu mendekripsinya sendiri.
- **Share link**: setting + ciphertext dikodekan di URL hash (`#...`), tidak ada server. Opsi untuk membuat link *tanpa* kunci.
- **Suara**: tombol, rotor step, tutup. Bisa dimatikan.

## 5. Spesifikasi engine enkripsi

Engine adalah modul TypeScript murni tanpa ketergantungan ke React atau Three.js, supaya bisa dites terpisah.

### 5.1 Data komponen (Enigma I)

| Rotor | Wiring (A→Z) | Notch (turnover saat jendela pindah dari → ke) |
|---|---|---|
| I | `EKMFLGDQVZNTOWYHXUSPAIBRCJ` | Q → R |
| II | `AJDKSIRUXBLHWTMCQGZNPYFVOE` | E → F |
| III | `BDFHJLCPRTXVZNYEIWGAKMUSQO` | V → W |
| IV | `ESOVPZJAYQUIRHXLNFTGKDCMWB` | J → K |
| V | `VZBRGITYUPSDNHLXAWMJQOFECK` | Z → A |

| Reflector | Wiring |
|---|---|
| UKW-A | `EJMZALYXVBWFCRQUONTSPIKHGD` |
| UKW-B | `YRUHQSLDPXNGOKMIEBFZCWVJAT` |
| UKW-C | `FVPJIAOYEDRZXWGCTKUQSBNMHL` |

### 5.2 Aturan

1. **Stepping terjadi sebelum enkripsi.** Setiap tombol ditekan, rotor berputar dulu, baru arus lewat.
2. Rotor kanan selalu maju satu langkah.
3. Jika rotor kanan berada di posisi notch, rotor tengah ikut maju.
4. **Double-stepping**: jika rotor tengah berada di posisi notch-nya, rotor tengah *dan* rotor kiri sama-sama maju.
5. Ring setting menggeser wiring relatif terhadap huruf di jendela; posisi notch mengikuti huruf di jendela, bukan wiring.
6. Plugboard ditukar di awal dan di akhir jalur.
7. Engine mengembalikan **jalur lengkap** (huruf di setiap tahap) untuk keperluan mode X-ray, bukan hanya huruf akhir.

### 5.3 Test vector (wajib lulus)

| Kasus | Setting | Input | Output yang diharapkan |
|---|---|---|---|
| Dasar | UKW-B, rotor I-II-III, ring AAA, posisi AAA, tanpa plugboard | `AAAAA` | `BDZGO` |
| Double-step | rotor I-II-III, posisi awal `ADU`, tekan 4 tombol | — | Jendela: `ADV`, `AEW`, `BFX`, `BFY` |
| Resiprokal | setting acak | plaintext acak | Enkripsi dua kali = plaintext semula |
| Tidak pernah ke dirinya sendiri | setting acak | 10.000 huruf acak | Tidak ada huruf yang terenkripsi menjadi dirinya sendiri |
| Historis | Pesan asli yang terdokumentasi (sumber dan setting dicatat di fase 1) | ciphertext asli | plaintext asli |

> Test vector historis harus diambil dan diverifikasi dari sumber tertulis di fase 1, tidak ditulis dari ingatan.

## 6. Arah visual

- **Suasana**: meja kayu tua, lampu meja hangat, latar gelap. Fokus ke mesin.
- **Material PBR**: kayu oak (kotak), bakelit hitam (tombol), kuningan (sekrup, ring rotor), logam hitam doff (panel), kulit (tali), kaca (lampu).
- **Tekstur**: CC0 dari Poly Haven atau ambientCG.
- **Pencahayaan**: HDRI interior + satu lampu utama dengan bayangan lembut.
- **Model**: dibangun lewat kode (geometri prosedural) supaya setiap bagian bisa dianimasikan. Proporsi mengacu ke foto dan dimensi Enigma I asli (sekitar 34 × 28 × 15 cm).

## 7. Teknologi

| Bagian | Pilihan |
|---|---|
| Build | Vite |
| UI | React + TypeScript |
| 3D | Three.js via React Three Fiber + drei |
| Efek | @react-three/postprocessing (bloom untuk lampu dan garis X-ray) |
| State | Zustand |
| Test | Vitest |
| Hosting | GitHub Pages, deploy otomatis via GitHub Actions |

## 8. Kebutuhan non-fungsional

| Aspek | Target |
|---|---|
| Performa desktop | 60 fps di laptop kantor biasa |
| Performa HP | ≥ 30 fps di HP kelas menengah; efek berat (bayangan, bloom) otomatis diturunkan |
| Ukuran awal | Total aset < 15 MB, tampilkan loading progress |
| Browser | Chrome, Edge, Firefox, Safari versi terbaru (WebGL2) |
| Input | Keyboard fisik, mouse, dan sentuh |
| Responsif | Panel setting bisa dipakai di layar 375 px |
| Aksesibilitas | Panel setting bisa dioperasikan dengan keyboard; ada mode "tanpa animasi" |

## 9. Tahapan

| Fase | Isi | Selesai jika |
|---|---|---|
| **1. Engine** | Engine TS, test vector, UI 2D minimal | Semua test di 5.3 lulus |
| **2. Mesin 3D dasar** | Scene, kotak, keyboard, lampboard, rotor, orbit + preset kamera, animasi tombol/lampu/rotor | Mengetik di 3D menghasilkan output yang sama dengan engine |
| **3. Realisme** | Material PBR, HDRI, bayangan, suara, loading screen | Terlihat seperti foto mesin asli dari sudut Operator |
| **4. Fitur andalan** | Mode X-ray + slow motion, plugboard drag, buka tutup & tukar rotor | Jalur sinyal di layar sesuai dengan jalur dari engine |
| **5. Bonus** | Intro sinematik, kertas catatan, misi 1941, share link | Link share bisa dibuka dan didekripsi di perangkat lain |
| **6. Rilis** | Deploy GitHub Pages, optimasi HP, README | Bisa dibuka publik dan memenuhi target di bagian 8 |

## 10. Kriteria sukses

- Semua test engine lulus di CI.
- Orang yang belum pernah melihat Enigma bisa mengenkripsi lalu mendekripsi pesan sendiri tanpa membaca manual.
- Misi "Pesan dari 1941" bisa diselesaikan dan menghasilkan plaintext historis yang benar.
- Berjalan lancar di desktop dan HP sesuai bagian 8.

## 11. Risiko

| Risiko | Mitigasi |
|---|---|
| Visual kurang realistis karena model prosedural | Fokus ke material, pencahayaan, dan bevel di tepi geometri; tambah normal map untuk detail kecil |
| Berat di HP | Tekstur dikompres, level detail adaptif, bayangan bisa dimatikan |
| Scope melebar | Fase 1–3 adalah inti; fase 4–5 boleh dipangkas |
| Folder project ada di OneDrive | `node_modules` dan `dist` membuat sync berat; pertimbangkan pindah folder kerja ke luar OneDrive (repo GitHub sudah jadi backup) |

## 12. Pertanyaan terbuka

1. Nama proyek dan nama repo GitHub?
2. Bahasa antarmuka: Indonesia, Inggris, atau keduanya?
3. Ada custom domain, atau cukup `username.github.io/enigma-3d`?
4. Folder kerja tetap di OneDrive atau dipindah (lihat risiko di atas)?
