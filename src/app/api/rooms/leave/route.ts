import { NextRequest, NextResponse } from 'next/server';
import { roomDB } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { roomId, userId } = body;

    if (!roomId || !userId) {
      return NextResponse.json(
        { error: 'Missing roomId or userId' },
        { status: 400 }
      );
    }

    // Leave room in database
    await roomDB.leaveRoom(roomId, userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error leaving room:', error);
    return NextResponse.json(
      { error: 'Failed to leave room' },
      { status: 500 }
    );
  }
}
