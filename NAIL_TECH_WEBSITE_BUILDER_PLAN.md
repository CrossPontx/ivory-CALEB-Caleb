# Nail Tech Website Builder - Implementation Plan

## Overview

Build a website builder for nail technicians using Vercel's v0 Platform API, similar to GlossGenius but integrated into Ivory's existing ecosystem. This will allow nail techs to create professional booking websites that integrate with Ivory's booking system.

**Key Requirements:**
- Available to all users (no subscription requirement)
- 1 credit per website creation/customization
- Subdomain support (yourname.ivoryschoice.com) + custom domain support
- 15% booking fee on all appointments booked through websites

## Architecture

### 1. Database Schema Extensions

Add new tables to support website builder functionality:

```sql
-- Tech websites
CREATE TABLE tech_websites (
  id SERIAL PRIMARY KEY,
  tech_profile_id INTEGER REFERENCES tech_profiles(id) NOT NULL,
  subdomain VARCHAR(100) UNIQUE NOT NULL, -- yourname.ivoryschoice.com
  custom_domain VARCHAR(255), -- optional custom domain
  v0_chat_id VARCHAR(255) NOT NULL, -- v0 chat session ID
  v0_project_id VARCHAR(255), -- v0 project ID for deployments
  demo_url TEXT NOT NULL, -- v0 demo URL
  deployment_url TEXT, -- production deployment URL
  is_published BOOLEAN DEFAULT false,
  ssl_enabled BOOLEAN DEFAULT true,
  theme_settings JSONB, -- colors, fonts, layout preferences
  seo_settings JSONB, -- meta tags, descriptions
  analytics_enabled BOOLEAN DEFAULT false,
  google_analytics_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Website pages/sections
CREATE TABLE website_sections (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES tech_websites(id) NOT NULL,
  section_type VARCHAR(50) NOT NULL, -- 'hero', 'services', 'gallery', 'booking', 'contact'
  content JSONB NOT NULL, -- section-specific content
  is_enabled BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Website customization history
CREATE TABLE website_customizations (
  id SERIAL PRIMARY KEY,
  website_id INTEGER REFERENCES tech_websites(id) NOT NULL,
  v0_message_id VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  changes_applied JSONB, -- what was changed
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Core Features

#### A. Website Builder Interface
- **Drag-and-drop editor** powered by v0 AI generation
- **Template selection** with nail tech-specific designs
- **Real-time preview** using v0's iframe embedding
- **Mobile-responsive** designs automatically generated

#### B. Essential Sections
1. **Hero Section** - Business name, tagline, hero image
2. **Services Menu** - Synced with Ivory's services table
3. **Portfolio Gallery** - Synced with tech's portfolio images
4. **Booking Integration** - Direct integration with Ivory's booking system
5. **Contact Information** - Location, hours, social media
6. **Reviews Display** - Show reviews from Ivory platform
7. **About Section** - Bio, certifications, experience

#### C. Booking Integration
- **Embedded booking widget** that connects to Ivory's booking system
- **Real-time availability** synced with tech's schedule
- **Service pricing** automatically pulled from tech profile
- **Client management** through existing Ivory dashboard

### 3. Technical Implementation

#### A. v0 Platform API Integration

```typescript
// lib/website-builder.ts
import { v0 } from 'v0-sdk';

export class WebsiteBuilder {
  async createTechWebsite(techProfile: TechProfile, preferences: WebsitePreferences, userId: number) {
    // Check Business plan subscription
    const user = await this.validateBusinessPlan(userId);
    
    // Check and deduct 1 credit
    await this.deductCredit(userId, 'website_creation');
    
    const prompt = this.generateWebsitePrompt(techProfile, preferences);
    
    const chat = await v0.chats.create({
      message: prompt,
      files: await this.prepareContextFiles(techProfile)
    });

    return {
      chatId: chat.id,
      demoUrl: chat.demo,
      files: chat.files,
      subdomain: `${preferences.subdomain}.ivoryschoice.com`
    };
  }

  async customizeWebsite(chatId: string, customizationPrompt: string, userId: number) {
    // Check Business plan subscription
    await this.validateBusinessPlan(userId);
    
    // Check and deduct 1 credit
    await this.deductCredit(userId, 'website_customization');
    
    const response = await v0.chats.sendMessage({
      chatId,
      message: customizationPrompt
    });

    return response;
  }

