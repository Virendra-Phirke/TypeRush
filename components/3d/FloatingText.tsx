'use client';

import { Text } from '@react-three/drei';
import { useMemo } from 'react';

interface FloatingTextProps {
  text: string;
  currentIndex: number;
}

export function FloatingText({ text, currentIndex }: FloatingTextProps) {
  // Split text into chunks for better display
  const chunkSize = 60;
  const chunks = useMemo(() => {
    const result: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      result.push(text.substring(i, Math.min(i + chunkSize, text.length)));
    }
    return result;
  }, [text]);

  const completedText = text.substring(0, currentIndex);
  const currentChar = text[currentIndex];
  const remainingText = text.substring(currentIndex + 1);

  return (
    <group position={[0, 0, 0]}>
      {/* Completed text (green) */}
      <Text
        position={[-4, 0.3, 0]}
        fontSize={0.35}
        color="#00ff00"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="left"
        anchorY="middle"
        maxWidth={8}
      >
        {completedText}
      </Text>

      {/* Current character (cursor) */}
      {currentChar && (
        <Text
          position={[
            -4 + (completedText.length % 40) * 0.085,
            0.3 - Math.floor(completedText.length / 40) * 0.4,
            0
          ]}
          fontSize={0.35}
          color="#ffd60a"
          fontFamily="/fonts/GeistMono_Regular.ttf"
          anchorX="left"
          anchorY="middle"
        >
          {currentChar}
        </Text>
      )}

      {/* Remaining text (gray) */}
      <Text
        position={[
          -4 + ((completedText.length + 1) % 40) * 0.085,
          0.3 - Math.floor((completedText.length + 1) / 40) * 0.4,
          0
        ]}
        fontSize={0.35}
        color="#666666"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="left"
        anchorY="middle"
        maxWidth={8}
      >
        {remainingText.substring(0, 40)}
      </Text>

      {/* Typing speed indicator - animated line */}
      <group position={[0, -0.8, 0]}>
        <mesh>
          <boxGeometry args={[8, 0.02, 0.05]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  );
}
