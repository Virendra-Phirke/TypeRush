'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { HomeScene } from '@/components/scenes/HomeScene';
import { TestScene } from '@/components/scenes/TestScene';
import { ResultScene } from '@/components/scenes/ResultScene';
import { InputLabScene } from '@/components/scenes/InputLabScene';
import { Background3D } from '@/components/3d/Background3D';

export type GameMode = 'timed' | 'words' | 'quote' | 'custom' | 'zen' | 'sudden-death';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface TestConfig {
  mode: GameMode;
  difficulty: Difficulty;
  duration?: number; // For timed mode (seconds)
  wordCount?: number; // For words mode
  customText?: string; // For custom mode
}

export interface TestResult {
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalChars: number;
  wordsTyped: number;
  errors: number;
  timeElapsed: number;
  config: TestConfig;
  wpmHistory?: number[]; // Added dynamic history feature
  errorHistory?: number[];
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'test' | 'results' | 'input-lab'>('home');
  const [testConfig, setTestConfig] = useState<TestConfig | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleStartTest = (config: TestConfig) => {
    setTestConfig(config);
    setCurrentScreen('test');
  };

  const handleTestComplete = (result: TestResult) => {
    setTestResult(result);
    setCurrentScreen('results');
  };

  const handleReturnHome = () => {
    setCurrentScreen('home');
    setTestConfig(null);
    setTestResult(null);
  };

  const handleOpenInputLab = () => {
    setCurrentScreen('input-lab');
  };

  return (
    <main className="w-full h-screen bg-[#050505] overflow-hidden relative">
      <Background3D />
      <AnimatePresence mode="wait">
        {currentScreen === 'home' && (
          <motion.div 
            key="home"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <HomeScene onStartTest={handleStartTest} onOpenInputLab={handleOpenInputLab} />
          </motion.div>
        )}
        {currentScreen === 'test' && testConfig && (
          <motion.div 
            key="test"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <TestScene
              config={testConfig}
              onComplete={handleTestComplete}
              onCancel={handleReturnHome}
            />
          </motion.div>
        )}
        {currentScreen === 'results' && testResult && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ResultScene result={testResult} onReturnHome={handleReturnHome} />
          </motion.div>
        )}
        {currentScreen === 'input-lab' && (
          <motion.div
            key="input-lab"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <InputLabScene onBack={handleReturnHome} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
