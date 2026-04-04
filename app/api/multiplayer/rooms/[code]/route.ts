import { NextRequest, NextResponse } from 'next/server';
import { configureRoom, getRoom, joinRoom, leaveRoom, startRoom } from '../store';

interface RouteParams {
  params: Promise<{ code: string }>;
}

export async function GET(_: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const room = getRoom(code.toUpperCase());

  if (!room) {
    return NextResponse.json({ error: 'Room not found.' }, { status: 404 });
  }

  return NextResponse.json({ room });
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const action = typeof body?.action === 'string' ? body.action : '';
  const playerId = typeof body?.playerId === 'string' ? body.playerId.trim() : '';

  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required.' }, { status: 400 });
  }

  if (action === 'join') {
    const result = joinRoom(code.toUpperCase(), playerId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ room: result.room });
  }

  if (action === 'configure') {
    const config = body?.config;
    if (!config || typeof config !== 'object') {
      return NextResponse.json({ error: 'config is required.' }, { status: 400 });
    }

    const mode = typeof config.mode === 'string' ? config.mode : '';
    const difficulty = typeof config.difficulty === 'string' ? config.difficulty : '';
    const duration = typeof config.duration === 'number' ? config.duration : undefined;
    const wordCount = typeof config.wordCount === 'number' ? config.wordCount : undefined;
    const customText = typeof config.customText === 'string' ? config.customText : undefined;

    const allowedModes = new Set(['timed', 'words', 'quote', 'sudden-death', 'zen']);
    const allowedDifficulties = new Set(['easy', 'medium', 'hard', 'insane']);

    if (!allowedModes.has(mode) || !allowedDifficulties.has(difficulty)) {
      return NextResponse.json({ error: 'Invalid room config.' }, { status: 400 });
    }

    const result = configureRoom(code.toUpperCase(), playerId, {
      mode: mode as 'timed' | 'words' | 'quote' | 'sudden-death' | 'zen',
      difficulty: difficulty as 'easy' | 'medium' | 'hard' | 'insane',
      duration,
      wordCount,
      customText,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ room: result.room });
  }

  if (action === 'leave') {
    const result = leaveRoom(code.toUpperCase(), playerId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ room: result.room });
  }

  if (action === 'start') {
    const result = startRoom(code.toUpperCase(), playerId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ room: result.room });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
