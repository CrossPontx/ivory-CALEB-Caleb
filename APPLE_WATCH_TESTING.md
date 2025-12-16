# Apple Watch Testing Guide

## Test Page

A dedicated test page has been created at `/watch-test` to demonstrate all Apple Watch optimizations.

### Access the Test Page

```
http://localhost:3000/watch-test
```

Or in production:
```
https://your-domain.com/watch-test
```

## What the Test Page Shows

### 1. Device Detection
- Displays current viewport type (Watch vs Regular)
- Shows real-time viewport dimensions

### 2. Conditional Content
- `HideOnWatch` component demo
- `WatchOnly` component demo
- Shows how content adapts

### 3. Watch-Optimized Buttons
- Primary button style
- Secondary button style
- Touch target sizing

### 4. Responsive Grid
- 2-column on regular devices
- 1-column on Apple Watch
- Automatic adaptation

### 5. Typography Scale
- H1, H2, H3 scaling
- Body text sizing
- Readability optimization

### 6. Viewport Information
- Current width/height
- Detection threshold (272px)
- Real-time updates

## Testing Methods

### Method 1: Browser DevTools (Recommended for Development)

**Chrome:**
1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Select "Edit..." from device dropdown
4. Add custom device:
   - Name: Apple Watch Series 9 (45mm)
   - Width: 396px
   - Height: 484px
   - Device pixel ratio: 2
5. Or use responsive mode with width ≤272px

**Safari:**
1. Enable Developer menu (Preferences > Advanced)
2. Develop > Enter Responsive Design Mode
3. Set custom dimensions: 272x340px

**Firefox:**
1. Open DevTools (F12)
2. Click Responsive Design Mode (Ctrl+Shift+M)
3. Set dimensions: 272x340px

### Method 2: iOS Simulator

```bash
# Build and open in Xcode
yarn ios:build

# In Xcode:
# 1. Window > Devices and Simulators
# 2. Click "+" to add simulator
# 3. Select Apple Watch Series 9
# 4. Run your app on iPhone simulator
# 5. Watch app appears automatically
```

### Method 3: Physical Apple Watch

**Requirements:**
- Apple Watch paired with iPhone
- iPhone with app installed
- Same Apple ID on both devices

**Steps:**
1. Install app on iPhone via TestFlight or Xcode
2. Watch app installs automatically
3. Open app on watch
4. Test all features

## Testing Checklist

### Visual Testing
- [ ] Header displays correctly (shortened title)
- [ ] Navigation is compact and usable
- [ ] Buttons are large enough (44x44px minimum)
- [ ] Text is readable (11px minimum)
- [ ] Images fit within viewport
- [ ] No horizontal scrolling
- [ ] Proper spacing (not too cramped)

### Interaction Testing
- [ ] All buttons are tappable
- [ ] Navigation works smoothly
- [ ] Scrolling is smooth
- [ ] No layout shifts
- [ ] Touch targets are adequate
- [ ] Gestures work properly

### Content Testing
- [ ] Essential content is visible
- [ ] Non-essential content is hidden
- [ ] Credits display shows correctly
- [ ] Design grid adapts to single column
- [ ] Images load properly
- [ ] Text doesn't overflow

### Performance Testing
- [ ] Page loads quickly (<3 seconds)
- [ ] Smooth scrolling
- [ ] No lag on interactions
- [ ] Images load progressively
- [ ] Minimal battery drain

## Common Issues and Solutions

### Issue: Layout doesn't adapt
**Check:**
- Viewport meta tag is present
- CSS media query is loaded
- JavaScript is enabled
- No CSS conflicts

**Solution:**
```tsx
// Verify hook is imported
import { useIsAppleWatch } from "@/components/watch-optimized-layout"

// Use in component
const isWatch = useIsAppleWatch()
```

### Issue: Text too small
**Solution:**
Increase minimum font size in `styles/globals.css`:
```css
@media (max-width: 272px) {
  :root {
    font-size: 13px; /* Increase from 12px */
  }
}
```

### Issue: Buttons not tappable
**Solution:**
Ensure minimum touch target:
```tsx
<button className="min-h-[44px] min-w-[44px]">
  Click Me
</button>
```

### Issue: Images too large
**Solution:**
Add watch-specific image sizing:
```tsx
<Image 
  className={isWatch ? 'max-h-[120px]' : 'max-h-[300px]'}
  src={imageUrl}
  alt="Design"
/>
```

## Automated Testing

### Viewport Testing Script

Create `scripts/test-watch.js`:
```javascript
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Set Apple Watch viewport
  await page.setViewport({
    width: 272,
    height: 340,
    deviceScaleFactor: 2,
  });
  
  await page.goto('http://localhost:3000/watch-test');
  
  // Take screenshot
  await page.screenshot({ 
    path: 'watch-test-screenshot.png' 
  });
  
  await browser.close();
})();
```

Run with:
```bash
node scripts/test-watch.js
```

## Performance Benchmarks

### Target Metrics
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Largest Contentful Paint**: <2.5s
- **Cumulative Layout Shift**: <0.1
- **First Input Delay**: <100ms

### Measuring Performance

```javascript
// Add to page component
useEffect(() => {
  if (typeof window !== 'undefined' && window.performance) {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log('Page load time:', pageLoadTime, 'ms');
  }
}, []);
```

## Accessibility Testing

### VoiceOver Testing (Apple Watch)
1. Enable VoiceOver on watch
2. Navigate through app
3. Verify all elements are announced
4. Check button labels are clear
5. Ensure proper focus order

### Contrast Testing
- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Use browser DevTools to check

## Reporting Issues

When reporting watch-specific issues, include:
1. Watch model and size
2. watchOS version
3. Viewport dimensions
4. Screenshot or video
5. Steps to reproduce
6. Expected vs actual behavior

## Next Steps

After testing:
1. Fix any identified issues
2. Optimize performance bottlenecks
3. Add watch-specific features
4. Test on multiple watch models
5. Gather user feedback
6. Iterate and improve

## Resources

- [Apple Watch HIG](https://developer.apple.com/design/human-interface-guidelines/watchos)
- [WatchKit Framework](https://developer.apple.com/documentation/watchkit)
- [Web Performance](https://web.dev/performance/)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
