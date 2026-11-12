import { ThreeEvent, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useStore } from '../store';
import { Shell } from './Machine';
import { CASE, COVER_Y, ETW_X, PLATE_Y, ROTOR, rotorAngle, UKW_X } from './layout';
import { ringTexture } from './textures';

const TWO_PI = Math.PI * 2;

function useGearGeometry() {
  return useMemo(() => {
    const shape = new THREE.Shape();
    const teeth = 52;
    for (let i = 0; i <= teeth * 2; i++) {
      const a = (i / (teeth * 2)) * TWO_PI;
      const r = i % 2 ? ROTOR.wheelR - 0.018 : ROTOR.wheelR;
      if (i === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a));
      else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
    }
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 1 });
    geo.translate(0, 0, -0.025);
    geo.rotateY(Math.PI / 2);
    return geo;
  }, []);
}

function useRingGeometry() {
  return useMemo(() => {
    const geo = new THREE.CylinderGeometry(ROTOR.ringR, ROTOR.ringR, 0.1, 104, 1, true);
    geo.rotateZ(-Math.PI / 2);
    return geo;
  }, []);
}

function Rotor({ slot }: { slot: number }) {
  const ref = useRef<THREE.Group>(null);
  const gear = useGearGeometry();
  const ring = useRingGeometry();
  const angle = useRef(rotorAngle(useStore.getState().positions[slot]));

  useFrame((_, dt) => {
    const target = rotorAngle(useStore.getState().positions[slot]);
    let delta = (target - angle.current) % TWO_PI;
    if (delta > Math.PI) delta -= TWO_PI;
    if (delta < -Math.PI) delta += TWO_PI;
    angle.current += delta * Math.min(1, dt * 16);
    ref.current!.rotation.x = angle.current;
  });

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    useStore.getState().nudgeRotor(slot, e.shiftKey ? -1 : 1);
  };

  return (
    <group position={[ROTOR.x[slot], ROTOR.y, ROTOR.z]}>
      <group ref={ref} onClick={onClick}>
        {/* thumbwheel */}
        <mesh geometry={gear} position-x={-0.13} castShadow>
          <meshStandardMaterial color="#2b2b2b" metalness={0.7} roughness={0.35} />
        </mesh>
        {/* alphabet ring */}
        <mesh geometry={ring} position-x={-0.05}>
          <meshStandardMaterial map={ringTexture()} roughness={0.4} />
        </mesh>
        {/* rotor body */}
        <mesh position-x={0.07} rotation-z={-Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.27, 0.27, 0.14, 48]} />
          <Shell color="#121110" roughness={0.3} />
        </mesh>
        {/* brass contacts on the right face */}
        {Array.from({ length: 26 }, (_, k) => {
          const a = (k / 26) * TWO_PI;
          return (
            <mesh key={k} position={[0.141, ROTOR.contactR * Math.cos(a), ROTOR.contactR * Math.sin(a)]} rotation-z={-Math.PI / 2}>
              <cylinderGeometry args={[0.012, 0.012, 0.006, 8]} />
              <meshStandardMaterial color="#c8a252" metalness={1} roughness={0.3} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function StaticDisc({ x, color }: { x: number; color: string }) {
  return (
    <mesh position={[x, ROTOR.y, ROTOR.z]} rotation-z={-Math.PI / 2} castShadow>
      <cylinderGeometry args={[0.28, 0.28, 0.12, 48]} />
      <meshStandardMaterial color={color} metalness={0.5} roughness={0.45} />
    </mesh>
  );
}

/** Inner lid over the rotors: one letter window and one thumbwheel slot per rotor. Hinged at the back. */
function Cover() {
  const ref = useRef<THREE.Group>(null);
  const depth = 0.74;
  const geo = useMemo(() => {
    const w = CASE.w - CASE.wall * 2;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2, 0).lineTo(w / 2, 0).lineTo(w / 2, depth).lineTo(-w / 2, depth).closePath();
    const hole = (x0: number, x1: number, z0: number, z1: number) =>
      shape.holes.push(new THREE.Path().moveTo(x0, z0).lineTo(x0, z1).lineTo(x1, z1).lineTo(x1, z0).closePath());
    const mid = depth / 2;
    for (const x of ROTOR.x) {
      hole(x - 0.09, x - 0.01, mid - 0.055, mid + 0.055); // letter window
      hole(x - 0.175, x - 0.105, mid - 0.21, mid + 0.21); // thumbwheel slot
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  useFrame((_, dt) => {
    const open = useStore.getState().coverOpen ? -1.75 : 0;
    ref.current!.rotation.x = THREE.MathUtils.damp(ref.current!.rotation.x, open, 6, dt);
  });
  const apronH = COVER_Y - 0.02 - PLATE_Y;
  return (
    <>
      <group ref={ref} position={[0, COVER_Y, ROTOR.z - depth / 2]}>
        <mesh geometry={geo} castShadow receiveShadow>
          <Shell color="#1b1917" roughness={0.6} metalness={0.35} />
        </mesh>
      </group>
      {/* fixed front and back walls of the raised rotor housing */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, PLATE_Y + apronH / 2, ROTOR.z + (side * depth) / 2]} receiveShadow>
          <boxGeometry args={[CASE.w - CASE.wall * 2, apronH, 0.02]} />
          <Shell color="#1b1917" roughness={0.6} metalness={0.35} />
        </mesh>
      ))}
    </>
  );
}

export function Rotors() {
  return (
    <group>
      {[0, 1, 2].map((slot) => (
        <Rotor key={slot} slot={slot} />
      ))}
      <Cover />
      <StaticDisc x={UKW_X} color="#3d3a36" />
      <StaticDisc x={ETW_X} color="#3d3a36" />
      {/* axle */}
      <mesh position={[0, ROTOR.y, ROTOR.z]} rotation-z={-Math.PI / 2}>
        <cylinderGeometry args={[0.02, 0.02, 1.9, 12]} />
        <meshStandardMaterial color="#cfcfcf" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  );
}
