import { NextResponse } from 'next/server';
import { db } from '@/db';
import { designRequestMessages, designRequests } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

// GET messages for a design request
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const designRequestId = parseInt(params.id);
    
    if (isNaN(designRequestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const messages = await db.query.designRequestMessages.findMany({
      where: eq(designRequestMessages.designRequestId, designRequestId),
      with: {
        sender: {
          columns: {
            id: true,
            username: true,
          }
        }
      },
      orderBy: asc(designRequestMessages.createdAt),
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST a new message
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const designRequestId = parseInt(params.id);
    
    if (isNaN(designRequestId)) {
      return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 });
    }

    const body = await request.json();
    const { senderId, senderType, messageType, content, fileName } = body;

    if (!senderId || !senderType || !content) {
      return NextResponse.json(
        { error: 'senderId, senderType, and content are required' },
        { status: 400 }
      );
    }

    // Verify the design request exists
    const designRequest = await db.query.designRequests.findFirst({
      where: eq(designRequests.id, designRequestId),
    });

    if (!designRequest) {
      return NextResponse.json({ error: 'Design request not found' }, { status: 404 });
    }

    // Create the message
    const newMessage = await db
      .insert(designRequestMessages)
      .values({
        designRequestId,
        senderId: parseInt(senderId),
        senderType,
        messageType: messageType || 'text',
        content,
        fileName,
      })
      .returning();

    return NextResponse.json(newMessage[0], { status: 201 });
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
