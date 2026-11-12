import { create } from 'zustand';
import { ALPHABET, parsePlugboard, press, Settings, SignalPath, Triple } from './engine/enigma';
import { click } from './sound';

interface State {
  settings: Settings;
  start: Triple;
  positions: Triple;
  input: string;
  output: string;
  path: SignalPath | null;
  pressed: number | null;
  xray: boolean;
  slow: boolean;
  sound: boolean;
  coverOpen: boolean;
  pressKey: (key: number) => void;
  releaseKey: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setStart: (start: Triple) => void;
  nudgeRotor: (slot: number, delta: number) => void;
  reset: () => void;
  clearTape: () => void;
  toggle: (name: 'xray' | 'slow' | 'sound' | 'coverOpen') => void;
}

const mod = (n: number) => ((n % 26) + 26) % 26;

export const useStore = create<State>((set, get) => ({
  settings: { reflector: 'B', rotors: ['I', 'II', 'III'], rings: [0, 0, 0], plugboard: '' },
  start: [0, 0, 0],
  positions: [0, 0, 0],
  input: '',
  output: '',
  path: null,
  pressed: null,
  xray: false,
  slow: false,
  sound: true,
  coverOpen: false,

  pressKey: (key) => {
    const s = get();
    if (s.pressed !== null) return; // one key at a time, like the real machine
    const res = press(s.settings, parsePlugboard(s.settings.plugboard), s.positions, key);
    if (s.sound) click('key');
    set({
      positions: res.positions,
      path: res.path,
      pressed: key,
      input: s.input + ALPHABET[key],
      output: s.output + ALPHABET[res.path.lamp],
    });
  },

  releaseKey: () => {
    if (get().pressed === null) return;
    if (get().sound) click('release');
    set({ pressed: null });
  },

  // Callers validate the plugboard with parsePlugboard before passing it here.
  setSettings: (patch) => set({ settings: { ...get().settings, ...patch } }),

  setStart: (start) => set({ start, positions: start, input: '', output: '', path: null }),

  nudgeRotor: (slot, delta) => {
    const s = get();
    const positions = [...s.positions] as Triple;
    positions[slot] = mod(positions[slot] + delta);
    if (s.sound) click('rotor');
    set(s.input ? { positions } : { positions, start: positions });
  },

  reset: () => set({ positions: get().start, input: '', output: '', path: null }),
  clearTape: () => set({ input: '', output: '' }),
  toggle: (name) => set({ [name]: !get()[name] } as Partial<State>),
}));
