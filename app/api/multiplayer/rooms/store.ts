type RoomStatus = 'waiting' | 'ready';
type GameMode = 'timed' | 'words' | 'quote' | 'sudden-death' | 'zen';
type Difficulty = 'easy' | 'medium' | 'hard' | 'insane';

export interface MultiplayerRoomConfig {
  mode: GameMode;
  difficulty: Difficulty;
  duration?: number;
  wordCount?: number;
}

export interface RoomState {
  code: string;
  hostId: string;
  guestId?: string;
  createdAt: number;
  status: RoomStatus;
  config: MultiplayerRoomConfig;
  sharedPassage: string;
}

const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WORD_BANKS: Record<Difficulty, string[]> = {
  easy: ['the', 'and', 'for', 'are', 'you', 'all', 'day', 'way', 'new', 'use', 'test', 'type', 'fast', 'focus', 'learn'],
  medium: ['about', 'again', 'before', 'between', 'every', 'first', 'group', 'other', 'right', 'small', 'still', 'their', 'while', 'world', 'write'],
  hard: ['absolute', 'abstract', 'accelerate', 'acquire', 'adjacent', 'adversary', 'aggregate', 'algorithm', 'alignment', 'alleviate', 'amalgamate'],
  insane: ['syzygy', 'onomatopoeia', 'floccinaucinihilipilification', 'antidisestablishmentarianism', 'pneumonoultramicroscopicsilicovolcanoconiosis'],
};

const QUOTES: Record<Difficulty, string[]> = {
  easy: [
    'Practice makes progress when each key is pressed with attention.',
    'Small daily sessions can build strong typing confidence.',
    'Consistent rhythm often beats sudden bursts of speed.'
  ],
  medium: [
    'Success in typing comes from balancing speed, accuracy, and calm focus under pressure.',
    'Reliable habits emerge when you review mistakes and make small improvements every day.',
    'Productive practice is measured not by effort alone, but by clear and repeatable outcomes.'
  ],
  hard: [
    'Clear communication, disciplined iteration, and technical precision are foundational to reliable software delivery.',
    'Complex systems remain maintainable when teams prioritize readability, observability, and thoughtful architectural boundaries.',
    'Engineering maturity grows through deliberate practice, evidence-based decisions, and respectful collaboration across disciplines.'
  ],
  insane: [
    'Interdisciplinary innovation demands methodological rigor, epistemic humility, and sustained commitment to empirical validation.',
    'Organizational resilience is strengthened when asynchronous collaboration, deterministic automation, and strategic foresight align.',
    'High-velocity delivery remains sustainable only when architectural coherence and operational excellence evolve in tandem.'
  ],
};

const DEFAULT_CONFIG: MultiplayerRoomConfig = {
  mode: 'timed',
  difficulty: 'medium',
  duration: 60,
};

function hashSeed(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSharedPassage(code: string, config: MultiplayerRoomConfig): string {
  const seed = hashSeed(`${code}:${config.mode}:${config.difficulty}:${config.duration ?? 0}:${config.wordCount ?? 0}`);
  const rand = mulberry32(seed);

  if (config.mode === 'quote') {
    const list = QUOTES[config.difficulty] || QUOTES.medium;
    return list[Math.floor(rand() * list.length)];
  }

  const bank = WORD_BANKS[config.difficulty] || WORD_BANKS.medium;
  const wordCount = config.mode === 'words' ? (config.wordCount ?? 50) : config.mode === 'sudden-death' ? 140 : config.mode === 'zen' ? 180 : 120;
  const words: string[] = [];
  for (let i = 0; i < wordCount; i += 1) {
    words.push(bank[Math.floor(rand() * bank.length)]);
  }
  return words.join(' ');
}

declare global {
  var __typeRushRooms: Map<string, RoomState> | undefined;
}

const roomStore = globalThis.__typeRushRooms ?? new Map<string, RoomState>();
globalThis.__typeRushRooms = roomStore;

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export function pruneRooms() {
  const now = Date.now();
  for (const [code, room] of roomStore.entries()) {
    if (now - room.createdAt > ROOM_TTL_MS) {
      roomStore.delete(code);
    }
  }
}

export function createRoom(hostId: string): RoomState {
  pruneRooms();

  let code = generateRoomCode();
  let attempts = 0;
  while (roomStore.has(code) && attempts < 24) {
    code = generateRoomCode();
    attempts += 1;
  }

  const room: RoomState = {
    code,
    hostId,
    createdAt: Date.now(),
    status: 'waiting',
    config: { ...DEFAULT_CONFIG },
    sharedPassage: generateSharedPassage(code, DEFAULT_CONFIG),
  };

  roomStore.set(code, room);
  return room;
}

export function configureRoom(code: string, playerId: string, config: MultiplayerRoomConfig) {
  const room = getRoom(code);
  if (!room) {
    return { room: null as RoomState | null, status: 404, error: 'Room not found.' };
  }

  if (room.hostId !== playerId) {
    return { room: null as RoomState | null, status: 403, error: 'Only host can configure room.' };
  }

  const normalized: MultiplayerRoomConfig = {
    mode: config.mode,
    difficulty: config.difficulty,
    duration: config.mode === 'timed' ? (config.duration ?? 60) : undefined,
    wordCount: config.mode === 'words' ? (config.wordCount ?? 50) : undefined,
  };

  const updated: RoomState = {
    ...room,
    config: normalized,
    sharedPassage: generateSharedPassage(room.code, normalized),
  };

  roomStore.set(code, updated);
  return { room: updated, status: 200, error: null };
}

export function getRoom(code: string): RoomState | null {
  pruneRooms();
  return roomStore.get(code) ?? null;
}

export function joinRoom(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) {
    return { room: null as RoomState | null, status: 404, error: 'Room not found.' };
  }

  if (room.hostId === playerId || room.guestId === playerId) {
    return { room, status: 200, error: null };
  }

  if (room.guestId && room.guestId !== playerId) {
    return { room: null as RoomState | null, status: 409, error: 'Room is full.' };
  }

  const updated: RoomState = {
    ...room,
    guestId: playerId,
    status: 'ready',
  };

  roomStore.set(code, updated);
  return { room: updated, status: 200, error: null };
}

export function leaveRoom(code: string, playerId: string) {
  const room = getRoom(code);
  if (!room) {
    return { room: null as RoomState | null, status: 404, error: 'Room not found.' };
  }

  if (room.hostId === playerId) {
    roomStore.delete(code);
    return { room: null as RoomState | null, status: 200, error: null };
  }

  if (room.guestId === playerId) {
    const updated: RoomState = {
      ...room,
      guestId: undefined,
      status: 'waiting',
    };
    roomStore.set(code, updated);
    return { room: updated, status: 200, error: null };
  }

  return { room, status: 200, error: null };
}
