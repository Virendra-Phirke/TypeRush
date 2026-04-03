'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useHighFrequencyPolling } from '@/hooks/useHighFrequencyPolling';

interface InputLabSceneProps {
  onBack: () => void;
}

type KeyboardKey = {
  label: string;
  code: string;
  units?: number;
};

type KeyboardPreset = '100' | '75' | '60';

const KEYBOARD_LAYOUT_100: KeyboardKey[][] = [
  [
    { label: 'Esc', code: 'Escape', units: 1.2 },
    { label: '1', code: '1' },
    { label: '2', code: '2' },
    { label: '3', code: '3' },
    { label: '4', code: '4' },
    { label: '5', code: '5' },
    { label: '6', code: '6' },
    { label: '7', code: '7' },
    { label: '8', code: '8' },
    { label: '9', code: '9' },
    { label: '0', code: '0' },
    { label: '-', code: '-' },
    { label: '=', code: '=' },
    { label: 'Backspace', code: 'Backspace', units: 2.2 },
    { label: 'Ins', code: 'Insert' },
    { label: 'Home', code: 'Home' },
    { label: 'PgUp', code: 'PageUp' },
    { label: 'Num', code: 'NumLock' },
    { label: '/', code: 'NumpadDivide' },
    { label: '*', code: 'NumpadMultiply' },
    { label: '-', code: 'NumpadSubtract' }
  ],
  [
    { label: 'Tab', code: 'Tab', units: 1.6 },
    { label: 'Q', code: 'Q' },
    { label: 'W', code: 'W' },
    { label: 'E', code: 'E' },
    { label: 'R', code: 'R' },
    { label: 'T', code: 'T' },
    { label: 'Y', code: 'Y' },
    { label: 'U', code: 'U' },
    { label: 'I', code: 'I' },
    { label: 'O', code: 'O' },
    { label: 'P', code: 'P' },
    { label: '[', code: '[' },
    { label: ']', code: ']' },
    { label: '\\', code: '\\', units: 1.6 },
    { label: 'Del', code: 'Delete' },
    { label: 'End', code: 'End' },
    { label: 'PgDn', code: 'PageDown' },
    { label: '7', code: 'Numpad7' },
    { label: '8', code: 'Numpad8' },
    { label: '9', code: 'Numpad9' },
    { label: '+', code: 'NumpadAdd', units: 1.2 }
  ],
  [
    { label: 'Caps', code: 'CapsLock', units: 1.9 },
    { label: 'A', code: 'A' },
    { label: 'S', code: 'S' },
    { label: 'D', code: 'D' },
    { label: 'F', code: 'F' },
    { label: 'G', code: 'G' },
    { label: 'H', code: 'H' },
    { label: 'J', code: 'J' },
    { label: 'K', code: 'K' },
    { label: 'L', code: 'L' },
    { label: ';', code: ';' },
    { label: "'", code: "'" },
    { label: 'Enter', code: 'Enter', units: 2.3 },
    { label: '4', code: 'Numpad4' },
    { label: '5', code: 'Numpad5' },
    { label: '6', code: 'Numpad6' },
    { label: '+', code: 'NumpadAdd', units: 1.2 }
  ],
  [
    { label: 'Shift', code: 'Shift', units: 2.3 },
    { label: 'Z', code: 'Z' },
    { label: 'X', code: 'X' },
    { label: 'C', code: 'C' },
    { label: 'V', code: 'V' },
    { label: 'B', code: 'B' },
    { label: 'N', code: 'N' },
    { label: 'M', code: 'M' },
    { label: ',', code: ',' },
    { label: '.', code: '.' },
    { label: '/', code: '/' },
    { label: 'Shift', code: 'Shift', units: 2.9 },
    { label: '↑', code: 'ArrowUp' },
    { label: '1', code: 'Numpad1' },
    { label: '2', code: 'Numpad2' },
    { label: '3', code: 'Numpad3' },
    { label: 'Enter', code: 'NumpadEnter', units: 1.2 }
  ],
  [
    { label: 'Ctrl', code: 'Control', units: 1.4 },
    { label: 'Win', code: 'Meta', units: 1.4 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: 'Space', code: 'Space', units: 8 },
    { label: 'Fn', code: 'Fn', units: 1.2 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: '←', code: 'ArrowLeft' },
    { label: '↓', code: 'ArrowDown' },
    { label: '→', code: 'ArrowRight' },
    { label: '0', code: 'Numpad0', units: 2.2 },
    { label: '.', code: 'NumpadDecimal' },
    { label: 'Ctrl', code: 'Control', units: 1.4 }
  ]
];

