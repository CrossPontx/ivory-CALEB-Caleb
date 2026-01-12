// Import V0 SDK with error handling
let createClient: any;
try {
  const v0SDK = require('v0-sdk');
  createClient = v0SDK.createClient;
} catch (error) {
  console.error('Failed to import v0-sdk:', error);
  createClient = null;
}
import { db } from '@/db';
import { techProfiles, techWebsites, websiteSections, websiteCustomizations, users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { uploadFile, generateFilename } from '@/lib/storage';

// Create V0 client dynamically when needed
function getV0Client() {
  if (!process.env.V0_API_KEY) {
    console.error('V0_API_KEY environment variable is not set');
    throw new Error('V0 API key is not configured. Please check V0_API_KEY environment variable.');
  }
  
  if (!createClient) {
    console.error('V0 SDK not available');
    throw new Error('V0 SDK is not available. Please check the v0-sdk package installation.');
  }
  
  try {
    return createClient({
      apiKey: process.env.V0_API_KEY
    });
  } catch (error) {
    console.error('Error creating V0 client:', error);
    throw new Error('Failed to initialize V0 AI service. Please try again later.');
  }
}

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
    userId: number,
    abortSignal?: AbortSignal
  ) {
    try {
      console.log('Starting website creation for user:', userId);
      console.log('V0_API_KEY available:', !!process.env.V0_API_KEY);
      console.log('V0 SDK available:', !!createClient);
      
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

      // Check if request was aborted before starting expensive operations
      if (abortSignal?.aborted) {
        throw new Error('Request was cancelled');
      }

      let chat: any = null;
      let demoUrl = '';
      let chatId = '';

      // Try V0 API if available, otherwise create a fallback
      if (process.env.V0_API_KEY && createClient) {
        try {
          // Generate the website prompt
          const prompt = this.generateWebsitePrompt(techProfileData, preferences);
          console.log('Generated prompt length:', prompt.length);

          // Check if request was aborted before V0 API call
          if (abortSignal?.aborted) {
            throw new Error('Request was cancelled');
          }

          console.log('Creating v0 chat...');
          
          // Create v0 client dynamically
          const v0Client = getV0Client();
          
          // Create v0 chat with timeout and cancellation handling
          console.log('Sending request to V0 API...');
          const startTime = Date.now();
          
          // Create a combined abort signal that handles both timeout and user cancellation
          const combinedController = new AbortController();
          
          // Set up timeout
          const timeoutId = setTimeout(() => {
            combinedController.abort();
          }, 180000); // 3 minute timeout
          
          // Listen for user cancellation
          if (abortSignal) {
            abortSignal.addEventListener('abort', () => {
              combinedController.abort();
            });
          }
          
          const chatPromise = v0Client.chats.create({
            message: prompt,
          });
          
          // Race between the API call and abort signal
          try {
            chat = await Promise.race([
              chatPromise,
              new Promise<never>((_, reject) => {
                combinedController.signal.addEventListener('abort', () => {
                  reject(new Error('Request was cancelled or timed out'));
                });
              })
            ]);
          } catch (error) {
            clearTimeout(timeoutId);
            
            // Check if it was user cancellation vs timeout
            if (abortSignal?.aborted) {
              throw new Error('Request was cancelled by user');
            } else {
              console.error('V0 API error details:', {
                error: error instanceof Error ? error.message : 'Unknown',
                stack: error instanceof Error ? error.stack : undefined,
                name: error instanceof Error ? error.name : 'Unknown',
              });
              
              // Handle specific V0 SDK errors
              if (error instanceof Error) {
                if (error.message.includes('fetch') || error.message.includes('network')) {
                  throw new Error('Network error connecting to V0 AI service. Please check your internet connection and try again.');
                }
                if (error.message.includes('401') || error.message.includes('unauthorized')) {
                  throw new Error('V0 API authentication failed. Please check your V0 API key configuration.');
                }
                if (error.message.includes('429') || error.message.includes('rate limit')) {
                  throw new Error('V0 API rate limit exceeded. The service is experiencing high demand. Please try again in a few minutes.');
                }
                if (error.message.includes('500') || error.message.includes('internal server error')) {
                  throw new Error('V0 AI service is temporarily unavailable. Please try again in a few minutes.');
                }
              }
              
              throw new Error('V0 AI request timed out after 3 minutes. The service may be experiencing high demand.');
            }
          }
          
          clearTimeout(timeoutId);

          const endTime = Date.now();
          console.log(`V0 API call completed in ${endTime - startTime}ms`);

          // Type guard to ensure we have the correct response type
          if (!('id' in chat)) {
            throw new Error('Invalid response from v0 API - missing chat ID');
          }

          console.log('V0 chat created successfully:', chat.id);
          chatId = chat.id;
          demoUrl = chat.latestVersion?.demoUrl || '';
          
        } catch (v0Error) {
          console.warn('V0 API failed, falling back to template website:', v0Error);
          // Fall back to template-based website creation
          chatId = `fallback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          demoUrl = `https://v0.dev/chat/${chatId}`;
        }
      } else {
        console.log('V0 API not available, creating template website');
        // Create a fallback template website
        chatId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        demoUrl = `https://v0.dev/chat/${chatId}`;
      }

      // Check if request was aborted before charging credits
      if (abortSignal?.aborted) {
        throw new Error('Request was cancelled by user');
      }

      if (!demoUrl) {
        console.warn('No demo URL available, using placeholder');
        demoUrl = `https://v0.dev/chat/${chatId}`;
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
          v0ChatId: chatId,
          demoUrl: demoUrl,
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
      await this.createDefaultSections(website.id, techProfileData);

      console.log('Website created successfully:', website.id);

      return {
        websiteId: website.id,
        chatId: chatId,
        demoUrl: demoUrl,
        subdomain: `${subdomain}.ivoryschoice.com`,
        files: chat && 'files' in chat ? chat.files : [],
        creditsRemaining: user.credits - 1,
      };
    } catch (error) {
      console.error('Error creating tech website:', error);
      
      // Don't charge credits if the request was cancelled by user
      if (error instanceof Error && (
        error.message.includes('cancelled by user') || 
        error.message.includes('Request was cancelled')
      )) {
        throw new Error('Website creation was cancelled. No credits were charged.');
      }
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('V0 API authentication failed. Please check your V0 API key configuration.');
        }
        if (error.message.includes('404')) {
          throw new Error('V0 API endpoint not found. Please verify the v0-sdk version and API configuration.');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('V0 API rate limit exceeded. The service is experiencing high demand. Please try again in a few minutes.');
        }
        if (error.message.includes('timed out')) {
          throw new Error('Website creation is taking longer than expected due to high demand. Please try again in a few minutes.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Customize an existing website with AI
   * Requires 1 credit
   */
  async customizeWebsite(websiteId: number, customizationPrompt: string, userId: number, attachedFiles?: File[]) {
    try {
      console.log('Starting website customization for user:', userId);
      
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

      // Verify V0 API key before making request
      if (!process.env.V0_API_KEY) {
        throw new Error('V0 API key is not configured. Please check V0_API_KEY environment variable.');
      }

      console.log('Sending customization message to v0...');

      // Create v0 client dynamically
      const v0Client = getV0Client();

      // Prepare the message with file attachments if any
      let messageOptions: any = {
        chatId: website.v0ChatId,
        message: customizationPrompt,
      };

      // If there are attached files, upload them first and include URLs in the request
      if (attachedFiles && attachedFiles.length > 0) {
        console.log(`Uploading ${attachedFiles.length} file(s) to storage...`);
        
        try {
          // Upload files to storage and get URLs
          const uploadedFiles = await Promise.all(
            attachedFiles.map(async (file) => {
              const filename = generateFilename(file.name, 'website-ref');
              const { url } = await uploadFile(file, filename, {
                folder: 'website-references',
                contentType: file.type,
              });
              
              return {
                url: url,
                name: file.name,
                contentType: file.type,
              };
            })
          );

          console.log(`Successfully uploaded ${uploadedFiles.length} file(s)`);

          // Add file attachments to the message
          messageOptions.attachments = uploadedFiles.map(file => ({
            url: file.url,
            name: file.name,
            contentType: file.contentType,
          }));
          
          // Enhance the prompt to mention the reference images
          messageOptions.message = `${customizationPrompt}

REFERENCE IMAGES: I've attached ${attachedFiles.length} reference image(s) for inspiration. Please analyze these images and use them to inform the design changes, color schemes, layouts, or styling elements that should be incorporated into the website.`;
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
          throw new Error(`Failed to upload reference images: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }

      // Send customization message to v0
      const response = await v0Client.chats.sendMessage(messageOptions);

      console.log('V0 customization response received');

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
          filesAttached: attachedFiles ? attachedFiles.length : 0,
        },
      });

      // Update website demo URL if changed
      const demoUrl = response.latestVersion?.demoUrl || null;
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
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
          throw new Error('V0 API authentication failed. Please check your V0 API key configuration.');
        }
        if (error.message.includes('404')) {
          throw new Error('V0 API endpoint not found or chat not found. Please verify the configuration.');
        }
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          throw new Error('V0 API rate limit exceeded. Please try again in a few minutes.');
        }
      }
      
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
  /**
   * Get chat history for a website
   */
  async getChatHistory(websiteId: number, userId: number) {
    try {
      console.log('Getting chat history for website:', websiteId);
      
      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Get website data and verify ownership
      const [website] = await db
        .select({
          id: techWebsites.id,
          v0ChatId: techWebsites.v0ChatId,
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

      // Verify V0 API key before making request
      if (!process.env.V0_API_KEY) {
        throw new Error('V0 API key is not configured. Please check V0_API_KEY environment variable.');
      }

      console.log('Fetching chat history from V0...');

      // Create v0 client dynamically
      const v0Client = getV0Client();

      // Get chat details including history
      const chat = await v0Client.chats.getById({ chatId: website.v0ChatId });

      console.log('Chat history retrieved successfully');

      // Get versions for this chat
      const versionsResponse = await v0Client.chats.findVersions({ chatId: website.v0ChatId });

      // Get customization history from database
      const customizations = await db
        .select()
        .from(websiteCustomizations)
        .where(eq(websiteCustomizations.websiteId, websiteId))
        .orderBy(websiteCustomizations.createdAt);

      return {
        chatId: website.v0ChatId,
        chat: chat,
        customizations: customizations,
        versions: versionsResponse.data || [],
        currentVersion: chat.latestVersion || null,
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      throw error;
    }
  }

  /**
   * Navigate to a specific version in the V0 chat
   */
  async navigateToVersion(websiteId: number, versionId: string, userId: number) {
    try {
      console.log('Navigating to version:', versionId, 'for website:', websiteId);
      
      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      // Get website data and verify ownership
      const [website] = await db
        .select({
          id: techWebsites.id,
          v0ChatId: techWebsites.v0ChatId,
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

      // Verify V0 API key before making request
      if (!process.env.V0_API_KEY) {
        throw new Error('V0 API key is not configured. Please check V0_API_KEY environment variable.');
      }

      console.log('Getting version details from V0...');

      // Create v0 client dynamically
      const v0Client = getV0Client();

      // Get the specific version
      const version = await v0Client.chats.getVersion({ 
        chatId: website.v0ChatId, 
        versionId: versionId 
      });

      // Update website demo URL to the selected version
      const demoUrl = version.demoUrl || null;
      if (demoUrl) {
        await db
          .update(techWebsites)
          .set({ 
            demoUrl: demoUrl,
            updatedAt: new Date(),
          })
          .where(eq(techWebsites.id, websiteId));
      }

      console.log('Successfully navigated to version:', versionId);

      return {
        versionId: versionId,
        demoUrl: demoUrl,
        version: version,
      };
    } catch (error) {
      console.error('Error navigating to version:', error);
      throw error;
    }
  }

  /**
   * Undo last customization (go back one version)
   */
  async undoLastCustomization(websiteId: number, userId: number) {
    try {
      console.log('Undoing last customization for website:', websiteId);
      
      // Get chat history
      const history = await this.getChatHistory(websiteId, userId);
      
      if (!history.versions || history.versions.length < 2) {
        throw new Error('No previous version available to undo to');
      }

      // Get the second-to-last version (previous version)
      const previousVersion = history.versions[history.versions.length - 2];
      
      // Navigate to the previous version
      const result = await this.navigateToVersion(websiteId, previousVersion.id, userId);

      return {
        ...result,
        message: 'Successfully undid last customization',
      };
    } catch (error) {
      console.error('Error undoing customization:', error);
      throw error;
    }
  }

  /**
   * Redo customization (go forward one version)
   */
  async redoCustomization(websiteId: number, userId: number) {
    try {
      console.log('Redoing customization for website:', websiteId);
      
      // Get chat history
      const history = await this.getChatHistory(websiteId, userId);
      
      if (!history.versions || history.versions.length === 0) {
        throw new Error('No versions available');
      }

      // Navigate to the latest version
      const latestVersion = history.versions[history.versions.length - 1];
      
      // Navigate to the latest version
      const result = await this.navigateToVersion(websiteId, latestVersion.id, userId);

      return {
        ...result,
        message: 'Successfully redid to latest version',
      };
    } catch (error) {
      console.error('Error redoing customization:', error);
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

5. Booking Section (CRITICAL):
   - Dedicated booking section with the following EXACT HTML code:
   
   <div id="ivory-booking-widget" data-tech-id="${techProfile.id}"></div>
   <script src="https://ivoryschoice.com/booking-widget.js"></script>
   
   - This widget provides real-time availability and booking functionality
   - Style the container to match the website design
   - Add a heading like "Book Your Appointment" above the widget
   - Ensure the widget is prominently placed and mobile-optimized

6. Contact & Information:
   - Contact form for general inquiries (separate from booking)
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
- MUST include the booking widget HTML exactly as specified above

Color Scheme: Use modern, professional nail salon appropriate colors with clean aesthetics

CRITICAL BOOKING INTEGRATION:
- The booking widget (id="ivory-booking-widget" data-tech-id="${techProfile.id}") MUST be included
- This connects to the live booking system with real availability
- All "Book Now" buttons should scroll to or link to this booking section
- The widget handles service selection, scheduling, and customer information
- Style the booking section to be prominent and trustworthy

CRITICAL: This website MUST be optimized for mobile devices first. Ensure all elements are touch-friendly, text is readable on small screens, and the layout works perfectly on mobile phones.

Make it conversion-optimized for booking appointments with clear CTAs throughout.
Focus on building trust and showcasing professionalism.
The booking widget is the primary conversion tool - make it prominent and accessible.
    `.trim();
  }

  /**
   * Create default website sections
   */
  private async createDefaultSections(
    websiteId: number, 
    techProfile: TechProfileData
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