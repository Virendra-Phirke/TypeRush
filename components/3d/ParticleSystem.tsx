'use client';

import { useRef, useImperativeHandle, forwardRef, useState, useCallback, useEffect } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

let particleIdCounter = 0;

const ParticleSystemComponent = forwardRef<any>((_, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Clean up expired particles
  useEffect(() => {
    if (particles.length === 0) return;
    const timeout = setTimeout(() => {
      setParticles([]);
    }, 500);
    return () => clearTimeout(timeout);
  }, [particles]);

  useImperativeHandle(ref, () => ({
    emit: (isCorrect: boolean) => {
      const count = isCorrect ? 5 : 3;
      const color = isCorrect ? '#00f5d4' : '#ff4d6d';
      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
        newParticles.push({
          id: particleIdCounter++,
          x: 0,
          y: 0,
          dx: Math.cos(angle) * (30 + Math.random() * 40),
          dy: Math.sin(angle) * (30 + Math.random() * 40),
          color,
        });
      }

      setParticles(newParticles);
    },
  }), []);

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animation: 'particle-scatter 400ms ease-out forwards',
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
});

ParticleSystemComponent.displayName = 'ParticleSystem';

export const ParticleSystem = ParticleSystemComponent;
