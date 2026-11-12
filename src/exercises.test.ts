import { describe, expect, it } from 'vitest';
import { EXERCISES, stepTexts } from './exercises';

// These ciphertexts are printed in LATIHAN.md, so the in-site exercises must produce the same ones.
const DOC = { 1: 'IDBM', 2: 'JLBGHWHAUTUX', 3: 'TGKGGKCUOZABTDB', 4: 'VJTDALJ', 5: 'VYBSGBQCHTKCCW', 6: 'OONFXYNFTKEICMV', 9: 'EJZLBSYEQPDWDUE' };

describe('exercises', () => {
  it('match the ciphertexts in LATIHAN.md', () => {
    for (const [id, cipher] of Object.entries(DOC)) {
      expect(stepTexts(EXERCISES.find((e) => e.id === +id)!, 0).type).toBe(cipher);
    }
  });
  it('encrypt exercise and message-key steps match the answer key', () => {
    expect(stepTexts(EXERCISES[6], 0).answer).toBe('TWTYNT');
    expect(stepTexts(EXERCISES[7], 0).type).toBe('IYK');
    expect(stepTexts(EXERCISES[7], 1).type).toBe('LHPMYEHYNRCZKS');
  });
});
