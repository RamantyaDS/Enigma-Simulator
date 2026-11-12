import type { CameraControls } from '@react-three/drei';
import { createRef, type ElementRef } from 'react';

export const controls = createRef<ElementRef<typeof CameraControls>>();

export const PRESETS = {
  operator: { pos: [0, 4.2, 3.5], target: [0, 0.75, 0] },
  rotor: { pos: [0.3, 2.6, 0.3], target: [0, 0.9, -1.04] },
  plugboard: { pos: [0, 1.2, 3.8], target: [0, 0.45, 1.4] },
  xray: { pos: [3.6, 2.6, 2.8], target: [0, 0.6, -0.2] },
} as const;

export type Preset = keyof typeof PRESETS;

export function goTo(name: Preset, smooth = true) {
  const { pos, target } = PRESETS[name];
  controls.current?.setLookAt(pos[0], pos[1], pos[2], target[0], target[1], target[2], smooth);
}
