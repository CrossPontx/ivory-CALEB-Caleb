import { v0 } from 'v0-sdk';
import { db } from '@/db';
import { techProfiles, techWebsites, websiteSections, websiteCustomizations, services, portfolioImages, users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface WebsitePreferences {
  customPrompt?: string;
  websiteImages: string[];
}

export interface TechProfileData {
  id: number;
  businessName?: string;
  location?: string;
  bio?: string;
  phoneNumber?: string;
  website?: string;
  instagramHandle?: string;
  user: {
    username: string;
    email: string;
    avatar?: string;
  };
  services: Array<{
    name: string;
    description?: string;
    price: string;
    duration?: number;
  }>;
  portfolioImages: Array<{
    imageUrl: string;
    caption?: string;
  }>;
}

export class WebsiteBuilder {
  /**
   * Create a new website for a nail tech using v0 AI
   * Requires 1 credit
   */
  async createTechWebsite(
    techProfileData: TechProfileData, 
    preferences: WebsitePreferences,
    subdomain: string,
    userId: number
  ) {
    try {
      // Get user and check credits
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Check credits
      if (user.credits < 1) {
        throw new Error('Insufficient credits. Website creation requires 1 credit.');
      }

      // Check if subdomain is available
      const existingWebsite = await db
        .select()
        .from(techWebsites)
        .where(eq(techWebsites.subdomain, subdomain))
        .limit(1);

      if (existingWebsite.length > 0) {
        throw new Error('Subdomain already taken');
      }

      // Generate the website prompt
      const prompt = this.generateWebsitePrompt(techProfileData, preferences);

      // Create v0 chat - for now, images are referenced in the prompt
      // TODO: Investigate proper way to pass images to v0 SDK
      const chat = await v0.chats.create({
        message: prompt,
      });

      // Type guard to ensure we have the correct response type
      if (!('id' in chat) || !('demo' in chat)) {
        throw new Error('Invalid response from v0 API');
      }

      // Deduct 1 credit
      await db
        .update(users)
        .set({ 
          credits: user.credits - 1,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Log credit transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: -1,
        type: 'website_creation',
        description: 'Website creation with AI',
        balanceAfter: user.credits - 1,
      });

      // Save website to database
      const [website] = await db
        .insert(techWebsites)
        .values({
          techProfileId: techProfileData.id,
          subdomain,
          v0ChatId: chat.id,
          demoUrl: chat.demo || '',
          themeSettings: {
            // Use default modern professional styling
            colorScheme: 'modern',
            style: 'professional',
          },
          seoSettings: {
            title: `${techProfileData.businessName || techProfileData.user.username} - Professional Nail Services`,
            description: techProfileData.bio || `Book professional nail services with ${techProfileData.businessName || techProfileData.user.username}`,
            keywords: ['nail tech', 'nail art', 'manicure', 'pedicure', techProfileData.location].filter(Boolean),
          },
        })
        .returning();

      // Create default sections
      await this.createDefaultSections(website.id, techProfileData, preferences);

      return {
        websiteId: website.id,
        chatId: chat.id,
        demoUrl: chat.demo,
        subdomain: `${subdomain}.ivoryschoice.com`,
        files: 'files' in chat ? chat.files : [],
        creditsRemaining: user.credits - 1,
      };
    } catch (error) {
      console.error('Error creating tech website:', error);
      throw error;
    }
  }

  /**
   * Customize an existing website with AI
   * Requires 1 credit
   */
  async customizeWebsite(websiteId: number, customizationPrompt: string, userId: number) {
    try {
      // Get user and check credits
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Check credits
      if (user.credits < 1) {
        throw new Error('Insufficient credits. Website customization requires 1 credit.');
      }

      // Get website data
      const [website] = await db
        .select()
        .from(techWebsites)
        .where(eq(techWebsites.id, websiteId))
        .limit(1);

      if (!website) {
        throw new Error('Website not found');
      }

      // Send customization message to v0
      const response = await v0.chats.sendMessage({
        chatId: website.v0ChatId,
        message: customizationPrompt,
      });

      // Type guard to ensure we have the correct response type
      if (!('id' in response)) {
        throw new Error('Invalid response from v0 API');
      }

      // Deduct 1 credit
      await db
        .update(users)
        .set({ 
          credits: user.credits - 1,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      // Log credit transaction
      await db.insert(creditTransactions).values({
        userId,
        amount: -1,
        type: 'website_customization',
        description: 'Website customization with AI',
        balanceAfter: user.credits - 1,
      });

      // Log the customization
      await db.insert(websiteCustomizations).values({
        websiteId,
        v0MessageId: response.id || '',
        prompt: customizationPrompt,
        changesApplied: {
          timestamp: new Date().toISOString(),
          prompt: customizationPrompt,
        },
      });

      // Update website demo URL if changed
      const demoUrl = 'demo' in response ? response.demo : null;
      if (demoUrl && demoUrl !== website.demoUrl) {
        await db
          .update(techWebsites)
          .set({ 
            demoUrl: demoUrl,
            updatedAt: new Date(),
          })
          .where(eq(techWebsites.id, websiteId));
      }

      return {
        messageId: response.id,
        demoUrl: demoUrl || website.demoUrl,
        files: 'files' in response ? response.files : [],
        creditsRemaining: user.credits - 1,
      };
    } catch (error) {
      console.error('Error customizing website:', error);
      throw error;
    }
  }

  /**
   * Get website data for management dashboard
   */
  async getWebsiteData(techProfileId: number) {
    try {
      const [website] = await db
        .select()
        .from(techWebsites)
        .where(eq(techWebsites.techProfileId, techProfileId))
        .limit(1);

      if (!website) {
        return null;
      }

      const sections = await db
        .select()
        .from(websiteSections)
        .where(eq(websiteSections.websiteId, website.id));

      const customizations = await db
        .select()
        .from(websiteCustomizations)
        .where(eq(websiteCustomizations.websiteId, website.id))
        .orderBy(websiteCustomizations.createdAt);

      return {
        ...website,
        sections,
        customizations,
        fullUrl: website.customDomain || `${website.subdomain}.ivoryschoice.com`,
      };
    } catch (error) {
      console.error('Error getting website data:', error);
      throw error;
    }
  }

  /**
   * Setup custom domain for a website
   */
  async setupCustomDomain(websiteId: number, domain: string, userId: number) {
    try {
      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Get website and verify ownership
      const [website] = await db
        .select({
          id: techWebsites.id,
          techProfileId: techWebsites.techProfileId,
        })
        .from(techWebsites)
        .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
        .where(
          eq(techWebsites.id, websiteId) && 
          eq(techProfiles.userId, userId)
        )
        .limit(1);

      if (!website) {
        throw new Error('Website not found or access denied');
      }

      // Validate domain format
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
      if (!domainRegex.test(domain)) {
        throw new Error('Invalid domain format');
      }

      // Check if domain is already in use
      const [existingDomain] = await db
        .select()
        .from(techWebsites)
        .where(eq(techWebsites.customDomain, domain))
        .limit(1);

      if (existingDomain && existingDomain.id !== websiteId) {
        throw new Error('Domain already in use');
      }

      // Update website with custom domain
      await db
        .update(techWebsites)
        .set({ 
          customDomain: domain,
          updatedAt: new Date(),
        })
        .where(eq(techWebsites.id, websiteId));

      return {
        success: true,
        domain,
        instructions: {
          type: 'CNAME',
          name: domain,
          value: 'cname.vercel-dns.com',
          ttl: 300,
        },
      };
    } catch (error) {
      console.error('Error setting up custom domain:', error);
      throw error;
    }
  }

  /**
   * Remove custom domain from a website
   */
  async removeCustomDomain(websiteId: number, userId: number) {
    try {
      // Verify website ownership
      const [website] = await db
        .select({
          id: techWebsites.id,
          techProfileId: techWebsites.techProfileId,
        })
        .from(techWebsites)
        .innerJoin(techProfiles, eq(techWebsites.techProfileId, techProfiles.id))
        .where(
          eq(techWebsites.id, websiteId) && 
          eq(techProfiles.userId, userId)
        )
        .limit(1);

      if (!website) {
        throw new Error('Website not found or access denied');
      }

      // Remove custom domain
      await db
        .update(techWebsites)
        .set({ 
          customDomain: null,
          updatedAt: new Date(),
        })
        .where(eq(techWebsites.id, websiteId));

      return { success: true };
    } catch (error) {
      console.error('Error removing custom domain:', error);
      throw error;
    }
  }
  async checkSubdomainAvailability(subdomain: string): Promise<boolean> {
    try {
      const existing = await db
        .select()
        .from(techWebsites)
        .where(eq(techWebsites.subdomain, subdomain))
        .limit(1);

      return existing.length === 0;
    } catch (error) {
      console.error('Error checking subdomain availability:', error);
      return false;
    }
  }

  /**
   * Generate AI prompt for website creation
   */
  private generateWebsitePrompt(
    techProfile: TechProfileData, 
    preferences: WebsitePreferences
  ): string {
    const businessName = techProfile.businessName || techProfile.user.username;
    const servicesText = techProfile.services
      .map(s => `${s.name} - $${s.price}${s.duration ? ` (${s.duration} min)` : ''}`)
      .join(', ');

    return `
Create a professional, mobile-optimized nail technician website for ${businessName}.

Business Details:
- Business Name: ${businessName}
- Location: ${techProfile.location || 'Not specified'}
- Description: ${preferences.customPrompt || techProfile.bio || 'Professional nail technician providing quality services'}
- Phone: ${techProfile.phoneNumber || 'Contact for booking'}
- Instagram: ${techProfile.instagramHandle ? `@${techProfile.instagramHandle}` : 'Not provided'}
- Services: ${servicesText || 'Custom nail services available'}${preferences.websiteImages.length > 0 ? `

REFERENCE IMAGES FOR DESIGN INSPIRATION:
${preferences.websiteImages.map((img, i) => `${i + 1}. ${img}`).join('\n')}

IMPORTANT: Please analyze these reference images and use them as inspiration for the website design, color scheme, and overall aesthetic. Incorporate the style, colors, and visual feel of these images into the website design.` : ''}

Design Requirements:
- Modern, professional styling with clean aesthetics
- MOBILE-FIRST responsive design optimized for mobile devices
- Professional nail salon aesthetic${preferences.websiteImages.length > 0 ? `
- Use the provided reference images to inform the design style, color palette, and visual aesthetic` : ''}
- Include prominent booking call-to-action buttons
- Modern, clean design that builds trust
- Fast loading and touch-friendly interface

Required Sections:
1. Hero Section:
   - Business name and tagline
   - Hero image placeholder for nail art
   - Primary "Book Now" CTA button
   - Location and contact info

2. Services Menu:
   - List all services with pricing
   - Service descriptions
   - Duration information
   - "Book This Service" buttons

3. Portfolio Gallery:
   - Grid layout for nail art images
   - Touch-friendly gallery with swipe gestures
   - Optimized image loading for mobile

4. About Section:
   - Bio and experience
   - Certifications/credentials
   - Professional photo placeholder

5. Contact & Booking:
   - Contact form optimized for mobile
   - Business hours
   - Location map placeholder
   - Social media links
   - Click-to-call phone number

Technical Requirements:
- Use React, TypeScript, and Tailwind CSS
- Mobile-first responsive design (prioritize mobile experience)
- Implement proper semantic HTML for SEO
- Include meta tags for local business
- Fast loading with optimized images
- Touch-friendly buttons and interactions
- Accessibility compliant (WCAG 2.1)
- Optimized for mobile performance

Color Scheme: Use modern, professional nail salon appropriate colors with clean aesthetics

CRITICAL: This website MUST be optimized for mobile devices first. Ensure all elements are touch-friendly, text is readable on small screens, and the layout works perfectly on mobile phones.

Make it conversion-optimized for booking appointments with clear CTAs throughout.
Focus on building trust and showcasing professionalism.
    `.trim();
  }

  /**
   * Create default website sections
   */
  private async createDefaultSections(
    websiteId: number, 
    techProfile: TechProfileData, 
    preferences: WebsitePreferences
  ) {
    const sections = [
      {
        websiteId,
        sectionType: 'hero' as const,
        content: {
          title: techProfile.businessName || techProfile.user.username,
          subtitle: 'Professional Nail Services',
          ctaText: 'Book Appointment',
          backgroundImage: null,
        },
        orderIndex: 1,
      },
      {
        websiteId,
        sectionType: 'services' as const,
        content: {
          title: 'Our Services',
          services: techProfile.services.map(s => ({
            name: s.name,
            description: s.description,
            price: s.price,
            duration: s.duration,
          })),
        },
        orderIndex: 2,
      },
      {
        websiteId,
        sectionType: 'gallery' as const,
        content: {
          title: 'Portfolio',
          images: techProfile.portfolioImages.map(img => ({
            url: img.imageUrl,
            caption: img.caption,
          })),
        },
        orderIndex: 3,
      },
      {
        websiteId,
        sectionType: 'about' as const,
        content: {
          title: 'About',
          bio: techProfile.bio,
          image: techProfile.user.avatar,
        },
        orderIndex: 4,
      },
      {
        websiteId,
        sectionType: 'contact' as const,
        content: {
          title: 'Contact & Book',
          phone: techProfile.phoneNumber,
          location: techProfile.location,
          instagram: techProfile.instagramHandle,
          website: techProfile.website,
        },
        orderIndex: 5,
      },
    ];

    await db.insert(websiteSections).values(sections);
  }
}

export const websiteBuilder = new WebsiteBuilder();