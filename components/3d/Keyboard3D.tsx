'use client';

import { memo, useEffect, useRef, useState } from 'react';

interface Keyboard3DProps {
  lastTypedChar?: string;
  isError?: boolean;
}

const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
];

const FINGER_ZONES: Record<string, string> = {
  '`': '#ff4d6d', '1': '#ff4d6d', 'Q': '#ff4d6d', 'A': '#ff4d6d', 'Z': '#ff4d6d',
  '2': '#f97316', 'W': '#f97316', 'S': '#f97316', 'X': '#f97316',
  '3': '#fbbf24', 'E': '#fbbf24', 'D': '#fbbf24', 'C': '#fbbf24',
  '4': '#84cc16', '5': '#84cc16', 'R': '#84cc16', 'T': '#84cc16',
  'F': '#84cc16', 'G': '#84cc16', 'V': '#84cc16', 'B': '#84cc16',
  '6': '#2dd4bf', '7': '#2dd4bf', 'Y': '#2dd4bf', 'U': '#2dd4bf',
  'H': '#2dd4bf', 'J': '#2dd4bf', 'N': '#2dd4bf', 'M': '#2dd4bf',
  '8': '#38bdf8', 'I': '#38bdf8', 'K': '#38bdf8', ',': '#38bdf8',
  '9': '#a78bfa', 'O': '#a78bfa', 'L': '#a78bfa', '.': '#a78bfa',
  '0': '#c084fc', '-': '#c084fc', '=': '#c084fc', 'P': '#c084fc',
  ';': '#c084fc', '/': '#c084fc', '[': '#c084fc', ']': '#c084fc',
  "'": '#c084fc', '\\': '#c084fc',
};

const SPACE_COLOR = '#00f5d4';

function getKeyColor(key: string): string {
  return FINGER_ZONES[key.toUpperCase()] || FINGER_ZONES[key] || '#666666';
}

const ROW_OFFSETS = [0, 0.25, 0.5, 0.9]; // rem offset per row for stagger

function Keyboard3DComponent({ lastTypedChar, isError }: Keyboard3DProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!lastTypedChar) return;

    const keyUpper = lastTypedChar.toUpperCase();
    setActiveKey(keyUpper === ' ' ? 'SPACE' : keyUpper);

    if (isError) {
      setErrorKey(keyUpper === ' ' ? 'SPACE' : keyUpper);
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveKey(null);
      setErrorKey(null);
    }, 150);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lastTypedChar, isError]);

  const getKeyStyle = (key: string): React.CSSProperties => {
    const keyId = key.toUpperCase();
    const color = getKeyColor(key);
    const isActive = activeKey === keyId;
    const isErr = errorKey === keyId;

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2.5rem',
      height: '2.5rem',
      margin: '0.125rem',
      borderRadius: '6px',
      fontFamily: 'monospace',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      color: isActive ? '#0d0d0d' : color,
      background: isErr ? '#ff4d6d' : isActive ? color : '#1a1a1a',
      border: `1px solid ${isActive ? color : '#333'}`,
      boxShadow: isActive
        ? `0 1px 0 #000, 0 0 12px ${isErr ? '#ff4d6d' : color}`
        : '0 4px 0 #000, 0 6px 0 rgba(0,0,0,0.5)',
      transform: isActive ? 'translateY(3px)' : 'translateY(0)',
      transition: 'all 80ms ease',
      cursor: 'default',
      userSelect: 'none' as const,
    };
  };

  return (
    <div
      style={{
        perspective: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
      }}
    >
      <div
        style={{
          transform: 'rotateX(12deg)',
          transformStyle: 'preserve-3d',
        }}
      >
        {KEYBOARD_LAYOUT.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingLeft: `${ROW_OFFSETS[rowIndex]}rem`,
            }}
          >
            {row.map((key) => (
              <div key={key} style={getKeyStyle(key)}>
                {key}
              </div>
            ))}
          </div>
        ))}
        {/* Spacebar */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              ...getKeyStyle('SPACE'),
              width: '14rem',
              fontSize: '0.6rem',
              color: activeKey === 'SPACE' ? '#0d0d0d' : SPACE_COLOR,
              background: errorKey === 'SPACE' ? '#ff4d6d' : activeKey === 'SPACE' ? SPACE_COLOR : '#1a1a1a',
              border: `1px solid ${activeKey === 'SPACE' ? SPACE_COLOR : '#333'}`,
              boxShadow: activeKey === 'SPACE'
                ? `0 1px 0 #000, 0 0 12px ${SPACE_COLOR}`
                : '0 4px 0 #000, 0 6px 0 rgba(0,0,0,0.5)',
              transform: activeKey === 'SPACE' ? 'translateY(3px)' : 'translateY(0)',
            }}
          >
            SPACE
          </div>
        </div>
      </div>
    </div>
  );
}

export const Keyboard3D = memo(Keyboard3DComponent);
