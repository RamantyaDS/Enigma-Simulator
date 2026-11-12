import { useState } from 'react';
import { ALPHABET } from '../engine/enigma';
import { useStore } from '../store';

const group5 = (t: string) => t.replace(/(.{5})/g, '$1 ').trim();

function PathText() {
  const path = useStore((s) => s.path);
  const rotors = useStore((s) => s.settings.rotors);
  const xray = useStore((s) => s.xray);
  if (!xray || !path) return null;
  const L = (i: number) => ALPHABET[i];
  const steps = [
    `Tombol ${L(path.key)}`,
    `Plugboard ${L(path.plugIn)}`,
    `${rotors[2]}: ${L(path.forward[0])}`,
    `${rotors[1]}: ${L(path.forward[1])}`,
    `${rotors[0]}: ${L(path.forward[2])}`,
    `UKW: ${L(path.reflector)}`,
    `${rotors[0]}: ${L(path.backward[0])}`,
    `${rotors[1]}: ${L(path.backward[1])}`,
    `${rotors[2]}: ${L(path.backward[2])}`,
    `Lampu ${L(path.lamp)}`,
  ];
  return <p className="path">{steps.join(' → ')}</p>;
}

export function Tape() {
  const input = useStore((s) => s.input);
  const output = useStore((s) => s.output);
  const clear = useStore((s) => s.clearTape);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(group5(output));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="tape">
      <PathText />
      <div className="paper">
        <div>
          <span className="tag">Input</span>
          <p>{group5(input) || '—'}</p>
        </div>
        <div>
          <span className="tag">Output</span>
          <p className="out">{group5(output) || '—'}</p>
        </div>
        <div className="tape-actions">
          <button onClick={copy} disabled={!output}>
            {copied ? 'Tersalin' : 'Salin output'}
          </button>
          <button onClick={clear} disabled={!input}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
