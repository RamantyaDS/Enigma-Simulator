import { useEffect, useState, type ReactNode } from 'react';
import { ALPHABET, REFLECTORS, ROTORS, run, SignalPath, toIndices, toLetters } from '../engine/enigma';
import { startExercise } from '../exercises';
import { useStore } from '../store';
import { CHAPTERS, endTour, later, openChapter, pressDemo, resetDemo, TEACH_KEY, typeDemo } from '../tour';

const group5 = (t: string) => t.replace(/(.{5})/g, '$1 ').trim();

/** Glossary term: German name plus what it means. */
const Term = ({ de, children }: { de: string; children: ReactNode }) => (
  <p className="term">
    <strong>{de}</strong> · {children}
  </p>
);

const Try = ({ children, onClick }: { children: ReactNode; onClick: () => void }) => (
  <button className="try" onClick={onClick}>
    ▶ {children}
  </button>
);

const Tech = ({ children }: { children: ReactNode }) => (
  <details className="tech">
    <summary>Detail teknis</summary>
    {children}
  </details>
);

/** The last key press, told step by step in plain words. */
function Trace({ path }: { path: SignalPath | null }) {
  const rotors = useStore((s) => s.settings.rotors);
  const reflector = useStore((s) => s.settings.reflector);
  if (!path) return <p className="hint">Tekan tombol "Coba" atau ketik huruf apa saja untuk melihat perjalanan arusnya.</p>;
  const L = (i: number) => ALPHABET[i];
  const steps = [
    `Kamu menekan ${L(path.key)}`,
    path.plugIn === path.key ? `Plugboard: ${L(path.key)} tidak dicolok, lewat apa adanya` : `Plugboard: kabel menukar ${L(path.key)} jadi ${L(path.plugIn)}`,
    `Rotor kanan (${rotors[2]}): ${L(path.plugIn)} jadi ${L(path.forward[0])}`,
    `Rotor tengah (${rotors[1]}): jadi ${L(path.forward[1])}`,
    `Rotor kiri (${rotors[0]}): jadi ${L(path.forward[2])}`,
    `Reflektor UKW-${reflector} memantulkan: ${L(path.forward[2])} jadi ${L(path.reflector)}`,
    `Kembali lewat rotor kiri: jadi ${L(path.backward[0])}`,
    `Rotor tengah: jadi ${L(path.backward[1])}`,
    `Rotor kanan: jadi ${L(path.backward[2])}`,
    path.lamp === path.backward[2] ? `Plugboard: ${L(path.lamp)} tidak dicolok` : `Plugboard: kabel menukar ${L(path.backward[2])} jadi ${L(path.lamp)}`,
    `Lampu ${L(path.lamp)} menyala`,
  ];
  return (
    <ol className="trace">
      {steps.map((t, i) => (
        <li key={i} className={i === 5 ? 'turn' : i === steps.length - 1 ? 'end' : ''}>
          {t}
        </li>
      ))}
    </ol>
  );
}

function LiveTrace() {
  return <Trace path={useStore((s) => s.path)} />;
}

function Tape() {
  const input = useStore((s) => s.input);
  const output = useStore((s) => s.output);
  return (
    <div className="mini-tape">
      <span>Input</span>
      <code>{group5(input) || '—'}</code>
      <span>Output</span>
      <code className="out">{group5(output) || '—'}</code>
    </div>
  );
}

const Position = () => <strong className="pos">{toLetters(useStore((s) => s.positions))}</strong>;

function Overview() {
  return (
    <>
      <p>
        Enigma pada dasarnya adalah <b>senter dengan kabel yang diacak</b>. Saat tombol ditekan, arus dari baterai mengalir lewat serangkaian kabel dan
        menyalakan satu lampu huruf. Rahasianya, sebagian kabel itu ada di dalam rotor yang <b>berputar setiap kali tombol ditekan</b>, jadi jalurnya
        selalu berubah.
      </p>
      <div className="flow">
        {['Keyboard', 'Plugboard', 'Roda masuk', 'Rotor ×3', 'Reflektor', 'Rotor ×3', 'Plugboard', 'Lampu'].map((x, i) => (
          <span key={i}>{x}</span>
        ))}
      </div>
      <p>
        Garis <span className="amber">kuning</span> adalah arus yang berangkat, garis <span className="cyan">biru</span> adalah arus yang dipantulkan
        balik. Bab-bab berikutnya membahas tiap bagiannya satu per satu.
      </p>
      <Try
        onClick={() => {
          useStore.setState({ slow: true });
          pressDemo('A');
        }}
      >
        Tekan A pelan-pelan
      </Try>
      <LiveTrace />
    </>
  );
}

