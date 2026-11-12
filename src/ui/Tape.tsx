import { useEffect, useState, type ReactNode } from 'react';
import { ALPHABET } from '../engine/enigma';
import { EXERCISES, markDone, startExercise } from '../exercises';
import { shareLink } from '../share';
import { playMorse, stopMorse } from '../sound';
import { useStore } from '../store';

const group5 = (t: string) => t.replace(/(.{5})/g, '$1 ').trim();

function InboxCard() {
  const inbox = useStore((s) => s.inbox);
  const input = useStore((s) => s.input);
  const output = useStore((s) => s.output);
  const close = useStore((s) => s.closeInbox);
  const typed = !!inbox && input === inbox.message;
  const correct = typed && output === inbox.answer;
  const ex = inbox?.exercise && EXERCISES.find((e) => e.id === inbox.exercise!.id);
  const lastStep = !!ex && inbox!.exercise!.step === ex.steps.length - 1;
  useEffect(() => {
    if (correct && ex && lastStep) markDone(ex.id);
  }, [correct, ex, lastStep]);
  if (!inbox) return null;

  let note: ReactNode = inbox.hint ?? 'Kunci sudah terpasang. Ketik huruf-huruf ini di mesin untuk membacanya.';
  if (inbox.answer === undefined && typed) note = `Terbaca: ${group5(output)}`;
  else if (correct) note = <strong className="ok">✓ Benar! Output: {group5(output)}</strong>;
  else if (typed) note = <span className="bad">Output-nya belum cocok. Klik Reset ke posisi awal, lalu ketik ulang.</span>;
  else if (inbox.answer !== undefined && input.length >= inbox.message.length)
    note = <span className="bad">Ketikanmu tidak sama dengan teks di atas. Klik Reset ke posisi awal, lalu ulangi.</span>;

  const next = ex && correct && (lastStep ? EXERCISES.find((e) => e.id === ex.id + 1) : ex);
  return (
    <div className="inbox" role="status">
      <div>
        <span className="tag">{inbox.title}</span>
        <p className="cipher">{group5(inbox.message)}</p>
        <small>{note}</small>
        {next && (
          <div>
            <button className="next" onClick={() => (lastStep ? startExercise(next.id) : startExercise(ex.id, inbox.exercise!.step + 1))}>
              {lastStep ? `Lanjut ke latihan ${next.id}` : 'Lanjut ke langkah berikutnya'}
            </button>
          </div>
        )}
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
  const [playing, setPlaying] = useState(false);
  useEffect(() => stopMorse, []);
  const morse = () => {
    if (playing) return stopMorse();
    setPlaying(true);
    playMorse(group5(output), () => setPlaying(false));
  };
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
          <button onClick={morse} disabled={!output} title="Putar output sebagai kode Morse, seperti operator radio">
            {playing ? 'Stop Morse' : 'Putar Morse'}
          </button>
          <button onClick={clear} disabled={!input}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
