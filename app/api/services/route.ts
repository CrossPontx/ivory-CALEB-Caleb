import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { services, techProfiles } from '@/db/schema'
import { eq } from 'drizzle-orm'

// GET - Fetch services for a tech
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const techProfileId = searchParams.get('techProfileId')
    const userId = searchParams.get('userId')

    if (!techProfileId && !userId) {
      return NextResponse.json(
        { error: 'techProfileId or userId is required' },
        { status: 400 }
      )
    }

    let servicesList

    if (techProfileId) {
      servicesList = await db
        .select()
        .from(services)
        .where(eq(services.techProfileId, parseInt(techProfileId)))
    } else if (userId) {
      // Get tech profile first
      const [profile] = await db
        .select()
        .from(techProfiles)
        .where(eq(techProfiles.userId, parseInt(userId)))
        .limit(1)

      if (!profile) {
        return NextResponse.json({ services: [] })
      }

      servicesList = await db
        .select()
        .from(services)
        .where(eq(services.techProfileId, profile.id))
    }

    return NextResponse.json({ services: servicesList })
  } catch (error: any) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// POST - Create or update services for a tech
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, services: servicesList } = body

    if (!userId || !servicesList || !Array.isArray(servicesList)) {
      return NextResponse.json(
        { error: 'userId and services array are required' },
        { status: 400 }
      )
    }

    // Get tech profile
    const [profile] = await db
      .select()
      .from(techProfiles)
      .where(eq(techProfiles.userId, parseInt(userId)))
      .limit(1)

    if (!profile) {
      return NextResponse.json(
        { error: 'Tech profile not found' },
        { status: 404 }
      )
    }

    // Delete existing services
    await db.delete(services).where(eq(services.techProfileId, profile.id))

    // Insert new services
    if (servicesList.length > 0) {
      const newServices = await db
        .insert(services)
        .values(
          servicesList.map((service: any) => ({
            techProfileId: profile.id,
            name: service.name,
            description: service.description || null,
            price: service.price,
            duration: service.duration || null,
          }))
        )
        .returning()

      return NextResponse.json({ services: newServices })
    }

    return NextResponse.json({ services: [] })
  } catch (error: any) {
    console.error('Error saving services:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to save services' },
      { status: 500 }
    )
  }
}

// DELETE - Remove a service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('id')

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 })
    }

    await db.delete(services).where(eq(services.id, parseInt(serviceId)))

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete service' },
      { status: 500 }
    )
  }
}