function Keyboard() {
  const output = useStore((s) => s.output);
  return (
    <>
      <Term de="Tastatur">papan ketik</Term>
      <p>
        Ada 26 tombol huruf dengan susunan QWERTZ ala Jerman. Tidak ada angka, spasi, atau tanda baca. Operator menulis angka dengan huruf (EINS, ZWEI)
        dan memakai <b>X</b> sebagai pengganti spasi atau titik.
      </p>
      <p>Menekan tombol melakukan dua hal sekaligus:</p>
      <ol>
        <li>
          <b>Mendorong rotor kanan</b> maju satu huruf, secara mekanis.
        </li>
        <li>
          <b>Menyambungkan arus</b> listrik ke jalur huruf itu, sehingga satu lampu menyala.
        </li>
      </ol>
      <p>
        Urutannya penting: rotor bergerak <i>dulu</i>, baru arus mengalir. Posisi rotor sekarang: <Position />
      </p>
      <Try onClick={() => typeDemo('QQQ', 1100)}>Tekan Q tiga kali</Try>
      {output && (
        <p className="hint">
          Q yang sama menghasilkan <b>{group5(output)}</b>. Hurufnya beda-beda karena rotor bergeser setiap kali tombol ditekan.
        </p>
      )}
    </>
  );
}

function Plugboard() {
  const plugged = useStore((s) => s.settings.plugboard);
  return (
    <>
      <Term de="Steckerbrett">papan colokan</Term>
      <p>
        Panel di depan mesin dengan 26 soket. Setiap kabel <b>menukar sepasang huruf</b>: kalau A dan B dicolok, A berubah jadi B dan B berubah jadi A.
        Huruf yang tidak dicolok lewat apa adanya.
      </p>
      <p>
        Arus melewati plugboard <b>dua kali</b>, yaitu saat berangkat dan saat kembali ke lampu. Tentara Jerman biasanya memakai 10 kabel, jadi hanya 6
        huruf yang tidak tertukar.
      </p>
      <p>
        Kenapa penting? Plugboard adalah penyumbang kombinasi terbesar: dengan 10 kabel ada sekitar <b>150 triliun</b> cara memasangnya. Ini bagian
        yang paling menyulitkan para pemecah kode.
      </p>
      <Try
        onClick={() => {
          useStore.getState().setSettings({ plugboard: 'AB' });
          useStore.setState({ slow: true });
          later(400, () => pressDemo('A'));
        }}
      >
        Colok kabel A–B, lalu tekan A
      </Try>
      {plugged && <p className="hint">Kabel terpasang: {plugged}. Kamu juga bisa klik soket di mesin untuk mencolok kabel sendiri.</p>}
      <LiveTrace />
    </>
  );
}

function Entry() {
  return (
    <>
      <Term de="Eintrittswalze (ETW)">roda masuk</Term>
      <p>
        Lempeng diam di sebelah kanan rotor. Tugasnya sederhana: menyambungkan kabel dari plugboard ke 26 kontak rotor kanan. Di Enigma I, sambungannya
        lurus: A ke kontak A, B ke kontak B, dan seterusnya.
      </p>
      <p>
        <b>Cerita kecil:</b> di Enigma versi komersial, sambungan ini mengikuti urutan keyboard (Q, W, E, ...). Saat Marian Rejewski dari Polandia
        mencoba merekonstruksi mesin militer, perhitungannya tidak cocok sampai ia menebak bahwa Jerman memakai urutan alfabet biasa. Tebakannya benar,
        dan rotornya terpecahkan.
      </p>
      <Try onClick={() => pressDemo('A')}>Tekan A dan lihat arus masuk</Try>
    </>
  );
}

