'use client';

import { Canvas } from '@react-three/fiber';
import { Environment, Html } from '@react-three/drei';
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

      {/* Results UI */}
      <Html position={[0, 2.5, 0]} distanceFactor={6}>
        <div className="text-center pointer-events-none">
          <h1 className="text-5xl font-mono font-bold mb-4" style={{ color: personalBest ? '#ff00ff' : '#00f5d4' }}>
            {personalBest ? 'NEW RECORD!' : 'TEST COMPLETE'}
          </h1>
          
          <div className="grid grid-cols-3 gap-8 mb-6">
            <div>
              <p className="text-sm" style={{ color: '#ffd60a' }}>WPM</p>
              <p className="text-3xl font-mono font-bold" style={{ color: '#00f5d4' }}>{result.wpm}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#ffd60a' }}>ACCURACY</p>
              <p className="text-3xl font-mono font-bold" style={{ color: '#00f5d4' }}>{result.accuracy}%</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: '#ffd60a' }}>TIME</p>
              <p className="text-3xl font-mono font-bold" style={{ color: '#00f5d4' }}>{(result.timeElapsed / 1000).toFixed(1)}s</p>
            </div>
          </div>

          <p className="text-xs mb-6" style={{ color: '#888888' }}>
            Words: {result.wordsTyped} · Errors: {result.errors}
          </p>

          <h2 className="text-lg font-mono font-bold mb-2" style={{ color: '#ffd60a' }}>TOP 5 SCORES</h2>
          <div className="text-xs space-y-1">
            {leaderboard.slice(0, 5).map((score, i) => (
              <p key={i} style={{ color: i === 0 ? '#ff00ff' : '#00f5d4' }}>
                {i + 1}. {score.wpm} WPM ({score.accuracy}%)
              </p>
            ))}
          </div>
        </div>
      </Html>

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
        <Html position={[0, 0, 0.1]} distanceFactor={3}>
          <p className="text-sm font-mono font-bold pointer-events-none" style={{ color: '#0d0d0d' }}>
            RETURN TO HOME
          </p>
        </Html>
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
