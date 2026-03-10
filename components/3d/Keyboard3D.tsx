'use client';

import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface Keyboard3DProps {
  lastTypedChar?: string;
  isError?: boolean;
}

const KEYBOARD_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
];

const FINGER_ZONES = {
  left: ['1', '2', '3', '4', '5', 'Q', 'W', 'E', 'R', 'T', 'A', 'S', 'D', 'F', 'G', 'Z', 'X', 'C', 'V', 'B'],
  right: ['6', '7', '8', '9', '0', 'Y', 'U', 'I', 'O', 'P', 'H', 'J', 'K', 'L', ';', 'N', 'M', ',', '.', '/'],
  space: [' ']
};

const FINGER_COLORS = {
  left: '#ff4d6d',    // Red
  right: '#00f5d4',   // Cyan
  space: '#ffd60a'    // Yellow
};

export function Keyboard3D({ lastTypedChar, isError }: Keyboard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const keysRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create keyboard geometry
    let xOffset = 0;
    let yOffset = 0;

    KEYBOARD_LAYOUT.forEach((row, rowIndex) => {
      xOffset = 0;
      row.forEach((key) => {
        const keyGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.2);
        const keyMaterial = new THREE.MeshStandardMaterial({
          color: getKeyColor(key),
          emissive: getKeyColor(key),
          emissiveIntensity: 0.3,
          metalness: 0.3,
          roughness: 0.4
        });

        const keyMesh = new THREE.Mesh(keyGeometry, keyMaterial);
        keyMesh.position.set(xOffset, -rowIndex * 0.45, 0);
        keyMesh.castShadow = true;
        keyMesh.receiveShadow = true;

        groupRef.current!.add(keyMesh);
        keysRef.current.set(key.toUpperCase(), keyMesh);

        // Add key label
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#0d0d0d';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = getKeyColor(key);
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        const labelGeometry = new THREE.PlaneGeometry(0.3, 0.3);
        const labelMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
        labelMesh.position.z = 0.15;
        keyMesh.add(labelMesh);

        xOffset += 0.4;
      });
    });

    // Add spacebar
    const spacebarGeometry = new THREE.BoxGeometry(3, 0.35, 0.2);
    const spacebarMaterial = new THREE.MeshStandardMaterial({
      color: FINGER_COLORS.space,
      emissive: FINGER_COLORS.space,
      emissiveIntensity: 0.3,
      metalness: 0.3,
      roughness: 0.4
    });
    const spacebarMesh = new THREE.Mesh(spacebarGeometry, spacebarMaterial);
    spacebarMesh.position.set(1.5, -KEYBOARD_LAYOUT.length * 0.45, 0);
    spacebarMesh.castShadow = true;
    spacebarMesh.receiveShadow = true;
    groupRef.current.add(spacebarMesh);
    keysRef.current.set(' ', spacebarMesh);

  }, []);

  // Update active key and effects
  useEffect(() => {
    if (lastTypedChar) {
      const keyUpper = lastTypedChar.toUpperCase();
      
      // Reset all keys
      keysRef.current.forEach((mesh) => {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.3;
      });

      // Highlight typed key
      const keyMesh = keysRef.current.get(keyUpper === ' ' ? ' ' : keyUpper);
      if (keyMesh) {
        const material = keyMesh.material as THREE.MeshStandardMaterial;
        if (isError) {
          material.emissive.setHex(0xff0000);
          material.emissiveIntensity = 0.8;
        } else {
          material.emissiveIntensity = 0.9;
        }
        setActiveKey(keyUpper);

        // Animate key press
        const originalY = keyMesh.position.y;
        keyMesh.position.z -= 0.08;
        setTimeout(() => {
          keyMesh.position.z = 0;
        }, 100);
      }

      // Reset after delay
      const timeout = setTimeout(() => {
        keysRef.current.forEach((mesh) => {
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.emissiveIntensity = 0.3;
        });
        setActiveKey(null);
      }, 200);

      return () => clearTimeout(timeout);
    }
  }, [lastTypedChar, isError]);

  return (
    <group ref={groupRef} position={[0, 0, 0]} />
  );
}

function getKeyColor(key: string): string {
  const upper = key.toUpperCase();
  if (FINGER_ZONES.left.includes(upper) || FINGER_ZONES.left.includes(key)) {
    return FINGER_COLORS.left;
  } else if (FINGER_ZONES.right.includes(upper) || FINGER_ZONES.right.includes(key)) {
    return FINGER_COLORS.right;
  } else if (key === ' ') {
    return FINGER_COLORS.space;
  }
  return '#666666';
}
