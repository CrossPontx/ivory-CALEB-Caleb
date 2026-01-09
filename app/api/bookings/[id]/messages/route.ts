import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookingMessages, bookings } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET messages for a booking
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const messages = await db.query.bookingMessages.findMany({
      where: eq(bookingMessages.bookingId, bookingId),
      with: {
        sender: {
          columns: {
            id: true,
            username: true,
            avatar: true,
          }
        }
      },
      orderBy: asc(bookingMessages.createdAt),
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching booking messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST a new message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    
    if (isNaN(bookingId)) {
      return NextResponse.json({ error: 'Invalid booking ID' }, { status: 400 });
    }

    const body = await request.json();
    const { senderId, senderType, messageType, content, fileName } = body;

    if (!senderId || !senderType || !content) {
      return NextResponse.json(
        { error: 'senderId, senderType, and content are required' },
        { status: 400 }
      );
    }

    // Verify the booking exists
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Create the message
    const newMessage = await db
      .insert(bookingMessages)
      .values({
        bookingId,
        senderId: parseInt(senderId),
        senderType,
        messageType: messageType || 'text',
        content,
        fileName,
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('Error creating booking message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
