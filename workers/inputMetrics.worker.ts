export {};

type ProcessMessage = {
  type: 'process';
  timestamps: Float64Array;
  eventCount: number;
  durationMs: number;
};

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

const MAX_ACTIVE_INTERVAL_MS = 24;

interface WorkerContext {
  postMessage: (message: WorkerResult) => void;
  onmessage: ((evt: MessageEvent<ProcessMessage>) => void) | null;
}

const ctx = self as unknown as WorkerContext;

ctx.onmessage = (evt: MessageEvent<ProcessMessage>) => {
  const msg = evt.data;
  if (!msg || msg.type !== 'process') return;

  const ts = msg.timestamps;
  const n = ts.length;

  if (n < 2) {
    const fallbackHz = msg.durationMs > 0 ? (msg.eventCount * 1000) / msg.durationMs : 0;
    const fallback: WorkerResult = {
      type: 'result',
      hz: fallbackHz,
      avgInterval: 0,
      jitter: 0,
      stability: 0,
      minInterval: 0,
      maxInterval: 0,
      eventCount: msg.eventCount
    };
    ctx.postMessage(fallback);
    return;
  }

  let sum = 0;
  let minInterval = Number.POSITIVE_INFINITY;
  let maxInterval = 0;
  let validIntervals = 0;

  for (let i = 1; i < n; i++) {
    const interval = ts[i] - ts[i - 1];
    if (interval <= 0 || interval > MAX_ACTIVE_INTERVAL_MS) {
      continue;
    }
    validIntervals += 1;
    sum += interval;
    if (interval < minInterval) minInterval = interval;
    if (interval > maxInterval) maxInterval = interval;
  }

  const intervalCount = validIntervals;
  if (intervalCount === 0) {
    const empty: WorkerResult = {
      type: 'result',
      hz: 0,
      avgInterval: 0,
      jitter: 0,
      stability: 0,
      minInterval: 0,
      maxInterval: 0,
      eventCount: msg.eventCount
    };
    ctx.postMessage(empty);
    return;
  }

  const avgInterval = intervalCount > 0 ? sum / intervalCount : 0;

  let varianceSum = 0;
  for (let i = 1; i < n; i++) {
    const interval = ts[i] - ts[i - 1];
    if (interval <= 0 || interval > MAX_ACTIVE_INTERVAL_MS) {
      continue;
    }
    const diff = interval - avgInterval;
    varianceSum += diff * diff;
  }

  const jitter = intervalCount > 0 ? Math.sqrt(varianceSum / intervalCount) : 0;

  const hzFromIntervals = avgInterval > 0 ? 1000 / avgInterval : 0;
  const hzFromCount = msg.durationMs > 0 ? (msg.eventCount * 1000) / msg.durationMs : 0;
  const hz = hzFromIntervals > 0 ? hzFromIntervals : hzFromCount;

  const coeffVar = avgInterval > 0 ? jitter / avgInterval : 1;
  const stability = Math.max(0, Math.min(100, 100 - coeffVar * 120));

  const result: WorkerResult = {
    type: 'result',
    hz,
    avgInterval,
    jitter,
    stability,
    minInterval: Number.isFinite(minInterval) ? minInterval : 0,
    maxInterval,
    eventCount: msg.eventCount
  };

  ctx.postMessage(result);
};
