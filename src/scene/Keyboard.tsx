import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ALPHABET } from '../engine/enigma';
import { useStore } from '../store';
import { controls } from './camera';
import { KEY_POS, LAMP_POS } from './layout';
import { letterTexture } from './textures';

const STEM = 0.15;

function Key({ index }: { index: number }) {
  const ref = useRef<THREE.Group>(null);
  const [x, y, z] = KEY_POS[index];
  useFrame((_, dt) => {
    const down = useStore.getState().pressed === index ? -0.07 : 0;
    const g = ref.current!;
    g.position.y = THREE.MathUtils.damp(g.position.y, y + down, 30, dt);
  });
  const onDown = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (controls.current) controls.current.enabled = false;
    useStore.getState().pressKey(index);
  };
  return (
    <group ref={ref} position={[x, y, z]} onPointerDown={onDown}>
      <mesh position-y={STEM / 2} castShadow>
        <cylinderGeometry args={[0.018, 0.018, STEM, 8]} />
        <meshStandardMaterial color="#9a9a9a" metalness={1} roughness={0.3} />
      </mesh>
      {/* chrome rim */}
      <mesh position-y={STEM + 0.02} castShadow>
        <cylinderGeometry args={[0.125, 0.125, 0.05, 40]} />
        <meshStandardMaterial color="#d8d8d8" metalness={1} roughness={0.2} />
      </mesh>
      {/* letter cap */}
      <mesh position-y={STEM + 0.046} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.105, 40]} />
        <meshStandardMaterial map={letterTexture(ALPHABET[index], '#141210', '#ece5d2')} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function Keyboard() {
  return (
    <group>
      {ALPHABET.split('').map((_, i) => (
        <Key key={i} index={i} />
      ))}
    </group>
  );
}

function Lamp({ index }: { index: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame((_, dt) => {
    const s = useStore.getState();
    const lit = s.pressed !== null && s.path?.lamp === index ? 4 : 0;
    mat.current!.emissiveIntensity = THREE.MathUtils.damp(mat.current!.emissiveIntensity, lit, 25, dt);
  });
  const tex = letterTexture(ALPHABET[index], '#ffffff', '#000000');
  const [x, y, z] = LAMP_POS[index];
  return (
    <group position={[x, y, z]}>
      <mesh position-y={0.006} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.1, 0.12, 40]} />
        <meshStandardMaterial color="#2a2826" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position-y={0.004} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.1, 40]} />
        <meshStandardMaterial
          ref={mat}
          color="#7d7666"
          map={tex}
          emissive="#ffc35a"
          emissiveMap={tex}
          emissiveIntensity={0}
          roughness={0.15}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/** One moving point light placed under the lit lamp. */
function LampLight() {
  const ref = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    const s = useStore.getState();
    const l = ref.current!;
    if (s.path) l.position.set(LAMP_POS[s.path.lamp][0], LAMP_POS[s.path.lamp][1] + 0.15, LAMP_POS[s.path.lamp][2]);
    l.intensity = THREE.MathUtils.damp(l.intensity, s.pressed !== null ? 0.6 : 0, 25, dt);
  });
  return <pointLight ref={ref} color="#ffb84a" distance={1.5} decay={2} intensity={0} />;
}

export function Lampboard() {
  return (
    <group>
      {ALPHABET.split('').map((_, i) => (
        <Lamp key={i} index={i} />
      ))}
      <LampLight />
    </group>
  );
}
