'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import { useState } from 'react';
import * as THREE from 'three';
import type { TestConfig, GameMode, Difficulty } from '@/app/page';

interface HomeSceneProps {
  onStartTest: (config: TestConfig) => void;
}

const MODE_CONFIG = {
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
    optionLabels: ['Start']
  }
};

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'insane'];
const DIFFICULTY_COLORS = {
  easy: '#00f5d4',
  medium: '#ffd60a',
  hard: '#ff4d6d',
  insane: '#ff00ff'
};

function HomeContent({ onStartTest }: HomeSceneProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('timed');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [selectedOption, setSelectedOption] = useState(0);

  const handleStart = () => {
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
    }
    return baseConfig;
  };

  return (
    <>
      <Environment preset="night" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />

      {/* Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={1.2}
        color="#00f5d4"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        TYPE RUSH
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.4}
        color="#888888"
        fontFamily="/fonts/Geist_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        3D Keyboard Typing Speed Challenge
      </Text>

      {/* Mode Selection Text */}
      <Text
        position={[-3, 1.2, 0]}
        fontSize={0.5}
        color="#ffd60a"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="left"
        anchorY="middle"
      >
        SELECT MODE
      </Text>

      {/* Mode Cards */}
      <group position={[-3, 0, 0]}>
        {Object.entries(MODE_CONFIG).map((entry, i) => {
          const [mode, config] = entry as [GameMode, typeof MODE_CONFIG[GameMode]];
          const isSelected = selectedMode === mode;
          return (
            <ModeCard
              key={mode}
              position={[0, -i * 0.6, 0]}
              label={config.label}
              description={config.description}
              isSelected={isSelected}
              onClick={() => {
                setSelectedMode(mode);
                setSelectedOption(0);
              }}
            />
          );
        })}
      </group>

      {/* Difficulty Selection Text */}
      <Text
        position={[3, 1.2, 0]}
        fontSize={0.5}
        color="#ffd60a"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="left"
        anchorY="middle"
      >
        DIFFICULTY
      </Text>

      {/* Difficulty Buttons */}
      <group position={[3, 0, 0]}>
        {DIFFICULTIES.map((diff, i) => (
          <DifficultyButton
            key={diff}
            position={[0, -i * 0.6, 0]}
            label={diff.toUpperCase()}
            isSelected={selectedDifficulty === diff}
            color={DIFFICULTY_COLORS[diff]}
            onClick={() => setSelectedDifficulty(diff)}
          />
        ))}
      </group>

      {/* Options for selected mode */}
      <Text
        position={[0, -2.2, 0]}
        fontSize={0.5}
        color="#ffd60a"
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {MODE_CONFIG[selectedMode].optionLabels[selectedOption]}
      </Text>

      {/* Option Selector */}
      <group position={[0, -2.8, 0]}>
        {MODE_CONFIG[selectedMode].options.map((_, i) => (
          <OptionDot
            key={i}
            position={[i * 0.5 - (MODE_CONFIG[selectedMode].options.length - 1) * 0.25, 0, 0]}
            isSelected={selectedOption === i}
            onClick={() => setSelectedOption(i)}
          />
        ))}
      </group>

      {/* Start Button */}
      <group position={[0, -3.6, 0]} onClick={handleStart}>
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
          fontFamily="/fonts/GeistMono_Regular.ttf"
          anchorX="center"
          anchorY="middle"
        >
          START TEST
        </Text>
      </group>
    </>
  );
}

function ModeCard({
  position,
  label,
  description,
  isSelected,
  onClick
}: {
  position: [number, number, number];
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.5, 0.1]} />
        <meshStandardMaterial
          color={isSelected ? '#00f5d4' : '#1a1a1a'}
          emissive={isSelected ? '#00f5d4' : '#333333'}
          emissiveIntensity={isSelected ? 0.8 : 0.2}
          wireframe={!isSelected}
        />
      </mesh>
      <Text
        position={[0, 0.1, 0.1]}
        fontSize={0.25}
        color={isSelected ? '#0d0d0d' : '#00f5d4'}
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      <Text
        position={[0, -0.15, 0.1]}
        fontSize={0.12}
        color={isSelected ? '#888888' : '#666666'}
        fontFamily="/fonts/Geist_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {description}
      </Text>
    </group>
  );
}

function DifficultyButton({
  position,
  label,
  isSelected,
  color,
  onClick
}: {
  position: [number, number, number];
  label: string;
  isSelected: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.4, 0.1]} />
        <meshStandardMaterial
          color={isSelected ? color : '#1a1a1a'}
          emissive={color}
          emissiveIntensity={isSelected ? 0.6 : 0.1}
        />
      </mesh>
      <Text
        position={[0, 0, 0.1]}
        fontSize={0.2}
        color={isSelected ? '#0d0d0d' : color}
        fontFamily="/fonts/GeistMono_Regular.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
}

function OptionDot({
  position,
  isSelected,
  onClick
}: {
  position: [number, number, number];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <group position={position} onClick={onClick}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#ffd60a' : '#333333'}
          emissive={isSelected ? '#ffd60a' : '#666666'}
          emissiveIntensity={isSelected ? 0.8 : 0.2}
        />
      </mesh>
    </group>
  );
}

export function HomeScene({ onStartTest }: HomeSceneProps) {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} className="w-full h-full">
      <color attach="background" args={['#0d0d0d']} />
      <pointLight position={[10, 10, 10]} intensity={0.6} />
      <pointLight position={[-10, -10, 5]} intensity={0.3} color="#00f5d4" />
      <HomeContent onStartTest={onStartTest} />
    </Canvas>
  );
}