  private async validateBusinessPlan(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0] || user[0].subscriptionTier !== 'business' || user[0].subscriptionStatus !== 'active') {
      throw new Error('Business plan subscription required for website builder');
    }
    
    return user[0];
  }

  private async deductCredit(userId: number, type: string) {
    const user = await this.validateBusinessPlan(userId);
    
    if (user.credits < 1) {
      throw new Error('Insufficient credits. Website operations require 1 credit.');
    }

    // Deduct credit and log transaction
    await db.update(users)
      .set({ credits: user.credits - 1 })
      .where(eq(users.id, userId));

    await db.insert(creditTransactions).values({
      userId,
      amount: -1,
      type,
      description: `Website ${type.replace('_', ' ')} with AI`,
      balanceAfter: user.credits - 1,
    });
  }

  private generateWebsitePrompt(techProfile: TechProfile, preferences: WebsitePreferences): string {
    return `
      Create a professional nail technician website for ${techProfile.businessName || techProfile.user.username}.
      
      Business Details:
      - Name: ${techProfile.businessName || techProfile.user.username}
      - Location: ${techProfile.location}
      - Bio: ${techProfile.bio}
      - Services: ${techProfile.services.map(s => `${s.name} - $${s.price}`).join(', ')}
      
      Design Requirements:
      - Modern, clean design with ${preferences.colorScheme} color scheme
      - Mobile-responsive layout
      - Professional nail salon aesthetic
      - Include booking call-to-action buttons
      - Gallery section for portfolio images
      - Contact information prominently displayed
      
      Sections needed:
      1. Hero section with business name and booking CTA
      2. Services menu with pricing
      3. Portfolio gallery
      4. About section
      5. Contact information
      6. Reviews/testimonials section
      
      Use modern web technologies: React, TypeScript, Tailwind CSS
      Make it conversion-optimized for booking appointments.
    `;
  }
}
```

#### B. Subdomain and Custom Domain Management

```typescript
// lib/subdomain-manager.ts
export class SubdomainManager {
  async createSubdomain(techId: number, subdomain: string): Promise<string> {
    // Validate subdomain availability
    const isAvailable = await this.checkSubdomainAvailability(subdomain);
    if (!isAvailable) {
      throw new Error('Subdomain already taken');
    }

    // Create DNS record for subdomain.ivoryschoice.com
    await this.createDNSRecord(subdomain);
    
    return `${subdomain}.ivoryschoice.com`;
  }