const KEYBOARD_LAYOUT_75: KeyboardKey[][] = [
  [
    { label: 'Esc', code: 'Escape', units: 1.2 },
    { label: '1', code: '1' },
    { label: '2', code: '2' },
    { label: '3', code: '3' },
    { label: '4', code: '4' },
    { label: '5', code: '5' },
    { label: '6', code: '6' },
    { label: '7', code: '7' },
    { label: '8', code: '8' },
    { label: '9', code: '9' },
    { label: '0', code: '0' },
    { label: '-', code: '-' },
    { label: '=', code: '=' },
    { label: 'Backspace', code: 'Backspace', units: 2.2 },
    { label: 'Del', code: 'Delete' },
    { label: 'PgUp', code: 'PageUp' }
  ],
  [
    { label: 'Tab', code: 'Tab', units: 1.6 },
    { label: 'Q', code: 'Q' },
    { label: 'W', code: 'W' },
    { label: 'E', code: 'E' },
    { label: 'R', code: 'R' },
    { label: 'T', code: 'T' },
    { label: 'Y', code: 'Y' },
    { label: 'U', code: 'U' },
    { label: 'I', code: 'I' },
    { label: 'O', code: 'O' },
    { label: 'P', code: 'P' },
    { label: '[', code: '[' },
    { label: ']', code: ']' },
    { label: '\\', code: '\\', units: 1.6 },
    { label: 'Home', code: 'Home' },
    { label: 'PgDn', code: 'PageDown' }
  ],
  [
    { label: 'Caps', code: 'CapsLock', units: 1.9 },
    { label: 'A', code: 'A' },
    { label: 'S', code: 'S' },
    { label: 'D', code: 'D' },
    { label: 'F', code: 'F' },
    { label: 'G', code: 'G' },
    { label: 'H', code: 'H' },
    { label: 'J', code: 'J' },
    { label: 'K', code: 'K' },
    { label: 'L', code: 'L' },
    { label: ';', code: ';' },
    { label: "'", code: "'" },
    { label: 'Enter', code: 'Enter', units: 2.3 },
    { label: 'End', code: 'End' }
  ],
  [
    { label: 'Shift', code: 'Shift', units: 2.3 },
    { label: 'Z', code: 'Z' },
    { label: 'X', code: 'X' },
    { label: 'C', code: 'C' },
    { label: 'V', code: 'V' },
    { label: 'B', code: 'B' },
    { label: 'N', code: 'N' },
    { label: 'M', code: 'M' },
    { label: ',', code: ',' },
    { label: '.', code: '.' },
    { label: '/', code: '/' },
    { label: 'Shift', code: 'Shift', units: 2.9 },
    { label: '↑', code: 'ArrowUp' }
  ],
  [
    { label: 'Ctrl', code: 'Control', units: 1.4 },
    { label: 'Win', code: 'Meta', units: 1.4 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: 'Space', code: 'Space', units: 6.5 },
    { label: 'Fn', code: 'Fn', units: 1.2 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: '←', code: 'ArrowLeft' },
    { label: '↓', code: 'ArrowDown' },
    { label: '→', code: 'ArrowRight' },
    { label: 'Ctrl', code: 'Control', units: 1.4 }
  ]
];

const KEYBOARD_LAYOUT_60: KeyboardKey[][] = [
  [
    { label: 'Esc', code: 'Escape', units: 1.2 },
    { label: '1', code: '1' },
    { label: '2', code: '2' },
    { label: '3', code: '3' },
    { label: '4', code: '4' },
    { label: '5', code: '5' },
    { label: '6', code: '6' },
    { label: '7', code: '7' },
    { label: '8', code: '8' },
    { label: '9', code: '9' },
    { label: '0', code: '0' },
    { label: '-', code: '-' },
    { label: '=', code: '=' },
    { label: 'Backspace', code: 'Backspace', units: 2.2 }
  ],
  [
    { label: 'Tab', code: 'Tab', units: 1.6 },
    { label: 'Q', code: 'Q' },
    { label: 'W', code: 'W' },
    { label: 'E', code: 'E' },
    { label: 'R', code: 'R' },
    { label: 'T', code: 'T' },
    { label: 'Y', code: 'Y' },
    { label: 'U', code: 'U' },
    { label: 'I', code: 'I' },
    { label: 'O', code: 'O' },
    { label: 'P', code: 'P' },
    { label: '[', code: '[' },
    { label: ']', code: ']' },
    { label: '\\', code: '\\', units: 1.6 }
  ],
  [
    { label: 'Caps', code: 'CapsLock', units: 1.9 },
    { label: 'A', code: 'A' },
    { label: 'S', code: 'S' },
    { label: 'D', code: 'D' },
    { label: 'F', code: 'F' },
    { label: 'G', code: 'G' },
    { label: 'H', code: 'H' },
    { label: 'J', code: 'J' },
    { label: 'K', code: 'K' },
    { label: 'L', code: 'L' },
    { label: ';', code: ';' },
    { label: "'", code: "'" },
    { label: 'Enter', code: 'Enter', units: 2.3 }
  ],
  [
    { label: 'Shift', code: 'Shift', units: 2.3 },
    { label: 'Z', code: 'Z' },
    { label: 'X', code: 'X' },
    { label: 'C', code: 'C' },
    { label: 'V', code: 'V' },
    { label: 'B', code: 'B' },
    { label: 'N', code: 'N' },
    { label: 'M', code: 'M' },
    { label: ',', code: ',' },
    { label: '.', code: '.' },
    { label: '/', code: '/' },
    { label: 'Shift', code: 'Shift', units: 2.9 }
  ],
  [
    { label: 'Ctrl', code: 'Control', units: 1.4 },
    { label: 'Win', code: 'Meta', units: 1.4 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: 'Space', code: 'Space', units: 6.3 },
    { label: 'Fn', code: 'Fn', units: 1.2 },
    { label: 'Alt', code: 'Alt', units: 1.4 },
    { label: '←', code: 'ArrowLeft' },
    { label: '↓', code: 'ArrowDown' },
    { label: '→', code: 'ArrowRight' },
    { label: 'Ctrl', code: 'Control', units: 1.4 }
  ]
];

const KEYBOARD_LAYOUTS: Record<KeyboardPreset, KeyboardKey[][]> = {
  '100': KEYBOARD_LAYOUT_100,
  '75': KEYBOARD_LAYOUT_75,
  '60': KEYBOARD_LAYOUT_60
};

const TYPING_PROMPT = 'Type this exactly: smooth input diagnostics for gamers and creators.';

interface RollingStats {
  buffer: Float64Array;
  index: number;
  size: number;
  sum: number;
  last: number;
}

function pushRolling(stats: RollingStats, value: number) {
  if (stats.size < stats.buffer.length) {
    stats.buffer[stats.index] = value;
    stats.sum += value;
    stats.size += 1;
  } else {
    const old = stats.buffer[stats.index];
    stats.buffer[stats.index] = value;
    stats.sum += value - old;
  }
  stats.last = value;
  stats.index = (stats.index + 1) % stats.buffer.length;
}

function createRollingStats(size = 24): RollingStats {
  return {
    buffer: new Float64Array(size),
    index: 0,
    size: 0,
    sum: 0,
    last: 0
  };
}

