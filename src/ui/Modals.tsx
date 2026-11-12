import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ALPHABET, RotorName, run, Settings, toIndices, toLetters, Triple } from '../engine/enigma';
import { EXERCISES, loadProgress, startExercise } from '../exercises';
import { useStore } from '../store';

function Modal({ title, children }: { title: string; children: ReactNode }) {
  const close = () => useStore.getState().setModal(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button onClick={close} aria-label="Tutup">
            ✕
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}

const describeKey = (s: Settings) =>
  `UKW-${s.reflector} · Rotor ${s.rotors.join('-')} · Ring ${toLetters(s.rings)} · Plugboard ${s.plugboard || 'kosong'}`;

function Exercises() {
  const done = new Set(loadProgress());
  const open = (id: number) => {
    startExercise(id);
    useStore.getState().setModal(null);
  };
  const levels = ['Pemanasan', 'Ganti satu bagian kunci', 'Kunci lengkap', 'Seperti operator asli'];
  return (
    <Modal title="Latihan">
      <p className="lead">
        Pilih latihan. Kuncinya otomatis terpasang di mesin, lalu ketik teks yang muncul di kartu bawah. Kalau output-nya benar, latihan
        ditandai selesai. Sudah selesai: <strong>{done.size}/{EXERCISES.length}</strong>
      </p>
      {levels.map((name, i) => (
        <section key={name}>
          <h3>
            Level {i + 1}: {name}
          </h3>
          {EXERCISES.filter((e) => e.level === i + 1).map((e) => (
            <div key={e.id} className="ex-row">
              <span className={done.has(e.id) ? 'ok' : 'todo'} aria-label={done.has(e.id) ? 'selesai' : 'belum'}>
                {done.has(e.id) ? '✓' : '○'}
              </span>
              <div>
                <strong>
                  {e.id}. {e.title}
                </strong>
                <small>{describeKey(e.settings)}</small>
              </div>
              <button onClick={() => open(e.id)}>{done.has(e.id) ? 'Ulangi' : 'Mulai'}</button>
            </div>
          ))}
        </section>
      ))}
    </Modal>
  );
}

// A weather report, the classic source of cribs at Bletchley Park.
const TURING_KEY: Settings = { reflector: 'B', rotors: ['II', 'V', 'III'], rings: toIndices('FKM'), plugboard: 'AQ BJ CW EL FN GT HR KV OS PZ' };
const PLAIN = 'ANXOBERKOMMANDOXWETTERVORHERSAGEXFUERXDIEXNACHTXREGENXUNDXSTURM';
const CRIB = 'WETTERVORHERSAGE';
const CIPHER = run(TURING_KEY, toIndices('JRA'), PLAIN);
const MAX = CIPHER.length - CRIB.length;
const clashesAt = (pos: number) => [...CRIB].map((c, i) => c === CIPHER[pos + i]);
const POSSIBLE = Array.from({ length: MAX + 1 }, (_, p) => p).filter((p) => !clashesAt(p).some(Boolean));

function Turing() {
  const [pos, setPos] = useState(0);
  const [reveal, setReveal] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Keep the crib in view on narrow screens as it slides along the ciphertext.
    const el = strip.current;
    if (el) el.scrollLeft = (pos / MAX) * (el.scrollWidth - el.clientWidth);
  }, [pos]);
  const clash = clashesAt(pos);
  const bad = clash.some(Boolean);
  return (
    <Modal title="Cara Turing memecahkan Enigma">
      <p className="lead">
        Bletchley Park tahu pesan cuaca Jerman hampir selalu memuat kata <code>WETTERVORHERSAGE</code> (prakiraan cuaca). Tebakan seperti ini
        disebut <em>crib</em>. Masalahnya: di posisi mana kata itu berada dalam ciphertext?
      </p>
      <p className="lead">
        Kuncinya ada pada celah Enigma: <strong>huruf tidak pernah dienkripsi menjadi dirinya sendiri</strong>. Kalau crib diletakkan di
        posisi yang membuat satu huruf jatuh tepat di atas huruf yang sama, posisi itu pasti salah. Geser crib dan cari posisi yang mungkin.
      </p>
      <div className="crib" ref={strip} aria-label="Ciphertext dan crib">
        <div className="crib-row">
          {[...CIPHER].map((c, i) => (
            <span key={i} className={i >= pos && i < pos + CRIB.length && clash[i - pos] ? 'clash' : ''}>
              {c}
            </span>
          ))}
        </div>
        <div className="crib-row" style={{ paddingLeft: `calc(${pos} * var(--cell))` }}>
          {[...CRIB].map((c, i) => (
            <span key={i} className={clash[i] ? 'clash' : 'crib-letter'}>
              {c}
            </span>
          ))}
        </div>
      </div>
      <div className="row crib-controls">
        <button onClick={() => setPos(Math.max(0, pos - 1))} aria-label="Geser crib ke kiri">
          ◀
        </button>
        <input type="range" min={0} max={MAX} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Posisi crib" />
        <button onClick={() => setPos(Math.min(MAX, pos + 1))} aria-label="Geser crib ke kanan">
          ▶
        </button>
        <span>Posisi {pos}</span>
      </div>
      <p className={bad ? 'bad' : 'ok'}>
        {bad
          ? `✗ Mustahil: ${clash.filter(Boolean).length} huruf jatuh di atas dirinya sendiri (merah).`
          : '✓ Mungkin. Tidak ada huruf yang bertabrakan, jadi posisi ini layak diuji dengan Bombe.'}
      </p>
      <p className="lead">
        Dari {MAX + 1} posisi, hanya {POSSIBLE.length} yang lolos: {POSSIBLE.join(', ')}. Untuk tiap posisi yang lolos, Bletchley membuat
        "menu" pasangan huruf dan menjalankan Bombe: mesin elektromekanis yang menguji 17.576 posisi rotor dan langsung menolak yang
        bertentangan dengan crib. Setting yang tersisa dicoba di mesin Enigma tiruan, dan yang menghasilkan bahasa Jerman adalah kunci hari itu.
      </p>
      <button onClick={() => setReveal(!reveal)}>{reveal ? 'Sembunyikan' : 'Lihat pesan aslinya'}</button>
      {reveal && (
        <p className="lead">
          Crib sebenarnya ada di posisi <strong>{PLAIN.indexOf(CRIB)}</strong>. Pesan lengkapnya: <code>{PLAIN}</code> ("An Oberkommando:
          Wettervorhersage für die Nacht: Regen und Sturm", artinya "Kepada Komando Tinggi: prakiraan cuaca malam ini hujan dan badai").
        </p>
      )}
    </Modal>
  );
}

