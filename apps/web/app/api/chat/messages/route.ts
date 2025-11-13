
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { sessionId, role, content, sql, results } = await request.json();
    
    const message = await prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        sql,
        results,
      },
    });
    
    return NextResponse.json(message);
  } catch (error) {
    console.error('Save message error:', error);
    return NextResponse.json(
      { error: 'Failed to save message' },
      { status: 500 }
    );
  }
}