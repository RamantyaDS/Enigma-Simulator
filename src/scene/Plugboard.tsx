import { RoundedBox } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { ALPHABET } from '../engine/enigma';
import { useStore } from '../store';
import { Shell } from './Machine';
import { CASE, PLUG_POS } from './layout';
import { letterTexture } from './textures';

const GLOW = new THREE.Color(3, 2, 0.6);

/** Cloth cable that hangs from one plug, loops onto the desk in front of the machine, and comes back up. */
function Cable({ a, b }: { a: number; b: number }) {
  const geo = useMemo(() => {
    const [xa, ya, z] = PLUG_POS[a];
    const [xb, yb] = PLUG_POS[b];
    const reach = 0.35 + ((a * 7 + b * 13) % 5) * 0.07; // vary the loops so cables do not overlap exactly
    const pts = [
      new THREE.Vector3(xa, ya - 0.04, z + 0.1),
      new THREE.Vector3(xa, ya - 0.2, z + 0.2),
      new THREE.Vector3((xa + xb) / 2, 0.025, z + reach),
      new THREE.Vector3(xb, yb - 0.2, z + 0.2),
      new THREE.Vector3(xb, yb - 0.04, z + 0.1),
    ];
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 0.016, 8);
  }, [a, b]);
  return (
    <mesh geometry={geo} castShadow>
      <meshStandardMaterial color="#3a2b22" roughness={0.95} />
    </mesh>
  );
}

/** Bakelite plug head with a brass screw, as on the real cables. */
function Plug() {
  return (
    <group position={[0, -0.03, 0.045]}>
      <RoundedBox args={[0.085, 0.12, 0.08]} radius={0.018} smoothness={3} castShadow>
        <meshStandardMaterial color="#0b0a09" roughness={0.25} />
      </RoundedBox>
      <mesh position-z={0.041} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[0.014, 0.014, 0.006, 16]} />
        <meshStandardMaterial color="#b8955a" metalness={1} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Socket({ k, plugged, selected }: { k: number; plugged: boolean; selected: boolean }) {
  const [x, y, z] = PLUG_POS[k];
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useStore.getState().clickSocket(k);
  };
  return (
    <group
      position={[x, y, z]}
      onClick={onClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = '')}
    >
      {[-0.025, 0.025].map((dy) => (
        <mesh key={dy} position={[0, dy - 0.02, 0.001]}>
          <circleGeometry args={[0.014, 12]} />
          <meshBasicMaterial color="#000" />
        </mesh>
      ))}
      <mesh position={[0, 0.07, 0.001]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial map={letterTexture(ALPHABET[k], '#d9d2bf', '#161412')} roughness={0.7} />
      </mesh>
      {selected && (
        <mesh position={[0, -0.02, 0.003]}>
          <ringGeometry args={[0.055, 0.07, 32]} />
          <meshBasicMaterial color={GLOW} toneMapped={false} />
        </mesh>
      )}
      {plugged && <Plug />}
      {/* invisible click target over the socket */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[0.13, 0.19]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function Plugboard() {
  const text = useStore((s) => s.settings.plugboard);
  const selected = useStore((s) => s.plugSelect);
  const pairs = (text.match(/[A-Z]{2}/g) ?? []).map((p) => [p.charCodeAt(0) - 65, p.charCodeAt(1) - 65]);
  const plugged = new Set(pairs.flat());
  return (
    <group>
      <mesh position={[0, 0.46, CASE.d / 2 + 0.005]} receiveShadow>
        <boxGeometry args={[3.0, 0.62, 0.02]} />
        <Shell color="#161412" roughness={0.75} metalness={0.25} />
      </mesh>
      {ALPHABET.split('').map((_, k) => (
        <Socket key={k} k={k} plugged={plugged.has(k)} selected={selected === k} />
      ))}
      {pairs.map(([a, b]) => (
        <Cable key={`${a}${b}`} a={a} b={b} />
      ))}
    </group>
  );
}