// Seeded random numbers so two people with the same passphrase get the same sheet.
function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353) >>> 0;
  return () => {
    h = (h + 0x6d2b79f5) >>> 0;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sheetRows(phrase: string, year: number, month: number) {
  const rand = rng(`${phrase.trim().toUpperCase()}|${year}-${month}`);
  const pick = <T,>(list: T[]) => list.splice(Math.floor(rand() * list.length), 1)[0];
  const letter = () => Math.floor(rand() * 26);
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, d) => {
    const names: RotorName[] = ['I', 'II', 'III', 'IV', 'V'];
    const letters = ALPHABET.split('');
    const pairs = Array.from({ length: 10 }, () => [pick(letters), pick(letters)].sort().join('')).sort();
    const settings: Settings = {
      reflector: 'B',
      rotors: [pick(names), pick(names), pick(names)],
      rings: [letter(), letter(), letter()],
      plugboard: pairs.join(' '),
    };
    return { day: d + 1, settings, start: [letter(), letter(), letter()] as Triple };
  }).reverse(); // newest day on top, like the real sheets: used rows were torn off the bottom
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function KeySheet() {
  const now = new Date();
  const [phrase, setPhrase] = useState('');
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const rows = useMemo(() => (phrase.trim() ? sheetRows(phrase, ym.y, ym.m) : []), [phrase, ym]);
  const isToday = (day: number) => ym.y === now.getFullYear() && ym.m === now.getMonth() && day === now.getDate();
  const use = (r: (typeof rows)[number]) => {
    useStore.getState().loadKey(r.settings, r.start, null);
    useStore.getState().setModal(null);
  };
  const months = [-1, 0, 1].map((d) => {
    const date = new Date(now.getFullYear(), now.getMonth() + d, 1);
    return { y: date.getFullYear(), m: date.getMonth() };
  });
  return (
    <Modal title="Lembar kunci bulanan">
      <p className="lead">
        Seperti buku kode asli: satu baris kunci untuk tiap tanggal. Kamu dan temanmu cukup menyepakati satu kata sandi. Kata sandi yang sama
        selalu menghasilkan lembar yang sama, jadi kuncinya tidak perlu ikut dikirim bersama pesan.
      </p>
      <div className="sheet-controls">
        <div className="field">
          <label htmlFor="phrase">Kata sandi bersama</label>
          <input id="phrase" value={phrase} onChange={(e) => setPhrase(e.target.value)} placeholder="mis. kopi susu jam tiga" autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="month">Bulan</label>
          <select id="month" value={`${ym.y}-${ym.m}`} onChange={(e) => setYm(months.find((x) => `${x.y}-${x.m}` === e.target.value)!)}>
            {months.map((x) => (
              <option key={`${x.y}-${x.m}`} value={`${x.y}-${x.m}`}>
                {MONTHS[x.m]} {x.y}
              </option>
            ))}
          </select>
        </div>
        <button onClick={() => window.print()} disabled={!rows.length}>
          Cetak
        </button>
      </div>
      {rows.length > 0 && (
        <div className="sheet print-area">
          <h3>
            Geheim! Schlüsseltafel · {MONTHS[ym.m]} {ym.y}
          </h3>
          <table>
            <thead>
              <tr>
                <th>Tgl</th>
                <th>UKW</th>
                <th>Rotor</th>
                <th>Ring</th>
                <th>Plugboard</th>
                <th>Posisi awal</th>
                <th className="no-print"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.day} className={isToday(r.day) ? 'today' : ''}>
                  <td>{r.day}</td>
                  <td>{r.settings.reflector}</td>
                  <td>{r.settings.rotors.join(' ')}</td>
                  <td>{toLetters(r.settings.rings)}</td>
                  <td>{r.settings.plugboard}</td>
                  <td>{toLetters(r.start)}</td>
                  <td className="no-print">
                    <button onClick={() => use(r)}>Pakai</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export function Modals() {
  const modal = useStore((s) => s.modal);
  if (modal === 'latihan') return <Exercises />;
  if (modal === 'turing') return <Turing />;
  if (modal === 'kunci') return <KeySheet />;
  return null;
}
