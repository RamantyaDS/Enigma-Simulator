import { Line } from '@react-three/drei';
import { useEffect, useMemo, useState } from 'react';
import { Color } from 'three';
import { SignalPath as Path } from '../engine/enigma';
import { useStore } from '../store';
import { contact, ETW_X, KEY_POS, LAMP_POS, PLUG_POS, ROTOR, UKW_X, Vec3 } from './layout';

// Values above 1 make the line glow through the bloom pass.
const FORWARD = new Color(4, 2.2, 0.4);
const BACKWARD = new Color(0.4, 2.4, 4);
const RIGHT_FACE = 0.145;
const LEFT_FACE = -0.16;
const plug = (k: number): Vec3 => [PLUG_POS[k][0], PLUG_POS[k][1], PLUG_POS[k][2] + 0.02];

/** Points of the current, in order, split where the reflector turns it around. */
function route(p: Path): { forward: Vec3[]; backward: Vec3[] } {
  const [xL, xM, xR] = ROTOR.x;
  const key = KEY_POS[p.key];
  const forward: Vec3[] = [
    [key[0], key[1] + 0.21, key[2]],
    [key[0], 0.45, key[2]],
    plug(p.key),
    plug(p.plugIn),
    contact(ETW_X - 0.07, p.plugIn),
    contact(xR + RIGHT_FACE, p.plugIn),
    contact(xR + LEFT_FACE, p.forward[0]),
    contact(xM + RIGHT_FACE, p.forward[0]),
    contact(xM + LEFT_FACE, p.forward[1]),
    contact(xL + RIGHT_FACE, p.forward[1]),
    contact(xL + LEFT_FACE, p.forward[2]),
    contact(UKW_X + 0.07, p.forward[2]),
  ];
  const lamp = LAMP_POS[p.lamp];
  const backward: Vec3[] = [
    contact(UKW_X + 0.07, p.reflector),
    contact(xL + LEFT_FACE, p.reflector),
    contact(xL + RIGHT_FACE, p.backward[0]),
    contact(xM + LEFT_FACE, p.backward[0]),
    contact(xM + RIGHT_FACE, p.backward[1]),
    contact(xR + LEFT_FACE, p.backward[1]),
    contact(xR + RIGHT_FACE, p.backward[2]),
    contact(ETW_X - 0.07, p.backward[2]),
    plug(p.backward[2]),
    plug(p.lamp),
    [lamp[0], 0.45, lamp[2]],
    [lamp[0], lamp[1] + 0.02, lamp[2]],
  ];
  return { forward, backward: [forward[forward.length - 1], ...backward] };
}

export function SignalPath() {
  const path = useStore((s) => s.path);
  const xray = useStore((s) => s.xray);
  const slow = useStore((s) => s.slow);
  const pts = useMemo(() => (path ? route(path) : null), [path]);
  const total = pts ? pts.forward.length + pts.backward.length - 1 : 0;
  const [shown, setShown] = useState(total);

  useEffect(() => {
    if (!slow) return setShown(total);
    setShown(2);
    const id = setInterval(() => setShown((n) => (n >= total ? n : n + 1)), 220);
    return () => clearInterval(id);
  }, [path, slow, total]);

  if (!xray || !pts) return null;
  const f = pts.forward.slice(0, Math.max(2, Math.min(shown, pts.forward.length)));
  const bCount = shown - pts.forward.length + 1;
  const b = bCount >= 2 ? pts.backward.slice(0, bCount) : null;
  return (
    <group>
      <Line points={f} color={FORWARD} lineWidth={3} toneMapped={false} />
      {b && <Line points={b} color={BACKWARD} lineWidth={3} toneMapped={false} />}
    </group>
  );
}
