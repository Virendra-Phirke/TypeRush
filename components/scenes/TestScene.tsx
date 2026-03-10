'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Html } from '@react-three/drei';
import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import type { TestConfig, TestResult } from '@/app/page';
import { Keyboard3D } from '@/components/3d/Keyboard3D';
import { FloatingText } from '@/components/3d/FloatingText';
import { ParticleSystem } from '@/components/3d/ParticleSystem';
import { WORD_BANKS, QUOTES } from '@/data/wordData';

interface TestSceneProps {
  config: TestConfig;
  onComplete: (result: TestResult) => void;
  onCancel: () => void;
}

interface TypingState {
  currentIndex: number;
  correctChars: number;
  totalChars: number;
  errors: number;
  wordsTyped: number;
  startTime: number;
  lastKeyTime: number;
  currentWPM: number;
  accuracy: number;
}

function generatePassage(config: TestConfig): string {
  if (config.mode === 'quote') {
    const quotes = QUOTES[config.difficulty] || QUOTES.medium;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const words = WORD_BANKS[config.difficulty] || WORD_BANKS.medium;
  const wordCount = config.wordCount || 50;
  let passage = '';
  for (let i = 0; i < wordCount; i++) {
    passage += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return passage.trim();
}

function TestContent({
  config,
  onComplete,
  onCancel,
  passage
}: TestSceneProps & { passage: string }) {
  const [typingState, setTypingState] = useState<TypingState>({
    currentIndex: 0,
    correctChars: 0,
    totalChars: 0,
    errors: 0,
    wordsTyped: 0,
    startTime: Date.now(),
    lastKeyTime: Date.now(),
    currentWPM: 0,
    accuracy: 100
  });

  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    config.mode === 'timed' ? config.duration || 60 : null
  );
  const [isComplete, setIsComplete] = useState(false);
  const particleSystemRef = useRef<any>(null);

  // Calculate WPM
  const calculateWPM = useCallback((chars: number, timeMs: number) => {
    if (timeMs < 1000) return 0;
    const minutes = timeMs / 60000;
    return Math.round((chars / 5) / minutes);
  }, []);

  // Handle keydown
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isComplete) return;

    const expectedChar = passage[typingState.currentIndex];
    const typedChar = e.key;

    if (typedChar === 'Escape') {
      onCancel();
      return;
    }

    if (typedChar.length !== 1 || /[^a-zA-Z0-9\s.,!?'":-]/.test(typedChar)) {
      return;
    }

    e.preventDefault();

    const isCorrect = typedChar === expectedChar;
    const newIndex = typingState.currentIndex + 1;
    const timeElapsed = Date.now() - typingState.startTime;
    const newCorrectChars = typingState.correctChars + (isCorrect ? 1 : 0);
    const newTotalChars = typingState.totalChars + 1;
    const newErrors = typingState.errors + (isCorrect ? 0 : 1);

    // Count words (spaces are word separators)
    let newWordsTyped = typingState.wordsTyped;
    if (expectedChar === ' ' && isCorrect) {
      newWordsTyped++;
    }

    const newWPM = calculateWPM(newCorrectChars, timeElapsed);
    const newAccuracy = newTotalChars > 0 ? Math.round((newCorrectChars / newTotalChars) * 100) : 100;

    const newState: TypingState = {
      currentIndex: newIndex,
      correctChars: newCorrectChars,
      totalChars: newTotalChars,
      errors: newErrors,
      wordsTyped: newWordsTyped,
      startTime: typingState.startTime,
      lastKeyTime: Date.now(),
      currentWPM: newWPM,
      accuracy: newAccuracy
    };

    setTypingState(newState);

    // Trigger particle effect
    if (particleSystemRef.current) {
      particleSystemRef.current.emit(isCorrect);
    }

    // Check completion conditions
    const shouldComplete =
      (config.mode === 'timed' && timeRemaining === 0) ||
      (config.mode === 'words' && newWordsTyped >= (config.wordCount || 50)) ||
      (config.mode === 'quote' && newIndex >= passage.length) ||
      (config.mode === 'custom' && newIndex >= passage.length);

    if (shouldComplete) {
      setIsComplete(true);
      onComplete({
        wpm: newWPM,
        accuracy: newAccuracy,
        correctChars: newCorrectChars,
        totalChars: newTotalChars,
        wordsTyped: newWordsTyped,
        errors: newErrors,
        timeElapsed,
        config
      });
    }
  }, [passage, typingState, isComplete, timeRemaining, config, onComplete, calculateWPM]);

  // Timer effect
  useEffect(() => {
    if (config.mode !== 'timed' || isComplete) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          setIsComplete(true);
          const timeElapsed = Date.now() - typingState.startTime;
          const finalWPM = calculateWPM(typingState.correctChars, timeElapsed);
          const finalAccuracy = typingState.totalChars > 0 
            ? Math.round((typingState.correctChars / typingState.totalChars) * 100) 
            : 100;

          onComplete({
            wpm: finalWPM,
            accuracy: finalAccuracy,
            correctChars: typingState.correctChars,
            totalChars: typingState.totalChars,
            wordsTyped: typingState.wordsTyped,
            errors: typingState.errors,
            timeElapsed,
            config
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config, isComplete, typingState, onComplete, calculateWPM]);

  // Keyboard event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = (typingState.currentIndex / passage.length) * 100;

  return (
    <>
      <Environment preset="night" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#00f5d4" />

      {/* Floating text display */}
      <group position={[0, 2, 0]}>
        <FloatingText
          text={passage}
          currentIndex={typingState.currentIndex}
        />
      </group>

      {/* 3D Keyboard */}
      <group position={[0, -2, 0]} scale={0.8}>
        <Keyboard3D
          lastTypedChar={passage[typingState.currentIndex - 1]}
          isError={
            typingState.totalChars > 0 &&
            passage[typingState.currentIndex - 1] !==
              (typingState.totalChars > typingState.correctChars
                ? passage[typingState.currentIndex - 1]
                : '')
          }
        />
      </group>

      {/* Particle system */}
      <ParticleSystem ref={particleSystemRef} />

      {/* HUD Overlay */}
      <Html position={[-4, 3.5, -2]} distanceFactor={1}>
        <div className="text-left">
          <div className="font-mono text-2xl text-cyan-400 font-bold">{typingState.currentWPM} WPM</div>
          <div className="font-mono text-sm text-yellow-400">{typingState.accuracy}% Accuracy</div>
        </div>
      </Html>

      {/* Progress/Time indicator */}
      <Html position={[4, 3.5, -2]} distanceFactor={1}>
        <div className="text-right">
          {config.mode === 'timed' && (
            <div className="font-mono text-2xl text-cyan-400 font-bold">
              {Math.max(0, timeRemaining || 0)}s
            </div>
          )}
          {config.mode !== 'timed' && (
            <div className="font-mono text-sm text-gray-400">
              {typingState.currentIndex} / {passage.length}
            </div>
          )}
          <div className="w-48 h-1 bg-gray-700 mt-2 relative">
            <div
              className="h-full bg-cyan-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Html>

      {/* Cancel button hint */}
      <Html position={[0, -3.5, -2]} distanceFactor={1}>
        <div className="text-center text-xs text-gray-500 font-mono">
          Press ESC to cancel
        </div>
      </Html>
    </>
  );
}

export function TestScene({ config, onComplete, onCancel }: TestSceneProps) {
  const passage = generatePassage(config);

  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} className="w-full h-full">
      <color attach="background" args={['#0d0d0d']} />
      <TestContent config={config} onComplete={onComplete} onCancel={onCancel} passage={passage} />
    </Canvas>
  );
}
