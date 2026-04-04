'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import type { TestConfig, GameMode, Difficulty } from '@/app/page';

interface HomeSceneProps {
  onStartTest: (config: TestConfig) => void;
  onOpenInputLab: () => void;
  onOpenMultiplayer: () => void;
}

const MODE_CONFIG: Record<GameMode, { label: string; description: string; options: number[]; optionLabels: string[] }> = {
  timed: {
    label: 'Timed Test',
    description: 'Type as fast as you can',
    options: [15, 30, 60, 120],
    optionLabels: ['15s', '30s', '60s', '120s']
  },
  words: {
    label: 'Word Count',
    description: 'Complete a set number of words',
    options: [10, 25, 50, 100],
    optionLabels: ['10', '25', '50', '100']
  },
  quote: {
    label: 'Quote Mode',
    description: 'Type famous quotes',
    options: [1],
    optionLabels: ['Start']
  },
  custom: {
    label: 'Custom Text',
    description: 'Paste your own text',
    options: [1],
    optionLabels: ['Start']  },
  zen: {
    label: 'Zen Mode',
    description: 'No limits, just typing',
    options: [1],
    optionLabels: ['Start']
  },
  'sudden-death': {
    label: 'Sudden Death',
    description: 'One mistake = Game Over',
    options: [1],
    optionLabels: ['Start']
  }
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'insane'];
const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: '#00f5d4',
  medium: '#ffd60a',
  hard: '#ff4d6d',
  insane: '#ff00ff'
};
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Beginner',
  medium: 'Practice',
  hard: 'Pro',
  insane: 'Insane'
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
};

