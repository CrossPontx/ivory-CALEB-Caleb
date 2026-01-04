# Customer Service Chatbot Integration

## Overview

The Ivory's Choice customer service chatbot is integrated using Langflow and appears on both the landing page and the home screen. It provides instant support to users with access to the comprehensive knowledge base.

## Features

### Aesthetic Design
- **Elegant floating button** with smooth animations
- **Brand colors**: Uses Ivory's Choice color palette (#8B7355, #1A1A1A)
- **Responsive**: Adapts to mobile and desktop screens
- **Smooth transitions**: Fade-in animations and hover effects
- **Pulse animation**: Subtle attention-grabbing effect

### Positioning

**Landing Page (Public)**
- Bottom right corner
- Larger button (64px/80px)
- Prominent for first-time visitors
- Helps with pre-signup questions

**Home Screen (Authenticated)**
- Top right corner
- Compact button (48px/56px)
- Doesn't interfere with main content
- Always accessible while using app

## Implementation

### Component: `components/customer-service-chatbot.tsx`

```tsx
<CustomerServiceChatbot position="landing" /> // For landing page
<CustomerServiceChatbot position="app" />     // For home screen
```

### Integration Points

1. **Landing Page** (`components/landing-page.tsx`)
   - Added at bottom of component
   - Position: `fixed bottom-6 right-6`

2. **Home Screen** (`app/home/page.tsx`)
   - Added before closing div
   - Position: `fixed top-20 right-4`

### Langflow Configuration

```html
<langflow-chat
  window_title="Ivory's Choice Support"
  flow_id="fb51d726-4af1-4101-8b7e-221884191359"
  host_url="http://localhost:7860"
  chat_input_field="Message"
  chat_trigger_style="display: none;"
/>
```

**Important**: Update `host_url` to your production Langflow server URL before deploying.

## Knowledge Base

The chatbot is trained on `CUSTOMER_SERVICE_KNOWLEDGE_BASE.md` which includes:

- Account management
- Billing and subscriptions
- Credits system
- Booking procedures
- Payment issues
- Technical support
- Privacy and security
- 50+ advanced FAQ entries
- Edge cases and complex scenarios

## Customization

### Colors

Edit in `components/customer-service-chatbot.tsx`:
```tsx
className="bg-[#8B7355] hover:bg-[#1A1A1A]"
```

### Size

**Landing page button:**
```tsx
className="w-16 h-16 sm:w-20 sm:h-20"
```

**App button:**
```tsx
className="w-12 h-12 sm:w-14 sm:h-14"
```

### Chat Window Size

**Landing page:**
```tsx
className="w-[90vw] sm:w-96 h-[70vh] sm:h-[600px]"
```

**App:**
```tsx
className="w-[90vw] sm:w-96 h-[70vh] sm:h-[500px]"
```

## Styling

Custom CSS in `styles/globals.css`:

```css
/* Fade-in animation */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Langflow theme customization */
langflow-chat {
  --chat-primary-color: #8B7355;
  --chat-secondary-color: #1A1A1A;
  --chat-background: #FFFFFF;
  --chat-text-color: #1A1A1A;
  --chat-border-radius: 16px;
}
```

## Production Deployment

### Before deploying:

1. **Update Langflow host URL:**
   ```tsx
   host_url="https://your-langflow-server.com"
   ```

2. **Verify flow ID:**
   ```tsx
   flow_id="your-production-flow-id"
   ```

3. **Test on staging:**
   - Verify chatbot loads
   - Test conversations
   - Check mobile responsiveness
   - Verify knowledge base accuracy

4. **Monitor performance:**
   - Response times
   - User satisfaction
   - Common questions
   - Error rates

## Accessibility

- **ARIA labels**: Buttons have descriptive labels
- **Keyboard navigation**: Fully keyboard accessible
- **Screen readers**: Compatible with screen readers
- **Focus states**: Clear focus indicators
- **Color contrast**: WCAG AA compliant

## Mobile Optimization

- **Touch-friendly**: Large tap targets (44px minimum)
- **Responsive sizing**: Adapts to screen size
- **Safe areas**: Respects iOS safe areas
- **Scroll behavior**: Doesn't interfere with page scroll

## Analytics (Future)

Consider tracking:
- Chat open rate
- Messages per session
- Resolution rate
- Common questions
- User satisfaction scores

## Troubleshooting

### Chatbot doesn't load

1. Check browser console for errors
2. Verify Langflow script loaded
3. Check network tab for failed requests
4. Verify host_url is correct

### Styling issues

1. Check CSS is loaded
2. Verify Tailwind classes
3. Check z-index conflicts
4. Inspect element styles

### Mobile issues

1. Test on actual devices
2. Check viewport meta tag
3. Verify touch events
4. Test on iOS and Android

## Future Enhancements

- [ ] Add typing indicators
- [ ] Show agent availability status
- [ ] Add quick reply buttons
- [ ] Implement chat history
- [ ] Add file upload support
- [ ] Multi-language support
- [ ] Voice input option
- [ ] Sentiment analysis
- [ ] Automated follow-ups
- [ ] Integration with ticketing system

## Support

For issues with the chatbot integration:
- Check this documentation
- Review Langflow documentation
- Test in different browsers
- Check mobile devices
- Review console errors

---

**Version:** 1.0.0  
**Last Updated:** January 3, 2026  
**Status:** Production Ready ✅
