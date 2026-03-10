'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Text, Html } from '@react-three/drei';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import type { TestResult } from '@/app/page';

interface ResultSceneProps {
  result: TestResult;
  onReturnHome: () => void;
}

interface StoredScore {
  wpm: number;
  accuracy: number;
  timestamp: number;
  mode: string;
  difficulty: string;
}

function ResultContent({ result, onReturnHome }: ResultSceneProps) {
  const [personalBest, setPersonalBest] = useState(false);
  const [leaderboard, setLeaderboard] = useState<StoredScore[]>([]);

  useEffect(() => {
    // Load and save scores
    const stored = localStorage.getItem('typeRushScores');
    const scores: StoredScore[] = stored ? JSON.parse(stored) : [];

    const newScore: StoredScore = {
      wpm: result.wpm,
      accuracy: result.accuracy,
      timestamp: Date.now(),
      mode: result.config.mode,
      difficulty: result.config.difficulty
    };

    scores.push(newScore);
    scores.sort((a, b) => b.wpm - a.wpm);
    const topScores = scores.slice(0, 10);

    setLeaderboard(topScores);
    localStorage.setItem('typeRushScores', JSON.stringify(scores));

    // Check if personal best
    const modeScores = scores.filter(
      (s) => s.mode === result.config.mode && s.difficulty === result.config.difficulty
    );
    const modeRecord = modeScores[0];
    if (modeRecord && modeRecord.wpm === result.wpm) {
      setPersonalBest(true);
    }
  }, [result]);

  return (
    <>
      <Environment preset="night" />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#00f5d4" />

      {/* Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={1}
        color={personalBest ? '#ff00ff' : '#00f5d4'}
        anchorX="center"
        anchorY="middle"
      >
        {personalBest ? 'NEW RECORD!' : 'TEST COMPLETE'}
      </Text>

      {/* Main stats */}
      <group position={[0, 1.5, 0]}>
        {/* WPM */}
        <group position={[-2, 0, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.6}
            color="#ffd60a"
            anchorX="center"
            anchorY="middle"
          >
            WPM
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={1.2}
            color="#00f5d4"
            anchorX="center"
            anchorY="middle"
          >
            {result.wpm}
          </Text>
        </group>

        {/* Accuracy */}
        <group position={[0, 0, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.6}
            color="#ffd60a"
            anchorX="center"
            anchorY="middle"
          >
            ACCURACY
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={1.2}
            color="#00f5d4"
            anchorX="center"
            anchorY="middle"
          >
            {result.accuracy}%
          </Text>
        </group>

        {/* Time */}
        <group position={[2, 0, 0]}>
          <Text
            position={[0, 0.3, 0]}
            fontSize={0.6}
            color="#ffd60a"
            anchorX="center"
            anchorY="middle"
          >
            TIME
          </Text>
          <Text
            position={[0, -0.3, 0]}
            fontSize={1.2}
            color="#00f5d4"
            anchorX="center"
            anchorY="middle"
          >
            {(result.timeElapsed / 1000).toFixed(1)}s
          </Text>
        </group>
      </group>

      {/* Detailed stats */}
      <group position={[0, -0.5, 0]}>
        <Text
          position={[-3, 0, 0]}
          fontSize={0.35}
          color="#888888"
          anchorX="left"
          anchorY="middle"
        >
          Words: {result.wordsTyped} · Errors: {result.errors}
        </Text>
      </group>

      {/* Leaderboard */}
      <Text
        position={[-3, -1.5, 0]}
        fontSize={0.5}
        color="#ffd60a"
        anchorX="left"
        anchorY="middle"
      >
        TOP 5 SCORES
      </Text>

      <group position={[-3, -2.2, 0]}>
        {leaderboard.slice(0, 5).map((score, i) => (
          <Text
            key={i}
            position={[0, -i * 0.35, 0]}
            fontSize={0.25}
            color={i === 0 ? '#ff00ff' : '#00f5d4'}
            anchorX="left"
            anchorY="middle"
          >
            {i + 1}. {score.wpm} WPM ({score.accuracy}%)
          </Text>
        ))}
      </group>

      {/* Return button */}
      <group
        position={[0, -3.5, 0]}
        onClick={onReturnHome}
        style={{ cursor: 'pointer' }}
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2, 0.4, 0.1]} />
          <meshStandardMaterial
            color="#00f5d4"
            emissive="#00f5d4"
            emissiveIntensity={0.5}
          />
        </mesh>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.3}
          color="#0d0d0d"
          anchorX="center"
          anchorY="middle"
        >
          RETURN TO HOME
        </Text>
      </group>
    </>
  );
}

export function ResultScene({ result, onReturnHome }: ResultSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} className="w-full h-full">
      <color attach="background" args={['#0d0d0d']} />
      <ResultContent result={result} onReturnHome={onReturnHome} />
    </Canvas>
  );
}
