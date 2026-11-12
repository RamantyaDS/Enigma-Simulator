import { ALPHABET, Settings, toIndices, Triple } from './engine/enigma';
import { goTo, goToView, PRESETS, setInset, View } from './scene/camera';
import { useStore, type Inbox } from './store';

/** Parts of the machine the tour can point at; boxes live in scene/TourHighlight.tsx. */
export type Part = 'keyboard' | 'plugboard' | 'etw' | 'rotors' | 'rightRotor' | 'windows' | 'ukw' | 'lamps';

export interface Chapter {
  title: string;
  view: View;
  part?: Part;
  cover?: boolean;
  xray?: boolean;
  slow?: boolean;
  /** Key the chapter starts from. Defaults to the simple teaching key at AAA. */
  start?: string;
  plugboard?: string;
}

/** A plain key so the examples are easy to follow: no cables, rings at A. */
export const TEACH_KEY: Settings = { reflector: 'B', rotors: ['I', 'II', 'III'], rings: [0, 0, 0], plugboard: '' };

export const CHAPTERS: Chapter[] = [
  { title: 'Gambaran besar', view: PRESETS.xray, xray: true },
  { title: 'Keyboard', view: { pos: [0, 2.6, 3.4], target: [0, 0.85, 0.7] }, part: 'keyboard' },
  { title: 'Plugboard', view: PRESETS.plugboard, part: 'plugboard', xray: true },
  { title: 'Roda masuk', view: { pos: [2.4, 1.9, 0.2], target: [0.5, 0.75, -1.04] }, part: 'etw', cover: true },
  { title: 'Rotor', view: PRESETS.rotor, part: 'rotors', cover: true, xray: true },
  { title: 'Posisi awal', view: { pos: [0, 2.3, 0.5], target: [0, 1.0, -1.04] }, part: 'windows' },
  { title: 'Ring setting', view: { pos: [1.6, 2.4, 0.9], target: [0.25, 0.8, -1.04] }, part: 'rightRotor', cover: true },
  { title: 'Langkah rotor', view: PRESETS.rotor, part: 'rotors', cover: true, start: 'ADU' },
  { title: 'Reflektor', view: { pos: [-2.4, 1.9, 0.2], target: [-0.5, 0.75, -1.04] }, part: 'ukw', cover: true, xray: true },
  { title: 'Papan lampu', view: { pos: [0, 5, 1.7], target: [0, 0.85, -0.35] }, part: 'lamps' },
  { title: 'Enkripsi & dekripsi', view: PRESETS.operator },
  { title: 'Di medan perang', view: PRESETS.operator },
  { title: 'Seberapa kuat?', view: PRESETS.operator },
];

let snapshot: { settings: Settings; start: Triple; inbox: Inbox | null; xray: boolean; slow: boolean; coverOpen: boolean } | null = null;
let timers: number[] = [];

export const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

function stopDemo() {
  timers.forEach(clearTimeout);
  timers = [];
  useStore.getState().releaseKey();
}

export function startTour() {
  const s = useStore.getState();
  snapshot ??= { settings: s.settings, start: s.start, inbox: s.inbox, xray: s.xray, slow: s.slow, coverOpen: s.coverOpen };
  s.setModal(null);
  // Match the tour card in styles.css: right column on wide screens, bottom sheet on phones.
  if (innerWidth > 760) setInset(432, 0);
  else setInset(0, innerHeight * 0.48 + 8);
  openChapter(0);
}

export function openChapter(i: number) {
  stopDemo();
  const c = CHAPTERS[i];
  const start = toIndices(c.start ?? 'AAA');
  useStore.setState({
    tour: i,
    settings: { ...TEACH_KEY, plugboard: c.plugboard ?? '' },
    start,
    positions: start,
    input: '',
    output: '',
    path: null,
    inbox: null,
    plugSelect: null,
    xray: !!c.xray,
    slow: !!c.slow,
    coverOpen: !!c.cover,
  });
  goToView(c.view);
}

export function endTour() {
  stopDemo();
  const snap = snapshot!;
  snapshot = null;
  useStore.setState({ tour: null, xray: snap.xray, slow: snap.slow, coverOpen: snap.coverOpen });
  useStore.getState().loadKey(snap.settings, snap.start, snap.inbox);
  setInset(0, 0);
  goTo('operator');
}

const idx = (ch: string) => ALPHABET.indexOf(ch);

/** Presses one key and holds it long enough to watch the lamp (and the slow-motion path). */
export function pressDemo(letter: string) {
  stopDemo();
  const s = useStore.getState();
  s.pressKey(idx(letter));
  later(s.xray && s.slow ? 5400 : 1000, () => useStore.getState().releaseKey());
}

/** Types text on the machine one key at a time. */
export function typeDemo(text: string, gap = 600) {
  stopDemo();
  [...text].forEach((ch, i) => {
    later(i * gap, () => useStore.getState().pressKey(idx(ch)));
    later(i * gap + 350, () => useStore.getState().releaseKey());
  });
}

/** Resets the rotors to the chapter's start position and clears the tape. */
export const resetDemo = () => {
  stopDemo();
  useStore.getState().reset();
};
