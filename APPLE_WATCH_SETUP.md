# Apple Watch Setup Guide

## Overview

This guide explains how to format and optimize Ivory's Choice for Apple Watch. The app now includes responsive design optimizations that automatically adapt the UI for Apple Watch displays.

## Apple Watch Display Specifications

### Supported Models
- **Apple Watch Series 9/8/7 (45mm)**: 396x484px
- **Apple Watch Series 9/8/7 (41mm)**: 352x430px  
- **Apple Watch SE (44mm)**: 368x448px
- **Apple Watch SE (40mm)**: 324x394px

### Detection Threshold
The app detects Apple Watch by viewport width ≤ 272px

## Implementation Details

### 1. Watch-Optimized Components

Created `components/watch-optimized-layout.tsx` with:

- `useIsAppleWatch()` - Hook to detect Apple Watch
- `WatchOnly` - Show content only on watch
- `HideOnWatch` - Hide content on watch
- `WatchButton` - Simplified button for watch
- `WatchCard` - Compact card layout
- `WatchGrid` - Single column grid for watch

### 2. CSS Optimizations

Added to `styles/globals.css`:


**Typography**
- Root font size: 12px
- H1: 16px
- H2: 14px  
- H3: 12px
- Body text: 11px

**Spacing**
- Compact padding: 8px
- Compact margins: 4px
- Grid gaps: 8px

**Touch Targets**
- Minimum size: 44x44px (Apple HIG)

**Layout**
- Single column grid
- Full-width buttons with rounded corners
- Reduced padding/margins
- Hidden non-essential UI elements

### 3. Page Optimizations

Updated `app/home/page.tsx`:

- Conditional rendering based on watch detection
- Simplified header (shows "IVORY'S" instead of full name)
- Hidden referral/subscription banner on watch
- Compact credits display at top
- Single column design grid
- Smaller images and text
- Rounded buttons optimized for watch


## Usage Examples

### Conditional Rendering

```tsx
import { useIsAppleWatch, HideOnWatch, WatchOnly } from "@/components/watch-optimized-layout"

function MyComponent() {
  const isWatch = useIsAppleWatch()
  
  return (
    <div>
      {/* Show different content based on device */}
      {isWatch ? (
        <CompactView />
      ) : (
        <FullView />
      )}
      
      {/* Hide on watch */}
      <HideOnWatch>
        <ComplexFeature />
      </HideOnWatch>
      
      {/* Show only on watch */}
      <WatchOnly>
        <SimplifiedFeature />
      </WatchOnly>
    </div>
  )
}
```

### Watch-Optimized Button

```tsx
import { WatchButton } from "@/components/watch-optimized-layout"

<WatchButton onClick={handleClick} variant="default">
  Create Design
</WatchButton>
```


### Watch-Optimized Grid

```tsx
import { WatchGrid } from "@/components/watch-optimized-layout"

<WatchGrid cols={2}>
  {items.map(item => (
    <Card key={item.id}>{item.content}</Card>
  ))}
</WatchGrid>
```

## Testing on Apple Watch

### Option 1: Xcode Simulator

1. Open Xcode
2. Go to Window > Devices and Simulators
3. Add Apple Watch simulator
4. Run your iOS app
5. The watch companion will appear

### Option 2: Physical Device

1. Pair Apple Watch with iPhone
2. Install app on iPhone via TestFlight or Xcode
3. Watch app installs automatically
4. Open app on watch

### Option 3: Browser Testing

Simulate watch viewport in browser:
- Chrome DevTools: Set custom device 272x340px
- Safari: Responsive Design Mode with custom dimensions


## Design Guidelines

### What to Show on Watch
- Essential content only
- Current designs/looks
- Quick actions (Create, View)
- Credits balance
- Simple navigation

### What to Hide on Watch
- Marketing banners
- Detailed descriptions
- Complex forms
- Multi-step wizards
- Social features (temporarily)
- Settings (link to iPhone)

### Best Practices

1. **Keep it Simple**: One primary action per screen
2. **Large Touch Targets**: Minimum 44x44px
3. **Readable Text**: 11px minimum, high contrast
4. **Quick Interactions**: Complete tasks in <10 seconds
5. **Glanceable Info**: Show key data at a glance
6. **Rounded Corners**: Match watch display shape
7. **Vertical Scrolling**: Single column layouts


## Capacitor Configuration

The app uses Capacitor to bridge web and native. No special watch configuration needed in `capacitor.config.ts` - the responsive CSS handles adaptation.

### Building for watchOS

To add native watchOS support:

1. Open Xcode project: `yarn cap:open:ios`
2. File > New > Target > watchOS > Watch App
3. Configure watch app settings
4. Add watch-specific assets
5. Build and run

## CSS Classes Reference

### Watch-Specific Classes

- `.watch-compact` - Reduced padding (8px)
- `.watch-hide` - Hidden on watch
- `.watch-button` - Full-width rounded button
- `.watch-grid` - Single column grid
- `.watch-card` - Compact card layout
- `.watch-image` - Constrained image height (120px)
- `.watch-nav` - Compact navigation
- `.watch-no-border` - Remove borders
- `.watch-stack` - Vertical stacking

### Safe Area Classes

- `.safe-top` - Top safe area padding
- `.safe-bottom` - Bottom safe area padding
- `.safe-left` - Left safe area padding
- `.safe-right` - Right safe area padding


## Performance Considerations

### Optimizations for Watch

1. **Lazy Loading**: Load images on demand
2. **Reduced Animations**: Simpler transitions
3. **Minimal JavaScript**: Less client-side processing
4. **Cached Data**: Reduce API calls
5. **Compressed Images**: Smaller file sizes

### Battery Efficiency

- Avoid continuous animations
- Minimize network requests
- Use dark mode when possible
- Reduce screen updates

## Troubleshooting

### Issue: Layout not adapting
**Solution**: Check viewport meta tag in HTML head:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Issue: Text too small
**Solution**: Increase base font size in watch media query

### Issue: Buttons not tappable
**Solution**: Ensure minimum 44x44px touch target size

### Issue: Images not loading
**Solution**: Check image URLs and network connectivity


## Next Steps

### Recommended Enhancements

1. **Complications**: Add watch face complications
2. **Notifications**: Push notifications for new designs
3. **Haptic Feedback**: Tactile responses for actions
4. **Voice Input**: Siri integration for commands
5. **Offline Mode**: Cache designs for offline viewing
6. **Watch-Specific Features**:
   - Quick view saved designs
   - Swipe gestures for navigation
   - Digital Crown scrolling
   - Force touch menus

### Additional Pages to Optimize

Apply watch optimizations to:
- `/capture` - Photo capture page
- `/look/[id]` - Design detail page
- `/settings` - Settings page
- `/billing` - Subscription page
- `/auth` - Authentication page

## Resources

- [Apple Watch Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/watchos)
- [WatchKit Documentation](https://developer.apple.com/documentation/watchkit)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)

## Summary

Your app is now optimized for Apple Watch with:
✅ Responsive design that detects watch viewport
✅ Simplified UI components for small screens
✅ Touch-optimized buttons and navigation
✅ Hidden non-essential features
✅ Compact typography and spacing
✅ Reusable watch-optimized components

The app will automatically adapt when viewed on Apple Watch displays!
