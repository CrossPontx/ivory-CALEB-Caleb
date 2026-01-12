import { db } from '@/db';
import { techProfiles, techWebsites, websiteSections, users, creditTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

export interface WebsitePreferences {
  customPrompt?: string;
  websiteImages: string[];
}

export class TemplateWebsiteGenerator {
  /**
   * Create a template-based website without external dependencies
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
      console.log('Starting template website creation for user:', userId);
      
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

      // Check if request was aborted
      if (abortSignal?.aborted) {
        throw new Error('Request was cancelled');
      }

      // Generate template website HTML
      const websiteHtml = this.generateWebsiteTemplate(techProfileData, preferences);
      
      // Create a unique template ID
      const templateId = `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // For now, we'll use a placeholder demo URL - in production this would be deployed
      const demoUrl = `https://${subdomain}.ivoryschoice.com`;

      // Check if request was aborted before charging credits
      if (abortSignal?.aborted) {
        throw new Error('Request was cancelled by user');
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
        description: 'Template website creation',
        balanceAfter: user.credits - 1,
      });

      // Save website to database
      const [website] = await db
        .insert(techWebsites)
        .values({
          techProfileId: techProfileData.id,
          subdomain,
          v0ChatId: templateId,
          demoUrl: demoUrl,
          themeSettings: {
            colorScheme: 'modern',
            style: 'professional',
            template: 'nail-tech-v1',
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

      console.log('Template website created successfully:', website.id);

      return {
        websiteId: website.id,
        chatId: templateId,
        demoUrl: demoUrl,
        subdomain: `${subdomain}.ivoryschoice.com`,
        files: [],
        creditsRemaining: user.credits - 1,
        isTemplate: true,
        html: websiteHtml, // Include the generated HTML
      };
    } catch (error) {
      console.error('Error creating template website:', error);
      
      // Don't charge credits if the request was cancelled by user
      if (error instanceof Error && (
        error.message.includes('cancelled by user') || 
        error.message.includes('Request was cancelled')
      )) {
        throw new Error('Website creation was cancelled. No credits were charged.');
      }
      
      throw error;
    }
  }

  /**
   * Generate a complete HTML template for the nail tech website
   */
  private generateWebsiteTemplate(
    techProfile: TechProfileData, 
    preferences: WebsitePreferences
  ): string {
    const businessName = techProfile.businessName || techProfile.user.username || 'Professional Nail Tech';
    const location = techProfile.location || '';
    const bio = preferences.customPrompt || techProfile.bio || 'Professional nail technician providing quality services';
    const phone = techProfile.phoneNumber || '';
    const instagram = techProfile.instagramHandle || '';
    
    const services = techProfile.services || [];
    const portfolioImages = techProfile.portfolioImages || [];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - Professional Nail Services</title>
    <meta name="description" content="${bio}">
    <meta name="keywords" content="nail tech, nail art, manicure, pedicure, ${location}">
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Custom Styles -->
    <style>
        .gradient-bg { background: linear-gradient(135deg, #f8f7f5 0%, #ffffff 100%); }
        .accent-color { color: #8B7355; }
        .accent-bg { background-color: #8B7355; }
        .hover-accent:hover { background-color: #6B5B47; }
        .border-accent { border-color: #8B7355; }
        
        .fade-in { animation: fadeIn 0.6s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .hero-pattern {
            background-image: radial-gradient(circle at 1px 1px, rgba(139,115,85,0.1) 1px, transparent 0);
            background-size: 20px 20px;
        }
    </style>
</head>
<body class="bg-white text-gray-900 font-light">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="font-serif text-xl accent-color">${businessName}</div>
                <div class="hidden md:flex space-x-8">
                    <a href="#home" class="text-gray-600 hover:text-gray-900 transition-colors">Home</a>
                    <a href="#services" class="text-gray-600 hover:text-gray-900 transition-colors">Services</a>
                    <a href="#portfolio" class="text-gray-600 hover:text-gray-900 transition-colors">Portfolio</a>
                    <a href="#about" class="text-gray-600 hover:text-gray-900 transition-colors">About</a>
                    <a href="#booking" class="accent-bg text-white px-4 py-2 rounded-lg hover-accent transition-colors">Book Now</a>
                </div>
                <button class="md:hidden accent-color">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="pt-16 gradient-bg hero-pattern min-h-screen flex items-center">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div class="text-center fade-in">
                <h1 class="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight">
                    ${businessName}
                </h1>
                <p class="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                    ${bio}
                </p>
                ${location ? `<p class="text-lg text-gray-500 mb-8 accent-color font-medium">${location}</p>` : ''}
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="#booking" class="accent-bg text-white px-8 py-4 rounded-lg text-lg hover-accent transition-all duration-300 shadow-lg hover:shadow-xl">
                        Book Appointment
                    </a>
                    <a href="#portfolio" class="border-2 border-accent text-gray-900 px-8 py-4 rounded-lg text-lg hover:bg-gray-50 transition-all duration-300">
                        View Portfolio
                    </a>
                </div>
            </div>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="py-20 bg-white">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-4">Our Services</h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">Professional nail care services tailored to your style and preferences</p>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                ${services.map(service => `
                <div class="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-all duration-300 fade-in">
                    <h3 class="font-serif text-xl font-medium text-gray-900 mb-3">${service.name}</h3>
                    ${service.description ? `<p class="text-gray-600 mb-4">${service.description}</p>` : ''}
                    <div class="flex justify-between items-center">
                        <span class="text-2xl font-light accent-color">${service.price}</span>
                        ${service.duration ? `<span class="text-sm text-gray-500">${service.duration} min</span>` : ''}
                    </div>
                    <a href="#booking" class="mt-4 block text-center accent-bg text-white py-2 rounded-lg hover-accent transition-colors">
                        Book This Service
                    </a>
                </div>
                `).join('')}
                
                ${services.length === 0 ? `
                <div class="col-span-full text-center py-12">
                    <p class="text-gray-500 text-lg">Services will be displayed here once configured</p>
                    <p class="text-gray-400 mt-2">Contact us for custom nail art and services</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>

    <!-- Portfolio Section -->
    <section id="portfolio" class="py-20 gradient-bg">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-4">Portfolio</h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">Explore our latest nail art creations and designs</p>
            </div>
            
            ${portfolioImages.length > 0 ? `
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                ${portfolioImages.map(image => `
                <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 fade-in">
                    <img src="${image.imageUrl}" alt="${image.caption || 'Nail art'}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
                </div>
                `).join('')}
            </div>
            ` : `
            <div class="text-center py-12">
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    ${Array.from({length: 8}, (_, i) => `
                    <div class="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                    </div>
                    `).join('')}
                </div>
                <p class="text-gray-500 text-lg">Portfolio images will be displayed here</p>
                <p class="text-gray-400 mt-2">Upload your nail art photos to showcase your work</p>
            </div>
            `}
        </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-16">
                <h2 class="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-8">About ${businessName}</h2>
                <div class="prose prose-lg mx-auto text-gray-600 leading-relaxed">
                    <p>${bio}</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Booking Section -->
    <section id="booking" class="py-20 gradient-bg">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-4">Book Your Appointment</h2>
                <p class="text-lg text-gray-600">Schedule your nail appointment online</p>
            </div>
            
            <!-- Booking Widget Integration -->
            <div class="bg-white rounded-lg shadow-lg p-8">
                <div id="ivory-booking-widget" data-tech-id="${techProfile.id}"></div>
                <script src="https://ivoryschoice.com/booking-widget.js"></script>
                
                <!-- Fallback contact info if widget doesn't load -->
                <div class="text-center mt-8 pt-8 border-t border-gray-200">
                    <p class="text-gray-600 mb-4">Or contact us directly:</p>
                    ${phone ? `
                    <a href="tel:${phone}" class="inline-flex items-center accent-bg text-white px-6 py-3 rounded-lg hover-accent transition-colors mr-4 mb-4">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                        </svg>
                        Call ${phone}
                    </a>
                    ` : ''}
                    ${instagram ? `
                    <a href="https://instagram.com/${instagram}" target="_blank" class="inline-flex items-center border-2 border-accent text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors mb-4">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551c-.684-.94-.684-2.126 0-3.066c.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.126 0 3.066c-.684.94-1.835 1.551-3.132 1.551z"/>
                        </svg>
                        @${instagram}
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section class="py-20 bg-white">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h2 class="font-serif text-3xl sm:text-4xl font-light text-gray-900 mb-4">Get In Touch</h2>
                <p class="text-lg text-gray-600">Have questions? We'd love to hear from you</p>
            </div>
            
            <div class="grid md:grid-cols-2 gap-12">
                <!-- Contact Info -->
                <div>
                    <h3 class="font-serif text-xl font-medium text-gray-900 mb-6">Contact Information</h3>
                    <div class="space-y-4">
                        ${location ? `
                        <div class="flex items-center">
                            <svg class="w-5 h-5 accent-color mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span class="text-gray-600">${location}</span>
                        </div>
                        ` : ''}
                        ${phone ? `
                        <div class="flex items-center">
                            <svg class="w-5 h-5 accent-color mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                            </svg>
                            <a href="tel:${phone}" class="text-gray-600 hover:accent-color transition-colors">${phone}</a>
                        </div>
                        ` : ''}
                        ${instagram ? `
                        <div class="flex items-center">
                            <svg class="w-5 h-5 accent-color mr-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001z"/>
                            </svg>
                            <a href="https://instagram.com/${instagram}" target="_blank" class="text-gray-600 hover:accent-color transition-colors">@${instagram}</a>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Contact Form -->
                <div>
                    <h3 class="font-serif text-xl font-medium text-gray-900 mb-6">Send a Message</h3>
                    <form class="space-y-4">
                        <div>
                            <input type="text" placeholder="Your Name" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors">
                        </div>
                        <div>
                            <input type="email" placeholder="Your Email" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors">
                        </div>
                        <div>
                            <textarea rows="4" placeholder="Your Message" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-colors resize-none"></textarea>
                        </div>
                        <button type="submit" class="w-full accent-bg text-white py-3 rounded-lg hover-accent transition-colors">
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-12">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h3 class="font-serif text-2xl font-light mb-4">${businessName}</h3>
                <p class="text-gray-400 mb-6">Professional nail services with a personal touch</p>
                <div class="flex justify-center space-x-6">
                    ${phone ? `<a href="tel:${phone}" class="text-gray-400 hover:text-white transition-colors">Phone</a>` : ''}
                    ${instagram ? `<a href="https://instagram.com/${instagram}" target="_blank" class="text-gray-400 hover:text-white transition-colors">Instagram</a>` : ''}
                </div>
                <div class="mt-8 pt-8 border-t border-gray-800 text-gray-500 text-sm">
                    <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
                    <p class="mt-2">Website powered by <a href="https://ivoryschoice.com" class="hover:text-white transition-colors">Ivory's Choice</a></p>
                </div>
            </div>
        </div>
    </footer>

    <!-- Smooth Scrolling Script -->
    <script>
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile menu toggle
        const mobileMenuButton = document.querySelector('button.md\\:hidden');
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', function() {
                // Add mobile menu functionality here
                console.log('Mobile menu clicked');
            });
        }

        // Contact form handling
        const contactForm = document.querySelector('form');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
            });
        }

        // Fade in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        document.querySelectorAll('section > div').forEach(el => {
            observer.observe(el);
        });
    </script>
</body>
</html>`;
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

      return {
        ...website,
        sections,
        customizations: [], // Template websites don't have customizations yet
        fullUrl: website.customDomain || `${website.subdomain}.ivoryschoice.com`,
      };
    } catch (error) {
      console.error('Error getting website data:', error);
      throw error;
    }
  }
}

export const templateWebsiteGenerator = new TemplateWebsiteGenerator();