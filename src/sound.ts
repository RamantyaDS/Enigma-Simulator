// Short synthesized mechanical clicks, no audio files needed.
let ctx: AudioContext | null = null;

const SOUNDS = {
  key: { len: 0.06, freq: 1400, gain: 0.9 },
  release: { len: 0.03, freq: 2200, gain: 0.5 },
  rotor: { len: 0.03, freq: 3200, gain: 0.5 },
  plug: { len: 0.08, freq: 700, gain: 1 },
};

export function click(kind: keyof typeof SOUNDS) {
  const { len, freq, gain: volume } = SOUNDS[kind];
  ctx ??= new AudioContext();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.5;
  const gain = ctx.createGain();
  gain.gain.value = volume;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}

const MORSE = '.- -... -.-. -.. . ..-. --. .... .. .--- -.- .-.. -- -. --- .--. --.- .-. ... - ..- ...- .-- -..- -.-- --..'.split(' ');
let stopCurrent: (() => void) | null = null;

/** Plays text as Morse code, like a radio operator sending it. Spaces become word gaps. Calls onEnd when done or stopped. */
export function playMorse(text: string, onEnd: () => void) {
  stopCurrent?.();
  ctx ??= new AudioContext();
  const unit = 0.07; // ~17 words per minute
  const osc = ctx.createOscillator();
  osc.frequency.value = 650;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  osc.connect(gain).connect(ctx.destination);
  let t = ctx.currentTime + 0.05;
  for (const ch of text) {
    const code = MORSE[ch.charCodeAt(0) - 65];
    if (!code) {
      t += unit * 4; // letter gap (3) + this = word gap (7)
      continue;
    }
    for (const sym of code) {
      const len = sym === '.' ? unit : unit * 3;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.005);
      gain.gain.setValueAtTime(0.2, t + len);
      gain.gain.linearRampToValueAtTime(0, t + len + 0.005);
      t += len + unit;
    }
    t += unit * 2;
  }
  const finish = () => {
    stopCurrent = null;
    onEnd();
  };
  osc.onended = finish;
  osc.start();
  osc.stop(t);
  stopCurrent = () => {
    osc.onended = null;
    osc.stop();
    finish();
  };
}

export const stopMorse = () => stopCurrent?.();
