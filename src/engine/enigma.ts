// Enigma I (3 rotors) — pure logic, no UI dependencies.

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const ROTORS = {
  I: { wiring: 'EKMFLGDQVZNTOWYHXUSPAIBRCJ', notch: 'Q' },
  II: { wiring: 'AJDKSIRUXBLHWTMCQGZNPYFVOE', notch: 'E' },
  III: { wiring: 'BDFHJLCPRTXVZNYEIWGAKMUSQO', notch: 'V' },
  IV: { wiring: 'ESOVPZJAYQUIRHXLNFTGKDCMWB', notch: 'J' },
  V: { wiring: 'VZBRGITYUPSDNHLXAWMJQOFECK', notch: 'Z' },
} as const;

export const REFLECTORS = {
  A: 'EJMZALYXVBWFCRQUONTSPIKHGD',
  B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL',
} as const;

export type RotorName = keyof typeof ROTORS;
export type ReflectorName = keyof typeof REFLECTORS;
/** Index 0 = left, 1 = middle, 2 = right. */
export type Triple = [number, number, number];

export interface Settings {
  reflector: ReflectorName;
  rotors: [RotorName, RotorName, RotorName];
  rings: Triple; // Ringstellung, 0..25
  plugboard: string; // e.g. "AV BS CG"
}

/** Letter at each stage of the signal path, as indices 0..25. */
export interface SignalPath {
  key: number;
  plugIn: number;
  forward: Triple; // output of rotor [right, middle, left]
  reflector: number;
  backward: Triple; // output of rotor [left, middle, right]
  lamp: number;
}

const mod = (n: number) => ((n % 26) + 26) % 26;
const idx = (c: string) => c.charCodeAt(0) - 65;

const FORWARD: Record<RotorName, number[]> = {} as never;
const BACKWARD: Record<RotorName, number[]> = {} as never;
for (const name of Object.keys(ROTORS) as RotorName[]) {
  FORWARD[name] = [...ROTORS[name].wiring].map(idx);
  BACKWARD[name] = Array(26);
  FORWARD[name].forEach((out, i) => (BACKWARD[name][out] = i));
}

export function parsePlugboard(text: string): number[] {
  const map = [...Array(26).keys()];
  const pairs = text.toUpperCase().match(/[A-Z]{2}/g) ?? [];
  const used = new Set<string>();
  for (const [a, b] of pairs) {
    if (a === b || used.has(a) || used.has(b)) throw new Error(`Pasangan plugboard tidak valid: ${a}${b}`);
    used.add(a).add(b);
    map[idx(a)] = idx(b);
    map[idx(b)] = idx(a);
  }
  return map;
}

/** Advance rotors before each key press, including the double-step anomaly. */
export function step(rotors: Settings['rotors'], [l, m, r]: Triple): Triple {
  const atNotch = (slot: number, pos: number) => pos === idx(ROTORS[rotors[slot]].notch);
  if (atNotch(1, m)) return [mod(l + 1), mod(m + 1), mod(r + 1)];
  if (atNotch(2, r)) return [l, mod(m + 1), mod(r + 1)];
  return [l, m, mod(r + 1)];
}

function through(table: number[], c: number, pos: number, ring: number) {
  const shift = pos - ring;
  return mod(table[mod(c + shift)] - shift);
}

/** Encrypt one letter at the given (already stepped) positions. */
export function encipher(s: Settings, plug: number[], pos: Triple, key: number): SignalPath {
  const plugIn = plug[key];
  const r = through(FORWARD[s.rotors[2]], plugIn, pos[2], s.rings[2]);
  const m = through(FORWARD[s.rotors[1]], r, pos[1], s.rings[1]);
  const l = through(FORWARD[s.rotors[0]], m, pos[0], s.rings[0]);
  const reflector = idx(REFLECTORS[s.reflector][l]);
  const l2 = through(BACKWARD[s.rotors[0]], reflector, pos[0], s.rings[0]);
  const m2 = through(BACKWARD[s.rotors[1]], l2, pos[1], s.rings[1]);
  const r2 = through(BACKWARD[s.rotors[2]], m2, pos[2], s.rings[2]);
  return { key, plugIn, forward: [r, m, l], reflector, backward: [l2, m2, r2], lamp: plug[r2] };
}

/** Press one key: step, then encipher. Returns the new positions and the path. */
export function press(s: Settings, plug: number[], pos: Triple, key: number) {
  const next = step(s.rotors, pos);
  return { positions: next, path: encipher(s, plug, next, key) };
}

/** Encrypt a whole string (non-letters are skipped). */
export function run(s: Settings, start: Triple, text: string): string {
  const plug = parsePlugboard(s.plugboard);
  let pos = start;
  let out = '';
  for (const ch of text.toUpperCase().replace(/[^A-Z]/g, '')) {
    const res = press(s, plug, pos, idx(ch));
    pos = res.positions;
    out += ALPHABET[res.path.lamp];
  }
  return out;
}

export const toIndices = (letters: string): Triple => [...letters.toUpperCase()].map(idx) as Triple;
export const toLetters = (t: Triple) => t.map((i) => ALPHABET[i]).join('');