  async setupCustomDomain(websiteId: number, domain: string): Promise<void> {
    // Verify domain ownership
    await this.verifyDomainOwnership(domain);
    
    // Setup SSL certificate
    await this.setupSSL(domain);
    
    // Update website record
    await db.update(techWebsites)
      .set({ customDomain: domain })
      .where(eq(techWebsites.id, websiteId));
  }
}
```

#### C. Booking Widget Integration

```typescript
// components/booking-widget.tsx
export function BookingWidget({ techId, websiteTheme }: BookingWidgetProps) {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => {
    // Load tech's services and availability
    loadTechData(techId);
  }, [techId]);

  return (
    <div className="booking-widget" style={websiteTheme}>
      <h3>Book an Appointment</h3>
      
      <ServiceSelector 
        services={services}
        onServiceSelect={setSelectedService}
      />
      
      <DateTimePicker
        availableSlots={availableSlots}
        onSlotSelect={setSelectedSlot}
      />
      
      <BookingForm
        techId={techId}
        service={selectedService}
        slot={selectedSlot}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
}
```

### 4. User Experience Flow

#### A. Website Creation Flow
1. **Tech Profile Setup** - Ensure tech has complete profile
2. **Template Selection** - Choose from nail tech-specific templates
3. **Content Input** - Business info, services, images
4. **AI Generation** - v0 creates initial website
5. **Customization** - Iterative improvements with AI
6. **Domain Setup** - Choose subdomain or custom domain
7. **Publishing** - Deploy to production

#### B. Website Management Dashboard
```typescript
// app/tech/website/page.tsx
export default function WebsiteManagement() {
  return (
    <div className="website-management">
      <WebsitePreview />
      <CustomizationPanel />
      <AnalyticsDashboard />
      <DomainSettings />
      <SEOSettings />
    </div>
  );
}
```

### 5. API Routes

```typescript
// app/api/websites/route.ts - Create website
// app/api/websites/[id]/route.ts - Update website
// app/api/websites/[id]/customize/route.ts - AI customization
// app/api/websites/[id]/publish/route.ts - Deploy website
// app/api/websites/[id]/analytics/route.ts - Website analytics
// app/api/subdomains/check/route.ts - Check availability
// app/api/domains/verify/route.ts - Custom domain verification
```

### 6. Integration Points

#### A. Existing Ivory Features
- **Tech Profiles** - Auto-populate website content
- **Services** - Sync pricing and descriptions
- **Portfolio** - Display tech's work
- **Booking System** - Embedded booking functionality
- **Reviews** - Show client testimonials
- **Analytics** - Track website performance

#### B. External Integrations
- **v0 Platform API** - Website generation and customization
- **Vercel** - Hosting and deployments
- **Cloudflare** - DNS management for subdomains
- **Google Analytics** - Website analytics (optional)
- **Stripe** - Payment processing for bookings

### 7. Pricing Model

#### A. Website Builder Access
- **Available to All Users** - No subscription requirement
- **Credit-Based** - 1 credit per website creation/customization
- **Domain Options** - Free subdomain (yourname.ivoryschoice.com) or custom domain setup
- **Booking Integration** - Seamless integration with Ivory's booking system

#### B. Revenue Sharing
- **Booking Fees** - 15% platform fee on all bookings
- **Credit System** - Revenue from website generation credits
- **Custom Domains** - Optional premium feature for branding

### 8. Technical Considerations

#### A. Performance
- **CDN** - Global content delivery for fast loading
- **Image Optimization** - Automatic image compression and WebP conversion
- **Caching** - Aggressive caching for static content
- **Mobile Optimization** - Lighthouse score > 90

#### B. SEO Features
- **Meta Tags** - Automatic generation based on business info
- **Schema Markup** - Local business and service markup
- **Sitemap** - Auto-generated XML sitemaps
- **Google My Business** - Integration for local SEO

#### C. Security
- **SSL Certificates** - Automatic HTTPS for all domains
- **DDoS Protection** - Cloudflare protection
- **Input Validation** - Sanitize all user inputs
- **Rate Limiting** - Prevent abuse of AI generation

### 9. Implementation Timeline

#### Phase 1 (Weeks 1-2): Foundation
- [ ] Database schema updates
- [ ] v0 SDK integration
- [ ] Basic website creation flow
- [ ] Subdomain management

#### Phase 2 (Weeks 3-4): Core Features
- [ ] Template system
- [ ] Booking widget integration
- [ ] Content management
- [ ] Preview functionality

#### Phase 3 (Weeks 5-6): Advanced Features
- [ ] Custom domain support
- [ ] Analytics integration
- [ ] SEO optimization
- [ ] Mobile responsiveness

#### Phase 4 (Weeks 7-8): Polish & Launch
- [ ] Performance optimization
- [ ] Security hardening
- [ ] User testing
- [ ] Documentation

### 10. Success Metrics

#### A. Adoption Metrics
- **Website Creation Rate** - % of techs who create websites
- **Time to First Website** - Average time from signup to website creation
- **Customization Usage** - How often techs modify their sites

#### B. Business Metrics
- **Booking Conversion** - Bookings from tech websites vs. Ivory app
- **Revenue per Tech** - Average monthly revenue from website-enabled techs
- **Retention Rate** - Tech subscription retention

#### C. Technical Metrics
- **Website Performance** - Average Lighthouse scores
- **Uptime** - 99.9% availability target
- **Load Times** - < 2 seconds first contentful paint

## Next Steps

1. **Set up v0 Platform API** - Get API keys and test integration
2. **Create database migrations** - Add new tables for website builder
3. **Build MVP website creation flow** - Basic template generation
4. **Implement subdomain system** - ivory.app subdomain management
5. **Integrate booking widget** - Connect to existing booking system

This implementation will position Ivory as a comprehensive platform for nail technicians, combining AI-powered design generation, professional booking management, and business growth tools.