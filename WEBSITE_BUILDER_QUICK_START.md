# Website Builder Quick Start Guide

## Overview

The Ivory Website Builder allows nail technicians to create professional websites in minutes using AI-powered design generation. This guide will help you get started quickly.

## Prerequisites

1. **Complete Tech Profile** - Ensure your tech profile is set up with:
   - Business name and bio
   - Services with pricing
   - Portfolio images
   - Contact information

2. **v0 API Key** - Add your v0 API key to environment variables:
   ```env
   V0_API_KEY=your-v0-api-key
   ```

## Quick Setup

### 1. Install Dependencies
```bash
yarn add v0-sdk
```

### 2. Run Database Migration
```bash
yarn db:push
```

### 3. Access Website Builder
- Navigate to `/tech/website` as a nail tech user
- Or click "Build Website" from the tech dashboard

## Features

### ✨ AI-Powered Generation
- Describe your vision in natural language
- AI creates a complete website tailored to your business
- Automatic integration with your Ivory profile data

### 🎨 Easy Customization
- Make changes by describing what you want
- "Change the hero background to soft pink"
- "Add a testimonials section"
- "Make the booking button more prominent"

### 📱 Mobile-First Design
- Automatically responsive
- Optimized for mobile booking
- Fast loading times

### 🔗 Integrated Booking
- Direct connection to Ivory booking system
- Real-time availability sync
- Automatic service pricing

## User Flow

### 1. Choose Domain
- Pick a unique subdomain: `yourname.ivory.app`
- Custom domains available with Pro plan

### 2. Select Design Style
- **Color Scheme**: Modern, Elegant, Bold, Minimal
- **Style**: Professional, Creative, Luxury, Friendly

### 3. Choose Sections
- **Hero** - Main banner with CTA (required)
- **Services** - Menu with pricing (required)
- **Gallery** - Portfolio showcase
- **About** - Your story and experience
- **Contact** - Booking form and info (required)
- **Reviews** - Customer testimonials

### 4. AI Generation
- AI creates your website in ~30 seconds
- Preview immediately in iframe
- Make customizations with natural language

### 5. Publish
- Toggle to make website live
- Share your professional URL
- Start receiving bookings

## Example Prompts

### Initial Creation
```
Create a professional nail technician website for [Business Name].
Style: Elegant with modern color scheme
Include: Hero section, services menu, portfolio gallery, about section, contact form
Focus on booking conversions and trust-building
```

### Customizations
```
"Change the hero section background to a soft gradient"
"Add a testimonials section with 5-star reviews"
"Make the booking button larger and more prominent"
"Update the color scheme to use more pink tones"
"Add a section about nail care tips"
```

## Technical Details

### Database Tables
- `tech_websites` - Website configuration
- `website_sections` - Page sections and content
- `website_customizations` - Change history

### API Endpoints
- `POST /api/websites` - Create website
- `POST /api/websites/[id]/customize` - AI customization
- `GET /api/subdomains/check` - Check availability

### Components
- `WebsiteBuilderWizard` - Creation flow
- `WebsiteManagementDashboard` - Management interface

## Best Practices

### Content Preparation
1. **High-Quality Images** - Use professional portfolio photos
2. **Clear Service Descriptions** - Be specific about what you offer
3. **Competitive Pricing** - Research local market rates
4. **Professional Bio** - Highlight experience and certifications

### SEO Optimization
1. **Local Keywords** - Include your city/area
2. **Service Keywords** - "nail art", "manicure", "pedicure"
3. **Business Info** - Complete NAP (Name, Address, Phone)
4. **Reviews** - Encourage client testimonials

### Booking Optimization
1. **Clear CTAs** - Multiple "Book Now" buttons
2. **Service Details** - Include duration and pricing
3. **Availability** - Keep calendar updated
4. **Contact Options** - Phone, text, online booking

## Troubleshooting

### Common Issues

**Subdomain Taken**
- Try variations: `yourname-nails`, `yourname-beauty`
- Use your business name or location

**AI Generation Slow**
- v0 API can take 30-60 seconds
- Show loading state to users
- Retry on timeout

**Missing Profile Data**
- Ensure tech profile is complete
- Add services and portfolio images
- Update contact information

**Customization Not Working**
- Be specific in prompts
- Use design terminology
- Reference existing sections

### Error Messages

**"Tech profile not found"**
- User must be logged in as tech
- Complete profile setup first

**"Subdomain already taken"**
- Choose different subdomain
- Check availability first

**"Failed to create website"**
- Check v0 API key
- Verify network connection
- Try again in a few minutes

## Next Steps

1. **Test the Flow** - Create a test website
2. **Customize Prompts** - Adjust AI generation prompts
3. **Add Analytics** - Implement website tracking
4. **Custom Domains** - Set up domain management
5. **SEO Features** - Add meta tags and sitemaps

## Support

- Check the v0 documentation: https://v0.dev/docs
- Review the implementation plan: `NAIL_TECH_WEBSITE_BUILDER_PLAN.md`
- Test with the wizard: `/tech/website`

The website builder is now ready for nail techs to create professional websites and grow their businesses!