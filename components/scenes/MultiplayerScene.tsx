'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface MultiplayerSceneProps {
  onBack: () => void;
}

type RoomStatus = 'waiting' | 'ready';

interface RoomState {
  code: string;
  hostId: string;
  guestId?: string;
  createdAt: number;
  status: RoomStatus;
}

type RoomDb = Record<string, RoomState>;

const STORAGE_KEY = 'typeRush.multiplayer.rooms';
const PLAYER_KEY = 'typeRush.multiplayer.playerId';
const ROOM_TTL_MS = 2 * 60 * 60 * 1000;

function generatePlayerId() {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreatePlayerId() {
  if (typeof window === 'undefined') return generatePlayerId();
  const existing = window.localStorage.getItem(PLAYER_KEY);
  if (existing) return existing;
  const created = generatePlayerId();
  window.localStorage.setItem(PLAYER_KEY, created);
  return created;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function loadRooms(): RoomDb {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}') as RoomDb;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveRooms(rooms: RoomDb) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms));
}

function pruneRooms(rooms: RoomDb): RoomDb {
  const now = Date.now();
  const entries = Object.entries(rooms).filter(([, room]) => now - room.createdAt <= ROOM_TTL_MS);
  return Object.fromEntries(entries);
}

function upsertRoom(room: RoomState) {
  const rooms = pruneRooms(loadRooms());
  rooms[room.code] = room;
  saveRooms(rooms);
}

function getRoom(code: string): RoomState | null {
  const rooms = pruneRooms(loadRooms());
  saveRooms(rooms);
  return rooms[code] || null;
}

export function MultiplayerScene({ onBack }: MultiplayerSceneProps) {
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const [joinCode, setJoinCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isHost = activeRoom?.hostId === playerId;
  const isGuest = activeRoom?.guestId === playerId;

  useEffect(() => {
    if (!activeRoom) return;

    const interval = window.setInterval(() => {
      const latest = getRoom(activeRoom.code);
      if (!latest) {
        setActiveRoom(null);
        setError('Room expired or was closed.');
        return;
      }
      setActiveRoom(latest);
    }, 800);

    return () => window.clearInterval(interval);
  }, [activeRoom]);

  const handleCreateRoom = () => {
    setError(null);
    setCopied(false);

    let code = generateRoomCode();
    const rooms = loadRooms();
    let attempts = 0;
    while (rooms[code] && attempts < 8) {
      code = generateRoomCode();
      attempts += 1;
    }

    const room: RoomState = {
      code,
      hostId: playerId,
      createdAt: Date.now(),
      status: 'waiting',
    };

    upsertRoom(room);
    setActiveRoom(room);
  };

  const handleJoinRoom = () => {
    setError(null);
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Enter a valid 6-character code.');
      return;
    }

    const room = getRoom(code);
    if (!room) {
      setError('Room not found.');
      return;
    }

    if (room.hostId === playerId) {
      setActiveRoom(room);
      return;
    }

    if (room.guestId && room.guestId !== playerId) {
      setError('Room is full.');
      return;
    }

    const joined: RoomState = {
      ...room,
      guestId: playerId,
      status: 'ready',
    };

    upsertRoom(joined);
    setActiveRoom(joined);
  };

  const handleCopyCode = async () => {
    if (!activeRoom) return;
    try {
      await navigator.clipboard.writeText(activeRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setError('Unable to copy code. Please copy manually.');
    }
  };

  const handleLeaveRoom = () => {
    if (!activeRoom) return;

    const room = getRoom(activeRoom.code);
    if (!room) {
      setActiveRoom(null);
      return;
    }

    if (room.hostId === playerId) {
      const rooms = loadRooms();
      delete rooms[room.code];
      saveRooms(rooms);
    } else if (room.guestId === playerId) {
      const updated: RoomState = {
        ...room,
        guestId: undefined,
        status: 'waiting',
      };
      upsertRoom(updated);
    }

    setActiveRoom(null);
    setJoinCode('');
  };

  return (
    <div className="w-full h-full bg-transparent flex flex-col items-center justify-center font-mono p-6">
      <div className="w-full max-w-4xl border border-[#333] rounded-2xl bg-[#101010]/85 p-6 md:p-8 shadow-xl">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-[#00f5d4] text-2xl md:text-3xl font-black tracking-[0.12em]">1V1 MULTIPLAYER LOBBY</h2>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded border border-[#555] text-[#aaa] hover:text-white hover:border-white"
          >
            Back
          </button>
        </div>

        <p className="text-[#888] mb-6 text-sm md:text-base">
          Host generates a room code. Opponent enters that code to join. Works across tabs/windows in the same browser profile.
        </p>

        {!activeRoom && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="border border-[#2e2e2e] rounded-xl p-5 bg-[#0f0f0f]">
              <p className="text-[#ffd60a] text-xs tracking-[0.15em] mb-3">HOST ROOM</p>
              <p className="text-[#7b7b7b] text-sm mb-4">Create a private 1v1 room and share the code.</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateRoom}
                className="px-5 py-3 rounded border-2 border-[#00f5d4] text-[#00f5d4] font-bold"
              >
                Generate Room Code
              </motion.button>
            </div>

            <div className="border border-[#2e2e2e] rounded-xl p-5 bg-[#0f0f0f]">
              <p className="text-[#ffd60a] text-xs tracking-[0.15em] mb-3">JOIN ROOM</p>
              <p className="text-[#7b7b7b] text-sm mb-4">Enter the host code to join instantly.</p>
              <div className="flex gap-2">
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                  placeholder="ABC123"
                  className="flex-1 rounded border border-[#333] bg-[#0b0b0b] px-3 py-2 text-[#e8fffa] tracking-[0.2em]"
                />
                <button
                  onClick={handleJoinRoom}
                  className="px-4 py-2 rounded border-2 border-[#ff4d6d] text-[#ff4d6d] font-bold"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        )}

        {activeRoom && (
          <div className="border border-[#2e2e2e] rounded-xl p-5 bg-[#0f0f0f]">
            <p className="text-[#ffd60a] text-xs tracking-[0.15em] mb-3">ROOM DETAILS</p>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-[#8a8a8a]">Code:</span>
              <span className="text-[#00f5d4] text-2xl font-black tracking-[0.2em]">{activeRoom.code}</span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1 rounded border border-[#00f5d4] text-[#00f5d4] text-xs"
              >
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-3 text-sm">
              <div className="rounded border border-[#2a2a2a] bg-[#121212] p-3">
                <p className="text-[#7f7f7f] mb-1">You are</p>
                <p className="text-[#e5fff9] font-bold">{isHost ? 'Host' : isGuest ? 'Guest' : 'Viewer'}</p>
              </div>
              <div className="rounded border border-[#2a2a2a] bg-[#121212] p-3">
                <p className="text-[#7f7f7f] mb-1">Room status</p>
                <p className={`font-bold ${activeRoom.status === 'ready' ? 'text-[#00f5d4]' : 'text-[#ffd60a]'}`}>
                  {activeRoom.status === 'ready' ? 'Opponent Joined' : 'Waiting for Opponent'}
                </p>
              </div>
            </div>

            {activeRoom.status === 'ready' && (
              <p className="text-[#00f5d4] mt-4 text-sm">Both players connected. 1v1 room is ready.</p>
            )}

            <div className="mt-5">
              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 rounded border border-[#555] text-[#aaa] hover:text-white hover:border-white"
              >
                Leave Room
              </button>
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-[#ff4d6d] text-sm">{error}</p>}
      </div>
    </div>
  );
}
