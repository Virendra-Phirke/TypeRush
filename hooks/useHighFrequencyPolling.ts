'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type WorkerResult = {
  type: 'result';
  hz: number;
  avgInterval: number;
  jitter: number;
  stability: number;
  minInterval: number;
  maxInterval: number;
  eventCount: number;
};

export interface PollingMetrics {
  hz: number;
  avgInterval: number;
  jitter: number;
  stability: number;
  minInterval: number;
  maxInterval: number;
  eventCount: number;
  droppedFrames: number;
  uiRate: number;
  mode: 'balanced' | 'high-refresh' | 'power-save';
}

interface UseHighFrequencyPollingResult {
  metrics: PollingMetrics;
  graphPoints: number[];
  reset: () => void;
}

const RING_BUFFER_SIZE = 8192;
const SAMPLE_WINDOW = 512;
const GRAPH_POINTS = 120;
const LOOKBACK_MS = 400;

function getMode(): PollingMetrics['mode'] {
  const cores = navigator.hardwareConcurrency || 4;
  if (cores >= 10) return 'high-refresh';
  if (cores <= 4) return 'power-save';
  return 'balanced';
}

function getUiInterval(mode: PollingMetrics['mode']): number {
  if (mode === 'high-refresh') return 8;
  if (mode === 'power-save') return 33;
  return 16;
}

export function useHighFrequencyPolling(): UseHighFrequencyPollingResult {
  const [metrics, setMetrics] = useState<PollingMetrics>({
    hz: 0,
    avgInterval: 0,
    jitter: 0,
    stability: 0,
    minInterval: 0,
    maxInterval: 0,
    eventCount: 0,
    droppedFrames: 0,
    uiRate: 60,
    mode: 'balanced'
  });
  const [graphPoints, setGraphPoints] = useState<number[]>([]);

  const mode = useMemo(() => (typeof window !== 'undefined' ? getMode() : 'balanced'), []);
  const uiInterval = useMemo(() => getUiInterval(mode), [mode]);

  const ringRef = useRef<Float64Array>(new Float64Array(RING_BUFFER_SIZE));
  const writeIndexRef = useRef(0);
  const countRef = useRef(0);
  const eventCounterRef = useRef(0);
  const inFlightRef = useRef(false);
  const droppedFramesRef = useRef(0);
  const lastUiTickRef = useRef(0);
  const lastMoveAtRef = useRef(0);
  const workerRef = useRef<Worker | null>(null);

  const reset = useCallback(() => {
    ringRef.current = new Float64Array(RING_BUFFER_SIZE);
    writeIndexRef.current = 0;
    countRef.current = 0;
    eventCounterRef.current = 0;
    inFlightRef.current = false;
    droppedFramesRef.current = 0;
    lastUiTickRef.current = 0;
    lastMoveAtRef.current = 0;

    setMetrics({
      hz: 0,
      avgInterval: 0,
      jitter: 0,
      stability: 0,
      minInterval: 0,
      maxInterval: 0,
      eventCount: 0,
      droppedFrames: 0,
      uiRate: Math.round(1000 / uiInterval),
      mode
    });
    setGraphPoints([]);
  }, [mode, uiInterval]);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/inputMetrics.worker.ts', import.meta.url), { type: 'module' });
    workerRef.current = worker;

    worker.onmessage = (evt: MessageEvent<WorkerResult>) => {
      const msg = evt.data;
      inFlightRef.current = false;
      if (!msg || msg.type !== 'result') return;

      setMetrics({
        hz: msg.hz,
        avgInterval: msg.avgInterval,
        jitter: msg.jitter,
        stability: msg.stability,
        minInterval: msg.minInterval,
        maxInterval: msg.maxInterval,
        eventCount: msg.eventCount,
        droppedFrames: droppedFramesRef.current,
        uiRate: Math.round(1000 / uiInterval),
        mode
      });

      setGraphPoints((prev) => {
        const next = prev.length >= GRAPH_POINTS ? prev.slice(1) : prev.slice();
        next.push(msg.hz);
        return next;
      });
    };

    const onMouseMove = () => {
      const t = performance.now();
      lastMoveAtRef.current = t;
      ringRef.current[writeIndexRef.current] = t;
      writeIndexRef.current = (writeIndexRef.current + 1) % RING_BUFFER_SIZE;
      countRef.current = Math.min(RING_BUFFER_SIZE, countRef.current + 1);
      eventCounterRef.current += 1;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let raf = 0;

    const tick = (now: number) => {
      if (lastUiTickRef.current === 0) {
        lastUiTickRef.current = now;
      }

      const elapsed = now - lastUiTickRef.current;
      if (elapsed >= uiInterval) {
        if (!inFlightRef.current) {
          const newestIdx = (writeIndexRef.current - 1 + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
          let sampleSize = 0;

          if (countRef.current > 0 && now - lastMoveAtRef.current <= LOOKBACK_MS) {
            for (let i = 0; i < Math.min(countRef.current, SAMPLE_WINDOW); i++) {
              const idx = (newestIdx - i + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
              const t = ringRef.current[idx];
              if (now - t > LOOKBACK_MS) break;
              sampleSize += 1;
            }
          }

          const sample = new Float64Array(sampleSize);
          const startIdx = (writeIndexRef.current - sampleSize + RING_BUFFER_SIZE) % RING_BUFFER_SIZE;
          for (let i = 0; i < sampleSize; i++) {
            sample[i] = ringRef.current[(startIdx + i) % RING_BUFFER_SIZE];
          }

          inFlightRef.current = true;
          worker.postMessage(
            {
              type: 'process',
              timestamps: sample,
              eventCount: eventCounterRef.current,
              durationMs: elapsed
            },
            [sample.buffer]
          );

          eventCounterRef.current = 0;
          lastUiTickRef.current = now;
        } else {
          droppedFramesRef.current += 1;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      worker.terminate();
      workerRef.current = null;
    };
  }, [mode, uiInterval]);

  return { metrics, graphPoints, reset };
}