function Rotor() {
  const output = useStore((s) => s.output);
  return (
    <>
      <Term de="Walzen">rotor atau roda sandi</Term>
      <p>
        Inti Enigma. Setiap rotor adalah piringan dengan 26 kontak di setiap sisi. Di dalamnya, kabel menghubungkan kontak secara acak. Contohnya rotor I:
      </p>
      <div className="wiring">
        <code>{ALPHABET}</code>
        <code>{ROTORS.I.wiring}</code>
      </div>
      <p>
        Artinya A keluar sebagai E, B sebagai K, dan seterusnya. Tiga rotor yang berderet membuat huruf diacak tiga kali. Karena rotor berputar, kabel
        acakannya ikut bergeser, jadi <b>setiap tombol ditekan, mesin seolah memakai sandi yang baru</b>.
      </p>
      <p>
        Operator memilih 3 dari 5 rotor (I sampai V) dan urutannya. Ada <b>60 susunan</b> yang mungkin, dan susunan ini termasuk bagian dari kunci harian
        (<i>Walzenlage</i>).
      </p>
      <Try onClick={() => typeDemo('AAA', 1400)}>Tekan A tiga kali dan lihat jalurnya berubah</Try>
      {output && <p className="hint">Hasilnya {group5(output)}: tiga huruf yang berbeda dari tombol yang sama.</p>}
      <Tech>
        <p>Kabel kelima rotor (huruf ke-n adalah hasil untuk huruf ke-n dalam alfabet):</p>
        {Object.entries(ROTORS).map(([name, r]) => (
          <p key={name} className="mono">
            {name.padEnd(3)} {r.wiring}
          </p>
        ))}
      </Tech>
    </>
  );
}

function Start() {
  return (
    <>
      <Term de="Grundstellung">posisi awal</Term>
      <p>
        Huruf yang terlihat di tiga jendela kecil di tutup rotor. Huruf ini menunjukkan posisi putaran tiap rotor sebelum mulai mengetik. Rotor bisa
        diputar dengan jari lewat roda bergerigi, dan di simulator ini kamu tinggal mengklik rotornya.
      </p>
      <p>
        Ada 26 × 26 × 26 = <b>17.576</b> posisi awal. Pengirim dan penerima <b>wajib</b> mulai dari posisi yang sama. Kalau berbeda satu huruf saja,
        hasilnya kacau.
      </p>
      <p>
        Posisi sekarang: <Position />
      </p>
      <Try onClick={() => useStore.getState().setStart(toIndices('HAI'))}>Putar rotor ke HAI</Try>
    </>
  );
}

function Ring() {
  const plain = run(TEACH_KEY, toIndices('AAA'), 'AAAAA');
  const shifted = run({ ...TEACH_KEY, rings: [0, 0, 1] }, toIndices('AAA'), 'AAAAA');
  const output = useStore((s) => s.output);
  return (
    <>
      <Term de="Ringstellung">ring setting</Term>
      <p>
        Bagian yang paling sering bikin bingung, jadi pelan-pelan. Cincin huruf di sekeliling rotor bisa <b>diputar terpisah dari kabel di dalamnya</b>.
        Jadi huruf yang terlihat di jendela tidak lagi menunjukkan posisi kabel yang sebenarnya.
      </p>
      <p>
        Analogi: seperti jam dinding yang angkanya digeser. Jarumnya tetap di tempat yang sama, tapi angka yang terbaca berbeda.
      </p>
      <p>Contoh dengan posisi awal AAA, sama-sama mengetik AAAAA:</p>
      <table className="compare">
        <tbody>
          <tr>
            <td>Ring AAA</td>
            <td className="mono">{plain}</td>
          </tr>
          <tr>
            <td>Ring AAB</td>
            <td className="mono">{shifted}</td>
          </tr>
        </tbody>
      </table>
      <p>
        Ring setting termasuk bagian dari kunci harian. Ia juga menggeser kapan rotor sebelahnya ikut berputar, karena takiknya menempel di cincin.
      </p>
      <Try
        onClick={() => {
          useStore.getState().setSettings({ rings: [0, 0, 1] });
          resetDemo();
          typeDemo('AAAAA', 700);
        }}
      >
        Ubah ring rotor kanan ke B, lalu ketik AAAAA
      </Try>
      {output && <p className="hint">Output: {group5(output)}</p>}
    </>
  );
}

