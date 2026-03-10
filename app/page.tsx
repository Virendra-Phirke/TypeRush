'use client';

import { useState } from 'react';
import { HomeScene } from '@/components/scenes/HomeScene';
import { TestScene } from '@/components/scenes/TestScene';
import { ResultScene } from '@/components/scenes/ResultScene';

export type GameMode = 'timed' | 'words' | 'quote' | 'custom';
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
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'test' | 'results'>('home');
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

  return (
    <main className="w-full h-screen bg-black overflow-hidden">
      {currentScreen === 'home' && (
        <HomeScene onStartTest={handleStartTest} />
      )}
      {currentScreen === 'test' && testConfig && (
        <TestScene
          config={testConfig}
          onComplete={handleTestComplete}
          onCancel={handleReturnHome}
        />
      )}
      {currentScreen === 'results' && testResult && (
        <ResultScene result={testResult} onReturnHome={handleReturnHome} />
      )}
    </main>
  );
}
