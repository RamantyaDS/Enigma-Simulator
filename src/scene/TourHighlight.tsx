import { Edges } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';
import { CHAPTERS, Part } from '../tour';
import { CASE, COVER_Y, ETW_X, PLATE_Y, ROTOR, UKW_X, Vec3 } from './layout';

const R = ROTOR;
const BOXES: Record<Part, { center: Vec3; size: Vec3 }> = {
  keyboard: { center: [0, PLATE_Y + 0.08, 0.79], size: [3.1, 0.22, 0.85] },
  lamps: { center: [0, PLATE_Y + 0.04, -0.3], size: [2.9, 0.12, 0.75] },
  plugboard: { center: [0, 0.46, CASE.d / 2 + 0.05], size: [3.05, 0.66, 0.12] },
  // Rotor-area boxes only cover what sticks out above the top plate, so the outline never cuts through the case.
  etw: { center: [ETW_X, 0.98, R.z], size: [0.2, 0.24, 0.52] },
  ukw: { center: [UKW_X, 0.98, R.z], size: [0.2, 0.24, 0.52] },
  rotors: { center: [0, 1.0, R.z], size: [1.3, 0.28, 0.78] },
  rightRotor: { center: [R.x[2], 1.0, R.z], size: [0.34, 0.28, 0.78] },
  windows: { center: [0, COVER_Y + 0.02, R.z], size: [1.2, 0.06, 0.3] },
};

// Above 1 so the outline glows through the bloom pass.
const GLOW = new THREE.Color(3, 2, 0.5);

/** Pulsing glowing box around the part the open tour chapter is talking about. */
export function TourHighlight() {
  const part = useStore((s) => (s.tour === null ? undefined : CHAPTERS[s.tour].part));
  const fill = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (fill.current) fill.current.opacity = 0.05 + 0.05 * Math.sin(clock.elapsedTime * 4);
  });
  if (!part) return null;
  const { center, size } = BOXES[part];
  return (
    <mesh key={part} position={center} renderOrder={10}>
      <boxGeometry args={size} />
      <meshBasicMaterial ref={fill} color="#ffcf6a" transparent depthWrite={false} />
      <Edges color={GLOW} toneMapped={false} linewidth={2} />
    </mesh>
  );
}
