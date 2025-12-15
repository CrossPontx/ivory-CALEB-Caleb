# Home Pages Redesign Plan

## Overview
Redesign both client and tech home pages with the luxury Loro Piana aesthetic to match the landing page, auth page, and navigation.

## Completed
✅ Bottom Navigation - Elegant minimal design with labels

## Design Principles

### Color Palette
- Background: `#FFFFFF` (white)
- Primary Text: `#1A1A1A` (dark charcoal)
- Secondary Text: `#6B6B6B` (medium gray)
- Accent: `#8B7355` (warm brown)
- Borders: `#E8E8E8` (light gray)
- Subtle Background: `#F8F7F5` (off-white)

### Typography
- Light font weights (`font-light`)
- Uppercase tracking for labels (`tracking-wider`, `tracking-widest`)
- Serif fonts for headings
- Small, refined text sizes

### Components
- Square corners (`rounded-none`)
- Subtle borders instead of shadows
- Clean white cards with borders
- Minimal hover effects
- Smooth transitions (duration-300, duration-500)

## Client Home Page (`app/home/page.tsx`)

### Header
- White background with subtle border
- "IVORY'S CHOICE" in serif, light weight
- Remove gradient text, use solid #1A1A1A
- Clean minimal layout

### Referral Banner
- Redesign with elegant styling
- White background with border
- Remove blue gradient
- Use refined typography
- Subtle accent color

### Gallery Grid
- Clean white cards with borders
- Remove shadows, use borders
- Elegant hover states
- Refined spacing

### Empty State
- Minimal centered design
- Light typography
- Clean bordered container

## Tech Dashboard (`app/tech/dashboard/page.tsx`)

### Header
- Match client header style
- Clean white background
- Refined badge styling

### Tabs
- Elegant tab design
- Border-based active states
- Light typography
- Clean transitions

### Request Cards
- White cards with borders
- Refined spacing
- Elegant badges
- Clean button styling

### Empty States
- Minimal centered design
- Bordered containers
- Light typography

## Implementation Notes

Due to the extensive nature of these files (500+ lines each), the redesign should be done carefully section by section:

1. Update background colors
2. Redesign headers
3. Update card styling
4. Refine typography
5. Update button styles
6. Polish spacing and layout

## Next Steps

1. Backup current home pages
2. Implement client home page redesign
3. Implement tech dashboard redesign
4. Test on mobile devices
5. Ensure all interactions work smoothly
6. Verify navigation flow

## Mobile Optimization

- Responsive text sizes (text-xs sm:text-sm)
- Touch-friendly button sizes (h-12 sm:h-14)
- Proper spacing (p-4 sm:p-6)
- Stack layouts on mobile
- Optimize image sizes
