import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/db';
import { users, looks, portfolioImages, creditTransactions, referrals, bookings, techProfiles, sessions } from '@/db/schema';
import { eq } from 'drizzle-orm';

function generatePDFHTML(data: any, username: string) {
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ivory Data Export - ${username}</title>
  <style>
    @media print {
      @page { margin: 1in; }
      body { margin: 0; }
    }
    body {
      font-family: 'Georgia', serif;
      line-height: 1.6;
      color: #1A1A1A;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
    }
    h1 {
      font-size: 32px;
      font-weight: 300;
      margin-bottom: 10px;
      color: #1A1A1A;
      border-bottom: 2px solid #8B7355;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 24px;
      font-weight: 300;
      margin-top: 40px;
      margin-bottom: 20px;
      color: #1A1A1A;
      border-bottom: 1px solid #E8E8E8;
      padding-bottom: 8px;
    }
    h3 {
      font-size: 18px;
      font-weight: 400;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #1A1A1A;
    }
    .export-date {
      color: #6B6B6B;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 12px;
      margin-bottom: 20px;
    }
    .info-label {
      font-weight: 400;
      color: #6B6B6B;
      font-size: 14px;
    }
    .info-value {
      color: #1A1A1A;
      font-size: 14px;
    }
    .item {
      border: 1px solid #E8E8E8;
      padding: 16px;
      margin-bottom: 12px;
      background: #F8F7F5;
    }
    .item-title {
      font-weight: 400;
      margin-bottom: 8px;
      color: #1A1A1A;
    }
    .item-detail {
      font-size: 13px;
      color: #6B6B6B;
      margin: 4px 0;
    }
    .no-data {
      color: #6B6B6B;
      font-style: italic;
      font-size: 14px;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #1A1A1A;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 300;
    }
    .print-button:hover {
      background: #333;
    }
    @media print {
      .print-button { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-button" onclick="window.print()">Save as PDF</button>
  
  <h1>Ivory Data Export</h1>
  <div class="export-date">Export Date: ${formatDate(data.exportDate)}</div>

  <h2>Account Information</h2>
  <div class="info-grid">
    <div class="info-label">Username:</div>
    <div class="info-value">${data.user.username || 'N/A'}</div>
    
    <div class="info-label">Email:</div>
    <div class="info-value">${data.user.email}</div>
    
    <div class="info-label">Account Type:</div>
    <div class="info-value">${data.user.userType === 'tech' ? 'Nail Technician' : 'Client'}</div>
    
    <div class="info-label">Credits:</div>
    <div class="info-value">${data.user.credits}</div>
    
    <div class="info-label">Subscription:</div>
    <div class="info-value">${data.user.subscriptionTier} (${data.user.subscriptionStatus})</div>
    
    <div class="info-label">Referral Code:</div>
    <div class="info-value">${data.user.referralCode || 'N/A'}</div>
    
    <div class="info-label">Member Since:</div>
    <div class="info-value">${formatDate(data.user.createdAt)}</div>
  </div>

  ${data.techProfile ? `
  <h2>Professional Profile</h2>
  <div class="info-grid">
    <div class="info-label">Business Name:</div>
    <div class="info-value">${data.techProfile.businessName || 'N/A'}</div>
    
    <div class="info-label">Location:</div>
    <div class="info-value">${data.techProfile.location || 'N/A'}</div>
    
    <div class="info-label">Rating:</div>
    <div class="info-value">${data.techProfile.rating || '0'} (${data.techProfile.totalReviews || 0} reviews)</div>
    
    <div class="info-label">Phone:</div>
    <div class="info-value">${data.techProfile.phoneNumber || 'N/A'}</div>
    
    <div class="info-label">Website:</div>
    <div class="info-value">${data.techProfile.website || 'N/A'}</div>
    
    <div class="info-label">Instagram:</div>
    <div class="info-value">${data.techProfile.instagramHandle || 'N/A'}</div>
    
    <div class="info-label">Verified:</div>
    <div class="info-value">${data.techProfile.isVerified ? 'Yes' : 'No'}</div>
  </div>
  ${data.techProfile.bio ? `<p><strong>Bio:</strong> ${data.techProfile.bio}</p>` : ''}
  ` : ''}

  <h2>Nail Designs (${data.looks.length})</h2>
  ${data.looks.length > 0 ? data.looks.map((look: any) => `
    <div class="item">
      <div class="item-title">${look.title}</div>
      <div class="item-detail">Created: ${formatDate(look.createdAt)}</div>
      <div class="item-detail">Visibility: ${look.isPublic ? 'Public' : 'Private'}</div>
      <div class="item-detail">Views: ${look.viewCount || 0}</div>
      ${look.aiPrompt ? `<div class="item-detail">AI Prompt: ${look.aiPrompt}</div>` : ''}
    </div>
  `).join('') : '<p class="no-data">No designs created yet</p>'}

  ${data.portfolio.length > 0 ? `
  <h2>Portfolio Images (${data.portfolio.length})</h2>
  ${data.portfolio.map((img: any) => `
    <div class="item">
      <div class="item-detail">Uploaded: ${formatDate(img.createdAt)}</div>
      ${img.caption ? `<div class="item-detail">Caption: ${img.caption}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  <h2>Credit Transactions (${data.creditTransactions.length})</h2>
  ${data.creditTransactions.length > 0 ? data.creditTransactions.map((tx: any) => `
    <div class="item">
      <div class="item-title">${tx.description}</div>
      <div class="item-detail">Amount: ${tx.amount > 0 ? '+' : ''}${tx.amount} credits</div>
      <div class="item-detail">Balance After: ${tx.balanceAfter} credits</div>
      <div class="item-detail">Date: ${formatDate(tx.createdAt)}</div>
    </div>
  `).join('') : '<p class="no-data">No transactions yet</p>'}

  <h2>Referrals (${data.referrals.length})</h2>
  ${data.referrals.length > 0 ? data.referrals.map((ref: any) => `
    <div class="item">
      <div class="item-detail">Referred User ID: ${ref.referredUserId}</div>
      <div class="item-detail">Credit Awarded: ${ref.creditAwarded ? 'Yes' : 'No'}</div>
      <div class="item-detail">Date: ${formatDate(ref.createdAt)}</div>
    </div>
  `).join('') : '<p class="no-data">No referrals yet</p>'}

  ${data.bookings.asClient.length > 0 ? `
  <h2>Bookings as Client (${data.bookings.asClient.length})</h2>
  ${data.bookings.asClient.map((booking: any) => `
    <div class="item">
      <div class="item-title">Booking #${booking.id}</div>
      <div class="item-detail">Appointment: ${formatDate(booking.appointmentDate)}</div>
      <div class="item-detail">Duration: ${booking.duration} minutes</div>
      <div class="item-detail">Status: ${booking.status}</div>
      <div class="item-detail">Total: $${booking.totalPrice}</div>
      <div class="item-detail">Payment: ${booking.paymentStatus}</div>
      ${booking.clientNotes ? `<div class="item-detail">Notes: ${booking.clientNotes}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  ${data.bookings.asTech.length > 0 ? `
  <h2>Bookings as Technician (${data.bookings.asTech.length})</h2>
  ${data.bookings.asTech.map((booking: any) => `
    <div class="item">
      <div class="item-title">Booking #${booking.id}</div>
      <div class="item-detail">Appointment: ${formatDate(booking.appointmentDate)}</div>
      <div class="item-detail">Duration: ${booking.duration} minutes</div>
      <div class="item-detail">Status: ${booking.status}</div>
      <div class="item-detail">Total: $${booking.totalPrice}</div>
      <div class="item-detail">Payment: ${booking.paymentStatus}</div>
      ${booking.techNotes ? `<div class="item-detail">Notes: ${booking.techNotes}</div>` : ''}
    </div>
  `).join('')}
  ` : ''}

  <script>
    // Auto-trigger print dialog after page loads
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;
}

export async function GET() {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get user from session
    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, sessionToken))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const userId = session.userId;

    // Fetch all user data
    const [userData] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch tech profile if user is a tech
    let techProfile = null;
    if (userData.userType === 'tech') {
      const [profile] = await db.select().from(techProfiles).where(eq(techProfiles.userId, userId));
      techProfile = profile;
    }

    // Fetch related data
    const userLooks = await db.select().from(looks).where(eq(looks.userId, userId));
    const userPortfolio = techProfile 
      ? await db.select().from(portfolioImages).where(eq(portfolioImages.techProfileId, techProfile.id))
      : [];
    const userTransactions = await db.select().from(creditTransactions).where(eq(creditTransactions.userId, userId));
    const userReferrals = await db.select().from(referrals).where(eq(referrals.referrerId, userId));
    
    // Fetch bookings (may not exist if migration hasn't been run)
    let userBookingsAsClient: any[] = [];
    let userBookingsAsTech: any[] = [];
    try {
      userBookingsAsClient = await db.select().from(bookings).where(eq(bookings.clientId, userId));
      userBookingsAsTech = techProfile
        ? await db.select().from(bookings).where(eq(bookings.techProfileId, techProfile.id))
        : [];
    } catch (error) {
      // Bookings table doesn't exist yet - skip it
      console.log('Bookings table not found, skipping bookings data');
    }

    // Compile all data
    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        userType: userData.userType,
        credits: userData.credits,
        subscriptionTier: userData.subscriptionTier,
        subscriptionStatus: userData.subscriptionStatus,
        referralCode: userData.referralCode,
        createdAt: userData.createdAt,
      },
      techProfile: techProfile ? {
        businessName: techProfile.businessName,
        location: techProfile.location,
        bio: techProfile.bio,
        rating: techProfile.rating,
        totalReviews: techProfile.totalReviews,
        phoneNumber: techProfile.phoneNumber,
        website: techProfile.website,
        instagramHandle: techProfile.instagramHandle,
        isVerified: techProfile.isVerified,
      } : null,
      looks: userLooks.map(look => ({
        id: look.id,
        title: look.title,
        imageUrl: look.imageUrl,
        originalImageUrl: look.originalImageUrl,
        aiPrompt: look.aiPrompt,
        isPublic: look.isPublic,
        viewCount: look.viewCount,
        createdAt: look.createdAt,
      })),
      portfolio: userPortfolio.map(img => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.caption,
        createdAt: img.createdAt,
      })),
      creditTransactions: userTransactions.map(tx => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        balanceAfter: tx.balanceAfter,
        createdAt: tx.createdAt,
      })),
      referrals: userReferrals.map(ref => ({
        id: ref.id,
        referredUserId: ref.referredUserId,
        creditAwarded: ref.creditAwarded,
        createdAt: ref.createdAt,
      })),
      bookings: {
        asClient: userBookingsAsClient.map(booking => ({
          id: booking.id,
          techProfileId: booking.techProfileId,
          serviceId: booking.serviceId,
          lookId: booking.lookId,
          appointmentDate: booking.appointmentDate,
          duration: booking.duration,
          status: booking.status,
          servicePrice: booking.servicePrice,
          serviceFee: booking.serviceFee,
          totalPrice: booking.totalPrice,
          paymentStatus: booking.paymentStatus,
          clientNotes: booking.clientNotes,
          createdAt: booking.createdAt,
        })),
        asTech: userBookingsAsTech.map(booking => ({
          id: booking.id,
          clientId: booking.clientId,
          serviceId: booking.serviceId,
          lookId: booking.lookId,
          appointmentDate: booking.appointmentDate,
          duration: booking.duration,
          status: booking.status,
          servicePrice: booking.servicePrice,
          serviceFee: booking.serviceFee,
          totalPrice: booking.totalPrice,
          paymentStatus: booking.paymentStatus,
          techNotes: booking.techNotes,
          createdAt: booking.createdAt,
        })),
      },
    };

    // Generate HTML for PDF
    const html = generatePDFHTML(exportData, userData.username);
    
    // Return HTML that can be printed as PDF
    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
