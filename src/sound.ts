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
