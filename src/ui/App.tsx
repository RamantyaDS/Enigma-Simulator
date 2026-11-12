import { useEffect, useState } from 'react';
import { ALPHABET } from '../engine/enigma';
import { Experience } from '../scene/Experience';
import { readLink } from '../share';
import { useStore } from '../store';
import { Modals } from './Modals';
import { Panel } from './Panel';
import { Tape } from './Tape';
import { Tour } from './Tour';
import { startTour } from '../tour';

function useKeyboard() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if ((e.target as Element).closest?.('input, select, textarea')) return;
      if (useStore.getState().modal) return;
      const i = ALPHABET.indexOf(e.key.toUpperCase());
      if (i >= 0 && e.key.length === 1) useStore.getState().pressKey(i);
    };
    const up = (e: KeyboardEvent) => {
      const s = useStore.getState();
      if (s.pressed !== null && e.key.toUpperCase() === ALPHABET[s.pressed]) s.releaseKey();
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
}

function useShareLink() {
  useEffect(() => {
    const link = readLink(location.hash);
    if (!link) return;
    useStore.getState().loadKey(link.settings, link.start, { title: 'Pesan masuk dari link', message: link.message });
    history.replaceState(null, '', location.pathname);
  }, []);
}

export function App() {
  useKeyboard();
  useShareLink();
  const [help, setHelp] = useState(true);
  const touring = useStore((s) => s.tour !== null);
  return (
    <>
      <Experience />
      <header className="brand">
        <h1>Enigma I</h1>
        <p>Simulator 3D · 3 rotor</p>
        {!touring && (
          <button className="tour-start" onClick={startTour}>
            ▶ Cara kerja Enigma
          </button>
        )}
      </header>
      {help && !touring && (
        <div className="help" role="note">
          <p>Ketik di keyboard atau klik tombol mesin. Klik rotor untuk memutar (Shift+klik untuk mundur).</p>
          <p>Drag untuk memutar kamera, scroll atau pinch untuk zoom.</p>
          <button onClick={() => setHelp(false)}>Mengerti</button>
        </div>
      )}
      {touring ? (
        <Tour />
      ) : (
        <>
          <Panel />
          <Tape />
        </>
      )}
      <Modals />
    </>
  );
}
