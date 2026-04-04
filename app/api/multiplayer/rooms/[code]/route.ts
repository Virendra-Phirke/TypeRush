import { NextRequest, NextResponse } from 'next/server';
import { getRoom, joinRoom, leaveRoom } from '../store';

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

  if (action === 'leave') {
    const result = leaveRoom(code.toUpperCase(), playerId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ room: result.room });
  }

  return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
}
