import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from './store';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const hostId = typeof body?.hostId === 'string' ? body.hostId.trim() : '';

  if (!hostId) {
    return NextResponse.json({ error: 'hostId is required.' }, { status: 400 });
  }

  const room = createRoom(hostId);
  return NextResponse.json({ room });
}