function RealtimeHzGraph({ points }: { points: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const maxHz = Math.max(250, ...points);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0d1214';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(71,85,105,0.35)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    if (points.length < 2) return;

    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.beginPath();

    points.forEach((value, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - (Math.min(value, maxHz) / maxHz) * (height - 8) - 4;
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }, [points]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={160}
      className="w-full h-40 rounded-lg border border-[#2f2f2f] bg-[#0d1214]"
    />
  );
}

function MouseTrajectoryCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathRef = useRef<{ x: number; y: number; time: number }[]>([]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pathRef.current.push({ x: e.clientX, y: e.clientY, time: performance.now() });
    };
    window.addEventListener('mousemove', handleMove);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const render = () => {
      const parent = canvas.parentElement;
      if (parent) {
        if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = performance.now();
      
      // keep only last 500ms
      pathRef.current = pathRef.current.filter((p) => now - p.time <= 500);

      if (pathRef.current.length > 2) {
        ctx.beginPath();
        const rect = canvas.getBoundingClientRect();
        
        pathRef.current.forEach((point, i) => {
          const px = point.x - rect.left;
          const py = point.y - rect.top;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });

        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, 'rgba(0, 245, 212, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 214, 10, 0.8)');
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();

        ctx.beginPath();
        const last = pathRef.current[pathRef.current.length - 1];
        ctx.arc(last.x - rect.left, last.y - rect.top, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#00f5d4';
        ctx.fill();
        ctx.shadowColor = '#00f5d4';
        ctx.shadowBlur = 10;
      }
      
      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />;
}

export function InputLabScene({ onBack }: InputLabSceneProps) {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'mouse' | 'combined'>('keyboard');
  const { metrics: pollingMetrics, graphPoints, reset: resetPollingMetrics } = useHighFrequencyPolling();

  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const pressedSetRef = useRef(new Set<string>());
  const [rolloverPeak, setRolloverPeak] = useState(0);
  const [modifiers, setModifiers] = useState({ shift: false, ctrl: false, alt: false });
  const [keyboardPreset, setKeyboardPreset] = useState<KeyboardPreset>('100');
  const [showScanCodes, setShowScanCodes] = useState(false);
  const [lastScanCode, setLastScanCode] = useState('');
  const [heatmapCounts, setHeatmapCounts] = useState<Record<string, number>>({});
  const heatmapCountsRef = useRef<Record<string, number>>({});
  const [lastKeyLatency, setLastKeyLatency] = useState(0);
  const [avgKeyLatency, setAvgKeyLatency] = useState(0);
  const keyLatencyStatsRef = useRef<RollingStats>(createRollingStats());
  const repeatCounterRef = useRef(0);
  const [keyRepeatRate, setKeyRepeatRate] = useState(0);
  const lastKeyboardAtRef = useRef(0);

  const [typedValue, setTypedValue] = useState('');
  const typingStartRef = useRef<number | null>(null);

  const [mouseDistance, setMouseDistance] = useState(0);
  const mouseDistanceRef = useRef(0);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const lastMouseAtRef = useRef(0);

  const clickRingRef = useRef<Float64Array>(new Float64Array(128));
  const clickWriteRef = useRef(0);
  const clickCountRef = useRef(0);
  const [clicksPerSecond, setClicksPerSecond] = useState(0);
  const [doubleClicks, setDoubleClicks] = useState(0);
  const [lastClickLatency, setLastClickLatency] = useState(0);
  const [avgClickLatency, setAvgClickLatency] = useState(0);
  const clickLatencyStatsRef = useRef<RollingStats>(createRollingStats());

  const [scrollDistance, setScrollDistance] = useState(0);
  const [dragSuccess, setDragSuccess] = useState(false);
  const [liftOffEvents, setLiftOffEvents] = useState(0);

  const [targetHits, setTargetHits] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 40, y: 30 });

  const [stressMode, setStressMode] = useState(false);
  const [fps, setFps] = useState(60);
  const fpsRef = useRef(60);
  const [multiInputActive, setMultiInputActive] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const keyboardUnitClass = useMemo(() => {
    if (keyboardPreset === '60') return '[--kb-unit:2.05rem]';
    if (keyboardPreset === '75') return '[--kb-unit:2.25rem]';
    return '[--kb-unit:2.55rem]';
  }, [keyboardPreset]);

  const activeKeyboardLayout = useMemo(() => KEYBOARD_LAYOUTS[keyboardPreset], [keyboardPreset]);

  const keyboardFrameClass = useMemo(() => {
    if (keyboardPreset === '60') return 'max-w-[780px]';
    if (keyboardPreset === '75') return 'max-w-[980px]';
    return 'max-w-[1280px]';
  }, [keyboardPreset]);

  const keyboardPresetLabel = useMemo(() => {
    if (keyboardPreset === '60') return '60% compact layout';
    if (keyboardPreset === '75') return '75% compact + nav layout';
    return '100% full-size layout';
  }, [keyboardPreset]);

  const activeKeySet = useMemo(() => {
    const s = new Set<string>();
    for (const k of pressedKeys) {
      s.add(k.toUpperCase());
    }
    return s;
  }, [pressedKeys]);

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      const eventKey = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
      lastKeyboardAtRef.current = performance.now();
      setLastScanCode(e.code || eventKey);
      heatmapCountsRef.current[eventKey] = (heatmapCountsRef.current[eventKey] || 0) + 1;

      if (!pressedSetRef.current.has(eventKey)) {
        pressedSetRef.current.add(eventKey);
        const keys = Array.from(pressedSetRef.current);
        setPressedKeys(keys);
        setRolloverPeak((prev) => Math.max(prev, keys.length));
      }

      setModifiers({ shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });

      if (e.repeat) {
        repeatCounterRef.current += 1;
      }

      const start = performance.now();
      requestAnimationFrame(() => {
        const latency = performance.now() - start;
        pushRolling(keyLatencyStatsRef.current, latency);
      });
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      const eventKey = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (pressedSetRef.current.has(eventKey)) {
        pressedSetRef.current.delete(eventKey);
        setPressedKeys(Array.from(pressedSetRef.current));
      }
      setModifiers({ shift: e.shiftKey, ctrl: e.ctrlKey, alt: e.altKey });
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      lastMouseAtRef.current = performance.now();
      if (lastMousePosRef.current) {
        const dx = e.clientX - lastMousePosRef.current.x;
        const dy = e.clientY - lastMousePosRef.current.y;
        mouseDistanceRef.current += Math.sqrt(dx * dx + dy * dy);
      }
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const mouseDownHandler = (e: MouseEvent) => {
      lastMouseAtRef.current = performance.now();
      const clickT = performance.now();
      clickRingRef.current[clickWriteRef.current] = clickT;
      clickWriteRef.current = (clickWriteRef.current + 1) % clickRingRef.current.length;
      clickCountRef.current = Math.min(clickRingRef.current.length, clickCountRef.current + 1);
      if (e.detail >= 2) {
        setDoubleClicks((prev) => prev + 1);
      }

      const start = performance.now();
      requestAnimationFrame(() => {
        const latency = performance.now() - start;
        pushRolling(clickLatencyStatsRef.current, latency);
      });
    };

    const wheelHandler = (e: WheelEvent) => {
      lastMouseAtRef.current = performance.now();
      setScrollDistance((prev) => prev + Math.abs(e.deltaY));
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler, { passive: true });
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('wheel', wheelHandler, { passive: true });

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mousedown', mouseDownHandler);
      window.removeEventListener('wheel', wheelHandler);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = performance.now();
      setMouseDistance(mouseDistanceRef.current);
      const keyStats = keyLatencyStatsRef.current;
      const clickStats = clickLatencyStatsRef.current;
      setLastKeyLatency(keyStats.last);
      setAvgKeyLatency(keyStats.size > 0 ? keyStats.sum / keyStats.size : 0);
      setLastClickLatency(clickStats.last);
      setAvgClickLatency(clickStats.size > 0 ? clickStats.sum / clickStats.size : 0);
      setKeyRepeatRate(repeatCounterRef.current);
      repeatCounterRef.current = 0;

      const clicksWindowMs = 1000;
      let cps = 0;
      const count = clickCountRef.current;
      const newest = (clickWriteRef.current - 1 + clickRingRef.current.length) % clickRingRef.current.length;
      for (let i = 0; i < count; i++) {
        const idx = (newest - i + clickRingRef.current.length) % clickRingRef.current.length;
        if (now - clickRingRef.current[idx] <= clicksWindowMs) cps += 1;
        else break;
      }
      setClicksPerSecond(cps);

      setFps(Math.round(fpsRef.current));
      setMultiInputActive(now - lastKeyboardAtRef.current < 1800 && now - lastMouseAtRef.current < 1800);
      setHeatmapCounts({ ...heatmapCountsRef.current });
    }, 120);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      const currentFps = delta > 0 ? Math.min(120, Math.round(1000 / delta)) : 120;
      fpsRef.current = currentFps;

      if (stressMode) {
        let total = 0;
        for (let i = 0; i < 45000; i++) {
          total += Math.sqrt(i % 1000);
        }
        if (total < 0) {
          fpsRef.current = 0;
        }
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stressMode]);

  const typingMetrics = useMemo(() => {
    const elapsedMs = typingStartRef.current ? performance.now() - typingStartRef.current : 0;
    const elapsedMinutes = elapsedMs > 0 ? elapsedMs / 60000 : 0;
    const correctChars = typedValue
      .split('')
      .filter((char, idx) => char === TYPING_PROMPT[idx]).length;
    const total = typedValue.length;
    const accuracy = total > 0 ? Math.round((correctChars / total) * 100) : 100;
    const wpm = elapsedMinutes > 0 ? Math.round((correctChars / 5) / elapsedMinutes) : 0;

    return { accuracy, wpm, elapsedMs };
  }, [typedValue]);

  const combinedDelay = useMemo(() => {
    if (avgKeyLatency === 0 && avgClickLatency === 0) return 0;
    if (avgKeyLatency === 0) return avgClickLatency;
    if (avgClickLatency === 0) return avgKeyLatency;
    return (avgKeyLatency + avgClickLatency) / 2;
  }, [avgKeyLatency, avgClickLatency]);

  const gamingScore = useMemo(() => {
    const normalizedPolling = Math.min(100, (pollingMetrics.hz / 125) * 40);
    const normalizedLatency = Math.max(0, 30 - combinedDelay);
    const normalizedCps = Math.min(20, clicksPerSecond * 2);
    const normalizedFps = Math.min(10, fps / 6);
    return Math.round(normalizedPolling + normalizedLatency + normalizedCps + normalizedFps);
  }, [pollingMetrics.hz, combinedDelay, clicksPerSecond, fps]);

  const avgPollingRate = useMemo(() => {
    const valid = graphPoints.filter((v) => v > 0);
    if (valid.length === 0) return 0;
    return valid.reduce((sum, v) => sum + v, 0) / valid.length;
  }, [graphPoints]);

  const keyboardChecklist = [
    { label: 'Anti-ghosting / key rollover', done: rolloverPeak >= 4, value: `${rolloverPeak} simultaneous keys` },
    { label: 'Key press detection', done: pressedKeys.length > 0, value: `${pressedKeys.length} active` },
    { label: 'Typing speed (WPM)', done: typingMetrics.wpm > 0, value: `${typingMetrics.wpm} WPM` },
    { label: 'Typing accuracy', done: typedValue.length > 0, value: `${typingMetrics.accuracy}%` },
    { label: 'Key latency', done: avgKeyLatency > 0, value: `${avgKeyLatency.toFixed(2)} ms` },
    { label: 'Key repeat rate', done: keyRepeatRate > 0, value: `${keyRepeatRate} repeats/sec` },
    { label: 'Modifier keys (Shift/Ctrl/Alt)', done: modifiers.shift || modifiers.ctrl || modifiers.alt, value: `${modifiers.shift ? 'Shift ' : ''}${modifiers.ctrl ? 'Ctrl ' : ''}${modifiers.alt ? 'Alt' : ''}`.trim() || 'inactive' },
    { label: 'Backlight / LED visual test', done: true, value: 'RGB visualization active' },
    { label: 'Scan code overlay', done: showScanCodes, value: showScanCodes ? 'enabled' : 'disabled' },
    { label: 'Rollover heatmap', done: Object.keys(heatmapCounts).length > 0, value: `${Object.keys(heatmapCounts).length} keys tracked` }
  ];

  const mouseChecklist = [
    { label: 'Polling rate (Hz)', done: pollingMetrics.hz > 0, value: `${pollingMetrics.hz.toFixed(1)} Hz` },
    { label: 'DPI sensitivity approximation', done: mouseDistance > 100, value: `${Math.round(mouseDistance)} px travel` },
    { label: 'Click speed (CPS)', done: clicksPerSecond > 0, value: `${clicksPerSecond} CPS` },
    { label: 'Double-click detection', done: doubleClicks > 0, value: `${doubleClicks} detected` },
    { label: 'Click latency', done: avgClickLatency > 0, value: `${avgClickLatency.toFixed(2)} ms` },
    { label: 'Cursor movement accuracy', done: targetHits > 0, value: `${targetHits} target hits` },
    { label: 'Scroll wheel test', done: scrollDistance > 0, value: `${Math.round(scrollDistance)} delta` },
    { label: 'Drag and drop test', done: dragSuccess, value: dragSuccess ? 'pass' : 'pending' },
    { label: 'Lift-off distance approximation', done: liftOffEvents > 0, value: `${liftOffEvents} leave events` }
  ];

  const combinedChecklist = [
    { label: 'Input delay (keyboard + mouse)', done: combinedDelay > 0, value: `${combinedDelay.toFixed(2)} ms` },
    { label: 'Responsiveness under load', done: fps >= 30, value: `${fps} FPS` },
    { label: 'Multi-device input test', done: multiInputActive, value: multiInputActive ? 'active' : 'inactive' },
    { label: 'Gaming performance score', done: gamingScore > 0, value: `${gamingScore}/100` },
    { label: 'Input stability score', done: pollingMetrics.stability > 0, value: `${pollingMetrics.stability.toFixed(1)} / 100` }
  ];

  const currentChecklist = activeTab === 'keyboard' ? keyboardChecklist : activeTab === 'mouse' ? mouseChecklist : combinedChecklist;

  const showActionMessage = (text: string) => {
    setActionMessage(text);
    window.setTimeout(() => setActionMessage(''), 1800);
  };

  const resetKeyboardDiagnostics = () => {
    pressedSetRef.current.clear();
    setPressedKeys([]);
    setRolloverPeak(0);
    setModifiers({ shift: false, ctrl: false, alt: false });
    setLastScanCode('');
    heatmapCountsRef.current = {};
    setHeatmapCounts({});
    keyLatencyStatsRef.current = createRollingStats();
    setLastKeyLatency(0);
    setAvgKeyLatency(0);
    repeatCounterRef.current = 0;
    setKeyRepeatRate(0);
    typingStartRef.current = null;
    setTypedValue('');
    showActionMessage('Keyboard diagnostics reset');
  };

  const resetMouseDiagnostics = () => {
    mouseDistanceRef.current = 0;
    lastMousePosRef.current = null;
    setMouseDistance(0);
    clickRingRef.current = new Float64Array(128);
    clickWriteRef.current = 0;
    clickCountRef.current = 0;
    setClicksPerSecond(0);
    setDoubleClicks(0);
    clickLatencyStatsRef.current = createRollingStats();
    setLastClickLatency(0);
    setAvgClickLatency(0);
    setScrollDistance(0);
    setDragSuccess(false);
    setLiftOffEvents(0);
    setTargetHits(0);
    setTargetPos({ x: 40, y: 30 });
    resetPollingMetrics();
    showActionMessage('Mouse diagnostics reset');
  };

  const resetAllDiagnostics = () => {
    resetKeyboardDiagnostics();
    resetMouseDiagnostics();
    setStressMode(false);
    setFps(60);
    setMultiInputActive(false);
    showActionMessage('All diagnostics reset');
  };

  const buildDiagnosticsReport = () => ({
    generatedAt: new Date().toISOString(),
    activeTab,
    keyboard: {
      preset: keyboardPreset,
      rolloverPeak,
      activeKeys: pressedKeys,
      modifiers,
      lastScanCode,
      keyRepeatRate,
      lastKeyLatency,
      avgKeyLatency,
      typing: {
        wpm: typingMetrics.wpm,
        accuracy: typingMetrics.accuracy,
        elapsedMs: Math.round(typingMetrics.elapsedMs)
      }
    },
    mouse: {
      pollingHz: pollingMetrics.hz,
      avgPollingHz: avgPollingRate,
      jitter: pollingMetrics.jitter,
      stability: pollingMetrics.stability,
      cursorTravelPx: Math.round(mouseDistance),
      clicksPerSecond,
      doubleClicks,
      lastClickLatency,
      avgClickLatency,
      scrollDistance: Math.round(scrollDistance),
      targetHits,
      dragSuccess,
      liftOffEvents
    },
    combined: {
      delayMs: combinedDelay,
      fps,
      multiInputActive,
      gamingScore
    }
  });

  const copyDiagnosticsReport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(buildDiagnosticsReport(), null, 2));
      showActionMessage('Diagnostics copied to clipboard');
    } catch {
      showActionMessage('Clipboard permission blocked');
    }
  };

  const downloadDiagnosticsReport = () => {
    const blob = new Blob([JSON.stringify(buildDiagnosticsReport(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `input-lab-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showActionMessage('Diagnostics JSON downloaded');
  };

  return (
    <div className="w-full h-full bg-transparent text-white p-4 md:p-8 overflow-y-auto font-mono">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black tracking-[0.12em] text-[#00f5d4] drop-shadow-[0_0_12px_rgba(0,245,212,0.45)]">
              KEYBOARD + MOUSE TEST LAB
            </h1>
            <p className="text-[#9ca3af] mt-2">Interactive diagnostics with smooth 3D motion cards and real-time metrics.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="self-start md:self-auto px-5 py-2 border border-[#333] rounded-lg bg-[#121212] text-[#d1d5db] hover:border-[#00f5d4] hover:text-[#00f5d4]"
          >
            ← Back
          </motion.button>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {(['keyboard', 'mouse', 'combined'] as const).map((tab) => {
            const active = activeTab === tab;
            return (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActiveTab(tab)}
                className={
                  'px-4 py-2 rounded-lg border text-sm tracking-[0.08em] uppercase ' +
                  (active ? 'bg-[#00f5d4] text-[#0b0b0b] border-[#00f5d4]' : 'bg-[#141414] text-[#cbd5e1] border-[#333]')
                }
              >
                {tab}
              </motion.button>
            );
          })}
        </div>

        <div className="mb-5 rounded-xl border border-[#2a2a2a] bg-[#0f0f0f]/80 p-3 flex flex-wrap gap-2 items-center">
          <button
            onClick={resetKeyboardDiagnostics}
            className="px-3 py-1.5 rounded border border-[#2f2f2f] bg-[#121212] text-[#cbd5e1] text-xs uppercase tracking-[0.08em] hover:border-[#00f5d4] hover:text-[#00f5d4]"
          >
            Reset Keyboard
          </button>
          <button
            onClick={resetMouseDiagnostics}
            className="px-3 py-1.5 rounded border border-[#2f2f2f] bg-[#121212] text-[#cbd5e1] text-xs uppercase tracking-[0.08em] hover:border-[#00f5d4] hover:text-[#00f5d4]"
          >
            Reset Mouse
          </button>
          <button
            onClick={resetAllDiagnostics}
            className="px-3 py-1.5 rounded border border-[#ff4d6d]/50 bg-[#241117] text-[#ff9fb0] text-xs uppercase tracking-[0.08em] hover:border-[#ff4d6d] hover:text-[#ff4d6d]"
          >
            Reset All
          </button>
          <button
            onClick={copyDiagnosticsReport}
            className="px-3 py-1.5 rounded border border-[#2f2f2f] bg-[#121212] text-[#cbd5e1] text-xs uppercase tracking-[0.08em] hover:border-[#ffd60a] hover:text-[#ffd60a]"
          >
            Copy Report
          </button>
          <button
            onClick={downloadDiagnosticsReport}
            className="px-3 py-1.5 rounded border border-[#2f2f2f] bg-[#121212] text-[#cbd5e1] text-xs uppercase tracking-[0.08em] hover:border-[#ffd60a] hover:text-[#ffd60a]"
          >
            Download JSON
          </button>
          <span className="ml-auto text-xs text-[#94a3b8]">{actionMessage || 'Utility actions for test sessions'}</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ rotateX: 2, rotateY: -2 }}
            className="xl:col-span-2 rounded-2xl border border-[#2a2a2a] bg-[#101010]/85 backdrop-blur-md p-5"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {activeTab === 'keyboard' && (
              <div className="space-y-5">
                <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                  <p className="text-[#ffd60a] text-xs tracking-[0.14em] mb-3">KEYBOARD VIEW CONTROLS</p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {(['60', '75', '100'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setKeyboardPreset(preset)}
                        className={
                          'px-3 py-1.5 rounded border text-xs uppercase tracking-[0.08em] ' +
                          (keyboardPreset === preset
                            ? 'bg-[#00f5d4] text-[#0b0b0b] border-[#00f5d4]'
                            : 'bg-[#101010] text-[#cbd5e1] border-[#2f2f2f]')
                        }
                      >
                        {preset}%
                      </button>
                    ))}
                    <button
                      onClick={() => setShowScanCodes((v) => !v)}
                      className={
                        'px-3 py-1.5 rounded border text-xs uppercase tracking-[0.08em] ' +
                        (showScanCodes
                          ? 'bg-[#ffd60a] text-[#0b0b0b] border-[#ffd60a]'
                          : 'bg-[#101010] text-[#cbd5e1] border-[#2f2f2f]')
                      }
                    >
                      {showScanCodes ? 'Hide Scan Codes' : 'Show Scan Codes'}
                    </button>
                    <div className="text-[11px] text-[#94a3b8] px-2 py-1 rounded border border-[#2f2f2f] bg-[#101010]">
                      {keyboardPresetLabel}
                    </div>
                    <div className="text-xs text-[#9ca3af] ml-auto">Last code: <span className="text-[#00f5d4]">{lastScanCode || 'N/A'}</span></div>
                  </div>
                </div>

                <div>
                  <p className="text-[#ffd60a] text-xs tracking-[0.14em] mb-3">KEY PRESS DETECTION + ROLLOVER</p>
                  <div className="overflow-x-auto pb-2">
                    <motion.div
                      key={keyboardPreset}
                      initial={{ opacity: 0.4, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className={`mx-auto w-fit rounded-2xl border border-[#2f2f2f] bg-[#121212] p-3 md:p-4 shadow-[0_12px_32px_rgba(0,0,0,0.35)] ${keyboardUnitClass} ${keyboardFrameClass}`}
                    >
                      <div className="space-y-1.5">
                        {activeKeyboardLayout.map((row, rowIdx) => (
                          <div key={rowIdx} className="flex gap-1.5 w-fit mx-auto">
                            {row.map((key, keyIdx) => {
                              const normalizedCode = key.code.toUpperCase();
                              const heat = Math.min(1, (heatmapCounts[key.label.toUpperCase()] || 0) / 40);
                              const heatClass =
                                heat >= 0.75 ? 'bg-[#00f5d4]/50' :
                                heat >= 0.5 ? 'bg-[#00f5d4]/35' :
                                heat >= 0.25 ? 'bg-[#00f5d4]/22' :
                                heat > 0 ? 'bg-[#00f5d4]/12' : '';
                              const isActive =
                                activeKeySet.has(normalizedCode) ||
                                (key.code === 'Space' && activeKeySet.has('SPACE')) ||
                                (key.code === 'Shift' && activeKeySet.has('SHIFT')) ||
                                (key.code === 'Control' && (activeKeySet.has('CONTROL') || activeKeySet.has('CTRL')));
                              return (
                                <motion.div
                                  key={`${rowIdx}-${key.label}-${keyIdx}`}
                                  animate={isActive ? { y: [0, -3, 0] } : { y: 0 }}
                                  transition={{ duration: 0.2 }}
                                  style={{ width: `calc((var(--kb-unit, 2.55rem)) * ${key.units ?? 1})` }}
                                  className={
                                    'h-12 md:h-13 px-2 md:px-3 py-2 rounded-md text-[11px] md:text-xs border text-center flex flex-col items-center justify-center relative overflow-hidden ' +
                                    (isActive ? 'bg-[#00f5d4] text-[#0b0b0b] border-[#00f5d4] shadow-[0_0_12px_rgba(0,245,212,0.45)]' : 'bg-[#161616] text-[#94a3b8] border-[#303030]')
                                  }
                                >
                                  {!isActive && heat > 0 && (
                                    <span className={`absolute inset-0 pointer-events-none ${heatClass}`} />
                                  )}
                                  {key.label}
                                  {showScanCodes && (
                                    <span className="text-[9px] leading-none mt-0.5 opacity-80">{key.code}</span>
                                  )}
                                </motion.div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                  <p className="text-[11px] text-[#94a3b8] mt-2">Heatmap intensity grows as keys are pressed more frequently during rollover testing.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">TYPING SPEED + ACCURACY</p>
                    <p className="text-[#9ca3af] text-sm mb-3">{TYPING_PROMPT}</p>
                    <textarea
                      value={typedValue}
                      onChange={(e) => {
                        if (!typingStartRef.current && e.target.value.length > 0) {
                          typingStartRef.current = performance.now();
                        }
                        setTypedValue(e.target.value.slice(0, TYPING_PROMPT.length));
                      }}
                      className="w-full min-h-24 rounded-lg bg-[#0f0f0f] border border-[#303030] p-3 text-sm"
                      placeholder="Type here to calculate WPM and accuracy"
                    />
                    <div className="mt-3 text-sm flex flex-wrap gap-3">
                      <span className="text-[#00f5d4]">WPM: {typingMetrics.wpm}</span>
                      <span className="text-[#ffd60a]">Accuracy: {typingMetrics.accuracy}%</span>
                      <span className="text-[#94a3b8]">Elapsed: {(typingMetrics.elapsedMs / 1000).toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">KEY LATENCY + MODIFIERS + REPEAT</p>
                    <div className="space-y-2 text-sm">
                      <div className="text-[#e2e8f0]">Last key latency: <span className="text-[#00f5d4]">{lastKeyLatency.toFixed(2)} ms</span></div>
                      <div className="text-[#e2e8f0]">Average latency: <span className="text-[#00f5d4]">{avgKeyLatency.toFixed(2)} ms</span></div>
                      <div className="text-[#e2e8f0]">Repeat rate: <span className="text-[#ffd60a]">{keyRepeatRate} repeats/sec</span></div>
                      <div className="text-[#e2e8f0]">Modifiers:
                        <span className={modifiers.shift ? 'text-[#00f5d4] ml-2' : 'text-[#64748b] ml-2'}>Shift</span>
                        <span className={modifiers.ctrl ? 'text-[#00f5d4] ml-2' : 'text-[#64748b] ml-2'}>Ctrl</span>
                        <span className={modifiers.alt ? 'text-[#00f5d4] ml-2' : 'text-[#64748b] ml-2'}>Alt</span>
                      </div>
                      <div className="pt-1 text-[#94a3b8]">Backlight simulation: key colors pulse on press.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'mouse' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">POLLING RATE + DPI APPROXIMATION</p>
                    <p className="text-sm text-[#cbd5e1]">Polling: <span className="text-[#00f5d4]">{pollingMetrics.hz.toFixed(1)} Hz</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Avg polling: <span className="text-[#00f5d4]">{avgPollingRate.toFixed(1)} Hz</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Cursor travel: <span className="text-[#00f5d4]">{Math.round(mouseDistance)} px</span></p>
                    <button
                      onClick={() => {
                        mouseDistanceRef.current = 0;
                        lastMousePosRef.current = null;
                        setMouseDistance(0);
                        showActionMessage('Cursor travel reset');
                      }}
                      className="mt-2 px-2.5 py-1 rounded border border-[#2f2f2f] bg-[#101010] text-[#cbd5e1] text-[11px] uppercase tracking-[0.08em] hover:border-[#00f5d4] hover:text-[#00f5d4]"
                    >
                      Reset Cursor Travel
                    </button>
                    <p className="text-sm text-[#cbd5e1] mt-1">Jitter: <span className="text-[#00f5d4]">{pollingMetrics.jitter.toFixed(3)} ms</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Stability: <span className="text-[#00f5d4]">{pollingMetrics.stability.toFixed(1)} / 100</span></p>
                    <p className="text-xs text-[#94a3b8] mt-2">Mode: {pollingMetrics.mode} • UI rate: {pollingMetrics.uiRate} Hz • dropped frames: {pollingMetrics.droppedFrames}</p>
                  </div>

                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">CLICK SPEED + DOUBLE CLICK + LATENCY</p>
                    <p className="text-sm text-[#cbd5e1]">CPS: <span className="text-[#00f5d4]">{clicksPerSecond}</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Double clicks: <span className="text-[#00f5d4]">{doubleClicks}</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Click latency avg: <span className="text-[#00f5d4]">{avgClickLatency.toFixed(2)} ms</span></p>
                  </div>
                </div>

                <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                  <p className="text-[#ffd60a] text-xs mb-3">REAL-TIME HZ FLUCTUATION</p>
                  <RealtimeHzGraph points={graphPoints} />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                    <div className="rounded bg-[#101010] p-2 border border-[#2f2f2f] text-[#cbd5e1]">Avg interval: <span className="text-[#00f5d4]">{pollingMetrics.avgInterval.toFixed(3)} ms</span></div>
                    <div className="rounded bg-[#101010] p-2 border border-[#2f2f2f] text-[#cbd5e1]">Min interval: <span className="text-[#00f5d4]">{pollingMetrics.minInterval.toFixed(3)} ms</span></div>
                    <div className="rounded bg-[#101010] p-2 border border-[#2f2f2f] text-[#cbd5e1]">Max interval: <span className="text-[#00f5d4]">{pollingMetrics.maxInterval.toFixed(3)} ms</span></div>
                    <div className="rounded bg-[#101010] p-2 border border-[#2f2f2f] text-[#cbd5e1]">Sample events: <span className="text-[#00f5d4]">{pollingMetrics.eventCount}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div
                    onMouseLeave={() => setLiftOffEvents((prev) => prev + 1)}
                    className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414] min-h-44 relative overflow-hidden"
                  >
                    <MouseTrajectoryCanvas />
                    <p className="text-[#ffd60a] text-xs mb-3 relative z-10">CURSOR ACCURACY TARGET TEST</p>
                    <div className="absolute inset-0">
                      <motion.button
                        onClick={() => {
                          setTargetHits((prev) => prev + 1);
                          setTargetPos({
                            x: 8 + Math.random() * 80,
                            y: 12 + Math.random() * 70
                          });
                        }}
                        whileHover={{ scale: 1.1 }}
                        className="absolute w-8 h-8 rounded-full bg-[#00f5d4] shadow-[0_0_14px_rgba(0,245,212,0.5)]"
                        style={{ left: `${targetPos.x}%`, top: `${targetPos.y}%` }}
                      />
                    </div>
                    <p className="relative z-10 text-xs text-[#cbd5e1] mt-28">Hits: {targetHits} • Lift-off events: {liftOffEvents}</p>
                  </div>

                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414] min-h-44">
                    <p className="text-[#ffd60a] text-xs mb-3">SCROLL + DRAG AND DROP</p>
                    <p className="text-sm text-[#cbd5e1] mb-3">Scroll delta: <span className="text-[#00f5d4]">{Math.round(scrollDistance)}</span></p>

                    <div className="grid grid-cols-2 gap-3">
                      <div
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('text/plain', 'token')}
                        className="rounded-lg p-3 border border-[#3a3a3a] bg-[#171717] text-center text-xs cursor-grab"
                      >
                        Drag token
                      </div>
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragSuccess(true);
                        }}
                        className={'rounded-lg p-3 border text-center text-xs ' + (dragSuccess ? 'border-[#00f5d4] text-[#00f5d4] bg-[#0f1b19]' : 'border-[#3a3a3a] text-[#cbd5e1] bg-[#171717]')}
                      >
                        {dragSuccess ? 'Drop success' : 'Drop zone'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'combined' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">INPUT DELAY + MULTI-DEVICE</p>
                    <p className="text-sm text-[#cbd5e1]">Combined delay: <span className="text-[#00f5d4]">{combinedDelay.toFixed(2)} ms</span></p>
                    <p className="text-sm text-[#cbd5e1] mt-1">Keyboard + mouse active: <span className={multiInputActive ? 'text-[#00f5d4]' : 'text-[#f87171]'}>{multiInputActive ? 'Yes' : 'No'}</span></p>
                  </div>

                  <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                    <p className="text-[#ffd60a] text-xs mb-2">RESPONSIVENESS UNDER LOAD</p>
                    <p className="text-sm text-[#cbd5e1]">Current FPS: <span className={fps < 30 ? 'text-[#f87171]' : 'text-[#00f5d4]'}>{fps}</span></p>
                    <button
                      onClick={() => setStressMode((prev) => !prev)}
                      className={'mt-3 px-3 py-2 rounded text-xs border ' + (stressMode ? 'bg-[#3b111b] border-[#ff4d6d] text-[#ff4d6d]' : 'bg-[#0f1b19] border-[#00f5d4] text-[#00f5d4]')}
                    >
                      {stressMode ? 'Stop stress mode' : 'Start stress mode'}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-[#2f2f2f] p-4 bg-[#141414]">
                  <p className="text-[#ffd60a] text-xs mb-2">GAMING PERFORMANCE SCORE</p>
                  <div className="w-full h-3 rounded bg-[#222] overflow-hidden">
                    <motion.div
                      animate={{ width: `${gamingScore}%` }}
                      transition={{ type: 'spring', damping: 18, stiffness: 120 }}
                      className="h-full bg-linear-to-r from-[#00f5d4] via-[#ffd60a] to-[#ff4d6d]"
                    />
                  </div>
                  <p className="text-sm mt-3 text-[#e2e8f0]">Score: <span className="text-[#00f5d4] font-bold">{gamingScore}/100</span></p>
                </div>
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            whileHover={{ rotateX: 2, rotateY: 2 }}
            className="rounded-2xl border border-[#2a2a2a] bg-[#0f0f0f]/90 p-5"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <h2 className="text-[#ffd60a] text-sm tracking-[0.14em] mb-4">TEST CHECKLIST</h2>
            <ul className="space-y-2 text-sm">
              {currentChecklist.map((item) => (
                <li key={item.label} className="border border-[#252525] rounded-lg p-3 bg-[#141414]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[#e5e7eb] leading-snug">{item.label}</span>
                    <span className={item.done ? 'text-[#00f5d4]' : 'text-[#6b7280]'}>{item.done ? 'DONE' : 'PENDING'}</span>
                  </div>
                  <div className="text-xs text-[#94a3b8] mt-1">{item.value}</div>
                </li>
              ))}
            </ul>

            <div className="mt-5 p-3 rounded-lg border border-[#2d2d2d] bg-[#121212]">
              <p className="text-[11px] text-[#9ca3af] leading-relaxed">
                Hardware-level DPI and absolute latency are browser-limited. These tests provide practical approximations for diagnostics, tuning, and comparative benchmarking.
              </p>
            </div>
          </motion.aside>
        </div>
      </motion.div>
    </div>
  );
}
