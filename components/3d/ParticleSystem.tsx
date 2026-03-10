'use client';

import { useRef, useImperativeHandle, forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  color: THREE.Color;
}

const ParticleSystemComponent = forwardRef<any>((props, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<Particle[]>([]);
  const meshesRef = useRef<THREE.InstancedMesh | null>(null);

  // Create instanced geometry for particles
  const { geometry, material } = (() => {
    const geom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshStandardMaterial({
      color: '#00f5d4',
      emissive: '#00f5d4',
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.2
    });
    return { geometry: geom, material: mat };
  })();

  useImperativeHandle(ref, () => ({
    emit: (isCorrect: boolean) => {
      const count = isCorrect ? 5 : 3;
      const color = new THREE.Color(isCorrect ? '#00f5d4' : '#ff0000');

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 0.05 + Math.random() * 0.05;

        particlesRef.current.push({
          position: new THREE.Vector3(
            Math.cos(angle) * 0.2,
            Math.sin(angle) * 0.2,
            0
          ),
          velocity: new THREE.Vector3(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed,
            (Math.random() - 0.5) * 0.05
          ),
          lifetime: 0,
          maxLifetime: 60,
          color
        });
      }
    }
  }), []);

  useFrame(() => {
    if (!groupRef.current) return;

    // Update particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.lifetime++;
      p.position.add(p.velocity);
      p.velocity.y -= 0.001; // Gravity

      if (p.lifetime >= p.maxLifetime) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Update mesh instances
    if (meshesRef.current && particlesRef.current.length > 0) {
      particlesRef.current.forEach((p, i) => {
        const matrix = new THREE.Matrix4();
        const progress = p.lifetime / p.maxLifetime;
        const scale = 1 - progress;
        matrix.compose(
          p.position,
          new THREE.Quaternion(),
          new THREE.Vector3(scale, scale, scale)
        );
        meshesRef.current!.setMatrixAt(i, matrix);
      });
      meshesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshesRef}
        args={[geometry, material, 1000]}
        position={[0, -2, 0]}
      />
    </group>
  );
});

ParticleSystemComponent.displayName = 'ParticleSystem';

export const ParticleSystem = ParticleSystemComponent;
