import { useState } from 'react';
import { ALPHABET, parsePlugboard, REFLECTORS, ReflectorName, RotorName, ROTORS, toLetters, Triple } from '../engine/enigma';
import { goTo, Preset } from '../scene/camera';
import { useStore } from '../store';

const SLOTS = ['Kiri', 'Tengah', 'Kanan'];
const ROTOR_NAMES = Object.keys(ROTORS) as RotorName[];
const LETTERS = ALPHABET.split('');
const mod = (n: number) => ((n % 26) + 26) % 26;

function PlugboardInput() {
  const current = useStore((s) => s.settings.plugboard);
  const setSettings = useStore((s) => s.setSettings);
  const [text, setText] = useState(current);
  const [error, setError] = useState('');
  const apply = () => {
    try {
      const pairs = parsePlugboard(text) && (text.toUpperCase().match(/[A-Z]{2}/g) ?? []);
      if (pairs.length > 13) throw new Error('Maksimal 13 pasangan');
      setSettings({ plugboard: pairs.join(' ') });
      setText(pairs.join(' '));
      setError('');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="field">
      <label htmlFor="plug">Plugboard (Steckerbrett)</label>
      <input
        id="plug"
        value={text}
        placeholder="mis. AV BS CG DL"
        onChange={(e) => setText(e.target.value.toUpperCase())}
        onBlur={apply}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        spellCheck={false}
        autoComplete="off"
      />
      {error ? <small className="error">{error}</small> : <small>Pasangan huruf dipisah spasi. Tekan Enter untuk menerapkan.</small>}
    </div>
  );
}

export function Panel() {
  const s = useStore();
  const [open, setOpen] = useState(() => window.innerWidth > 760);
  const { settings } = s;

  const setRotor = (slot: number, name: RotorName) => {
    const rotors = [...settings.rotors] as typeof settings.rotors;
    const other = rotors.indexOf(name);
    if (other >= 0) rotors[other] = rotors[slot]; // swap instead of duplicating
    rotors[slot] = name;
    s.setSettings({ rotors });
  };
  const setRing = (slot: number, v: number) => {
    const rings = [...settings.rings] as Triple;
    rings[slot] = v;
    s.setSettings({ rings });
  };
  const nudgeStart = (slot: number, d: number) => {
    const start = [...s.start] as Triple;
    start[slot] = mod(start[slot] + d);
    s.setStart(start);
  };

  return (
    <>
      <button className="panel-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Tutup' : 'Setting'}
      </button>
      <aside className={`panel ${open ? 'open' : ''}`} aria-label="Pengaturan mesin">
        <section>
          <h2>Kamera</h2>
          <div className="row">
            {(['operator', 'rotor', 'plugboard', 'xray'] as Preset[]).map((p) => (
              <button key={p} onClick={() => goTo(p)}>
                {{ operator: 'Operator', rotor: 'Rotor', plugboard: 'Plugboard', xray: 'Samping' }[p]}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2>Mode</h2>
          <label className="check">
            <input type="checkbox" checked={s.xray} onChange={() => s.toggle('xray')} /> X-ray (lihat jalur arus)
          </label>
          <label className="check">
            <input type="checkbox" checked={s.slow} onChange={() => s.toggle('slow')} disabled={!s.xray} /> Slow motion
          </label>
          <label className="check">
            <input type="checkbox" checked={s.coverOpen} onChange={() => s.toggle('coverOpen')} /> Buka tutup rotor
          </label>
          <label className="check">
            <input type="checkbox" checked={s.sound} onChange={() => s.toggle('sound')} /> Suara
          </label>
        </section>

        <section>
          <h2>Kunci harian</h2>
          <div className="field">
            <label htmlFor="ukw">Reflector (UKW)</label>
            <select id="ukw" value={settings.reflector} onChange={(e) => s.setSettings({ reflector: e.target.value as ReflectorName })}>
              {(Object.keys(REFLECTORS) as ReflectorName[]).map((r) => (
                <option key={r} value={r}>
                  UKW-{r}
                </option>
              ))}
            </select>
          </div>
          <div className="grid3">
            {SLOTS.map((name, slot) => (
              <div key={slot} className="slot">
                <span className="slot-name">{name}</span>
                <select aria-label={`Rotor ${name}`} value={settings.rotors[slot]} onChange={(e) => setRotor(slot, e.target.value as RotorName)}>
                  {ROTOR_NAMES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <select aria-label={`Ring ${name}`} value={settings.rings[slot]} onChange={(e) => setRing(slot, +e.target.value)}>
                  {LETTERS.map((l, i) => (
                    <option key={l} value={i}>
                      {l} ({String(i + 1).padStart(2, '0')})
                    </option>
                  ))}
                </select>
                <div className="stepper">
                  <button aria-label={`Posisi awal ${name} naik`} onClick={() => nudgeStart(slot, 1)}>
                    ▲
                  </button>
                  <span>{ALPHABET[s.start[slot]]}</span>
                  <button aria-label={`Posisi awal ${name} turun`} onClick={() => nudgeStart(slot, -1)}>
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="legend">Baris: rotor · ring setting · posisi awal</p>
          <PlugboardInput />
        </section>

        <section>
          <h2>Status</h2>
          <p className="status">
            Posisi rotor sekarang: <strong>{toLetters(s.positions)}</strong>
          </p>
          <div className="row">
            <button onClick={s.reset}>Reset ke posisi awal</button>
          </div>
        </section>
      </aside>
    </>
  );
}
