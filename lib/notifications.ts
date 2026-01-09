import { db } from '@/db';
import { notifications } from '@/db/schema';

export type NotificationType = 
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'booking_paid'
  | 'design_request'
  | 'request_received'
  | 'request_approved'
  | 'request_modified'
  | 'request_rejected'
  | 'new_review'
  | 'credits_low'
  | 'credits_added'
  | 'design_breakdown_ready'
  | 'content_flagged'
  | 'user_blocked';

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message?: string;
  relatedId?: number;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  const { userId, type, title, message, relatedId } = params;
  
  try {
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        relatedId,
        isRead: false,
      })
      .returning();
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create a booking confirmation notification
 */
export async function notifyBookingConfirmed(
  clientId: number,
  bookingId: number,
  serviceName: string,
  techName: string
) {
  return createNotification({
    userId: clientId,
    type: 'booking_confirmed',
    title: `Booking confirmed with ${techName}`,
    message: `Your ${serviceName} appointment has been confirmed.`,
    relatedId: bookingId,
  });
}

/**
 * Create a booking cancellation notification
 */
export async function notifyBookingCancelled(
  userId: number,
  bookingId: number,
  serviceName: string,
  cancelledBy: 'client' | 'tech'
) {
  return createNotification({
    userId,
    type: 'booking_cancelled',
    title: 'Booking cancelled',
    message: `Your ${serviceName} appointment has been cancelled${cancelledBy === 'tech' ? ' by the nail tech' : ''}.`,
    relatedId: bookingId,
  });
}

/**
 * Create a booking payment notification for tech
 */
export async function notifyBookingPaid(
  techUserId: number,
  bookingId: number,
  clientName: string,
  serviceName: string
) {
  return createNotification({
    userId: techUserId,
    type: 'booking_paid',
    title: 'New booking payment received',
    message: `${clientName} has paid for ${serviceName}.`,
    relatedId: bookingId,
  });
}

/**
 * Create a design request notification for tech
 */
export async function notifyDesignRequest(
  techUserId: number,
  requestId: number,
  clientName: string
) {
  return createNotification({
    userId: techUserId,
    type: 'request_received',
    title: 'New design request',
    message: `${clientName} sent you a design request.`,
    relatedId: requestId,
  });
}

/**
 * Create a request status update notification for client
 */
export async function notifyRequestStatusUpdate(
  clientId: number,
  requestId: number,
  status: 'approved' | 'modified' | 'rejected',
  techName: string
) {
  const statusMessages = {
    approved: `${techName} approved your design request!`,
    modified: `${techName} suggested modifications to your design.`,
    rejected: `${techName} couldn't accept your design request.`,
  };
  
  return createNotification({
    userId: clientId,
    type: `request_${status}` as NotificationType,
    title: statusMessages[status],
    relatedId: requestId,
  });
}

/**
 * Create a new review notification for tech
 */
export async function notifyNewReview(
  techUserId: number,
  reviewId: number,
  clientName: string,
  rating: number
) {
  return createNotification({
    userId: techUserId,
    type: 'new_review',
    title: 'New review received',
    message: `${clientName} left you a ${rating}-star review.`,
    relatedId: reviewId,
  });
}

/**
 * Create a low credits notification
 */
export async function notifyLowCredits(userId: number, remainingCredits: number) {
  return createNotification({
    userId,
    type: 'credits_low',
    title: 'Running low on credits',
    message: `You have ${remainingCredits} credit${remainingCredits === 1 ? '' : 's'} remaining. Top up to continue creating designs.`,
  });
}

/**
 * Create a credits added notification
 */
export async function notifyCreditsAdded(userId: number, creditsAdded: number, newBalance: number) {
  return createNotification({
    userId,
    type: 'credits_added',
    title: 'Credits added',
    message: `${creditsAdded} credit${creditsAdded === 1 ? '' : 's'} added to your account. New balance: ${newBalance}.`,
  });
}

/**
 * Create a design breakdown ready notification
 */
export async function notifyDesignBreakdownReady(
  techUserId: number,
  bookingId: number
) {
  return createNotification({
    userId: techUserId,
    type: 'design_breakdown_ready',
    title: 'Design breakdown ready',
    message: 'AI has generated a detailed breakdown for your upcoming appointment.',
    relatedId: bookingId,
  });
}
