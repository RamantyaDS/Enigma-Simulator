import { CameraControls, ContactShadows, Environment, Lightformer } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect } from 'react';
import { useStore } from '../store';
import { controls, goTo } from './camera';
import { Keyboard, Lampboard } from './Keyboard';
import { Case, Desk, Lid } from './Machine';
import { Plugboard } from './Plugboard';
import { Rotors } from './Rotors';
import { SignalPath } from './SignalPath';
import { TourHighlight } from './TourHighlight';

function Intro() {
  useEffect(() => {
    controls.current?.setLookAt(7, 9, 13, 0, 0.6, 0, false);
    const id = setTimeout(() => goTo('operator'), 150);
    return () => clearTimeout(id);
  }, []);
  return null;
}

export function Experience() {
  const release = () => {
    useStore.getState().releaseKey();
    if (controls.current) controls.current.enabled = true;
  };
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [7, 9, 13], fov: 35, near: 0.1, far: 60 }}
      onPointerUp={release}
      onPointerLeave={release}
    >
      <color attach="background" args={['#0e0b08']} />
      <fog attach="fog" args={['#0e0b08', 12, 26]} />

      <ambientLight intensity={0.08} />
      <spotLight
        position={[-3.5, 7, 3.5]}
        angle={0.55}
        penumbra={0.8}
        intensity={140}
        color="#ffe0b0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <Environment resolution={256} environmentIntensity={0.6}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -6]} scale={[12, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-6, 3, 2]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} color="#ffd9a8" />
        <Lightformer form="circle" intensity={3} position={[3, 6, 4]} scale={2} />
      </Environment>

      <group position={[0, 0, 0]}>
        <Case />
        <Lid />
        <Keyboard />
        <Lampboard />
        <Rotors />
        <Plugboard />
        <SignalPath />
        <TourHighlight />
      </group>
      <Desk />
      <ContactShadows position={[0, 0.002, 0]} scale={10} blur={2.2} opacity={0.6} far={2} />

      <CameraControls
        ref={controls}
        makeDefault
        minDistance={1.2}
        maxDistance={14}
        maxPolarAngle={Math.PI * 0.47}
        smoothTime={0.6}
      />
      <Intro />
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} intensity={0.9} />
      </EffectComposer>
    </Canvas>
  );
}
