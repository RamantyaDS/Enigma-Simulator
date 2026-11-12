import { useState } from 'react';
import { ALPHABET } from '../engine/enigma';
import { shareLink } from '../share';
import { useStore } from '../store';

const group5 = (t: string) => t.replace(/(.{5})/g, '$1 ').trim();

function InboxCard() {
  const inbox = useStore((s) => s.inbox);
  const input = useStore((s) => s.input);
  const output = useStore((s) => s.output);
  const close = useStore((s) => s.closeInbox);
  if (!inbox) return null;
  const done = input === inbox.message;
  return (
    <div className="inbox" role="status">
      <div>
        <span className="tag">{inbox.title}</span>
        <p className="cipher">{group5(inbox.message)}</p>
        <small>{done ? `Terbaca: ${group5(output)}` : 'Kunci sudah terpasang. Ketik huruf-huruf ini di mesin untuk membacanya.'}</small>
      </div>
      <button onClick={close} aria-label="Tutup pesan">
        ✕
      </button>
    </div>
  );
}

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
  const [copied, setCopied] = useState('');
  const copy = async (what: 'output' | 'link') => {
    const s = useStore.getState();
    await navigator.clipboard.writeText(what === 'output' ? group5(output) : shareLink(s.settings, s.start, output));
    setCopied(what);
    setTimeout(() => setCopied(''), 1400);
  };
  return (
    <div className="tape">
      <InboxCard />
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
          <button onClick={() => copy('output')} disabled={!output}>
            {copied === 'output' ? 'Tersalin' : 'Salin output'}
          </button>
          <button onClick={() => copy('link')} disabled={!output} title="Link berisi kunci dan pesan terenkripsi">
            {copied === 'link' ? 'Link tersalin' : 'Salin link pesan'}
          </button>
          <button onClick={clear} disabled={!input}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
