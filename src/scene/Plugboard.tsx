import { useMemo } from 'react';
import * as THREE from 'three';
import { ALPHABET } from '../engine/enigma';
import { useStore } from '../store';
import { Shell } from './Machine';
import { CASE, PLUG_POS } from './layout';
import { letterTexture } from './textures';

function Cable({ a, b }: { a: number; b: number }) {
  const geo = useMemo(() => {
    const pa = new THREE.Vector3(...PLUG_POS[a]).setZ(PLUG_POS[a][2] + 0.08);
    const pb = new THREE.Vector3(...PLUG_POS[b]).setZ(PLUG_POS[b][2] + 0.08);
    const sag = Math.min(pa.y, pb.y) - 0.25 - pa.distanceTo(pb) * 0.15;
    const mid = new THREE.Vector3((pa.x + pb.x) / 2, Math.max(sag, 0.04), pa.z + 0.12);
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([pa, mid, pb]), 40, 0.014, 8);
  }, [a, b]);
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color="#2a1a12" roughness={0.8} />
      </mesh>
      {[a, b].map((k) => (
        <mesh key={k} position={[PLUG_POS[k][0], PLUG_POS[k][1], PLUG_POS[k][2] + 0.04]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
          <meshStandardMaterial color="#0e0d0c" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export function Plugboard() {
  const text = useStore((s) => s.settings.plugboard);
  const pairs = (text.toUpperCase().match(/[A-Z]{2}/g) ?? []).map((p) => [p.charCodeAt(0) - 65, p.charCodeAt(1) - 65]);
  return (
    <group>
      <mesh position={[0, 0.46, CASE.d / 2 + 0.005]} receiveShadow>
        <boxGeometry args={[3.0, 0.62, 0.02]} />
        <Shell color="#161412" roughness={0.75} metalness={0.25} />
      </mesh>
      {ALPHABET.split('').map((ch, k) => {
        const [x, y, z] = PLUG_POS[k];
        return (
          <group key={k} position={[x, y, z]}>
            {[-0.025, 0.025].map((dy) => (
              <mesh key={dy} position={[0, dy - 0.02, 0.001]}>
                <circleGeometry args={[0.014, 12]} />
                <meshBasicMaterial color="#000" />
              </mesh>
            ))}
            <mesh position={[0, 0.06, 0.001]}>
              <planeGeometry args={[0.07, 0.07]} />
              <meshStandardMaterial map={letterTexture(ch, '#d9d2bf', '#161412')} roughness={0.7} />
            </mesh>
          </group>
        );
      })}
      {pairs.map(([a, b]) => (
        <Cable key={`${a}${b}`} a={a} b={b} />
      ))}
    </group>
  );
}
