import { parsePlugboard, REFLECTORS, ReflectorName, RotorName, ROTORS, Settings, toIndices, toLetters, Triple } from './engine/enigma';

/** Builds a link that carries the key and the ciphertext in the URL hash (nothing is sent to a server). */
export function shareLink(s: Settings, start: Triple, message: string) {
  const params = new URLSearchParams({
    u: s.reflector,
    w: s.rotors.join('-'),
    r: toLetters(s.rings),
    g: toLetters(start),
    p: s.plugboard.replace(/ /g, ''),
    m: message,
  });
  return `${location.origin}${location.pathname}#${params}`;
}

export function readLink(hash: string): { settings: Settings; start: Triple; message: string } | null {
  const q = new URLSearchParams(hash.replace(/^#/, ''));
  const rotors = (q.get('w') ?? '').split('-') as RotorName[];
  const reflector = q.get('u') as ReflectorName;
  const rings = q.get('r') ?? '';
  const start = q.get('g') ?? '';
  const plugboard = (q.get('p') ?? '').toUpperCase().match(/[A-Z]{2}/g)?.join(' ') ?? '';
  const message = (q.get('m') ?? '').toUpperCase().replace(/[^A-Z]/g, '');
  const letters = /^[A-Z]{3}$/;
  const valid =
    reflector in REFLECTORS &&
    rotors.length === 3 &&
    rotors.every((r) => r in ROTORS) &&
    new Set(rotors).size === 3 &&
    letters.test(rings) &&
    letters.test(start) &&
    message.length > 0;
  if (!valid) return null;
  try {
    parsePlugboard(plugboard);
  } catch {
    return null;
  }
  return { settings: { reflector, rotors: rotors as Settings['rotors'], rings: toIndices(rings), plugboard }, start: toIndices(start), message };
}
