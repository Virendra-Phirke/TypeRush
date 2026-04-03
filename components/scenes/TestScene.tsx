'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  if (config.mode === 'custom') {
    const input = config.customText?.trim() || '';
    return input.length > 0 ? input.replace(/\s+/g, ' ').trim() : 'Paste custom text in Home and start again.';
  }

  if (config.mode === 'quote') {
    const quotes = QUOTES[config.difficulty as keyof typeof QUOTES] || QUOTES.medium;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  const words = WORD_BANKS[config.difficulty as keyof typeof WORD_BANKS] || WORD_BANKS.medium;
  const wordCount = config.mode === 'zen' || config.mode === 'sudden-death' ? 500 : (config.wordCount || 50);
  let passage = '';
  for (let i = 0; i < wordCount; i++) {
    passage += words[Math.floor(Math.random() * words.length)] + ' ';
  }
  return passage.trim();
}

export function TestScene({ config, onComplete, onCancel }: TestSceneProps) {
  const [passage, setPassage] = useState(() => generatePassage(config));
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
  const [lastTypedChar, setLastTypedChar] = useState<string | undefined>(undefined);
  const [isError, setIsError] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string | null>(null);
  const wpmHistoryRef = useRef<number[]>([]);
  const errorHistoryRef = useRef<number[]>([]);
  
  const particleSystemRef = useRef<any>(null);

  const calculateWPM = useCallback((chars: number, timeMs: number) => {
    if (timeMs < 1000) return 0;
    const minutes = timeMs / 60000;
    return Math.round((chars / 5) / minutes);
  }, []);

  const finishTest = useCallback((state: TypingState, reason?: string) => {
    setIsComplete(true);
    if(reason) setGameOverReason(reason);
    const timeElapsed = Date.now() - state.startTime;
    
    // Slight delay to see the error state before switching screens
    setTimeout(() => {
      onComplete({
        wpm: state.currentWPM,
        accuracy: state.accuracy,
        correctChars: state.correctChars,
        totalChars: state.totalChars,
        wordsTyped: state.wordsTyped,
        errors: state.errors,
        timeElapsed,
        config,
        wpmHistory: wpmHistoryRef.current,
        errorHistory: errorHistoryRef.current
      });
    }, reason ? 1500 : 0);
  }, [onComplete, config]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isComplete) return;

    const expectedChar = passage[typingState.currentIndex];
    const typedChar = e.key;

    if (typedChar === 'Escape') {
      onCancel();
      return;
    }

    if (typedChar.length !== 1 || /[^a-zA-Z0-9\s.,!?'`:;\-]/.test(typedChar)) {
      return;
    }

    e.preventDefault();

    const isCorrect = typedChar === expectedChar;
    const newIndex = isCorrect ? typingState.currentIndex + 1 : typingState.currentIndex;
    const timeElapsed = Date.now() - typingState.startTime;
    const newCorrectChars = typingState.correctChars + (isCorrect ? 1 : 0);
    const newTotalChars = typingState.totalChars + 1;
    const newErrors = typingState.errors + (isCorrect ? 0 : 1);

    let newWordsTyped = typingState.wordsTyped;
    if (expectedChar === ' ' && isCorrect) {
      newWordsTyped++;
    }

    const newWPM = calculateWPM(newCorrectChars, timeElapsed);
    const newAccuracy = newTotalChars > 0 ? Math.round((newCorrectChars / newTotalChars) * 100) : 100;

    setLastTypedChar(typedChar);
    setIsError(!isCorrect);

    const newState: TypingState = {
      ...typingState,
      currentIndex: newIndex,
      correctChars: newCorrectChars,
      totalChars: newTotalChars,
      errors: newErrors,
      wordsTyped: newWordsTyped,
      lastKeyTime: Date.now(),
      currentWPM: newWPM,
      accuracy: newAccuracy
    };

    setTypingState(newState);

    if (particleSystemRef.current) {
      particleSystemRef.current.emit(isCorrect);
    }

    if (config.mode === 'sudden-death' && !isCorrect) {
      finishTest(newState, 'SUDDEN DEATH: You made a mistake!');
      return;
    }

    // infinite passage generation for zen mode if near end
    if (config.mode === 'zen' && newIndex >= passage.length - 20) {
      const words = WORD_BANKS[config.difficulty as keyof typeof WORD_BANKS] || WORD_BANKS.medium;
      let newPassage = passage;
      for (let i = 0; i < 50; i++) {
        newPassage += ' ' + words[Math.floor(Math.random() * words.length)];
      }
      setPassage(newPassage);
    }

    const shouldComplete =
      (config.mode === 'timed' && timeRemaining === 0) ||
      (config.mode === 'words' && newWordsTyped >= (config.wordCount || 50)) ||
      (config.mode === 'quote' && newIndex >= passage.length) ||
      (config.mode === 'custom' && newIndex >= passage.length);

    if (shouldComplete && !isComplete) {
      finishTest(newState);
    }
  }, [passage, typingState, isComplete, timeRemaining, config, calculateWPM, finishTest, onCancel]);

  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      wpmHistoryRef.current.push(typingState.currentWPM);
      errorHistoryRef.current.push(typingState.errors);
      
      if (config.mode !== 'timed') return;
      
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 0) {
          finishTest(typingState);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [config, isComplete, typingState, finishTest]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progress = (typingState.currentIndex / passage.length) * 100;

  return (
    <div className="w-full h-full bg-transparent flex flex-col items-center justify-between font-mono overflow-hidden relative p-6">
      
      {/* Header bar */}
      <div className="w-full flex justify-between items-center relative z-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="bg-transparent border border-[#333] rounded px-4 py-2 text-[#888] font-mono text-sm cursor-pointer hover:text-white transition-colors hover:border-white"
        >
          ← Back
        </motion.button>
        <span className="text-[#888] text-sm font-bold tracking-widest">
          {config.difficulty.toUpperCase()} • {config.mode.toUpperCase()}
        </span>
      </div>

      <AnimatePresence>
        {gameOverReason && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-50 bg-[#ff4d6d] text-white px-8 py-4 rounded-xl text-3xl font-black shadow-[0_0_50px_rgba(255,77,109,1)] border-2 border-white whitespace-nowrap text-center"
          >
            {gameOverReason}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Stats Bar */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex gap-8 items-center relative z-20 mt-4 bg-[#1a1a1a]/80 backdrop-blur-sm p-4 rounded-2xl border border-[#333] shadow-lg"
      >
        <div className="text-center w-24">
          <div className="text-[#ffd60a] text-[0.65rem] tracking-widest">WPM</div>
          <motion.div key={typingState.currentWPM} animate={{ scale: [1.2, 1] }} className="text-[#00f5d4] text-3xl font-black">{typingState.currentWPM}</motion.div>
        </div>
        <div className="text-center w-24 border-l border-[#333] pl-8">
          <div className="text-[#ffd60a] text-[0.65rem] tracking-widest">ACCURACY</div>
          <div className="text-[#00f5d4] text-3xl font-black">{typingState.accuracy}%</div>
        </div>
        <div className="text-center w-24 border-l border-[#333] pl-8">
          <div className="text-[#ffd60a] text-[0.65rem] tracking-widest">ERRORS</div>
          <motion.div key={typingState.errors} animate={typingState.errors > 0 ? { x: [-5,5,-5,5,0], color: ['#fff', '#ff4d6d'] } : {}} className={`text-3xl font-black ${typingState.errors > 0 ? 'text-[#ff4d6d]' : 'text-[#888]'}`}>{typingState.errors}</motion.div>
        </div>
        {config.mode === 'timed' && timeRemaining !== null && (
          <div className="text-center w-24 border-l border-[#333] pl-8">
            <div className="text-[#ffd60a] text-[0.65rem] tracking-widest">TIME</div>
            <div className={`text-3xl font-black ${timeRemaining <= 5 ? 'text-[#ff4d6d] animate-pulse' : timeRemaining <= 10 ? 'text-[#ffd60a]' : 'text-[#00f5d4]'}`}>
              {Math.max(0, timeRemaining)}s
            </div>
          </div>
        )}
      </motion.div>

      {/* Progress bar */}
      {config.mode !== 'zen' && (
        <div className="w-[80%] h-1 bg-[#1a1a1a] rounded mt-4 relative z-20 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-[#00f5d4] shadow-[0_0_10px_rgba(0,245,212,0.8)]"
          />
        </div>
      )}

      {/* Floating text display */}
      <motion.div
        layout
        className="flex-1 flex items-center justify-center w-full max-w-5xl relative z-20 perspective-1000"
      >
        <FloatingText text={passage} currentIndex={typingState.currentIndex} />
        <ParticleSystem ref={particleSystemRef} />
      </motion.div>

      {/* 3D Keyboard */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1, transition: { delay: 0.2, type: 'spring' } }}
        className="relative z-20 mb-2"
      >
        <Keyboard3D
          lastTypedChar={lastTypedChar}
          isError={isError}
        />
      </motion.div>

      {/* Cancel button hint */}
      <div className="text-[#555] text-xs relative z-20">
        Press ESC to cancel
      </div>
    </div>
  );
}
