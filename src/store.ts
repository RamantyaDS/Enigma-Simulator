import { create } from 'zustand';
import { ALPHABET, parsePlugboard, press, Settings, SignalPath, toIndices, Triple } from './engine/enigma';
import { click } from './sound';

/** A ciphertext waiting to be read, from a share link or the built-in mission. */
export interface Inbox {
  title: string;
  message: string;
  /** For exercises: the output the player should get, a hint, and which exercise step this is. */
  answer?: string;
  hint?: string;
  exercise?: { id: number; step: number };
}

export type Modal = 'latihan' | 'turing' | 'kunci' | null;

// Worked example from de.wikipedia.org/wiki/Enigma_(Maschine) (section "Funkspruch"). Its 10 cables
// also make a realistic default, since operators normally used 10 plugboard cables.
export const MISSION = {
  settings: { reflector: 'B', rotors: ['I', 'IV', 'III'], rings: [15, 25, 7], plugboard: 'AD CN ET FL GI JV KZ PU QY WX' } as Settings,
  start: toIndices('RTZ'),
  inbox: { title: 'Misi: contoh pesan dari buku panduan', message: 'EJZLBSYEQPDWDUE' },
};

interface State {
  settings: Settings;
  start: Triple;
  positions: Triple;
  input: string;
  output: string;
  path: SignalPath | null;
  pressed: number | null;
  plugSelect: number | null;
  inbox: Inbox | null;
  xray: boolean;
  slow: boolean;
  sound: boolean;
  coverOpen: boolean;
  modal: Modal;
  pressKey: (key: number) => void;
  releaseKey: () => void;
  setSettings: (patch: Partial<Settings>) => void;
  setStart: (start: Triple) => void;
  nudgeRotor: (slot: number, delta: number) => void;
  clickSocket: (k: number) => void;
  loadKey: (settings: Settings, start: Triple, inbox: Inbox | null) => void;
  reset: () => void;
  clearTape: () => void;
  toggle: (name: 'xray' | 'slow' | 'sound' | 'coverOpen') => void;
  closeInbox: () => void;
  setModal: (modal: Modal) => void;
}

const mod = (n: number) => ((n % 26) + 26) % 26;
const pairsOf = (plugboard: string) => plugboard.match(/[A-Z]{2}/g) ?? [];

export const useStore = create<State>((set, get) => {
  const sfx = (kind: Parameters<typeof click>[0]) => get().sound && click(kind);
  return {
    settings: MISSION.settings,
    start: MISSION.start,
    positions: MISSION.start,
    input: '',
    output: '',
    path: null,
    pressed: null,
    plugSelect: null,
    inbox: null,
    xray: false,
    slow: false,
    sound: true,
    coverOpen: false,
    modal: null,

    pressKey: (key) => {
      const s = get();
      if (s.pressed !== null) return; // one key at a time, like the real machine
      const res = press(s.settings, parsePlugboard(s.settings.plugboard), s.positions, key);
      sfx('key');
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
      sfx('release');
      set({ pressed: null });
    },

    // Callers validate the plugboard with parsePlugboard before passing it here.
    setSettings: (patch) => {
      sfx(patch.plugboard !== undefined ? 'plug' : 'rotor');
      set({ settings: { ...get().settings, ...patch } });
    },

    setStart: (start) => {
      sfx('rotor');
      set({ start, positions: start, input: '', output: '', path: null });
    },

    nudgeRotor: (slot, delta) => {
      const s = get();
      const positions = [...s.positions] as Triple;
      positions[slot] = mod(positions[slot] + delta);
      sfx('rotor');
      set(s.input ? { positions } : { positions, start: positions });
    },

    // Click a socket to pick it, click a second one to connect them, click a plugged socket to unplug.
    clickSocket: (k) => {
      const { settings, plugSelect } = get();
      const pairs = pairsOf(settings.plugboard);
      const letter = ALPHABET[k];
      const plugged = pairs.find((p) => p.includes(letter));
      if (plugged) {
        set({ plugSelect: null });
        get().setSettings({ plugboard: pairs.filter((p) => p !== plugged).join(' ') });
      } else if (plugSelect === null) {
        sfx('rotor');
        set({ plugSelect: k });
      } else if (plugSelect === k || pairs.length >= 13) {
        set({ plugSelect: null });
      } else {
        set({ plugSelect: null });
        get().setSettings({ plugboard: [...pairs, ALPHABET[plugSelect] + letter].join(' ') });
      }
    },

    loadKey: (settings, start, inbox) => {
      sfx('plug');
      set({ settings, start, positions: start, input: '', output: '', path: null, plugSelect: null, inbox });
    },

    reset: () => set({ positions: get().start, input: '', output: '', path: null }),
    clearTape: () => set({ input: '', output: '' }),
    toggle: (name) => set({ [name]: !get()[name] } as Partial<State>),
    closeInbox: () => set({ inbox: null }),
    setModal: (modal) => set({ modal }),
  };
});
