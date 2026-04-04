type RoomStatus = 'waiting' | 'ready';

export interface RoomState {
  code: string;
  hostId: string;
  guestId?: string;
  createdAt: number;
  status: RoomStatus;
}

const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

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
  };

  roomStore.set(code, room);
  return room;
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
