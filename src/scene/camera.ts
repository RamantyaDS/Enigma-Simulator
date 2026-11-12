import type { CameraControls } from '@react-three/drei';
import { createRef, type ElementRef } from 'react';
import type { PerspectiveCamera } from 'three';

export const controls = createRef<ElementRef<typeof CameraControls>>();

export const PRESETS = {
  operator: { pos: [0, 4.2, 3.5], target: [0, 0.75, 0] },
  rotor: { pos: [0.3, 2.6, 0.3], target: [0, 0.9, -1.04] },
  plugboard: { pos: [0, 1.2, 3.8], target: [0, 0.45, 1.4] },
  xray: { pos: [3.6, 2.6, 2.8], target: [0, 0.6, -0.2] },
} as const;

export type Preset = keyof typeof PRESETS;

export function goTo(name: Preset, smooth = true) {
  const c = controls.current;
  if (!c) return;
  const { pos, target } = PRESETS[name];
  // Presets are framed for landscape screens; pull back on narrow (portrait) screens so the machine still fits.
  const aspect = (c.camera as PerspectiveCamera).aspect;
  const k = Math.max(1, 1.3 / aspect);
  const p = pos.map((v, i) => target[i] + (v - target[i]) * k);
  c.setLookAt(p[0], p[1], p[2], target[0], target[1], target[2], smooth);
}
