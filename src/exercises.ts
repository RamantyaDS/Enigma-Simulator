import { ReflectorName, run, Settings, toIndices } from './engine/enigma';
import { MISSION, useStore } from './store';

interface Step {
  start: string;
  /** decrypt: the player types the ciphertext and should read `plain`. encrypt: the player types `plain`. */
  mode: 'decrypt' | 'encrypt';
  plain: string;
  hint: string;
}

export interface Exercise {
  id: number;
  level: number;
  title: string;
  settings: Settings;
  steps: Step[];
}

const key = (reflector: ReflectorName, rotors: string, rings: string, plugboard = ''): Settings => ({
  reflector,
  rotors: rotors.split('-') as Settings['rotors'],
  rings: toIndices(rings),
  plugboard,
});

const decrypt = (start: string, plain: string, hint = 'Ketik huruf-huruf di atas. Output-nya adalah pesan aslinya.'): Step => ({ start, mode: 'decrypt', plain, hint });

// Same keys as LATIHAN.md, so the ciphertexts there match the ones computed here (checked in exercises.test.ts).
export const EXERCISES: Exercise[] = [
  { id: 1, level: 1, title: 'Dekripsi pertama', settings: key('B', 'I-II-III', 'AAA'), steps: [decrypt('AAA', 'HALO')] },
  { id: 2, level: 1, title: 'Pesan lebih panjang', settings: key('B', 'I-II-III', 'AAA'), steps: [decrypt('AAA', 'SELAMATXPAGI', 'X adalah pengganti spasi.')] },
  { id: 3, level: 2, title: 'Posisi awal berbeda', settings: key('B', 'I-II-III', 'AAA'), steps: [decrypt('KOP', 'KOPIXSUDAHXSIAP')] },
  { id: 4, level: 2, title: 'Pakai plugboard', settings: key('B', 'I-II-III', 'AAA', 'AB CD EF'), steps: [decrypt('AAA', 'RAHASIA', 'Lihat kabel di depan mesin: A-B, C-D, E-F tertukar sebelum dan sesudah rotor.')] },
  { id: 5, level: 2, title: 'Urutan rotor dan ring berbeda', settings: key('B', 'II-IV-V', 'BUL'), steps: [decrypt('XYZ', 'TEMUXDIXKANTIN')] },
  { id: 6, level: 3, title: 'Semua setting diganti', settings: key('C', 'V-III-I', 'CCC', 'QW ER TY UI OP'), steps: [decrypt('NIH', 'MAKANXSIANGXYUK')] },
  {
    id: 7,
    level: 3,
    title: 'Giliran kamu mengenkripsi',
    settings: key('B', 'IV-I-II', 'AAA', 'HO JK'),
    steps: [{ start: 'BOS', mode: 'encrypt', plain: 'ENIGMA', hint: 'Ketik kata biasa ini. Output-nya adalah ciphertext yang akan kamu kirim.' }],
  },
  {
    id: 8,
    level: 4,
    title: 'Prosedur kunci pesan zaman perang',
    settings: key('B', 'I-II-III', 'AAA', 'AB CD'),
    steps: [
      decrypt('WZA', 'SUN', 'Indikator pesan: WZA IYK. Posisi awal sudah di WZA. Ketik IYK untuk membuka kunci pesan.'),
      decrypt('SUN', 'SANDIXBERHASIL', 'Posisi awal sekarang memakai kunci pesan SUN. Ketik isi pesannya.'),
    ],
  },
  {
    id: 9,
    level: 4,
    title: 'Contoh asli buku panduan',
    settings: MISSION.settings,
    steps: [decrypt('RTZ', 'XAACHENXAACHENX', 'Contoh dari buku panduan Enigma (Wikipedia Jerman), lengkap dengan 10 kabel plugboard.')],
  },
  {
    id: 10,
    level: 4,
    title: 'Ujian akhir',
    settings: key('B', 'III-V-I', 'LOV', 'AZ BY CX DW EV FU GT HS IR JQ'),
    steps: [decrypt('MAU', 'ENIGMAXDIPECAHKANXDIXBLETCHLEYXPARK', 'Pesan panjang dengan 10 kabel plugboard. Ketik pelan-pelan.')],
  },
];

/** What the player must type, and what the output should read when they get it right. */
export function stepTexts(ex: Exercise, step: number) {
  const s = ex.steps[step];
  const other = run(ex.settings, toIndices(s.start), s.plain);
  return s.mode === 'decrypt' ? { type: other, answer: s.plain } : { type: s.plain, answer: other };
}

export function startExercise(id: number, step = 0) {
  const ex = EXERCISES.find((e) => e.id === id)!;
  const { type, answer } = stepTexts(ex, step);
  const total = ex.steps.length > 1 ? ` (langkah ${step + 1}/${ex.steps.length})` : '';
  useStore.getState().loadKey(ex.settings, toIndices(ex.steps[step].start), {
    title: `Latihan ${ex.id}: ${ex.title}${total}`,
    message: type,
    answer,
    hint: ex.steps[step].hint,
    exercise: { id, step },
  });
}

const STORE_KEY = 'enigma-latihan';

export function loadProgress(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function markDone(id: number) {
  const done = new Set(loadProgress()).add(id);
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...done]));
  } catch {
    // Progress is a convenience; the exercise still works without storage.
  }
}
