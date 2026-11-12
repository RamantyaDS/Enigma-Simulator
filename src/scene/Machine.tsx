import type { Texture } from 'three';
import { useStore } from '../store';
import { CASE, PLATE_Y, ROTOR } from './layout';
import { woodTexture } from './textures';

/** Material that fades out in X-ray mode. */
export function Shell({ color, map, roughness = 0.6, metalness = 0 }: { color?: string; map?: Texture; roughness?: number; metalness?: number }) {
  const xray = useStore((s) => s.xray);
  return (
    <meshStandardMaterial
      key={xray ? 'xray' : 'solid'} // a fresh material, since three.js does not re-sort a material whose transparency flips
      color={color}
      map={map}
      roughness={roughness}
      metalness={metalness}
      transparent={xray}
      opacity={xray ? 0.08 : 1}
      depthWrite={!xray}
    />
  );
}

export function Desk() {
  const map = woodTexture('desk', '#4a2e1b', '#1e110a', 3);
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial map={map} roughness={0.45} />
    </mesh>
  );
}

export function Case() {
  const wood = woodTexture('case', '#7a4f2c', '#3a2112');
  const { w, d, h, wall } = CASE;
  const front = PLATE_Y; // the front wall stops at plate level so the keyboard stays visible
  const walls: [number[], number[]][] = [
    [[0, h / 2, -d / 2 + wall / 2], [w, h, wall]],
    [[0, front / 2, d / 2 - wall / 2], [w, front, wall]],
    [[-w / 2 + wall / 2, h / 2, 0], [wall, h, d]],
    [[w / 2 - wall / 2, h / 2, 0], [wall, h, d]],
    [[0, 0.03, 0], [w, 0.06, d]],
  ];
  // Top plate with an opening over the rotors.
  const inner = w - wall * 2;
  const rotorOpen = { z0: ROTOR.z - 0.38, z1: ROTOR.z + 0.36 };
  const zFront = d / 2 - wall;
  const zBack = -d / 2 + wall;
  return (
    <group>
      {walls.map(([p, s], i) => (
        <mesh key={i} position={p as never} castShadow receiveShadow>
          <boxGeometry args={s as never} />
          <Shell map={wood} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, PLATE_Y - 0.015, (rotorOpen.z1 + zFront) / 2]} receiveShadow castShadow>
        <boxGeometry args={[inner, 0.03, zFront - rotorOpen.z1]} />
        <Shell color="#181614" roughness={0.75} metalness={0.25} />
      </mesh>
      <mesh position={[0, PLATE_Y - 0.015, (rotorOpen.z0 + zBack) / 2]} receiveShadow>
        <boxGeometry args={[inner, 0.03, rotorOpen.z0 - zBack]} />
        <Shell color="#181614" roughness={0.75} metalness={0.25} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (inner / 2 - 0.27), PLATE_Y - 0.015, ROTOR.z]} receiveShadow>
          <boxGeometry args={[0.54, 0.03, rotorOpen.z1 - rotorOpen.z0]} />
          <Shell color="#181614" roughness={0.75} metalness={0.25} />
        </mesh>
      ))}
      {/* dark well under the rotors */}
      <mesh position={[0, 0.3, ROTOR.z]}>
        <boxGeometry args={[inner - 0.02, 0.02, 0.9]} />
        <meshStandardMaterial color="#0c0b0a" roughness={1} />
      </mesh>
    </group>
  );
}

export function Lid() {
  const wood = woodTexture('case', '#7a4f2c', '#3a2112');
  const { w, d, h } = CASE;
  const t = 0.3;
  return (
    <group position={[0, h, -d / 2]} rotation-x={-1.85}>
      <mesh position={[0, t / 2, d / 2]} castShadow>
        <boxGeometry args={[w, t, d]} />
        <Shell map={wood} roughness={0.5} />
      </mesh>
      {/* felt lining on the inside */}
      <mesh position={[0, -0.001, d / 2]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[w - 0.14, d - 0.14]} />
        <Shell color="#2b2a24" roughness={1} />
      </mesh>
    </group>
  );
}
