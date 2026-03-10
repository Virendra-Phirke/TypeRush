'use client';

import { Html } from '@react-three/drei';

interface FloatingTextProps {
  text: string;
  currentIndex: number;
}

export function FloatingText({ text, currentIndex }: FloatingTextProps) {
  const completedText = text.substring(0, currentIndex);
  const currentChar = text[currentIndex];
  const remainingText = text.substring(currentIndex + 1);

  return (
    <Html position={[0, 1, 0]} distanceFactor={4}>
      <div className="font-mono text-lg pointer-events-none whitespace-pre-wrap max-w-2xl">
        <span style={{ color: '#00ff00' }}>{completedText}</span>
        <span style={{ color: '#ffd60a', fontWeight: 'bold' }}>{currentChar}</span>
        <span style={{ color: '#666666' }}>{remainingText}</span>
      </div>
    </Html>
  );
}