export function HomeScene({ onStartTest, onOpenInputLab, onOpenMultiplayer }: HomeSceneProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('timed');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedOption, setSelectedOption] = useState(0);
  const [customText, setCustomText] = useState('');

  const handleStart = () => {
    if (selectedMode === 'custom' && customText.trim().length === 0) {
      return;
    }
    const config = getModeConfig();
    onStartTest(config);
  };

  const getModeConfig = (): TestConfig => {
    const modeInfo = MODE_CONFIG[selectedMode];
    const baseConfig = {
      mode: selectedMode,
      difficulty: selectedDifficulty
    };

    if (selectedMode === 'timed') {
      return { ...baseConfig, duration: modeInfo.options[selectedOption] };
    } else if (selectedMode === 'words') {
      return { ...baseConfig, wordCount: modeInfo.options[selectedOption] };
    } else if (selectedMode === 'custom') {
      return { ...baseConfig, customText: customText.trim() };
    }
    return baseConfig;
  };

  const modeConfig = MODE_CONFIG[selectedMode];
  const isStartDisabled = selectedMode === 'custom' && customText.trim().length === 0;

  return (
    <div className="w-full h-full bg-transparent flex-col items-center justify-center font-mono overflow-hidden relative flex">

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center justify-center z-20 w-full max-w-5xl px-4"
      >
        {/* Title */}
        <motion.div variants={itemVariants} className="text-center mb-10 relative">
          <h1 className="home-title-glow text-5xl md:text-6xl font-black text-[#00f5d4] tracking-[0.2em] m-0">
            ⌨️ TYPE RUSH
          </h1>
          <p className="text-[#888888] text-lg mt-2">
            How fast are you?
          </p>
        </motion.div>

        {/* Main content row */}
        <div className="flex flex-col md:flex-row gap-8 items-start w-full justify-center">
          
          {/* Mode Cards */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full md:w-80">
            <p className="text-[#ffd60a] text-xs text-center mb-1 tracking-[0.15em] font-bold">SELECT MODE</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(MODE_CONFIG) as GameMode[]).map((mode) => {
                const config = MODE_CONFIG[mode];
                const isSelected = selectedMode === mode;
                return (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={mode}
                    onClick={() => { setSelectedMode(mode); setSelectedOption(0); }}
                    className={'w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 border-2 ' + (isSelected ? 'bg-[#00f5d4] border-[#00f5d4] text-[#0d0d0d] shadow-[0_0_15px_rgba(0,245,212,0.4)]' : 'bg-[#1a1a1a] border-[#333] text-[#00f5d4] hover:border-[#00f5d4]/50')}
                  >
                    <div className="text-sm font-bold">{config.label}</div>
                    <div className={'text-[0.65rem] opacity-80 ' + (isSelected ? 'text-[#0d0d0d]' : 'text-[#888]')}>{config.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Difficulty Cards */}
          <motion.div variants={itemVariants} className="flex flex-col gap-3 w-full md:w-56">
            <p className="text-[#ffd60a] text-xs text-center mb-1 tracking-[0.15em] font-bold">DIFFICULTY</p>
            <div className="flex flex-col gap-2">
              {DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff;
                const color = DIFFICULTY_COLORS[diff];
                return (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={'w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 border-2 '}
                    style={{
                      backgroundColor: isSelected ? color : '#1a1a1a',
                      borderColor: isSelected ? color : '#333',
                      color: isSelected ? '#0d0d0d' : color,
                      boxShadow: isSelected ? `0 0 15px ${color}66` : 'none'
                    }}
                  >
                    <div className="text-sm font-bold">{diff.toUpperCase()}</div>
                    <div className={'text-[0.65rem] opacity-80 ' + (isSelected ? 'text-[#0d0d0d]' : 'text-white')}>{DIFFICULTY_LABELS[diff]}</div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

        </div>

        {/* Option selector */}
        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3 mt-8 h-10">
          {modeConfig.options.length > 1 && modeConfig.optionLabels.map((label, i) => {
            const isSelected = selectedOption === i;
            return (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                key={i}
                onClick={() => setSelectedOption(i)}
                className={'px-6 py-2 rounded-full font-bold text-sm transition-colors border-2 ' + (isSelected ? 'bg-[#ffd60a] border-[#ffd60a] text-[#0d0d0d] shadow-[0_0_15px_rgba(255,214,10,0.4)]' : 'bg-[#1a1a1a] border-[#333] text-[#ffd60a] hover:border-[#ffd60a]/50')}
              >
                {label}
              </motion.button>
            );
          })}
        </motion.div>

        {selectedMode === 'custom' && (
          <motion.div
            variants={itemVariants}
            className="mt-6 w-full max-w-3xl"
          >
            <label className="block text-[#ffd60a] text-xs tracking-[0.15em] font-bold mb-2 text-center">
              PASTE TEXT TO PRACTICE
            </label>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste or type your custom text here..."
              className="w-full min-h-36 resize-y rounded-lg bg-[#121212] border border-[#333] px-4 py-3 text-[#e6fff9] focus:outline-none focus:border-[#00f5d4] focus:shadow-[0_0_0_2px_rgba(0,245,212,0.2)]"
            />
            <p className="mt-2 text-xs text-[#888] text-center">
              Start becomes available after you paste some text.
            </p>
          </motion.div>
        )}

        {/* Start Button */}
        <motion.div variants={itemVariants} className="mt-10 flex flex-col items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,245,212,0.6)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={isStartDisabled}
            className={'px-12 py-4 bg-transparent border-2 rounded-lg text-xl font-bold tracking-[0.2em] relative overflow-hidden group transition-opacity ' + (isStartDisabled ? 'border-[#555] text-[#555] cursor-not-allowed opacity-70' : 'border-[#00f5d4] text-[#00f5d4]')}
          >
            <span className="relative z-10">START_</span>
            <div className="absolute inset-0 bg-[#00f5d4] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 z-0" />
            <div className="absolute inset-0 text-[#0d0d0d] flex items-center justify-center font-bold tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
              START_ 
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(255,214,10,0.45)' }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenInputLab}
            className="px-8 py-3 rounded-lg border-2 border-[#ffd60a] text-[#ffd60a] bg-[#121212]/80 text-sm md:text-base font-bold tracking-[0.12em]"
          >
            OPEN KEYBOARD + MOUSE TEST LAB
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(255,77,109,0.45)' }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenMultiplayer}
            className="px-8 py-3 rounded-lg border-2 border-[#ff4d6d] text-[#ff4d6d] bg-[#121212]/80 text-sm md:text-base font-bold tracking-[0.12em]"
          >
            OPEN 1V1 MULTIPLAYER LOBBY
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
