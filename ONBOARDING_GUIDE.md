# First-Time User Onboarding Guide

## Overview

The capture page now includes a progressive onboarding flow that guides new users through creating their first nail design in 30-60 seconds. This is a lightweight, non-intrusive tour that activates users quickly.

## Features

### 🎯 Smart Progressive Onboarding
- **4-step guided tour** that adapts to user progress
- **Auto-advances** based on user actions (no need to click "Next" if they're already doing it)
- **Skippable** at any time - users can dismiss or skip the tour
- **One-time only** - shown only on first visit, never again

### 📍 Onboarding Steps

1. **Welcome** (Center overlay)
   - Friendly greeting: "Welcome to Ivory! 💅"
   - Sets expectations: "Let's create your first nail design in 30 seconds"

2. **Capture Your Hand** (Bottom highlight)
   - Guides user to take or upload a photo
   - Highlights the capture button
   - Auto-advances when photo is captured

3. **Design Your Nails** (Top highlight)
   - Shows where to customize colors, shapes, and styles
   - Highlights the design parameters section
   - Auto-advances when user changes any design setting

4. **See the Magic** (Bottom highlight)
   - Explains the "Visualize" button
   - Shows credit cost (1 credit)
   - Completes when user clicks "Got it!" or generates their first design

### 🎨 Visual Design

- **Elegant overlay** with backdrop blur
- **Progress dots** showing current step
- **Smooth animations** and transitions
- **Mobile-optimized** for all screen sizes
- **Non-blocking** - users can interact with the app while onboarding is active

## Implementation Details

### Components

1. **`CaptureOnboarding`** (`components/capture-onboarding.tsx`)
   - Main onboarding component
   - Handles step progression and UI
   - Props:
     - `onComplete`: Callback when onboarding is finished
     - `currentPhase`: Current user progress ('capture' | 'design' | 'visualize')

2. **`useOnboarding`** (`hooks/use-onboarding.ts`)
   - Custom hook for managing onboarding state
   - Stores completion status in localStorage
   - Returns:
     - `shouldShowOnboarding`: Boolean to show/hide onboarding
     - `isLoading`: Loading state
     - `completeOnboarding`: Function to mark as complete
     - `resetOnboarding`: Function to reset (for testing)

### Integration Points

The onboarding is integrated into `app/capture/page.tsx`:

1. **Phase tracking** - Automatically detects user progress:
   ```typescript
   const [onboardingPhase, setOnboardingPhase] = useState<'capture' | 'design' | 'visualize'>('capture')
   ```

2. **Data attributes** for highlighting:
   - `data-onboarding="capture-button"` - Capture photo button
   - `data-onboarding="design-section"` - Design parameters section
   - `data-onboarding="visualize-button"` - Visualize button

3. **Auto-phase detection**:
   - Moves to 'design' phase when photo is captured
   - Moves to 'visualize' phase when user changes design settings

## User Flow

```
1. User lands on capture page (first time)
   ↓
2. Welcome overlay appears
   ↓
3. User clicks "Next" or taps outside
   ↓
4. Capture step highlights camera button
   ↓
5. User takes/uploads photo → Auto-advances to design step
   ↓
6. Design step highlights design parameters
   ↓
7. User changes color/shape → Auto-advances to visualize step
   ↓
8. Visualize step highlights the button
   ↓
9. User clicks "Got it!" → Onboarding complete ✅
```

## Testing

### Test the Onboarding
1. Open the capture page in a new browser/incognito window
2. The onboarding should appear automatically
3. Follow the steps or skip to test different flows

### Reset Onboarding (for testing)
Open browser console and run:
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
```
Then refresh the page.

### Test Auto-Advancement
1. Start onboarding
2. Take a photo → Should auto-advance to design step
3. Change a design setting → Should auto-advance to visualize step

## Customization

### Modify Steps
Edit `ONBOARDING_STEPS` in `components/capture-onboarding.tsx`:
```typescript
const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Your Title',
    description: 'Your description',
    position: 'center',
    icon: <YourIcon />
  },
  // Add more steps...
]
```

### Change Styling
The component uses Tailwind CSS classes. Key styling areas:
- Overlay: `bg-black/60 backdrop-blur-sm`
- Card: `bg-white rounded-2xl shadow-2xl`
- Buttons: `bg-[#8B7355]` (brand color)

### Adjust Timing
The onboarding uses CSS transitions for smooth animations:
- Overlay fade: `transition-opacity duration-300`
- Card movement: `transition-all duration-500`

## Best Practices

✅ **Do:**
- Keep steps short and actionable
- Use friendly, encouraging language
- Show progress indicators
- Allow users to skip
- Auto-advance when possible

❌ **Don't:**
- Force users through all steps
- Use technical jargon
- Block critical functionality
- Show onboarding on every visit
- Make steps too long or complex

## Analytics (Future Enhancement)

Consider tracking:
- Onboarding completion rate
- Step where users skip
- Time to complete each step
- First design generation success rate

## Accessibility

- Keyboard navigation supported (Tab, Enter, Escape)
- Screen reader friendly with semantic HTML
- High contrast text for readability
- Touch-friendly button sizes (min 44x44px)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires localStorage support

---

**Questions or Issues?**
Check the implementation in:
- `components/capture-onboarding.tsx`
- `hooks/use-onboarding.ts`
- `app/capture/page.tsx`