function Stepping() {
  const positions = useStore((s) => s.positions);
  const input = useStore((s) => s.input);
  const [log, setLog] = useState<string[]>([]);
  useEffect(() => {
    const p = toLetters(positions);
    setLog((l) => (input.length === 0 ? [p] : [...l, p]));
  }, [positions, input.length]);
  return (
    <>
      <p>
        Rotor bergerak seperti <b>odometer motor</b>. Rotor kanan maju setiap tombol ditekan. Saat melewati huruf tertentu, takik (<i>notch</i>) di
        cincinnya mendorong rotor tengah maju satu huruf. Begitu juga rotor tengah terhadap rotor kiri.
      </p>
      <table className="compare">
        <tbody>
          <tr>
            <td>Rotor</td>
            {Object.keys(ROTORS).map((r) => (
              <td key={r}>{r}</td>
            ))}
          </tr>
          <tr>
            <td>Mendorong setelah</td>
            {Object.values(ROTORS).map((r) => (
              <td key={r.notch} className="mono">
                {r.notch}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <p>
        <b>Keanehan double-step:</b> saat rotor tengah tiba di posisi takiknya sendiri, pada ketukan berikutnya ia ikut maju <i>lagi</i> bersama rotor
        kiri. Jadi rotor tengah bergerak dua kali berturut-turut. Ini bukan bug simulator, tapi efek mekanis dari mesin aslinya.
      </p>
      <Try onClick={() => typeDemo('AAAA', 1300)}>Mulai dari ADU, tekan 4 kali</Try>
      <p className="steps">{log.join(' → ')}</p>
      {log.length >= 5 && (
        <p className="hint">
          Lihat huruf tengah: D → E → F, maju dua kali berturut-turut (dari ADV ke AEW, lalu AEW ke BFX). Itulah double-step.
        </p>
      )}
    </>
  );
}

function Reflector() {
  const path = useStore((s) => s.path);
  const pairs = [...REFLECTORS.B].map((c, i) => [ALPHABET[i], c]).filter(([a, b]) => a < b);
  const lamp = path && ALPHABET[path.lamp];
  return (
    <>
      <Term de="Umkehrwalze (UKW)">reflektor atau roda pembalik</Term>
      <p>
        Lempeng diam di ujung kiri. Kabelnya menghubungkan huruf berpasangan, lalu <b>memantulkan arus balik</b> lewat ketiga rotor. Pasangan UKW-B:
      </p>
      <p className="mono pairs">{pairs.map((p) => p.join('')).join(' ')}</p>
      <p>Desain ini punya dua akibat besar:</p>
      <ol>
        <li>
          <b>Enkripsi = dekripsi.</b> Kalau dari posisi tertentu A menjadi X, maka dari posisi yang sama X pasti menjadi A. Penerima tidak butuh mode
          khusus, cukup mengetik ciphertext-nya.
        </li>
        <li>
          <b>Huruf tidak pernah menjadi dirinya sendiri.</b> Arus tidak mungkin kembali ke kabel yang sama. Inilah celah yang dimanfaatkan Turing dan tim
          Bletchley Park.
        </li>
      </ol>
      <Try
        onClick={() => {
          resetDemo();
          pressDemo('A');
        }}
      >
        Tekan A
      </Try>
      {lamp && path && ALPHABET[path.key] === 'A' && (
        <Try
          onClick={() => {
            resetDemo();
            pressDemo(lamp);
          }}
        >
          Buktikan: reset lalu tekan {lamp}
        </Try>
      )}
      {path && ALPHABET[path.key] !== 'A' && <p className="hint">Dari posisi yang sama, {ALPHABET[path.key]} menyala sebagai {lamp}. Bolak-balik!</p>}
    </>
  );
}

function Lamps() {
  const output = useStore((s) => s.output);
  return (
    <>
      <Term de="Glühlampenfeld">papan lampu</Term>
      <p>
        26 lampu kecil dengan susunan yang sama seperti keyboard. Lampu hanya menyala <b>selama tombol ditahan</b>. Biasanya satu operator mengetik, dan
        operator kedua membaca lampu lalu mencatat hurufnya di kertas.
      </p>
      <p>
        Hasilnya ditulis dalam <b>kelompok 5 huruf</b> agar mudah dibacakan dan dikirim lewat radio dengan kode Morse, tanpa petunjuk di mana kata
        dimulai atau berakhir.
      </p>
      <Try onClick={() => typeDemo('ENIGMA', 900)}>Ketik ENIGMA dan lihat lampunya</Try>
      {output && <p className="hint">Lampu yang menyala berurutan: {group5(output)}</p>}
    </>
  );
}

function Crypt() {
  const cipher = run(TEACH_KEY, toIndices('AAA'), 'HALO');
  return (
    <>
      <p>Sekarang semua bagian disatukan. Begini cara dua orang berkirim pesan:</p>
      <ol>
        <li>
          <b>Sepakati kunci:</b> reflektor, urutan rotor, ring setting, kabel plugboard, dan posisi awal. Di bab ini kuncinya: UKW-B, rotor I-II-III,
          ring AAA, tanpa kabel, posisi awal AAA.
        </li>
        <li>
          <b>Pengirim</b> memasang kunci, lalu mengetik pesan (spasi diganti X) dan mencatat lampu yang menyala. Itulah ciphertext-nya.
        </li>
        <li>
          <b>Penerima</b> memasang kunci yang sama persis, <b>memutar rotor kembali ke posisi awal</b>, lalu mengetik ciphertext. Lampu yang menyala adalah
          pesan aslinya.
        </li>
      </ol>
      <div className="row">
        <Try
          onClick={() => {
            resetDemo();
            typeDemo('HALO', 800);
          }}
        >
          1. Enkripsi HALO
        </Try>
        <Try onClick={resetDemo}>2. Reset ke posisi awal</Try>
        <Try
          onClick={() => {
            resetDemo();
            typeDemo(cipher, 800);
          }}
        >
          3. Dekripsi {cipher}
        </Try>
      </div>
      <Tape />
      <p>
        Posisi rotor: <Position />
      </p>
      <p>
        <b>Kenapa berhasil?</b> Karena reflektor membuat jalurnya bolak-balik. Dari posisi yang sama, H → {cipher[0]} berarti {cipher[0]} → H.
      </p>
      <p>
        <b>Kesalahan paling umum:</b> lupa mereset rotor sebelum dekripsi. Rotor sudah bergeser 4 langkah, jadi hasilnya kacau. Kamu juga bisa mengetik
        sendiri dengan keyboard laptop di bab ini.
      </p>
    </>
  );
}

function Field() {
  const go = (fn: () => void) => {
    endTour();
    fn();
  };
  return (
    <>
      <p>Di medan perang, satu pesan melewati beberapa tahap:</p>
      <ol>
        <li>
          <b>Tengah malam:</b> operator membuka <i>Schlüsseltafel</i> (lembar kunci bulanan), lalu memasang rotor, ring, dan kabel sesuai tanggal hari itu.
        </li>
        <li>
          <b>Pilih kunci pesan:</b> operator memilih sendiri posisi awal acak, misalnya WZA, dan kunci pesan, misalnya SUN.
        </li>
        <li>
          <b>Enkripsi kunci pesan:</b> rotor diputar ke WZA, lalu SUN diketik dan menghasilkan IYK.
        </li>
        <li>
          <b>Enkripsi isi pesan:</b> rotor diputar ke SUN, lalu seluruh pesan diketik.
        </li>
        <li>
          <b>Kirim lewat radio</b> dengan Morse: kepala pesan berisi jam, jumlah huruf, dan "WZA IYK", diikuti isi pesan dalam kelompok 5 huruf.
        </li>
        <li>
          <b>Penerima</b> melakukan semuanya dari belakang: putar ke WZA, ketik IYK untuk mendapat SUN, putar ke SUN, lalu ketik isi pesannya.
        </li>
      </ol>
      <p>
        Kenapa repot? Supaya setiap pesan memakai posisi awal yang berbeda. Jadi musuh tidak punya ribuan pesan yang semuanya dimulai dari posisi yang
        sama.
      </p>
      <div className="row">
        <Try onClick={() => go(() => startExercise(8))}>Praktikkan di Latihan 8</Try>
        <Try onClick={() => go(() => useStore.getState().setModal('kunci'))}>Buat lembar kunci bulanan</Try>
      </div>
    </>
  );
}

// Ways to place n cables on 26 sockets: 26! / ((26-2n)! · n! · 2^n)
function plugWays(n: number) {
  let r = 1n;
  for (let i = 0; i < 2 * n; i++) r *= BigInt(26 - i);
  for (let i = 1; i <= n; i++) r /= BigInt(i * 2);
  return r;
}

const SCALES: [number, string][] = [
  [1e24, 'triliun triliun'],
  [1e21, 'miliar triliun'],
  [1e18, 'juta triliun'],
  [1e15, 'ribu triliun'],
  [1e12, 'triliun'],
  [1e9, 'miliar'],
  [1e6, 'juta'],
  [1e3, 'ribu'],
];

function inWords(n: bigint) {
  const x = Number(n);
  const s = SCALES.find(([v]) => x >= v);
  return s ? `sekitar ${(x / s[0]).toLocaleString('id-ID', { maximumFractionDigits: 0 })} ${s[1]}` : x.toLocaleString('id-ID');
}

function Strength() {
  const [cables, setCables] = useState(10);
  const plug = plugWays(cables);
  const total = 60n * 17576n * plug;
  const years = Number(total) / 1e6 / 31_557_600;
  const fmt = (n: bigint) => n.toLocaleString('id-ID');
  return (
    <>
      <p>Berapa banyak kunci yang mungkin? Kalikan semua pilihannya:</p>
      <table className="compare calc">
        <tbody>
          <tr>
            <td>Urutan rotor (3 dari 5)</td>
            <td className="mono">60</td>
          </tr>
          <tr>
            <td>Posisi awal (26³)</td>
            <td className="mono">17.576</td>
          </tr>
          <tr>
            <td>Plugboard ({cables} kabel)</td>
            <td className="mono">{fmt(plug)}</td>
          </tr>
          <tr className="total">
            <td>Total</td>
            <td className="mono">{fmt(total)}</td>
          </tr>
        </tbody>
      </table>
      <p>
        Itu <b>{inWords(total)}</b> kunci.
      </p>
      <div className="row crib-controls">
        <label htmlFor="cables">Jumlah kabel</label>
        <input id="cables" type="range" min={0} max={13} value={cables} onChange={(e) => setCables(+e.target.value)} />
        <span>{cables}</span>
      </div>
      <p>
        Kalau komputer mencoba <b>1 juta kunci per detik</b>, semuanya baru selesai dicoba dalam{' '}
        <b>{years < 1 ? 'kurang dari setahun' : `${inWords(BigInt(Math.round(years)))} tahun`}</b>.
      </p>
      <p className="hint">
        Coba geser jumlah kabelnya. Kombinasi terbanyak ada di 11 kabel, bukan 13. Jerman memakai 10 kabel. Ring setting sebenarnya menambah pilihan lagi,
        tapi efeknya sebagian sama dengan menggeser posisi awal, jadi biasanya tidak ikut dihitung.
      </p>
      <p>
        Jadi bagaimana Enigma bisa dipecahkan? Bukan dengan mencoba semuanya, tapi dengan memanfaatkan celah: <b>huruf tidak pernah menjadi dirinya
        sendiri</b>, tebakan kata (crib), dan kecerobohan operator. Bombe buatan Turing hanya perlu menguji posisi rotor, lalu plugboard ditebak dari
        logika.
      </p>
      <Try
        onClick={() => {
          endTour();
          useStore.getState().setModal('turing');
        }}
      >
        Lihat cara Turing memecahkannya
      </Try>
    </>
  );
}

const BODIES = [Overview, Keyboard, Plugboard, Entry, Rotor, Start, Ring, Stepping, Reflector, Lamps, Crypt, Field, Strength];

export function Tour() {
  const tour = useStore((s) => s.tour);
  useEffect(() => {
    if (tour === null) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && endTour();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tour]);
  if (tour === null) return null;
  const Body = BODIES[tour];
  const last = tour === CHAPTERS.length - 1;
  return (
    <aside className="tour" aria-label="Cara kerja Enigma">
      <header>
        <span className="tag">
          Cara kerja Enigma · {tour + 1}/{CHAPTERS.length}
        </span>
        <button onClick={endTour} aria-label="Tutup tur">
          ✕
        </button>
      </header>
      <select value={tour} onChange={(e) => openChapter(+e.target.value)} aria-label="Pilih bab">
        {CHAPTERS.map((c, i) => (
          <option key={i} value={i}>
            {i + 1}. {c.title}
          </option>
        ))}
      </select>
      <h2>{CHAPTERS[tour].title}</h2>
      <div className="tour-body" key={tour}>
        <Body />
      </div>
      <footer>
        <button onClick={() => openChapter(tour - 1)} disabled={tour === 0}>
          ◀ Sebelumnya
        </button>
        <button className="primary" onClick={() => (last ? endTour() : openChapter(tour + 1))}>
          {last ? 'Selesai' : 'Berikutnya ▶'}
        </button>
      </footer>
    </aside>
  );
}
