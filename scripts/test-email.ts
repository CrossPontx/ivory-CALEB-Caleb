/**
 * Test script to verify email service is working
 * Run with: npx tsx scripts/test-email.ts
 */

import { sendWelcomeEmail } from '../lib/email';

async function testEmail() {
  console.log('🧪 Testing email service...\n');

  // Test client welcome email
  console.log('📧 Sending test client welcome email...');
  const clientResult = await sendWelcomeEmail({
    email: 'test@example.com', // Replace with your test email
    username: 'TestClient',
    userType: 'client',
  });

  if (clientResult.success) {
    console.log('✅ Client welcome email sent successfully!');
    console.log('   Data:', clientResult.data);
  } else {
    console.error('❌ Failed to send client welcome email');
    console.error('   Error:', clientResult.error);
  }

  console.log('\n---\n');

  // Test tech welcome email
  console.log('📧 Sending test tech welcome email...');
  const techResult = await sendWelcomeEmail({
    email: 'test@example.com', // Replace with your test email
    username: 'TestTech',
    userType: 'tech',
  });

  if (techResult.success) {
    console.log('✅ Tech welcome email sent successfully!');
    console.log('   Data:', techResult.data);
  } else {
    console.error('❌ Failed to send tech welcome email');
    console.error('   Error:', techResult.error);
  }

  console.log('\n✨ Email test complete!\n');
}

testEmail().catch(console.error);
