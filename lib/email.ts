import { Resend } from 'resend';
import { env } from './env';

// Initialize Resend lazily to avoid build-time errors
let resend: Resend | null = null;

function getResendClient() {
  if (!resend && env.RESEND_API_KEY) {
    resend = new Resend(env.RESEND_API_KEY);
  }
  return resend;
}

export interface WelcomeEmailProps {
  email: string;
  username: string;
  userType: 'client' | 'tech';
}

export async function sendWelcomeEmail({ email, username, userType }: WelcomeEmailProps) {
  try {
    const client = getResendClient();
    
    if (!client) {
      console.warn('Resend API key not configured, skipping welcome email');
      return { success: false, error: 'Resend API key not configured' };
    }

    const subject = userType === 'tech' 
      ? '🎨 Welcome to Mirro - Start Showcasing Your Nail Art!'
      : '💅 Welcome to Mirro - Your Nail Design Journey Begins!';

    const htmlContent = userType === 'tech'
      ? getTechWelcomeEmail(username)
      : getClientWelcomeEmail(username);

    const { data, error } = await client.emails.send({
      from: env.FROM_EMAIL || 'noreply@mirro2.com',
      to: email,
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    console.log('Welcome email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

function getClientWelcomeEmail(username: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Mirro</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">💅 Welcome to Mirro!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Hi ${username}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to have you join Mirro, where your dream nail designs come to life!
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0;">🎨 Get Started:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin-bottom: 10px;">Capture or upload photos of your hands</li>
              <li style="margin-bottom: 10px;">Design custom nail art with our editor</li>
              <li style="margin-bottom: 10px;">Use AI to generate unique designs</li>
              <li style="margin-bottom: 10px;">Share your designs with nail techs</li>
              <li style="margin-bottom: 10px;">Book appointments with verified professionals</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; margin: 25px 0;">
            Ready to create your first design? Let's get started!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.BASE_URL}/capture" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 16px;">
              Start Designing
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            Need help? Reply to this email or visit our <a href="${env.BASE_URL}" style="color: #667eea;">help center</a>.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            Happy designing! ✨<br>
            The Mirro Team
          </p>
        </div>
      </body>
    </html>
  `;
}

function getTechWelcomeEmail(username: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Mirro</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">🎨 Welcome to Mirro!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Hi ${username}! 👋</h2>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Welcome to Mirro! We're excited to help you grow your nail art business and connect with clients who love your work.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="color: #333; margin-top: 0;">🚀 Build Your Profile:</h3>
            <ul style="padding-left: 20px; margin: 10px 0;">
              <li style="margin-bottom: 10px;">Complete your business profile</li>
              <li style="margin-bottom: 10px;">Upload your portfolio and showcase your best work</li>
              <li style="margin-bottom: 10px;">Set your services and pricing</li>
              <li style="margin-bottom: 10px;">Receive design requests from clients</li>
              <li style="margin-bottom: 10px;">Manage appointments and grow your business</li>
            </ul>
          </div>
          
          <p style="font-size: 16px; margin: 25px 0;">
            Let's set up your profile and start receiving client requests!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${env.BASE_URL}/tech/dashboard" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; font-size: 16px;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            Need help getting started? Reply to this email or visit our <a href="${env.BASE_URL}" style="color: #667eea;">help center</a>.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            Here's to your success! ✨<br>
            The Mirro Team
          </p>
        </div>
      </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(email: string, resetToken: string) {
  try {
    const client = getResendClient();
    
    if (!client) {
      console.warn('Resend API key not configured, skipping password reset email');
      return { success: false, error: 'Resend API key not configured' };
    }

    const resetUrl = `${env.BASE_URL}/reset-password?token=${resetToken}`;
    
    const { data, error } = await client.emails.send({
      from: env.FROM_EMAIL || 'noreply@mirro2.com',
      to: email,
      subject: '🔐 Reset Your Mirro Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #667eea; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Reset Your Password</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <p style="font-size: 16px;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 14px; color: #666;">
                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
              </p>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                The Mirro Team
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error };
  }
}
