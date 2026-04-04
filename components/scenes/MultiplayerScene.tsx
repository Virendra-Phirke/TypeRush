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

const PLAYER_KEY = 'typeRush.multiplayer.playerId';

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

async function parseJsonOrThrow(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Request failed.';
    throw new Error(message);
  }
  return data;
}

async function apiCreateRoom(hostId: string): Promise<RoomState> {
  const response = await fetch('/api/multiplayer/rooms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId }),
  });
  const data = await parseJsonOrThrow(response);
  return data.room as RoomState;
}

async function apiGetRoom(code: string): Promise<RoomState | null> {
  const response = await fetch(`/api/multiplayer/rooms/${code}`, { cache: 'no-store' });
  if (response.status === 404) return null;
  const data = await parseJsonOrThrow(response);
  return data.room as RoomState;
}

async function apiJoinRoom(code: string, playerId: string): Promise<RoomState> {
  const response = await fetch(`/api/multiplayer/rooms/${code}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'join', playerId }),
  });
  const data = await parseJsonOrThrow(response);
  return data.room as RoomState;
}

async function apiLeaveRoom(code: string, playerId: string): Promise<void> {
  const response = await fetch(`/api/multiplayer/rooms/${code}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'leave', playerId }),
  });
  await parseJsonOrThrow(response);
}

export function MultiplayerScene({ onBack }: MultiplayerSceneProps) {
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const [joinCode, setJoinCode] = useState('');
  const [activeRoom, setActiveRoom] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isHost = activeRoom?.hostId === playerId;
  const isGuest = activeRoom?.guestId === playerId;

  useEffect(() => {
    if (!activeRoom) return;

    const interval = window.setInterval(() => {
      apiGetRoom(activeRoom.code)
        .then((latest) => {
          if (!latest) {
            setActiveRoom(null);
            setError('Room expired or was closed.');
            return;
          }
          setActiveRoom(latest);
        })
        .catch(() => {
          setError('Unable to sync room status. Check network and retry.');
        });
    }, 800);

    return () => window.clearInterval(interval);
  }, [activeRoom]);

  const handleCreateRoom = async () => {
    if (isLoading) return;
    setError(null);
    setCopied(false);
    setIsLoading(true);
    try {
      const room = await apiCreateRoom(playerId);
      setActiveRoom(room);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create room.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (isLoading) return;
    setError(null);
    const code = joinCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('Enter a valid 6-character code.');
      return;
    }

    setIsLoading(true);
    try {
      const joined = await apiJoinRoom(code, playerId);
      setActiveRoom(joined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join room.');
    } finally {
      setIsLoading(false);
    }
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

  const handleLeaveRoom = async () => {
    if (!activeRoom) return;

    try {
      await apiLeaveRoom(activeRoom.code, playerId);
    } catch {
      // We still clear local state to avoid trapping the user in stale room UI.
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
          Host generates a room code. Opponent enters that code to join from another browser or another device using the same app URL.
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
                disabled={isLoading}
                className="px-5 py-3 rounded border-2 border-[#00f5d4] text-[#00f5d4] font-bold"
              >
                {isLoading ? 'Creating...' : 'Generate Room Code'}
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
                  disabled={isLoading}
                  className="px-4 py-2 rounded border-2 border-[#ff4d6d] text-[#ff4d6d] font-bold"
                >
                  {isLoading ? 'Joining...' : 'Join'}
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
