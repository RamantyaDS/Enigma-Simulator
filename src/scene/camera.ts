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

export interface View {
  pos: readonly number[];
  target: readonly number[];
}

// Screen space (px) covered by an overlay, so the camera can frame the machine in the part that stays visible.
let inset = { right: 0, bottom: 0 };
export const setInset = (right: number, bottom: number) => (inset = { right, bottom });

export const goTo = (name: Preset, smooth = true) => goToView(PRESETS[name], smooth);

export function goToView({ pos, target }: View, smooth = true) {
  const c = controls.current;
  if (!c) return;
  // Presets are framed for landscape screens; pull back on narrow (portrait) screens so the machine still fits.
  // Width is what limits the framing, so fit the machine into the width an overlay leaves visible.
  const aspect = (c.camera as PerspectiveCamera).aspect;
  const visible = (innerWidth - inset.right) / innerHeight;
  const k = Math.max(1, 1.3 / visible);
  const p = pos.map((v, i) => target[i] + (v - target[i]) * k);
  c.setLookAt(p[0], p[1], p[2], target[0], target[1], target[2], smooth);
  const cam = c.camera as PerspectiveCamera;
  const h = 2 * Math.hypot(...p.map((v, i) => v - target[i])) * Math.tan((cam.fov * Math.PI) / 360);
  c.setFocalOffset(((h * aspect) / 2) * (inset.right / innerWidth), (h / 2) * (inset.bottom / innerHeight), 0, smooth);
}
