// Short synthesized mechanical clicks, no audio files needed.
let ctx: AudioContext | null = null;

export function click(kind: 'key' | 'release' | 'rotor') {
  ctx ??= new AudioContext();
  const len = kind === 'key' ? 0.06 : 0.03;
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * len), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 4);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = kind === 'rotor' ? 3200 : kind === 'key' ? 1400 : 2200;
  filter.Q.value = 1.5;
  const gain = ctx.createGain();
  gain.gain.value = kind === 'key' ? 0.9 : 0.5;
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start();
}
