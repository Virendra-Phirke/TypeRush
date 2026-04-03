'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, Grid } from '@react-three/drei';
import * as THREE from 'three';

function Scene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating/rotating based on time
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 10, 40]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#00f5d4" />
      <directionalLight position={[-10, 10, 5]} intensity={0.5} color="#ff4d6d" />
      
      <group ref={groupRef}>
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <Grid
            position={[0, -2, 0]}
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#00f5d4"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#ffd60a"
            fadeDistance={30}
            fadeStrength={1}
          />
        </Float>
        <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      </group>
    </>
  );
}

export function Background3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
      <Canvas 
        camera={{ position: [0, 2, 10], fov: 60 }}
        gl={{ powerPreference: 'high-performance', antialias: false, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Scene />
      </Canvas>
      {/* Scanline overlay over the 3D canvas */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
    </div>
  );
}