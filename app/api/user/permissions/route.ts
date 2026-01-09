import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.select({
      cameraPermissionGranted: users.cameraPermissionGranted,
      photosPermissionGranted: users.photosPermissionGranted,
      notificationsPermissionGranted: users.notificationsPermissionGranted,
      permissionsRequestedAt: users.permissionsRequestedAt,
    }).from(users).where(eq(users.id, parseInt(userId))).limit(1);

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      permissions: user[0]
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { permissions } = body;

    if (!permissions || typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Invalid permissions data' }, { status: 400 });
    }

    // Update user permissions
    const updateData: any = {
      permissionsRequestedAt: new Date(),
    };

    if (typeof permissions.camera === 'boolean') {
      updateData.cameraPermissionGranted = permissions.camera;
    }
    if (typeof permissions.photos === 'boolean') {
      updateData.photosPermissionGranted = permissions.photos;
    }
    if (typeof permissions.notifications === 'boolean') {
      updateData.notificationsPermissionGranted = permissions.notifications;
    }

    await db.update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(userId)));

    return NextResponse.json({ 
      success: true,
      message: 'Permissions updated successfully'
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}