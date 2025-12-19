import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { reviews, techProfiles, bookings } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = parseInt(params.id)
    const { rating, comment } = await request.json()

    // Get session from cookie
    const sessionToken = request.cookies.get('session')?.value
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from session
    const sessionResult = await db.query.sessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.token, sessionToken),
      with: {
        user: true,
      },
    })

    if (!sessionResult || new Date(sessionResult.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const userId = sessionResult.userId

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Get booking details
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify user is the client
    if (booking.clientId !== userId) {
      return NextResponse.json(
        { error: 'You can only review your own bookings' },
        { status: 403 }
      )
    }

    // Verify booking is completed
    if (booking.status !== 'completed') {
      return NextResponse.json(
        { error: 'You can only review completed bookings' },
        { status: 400 }
      )
    }

    // Check if review already exists
    const existingReview = await db.query.reviews.findFirst({
      where: (reviews, { and, eq }) =>
        and(
          eq(reviews.techProfileId, booking.techProfileId),
          eq(reviews.clientId, userId)
        ),
    })

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this booking' },
        { status: 400 }
      )
    }

    // Create review
    const [review] = await db
      .insert(reviews)
      .values({
        techProfileId: booking.techProfileId,
        clientId: userId,
        rating,
        comment: comment || null,
      })
      .returning()

    // Update tech profile rating
    await db.execute(sql`
      UPDATE tech_profiles
      SET 
        rating = (
          SELECT ROUND(AVG(rating)::numeric, 2)
          FROM reviews
          WHERE tech_profile_id = ${booking.techProfileId}
        ),
        total_reviews = (
          SELECT COUNT(*)
          FROM reviews
          WHERE tech_profile_id = ${booking.techProfileId}
        )
      WHERE id = ${booking.techProfileId}
    `)

    return NextResponse.json({
      success: true,
      review,
    })
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
