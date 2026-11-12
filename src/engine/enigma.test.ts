import { describe, expect, it } from 'vitest';
import { parsePlugboard, press, run, Settings, step, toIndices, toLetters } from './enigma';

const base: Settings = { reflector: 'B', rotors: ['I', 'II', 'III'], rings: [0, 0, 0], plugboard: '' };

describe('Enigma I', () => {
  it('I-II-III, UKW-B, ring AAA, start AAA: AAAAA -> BDZGO', () => {
    expect(run(base, toIndices('AAA'), 'AAAAA')).toBe('BDZGO');
  });

  it('ring BBB: AAAAA -> EWTYX', () => {
    expect(run({ ...base, rings: [1, 1, 1] }, toIndices('AAA'), 'AAAAA')).toBe('EWTYX');
  });

  it('double-steps the middle rotor: ADU -> ADV -> AEW -> BFX -> BFY', () => {
    let pos = toIndices('ADU');
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      pos = step(base.rotors, pos);
      seen.push(toLetters(pos));
    }
    expect(seen).toEqual(['ADV', 'AEW', 'BFX', 'BFY']);
  });

  const random: Settings = { reflector: 'B', rotors: ['IV', 'II', 'V'], rings: [3, 17, 11], plugboard: 'AV BS CG DL FU HZ IN KM OW RX' };
  const start = toIndices('QWE');
  const text = 'DIESISTEINGEHEIMERTESTTEXTFUERDIEENIGMAMASCHINE';

  it('is reciprocal: encrypting the ciphertext returns the plaintext', () => {
    expect(run(random, start, run(random, start, text))).toBe(text);
  });

  it('never encrypts a letter to itself', () => {
    const plug = parsePlugboard(random.plugboard);
    let pos = start;
    for (let i = 0; i < 10000; i++) {
      const key = i % 26;
      const res = press(random, plug, pos, key);
      expect(res.path.lamp).not.toBe(key);
      pos = res.positions;
    }
  });

  it('rejects a letter used twice on the plugboard', () => {
    expect(() => parsePlugboard('AB AC')).toThrow();
  });
});
