# Interactive Onboarding Visual Flow

## Overview
A 7-step progressive onboarding that guides first-time users through the capture page features.

---

## Step-by-Step Visual Flow

### 🎯 Step 1: Take Photo
```
┌─────────────────────────────────────┐
│  📸 Camera View                     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 1. Take a Photo     │    │   │
│  │  │ Capture or upload   │    │   │
│  │  │ a photo of your     │    │   │
│  │  │ hand in good        │    │   │
│  │  │ lighting for best   │    │   │
│  │  │ results             │    │   │
│  │  │ ↓ Tap camera button │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ 📷 TAKE │ ← Pulsing ring │
│         │  PHOTO  │                │
│         └─────────┘                │
└─────────────────────────────────────┘

USER ACTION: Tap camera button
RESULT: Photo captured, advances to Step 2
```

---

### 🎨 Step 2: Upload Design Images
```
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 2. Upload Design    │    │   │
│  │  │    Images           │    │   │
│  │  │ You can upload      │    │   │
│  │  │ reference images    │    │   │
│  │  │ of nail designs     │    │   │
│  │  │ you like            │    │   │
│  │  │ ↓ Tap to see upload │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ 🖼️ IMAGE│ ← Pulsing ring │
│         │  UPLOAD │                │
│         └─────────┘                │
│                                     │
│  [Hand photo displayed]             │
└─────────────────────────────────────┘

USER ACTION: Tap upload button, upload image
RESULT: Upload completes, drawer auto-closes after 1s, advances to Step 3
```

---

### ✏️ Step 3: Drawing Canvas
```
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 3. Drawing Canvas   │    │   │
│  │  │ Draw directly on    │    │   │
│  │  │ your nails to guide │    │   │
│  │  │ the AI design       │    │   │
│  │  │ ↓ Tap to open       │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ ✏️ DRAW │ ← Pulsing ring │
│         │  CANVAS │                │
│         └─────────┘                │
│                                     │
│  [Hand photo displayed]             │
└─────────────────────────────────────┘

USER ACTION: Tap drawing button, draw (optional), close canvas
RESULT: Canvas closes, auto-advances to Step 4 (if drawing was made)
```

---

### 💅 Step 4: Choose Nail Shape
```
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│                                     │
│  Design Parameters                  │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 4. Choose Nail Shape│    │   │
│  │  │ Select your nail    │    │   │
│  │  │ shape - oval,       │    │   │
│  │  │ square, almond,     │    │   │
│  │  │ and more            │    │   │
│  │  │ ↓ Tap to choose     │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │ Nail Shape: Oval        ▼   │ ← │
│  └─────────────────────────────┘   │
│         ↑ Pulsing ring              │
│                                     │
│  [Hand photo displayed]             │
└─────────────────────────────────────┘

USER ACTION: Tap nail shape option, change shape, close parameters
RESULT: Parameters close, auto-advances to Step 5 (if shape was changed)
```

---

### 🔄 Step 5: Replace Hand Photo
```
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 5. Replace Hand     │    │   │
│  │  │    Photo            │    │   │
│  │  │ You can replace     │    │   │
│  │  │ your hand photo     │    │   │
│  │  │ anytime if needed   │    │   │
│  │  │                     │    │   │
│  │  │ [  Next Button  ]   │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│         ┌─────────┐                │
│         │ 🔄 REPL │ ← Pulsing ring │
│         │  ACE    │                │
│         └─────────┘                │
│                                     │
│  [Hand photo displayed]             │
└─────────────────────────────────────┘

USER ACTION: Click "Next" button in tooltip
RESULT: Advances to Step 6 (doesn't require tapping replace button)
```

---

### ✨ Step 6: Visualize
```
┌─────────────────────────────────────┐
│  Design Your Nails                  │
│                                     │
│  [Hand photo displayed]             │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  [Tooltip appears here]     │   │
│  │  ┌─────────────────────┐    │   │
│  │  │ 6. Generate Your    │    │   │
│  │  │    Design           │    │   │
│  │  │ Tap this button to  │    │   │
│  │  │ see your custom     │    │   │
│  │  │ design on your nails│    │   │
│  │  │ ↓ Tap to visualize  │    │   │
│  │  └─────────────────────┘    │   │
│  └─────────────────────────────┘   │
│              ↓                      │
│  ┌─────────────────────────────┐   │
│  │ ✨ VISUALIZE YOUR DESIGN    │ ← │
│  └─────────────────────────────┘   │
│         ↑ Pulsing ring              │
└─────────────────────────────────────┘

USER ACTION: Tap visualize button
RESULT: Confirmation dialog opens, advances to Step 7
```

---

### ✅ Step 7: Confirm Generation
```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐ │
│  │  Ready to Visualize?          │ │
│  │  ✨                            │ │
│  │  Generate your AI-powered     │ │
│  │  nail design                  │ │
│  │                               │ │
│  │  Your Credits: 10             │ │
│  │  After generation: 9          │ │
│  │  • 1 credit will be used      │ │
│  │                               │ │
│  │  ┌─────────────────────────┐ │ │
│  │  │  [Tooltip here]         │ │ │
│  │  │  ┌─────────────────┐    │ │ │
│  │  │  │ 7. Confirm      │    │ │ │
│  │  │  │    Generation   │    │ │ │
│  │  │  │ Review the cost │    │ │ │
│  │  │  │ and confirm to  │    │ │ │
│  │  │  │ generate design │    │ │ │
│  │  │  │ ↓ Tap Confirm   │    │ │ │
│  │  │  └─────────────────┘    │ │ │
│  │  └─────────────────────────┘ │ │
│  │              ↓                │ │
│  │  [ Cancel ] [✨ CONFIRM ]    │ │
│  │                ↑              │ │
│  │         Pulsing ring          │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘

USER ACTION: Tap "Confirm" button
RESULT: ✅ ONBOARDING COMPLETES!
        - Stored in localStorage
        - Design generation begins
        - Won't show again
```

---

## Key Features

### 🎯 Interactive & Non-Blocking
- Users tap actual UI elements (not "Next" buttons, except Step 5)
- Semi-transparent overlay allows interaction
- Spotlight effect highlights target elements
- Pulsing rings draw attention

### 📱 Responsive Positioning
- Tooltips stay within viewport bounds
- Mobile: prefers top/bottom positioning
- Desktop: uses top/bottom/left/right as needed
- Auto-scroll brings elements into view

### ✨ Visual Effects
- Spotlight effect with cut-out mask
- Pulsing rings around target elements
- Smooth animations and transitions
- Progress indicator shows completion

### 🎨 Design Elements
- Elegant tooltips with arrows pointing to targets
- Step numbers in circular badges
- Progress dots at bottom of tooltip
- "Skip tutorial" option always available

---

## Completion & Storage

### When Onboarding Completes
```javascript
// After user clicks "Confirm" in Step 7:
localStorage.setItem('ivory_capture_onboarding_completed', 'true')
```

### Checking Completion Status
```javascript
const hasCompleted = localStorage.getItem('ivory_capture_onboarding_completed')
// Returns: "true" if completed, null if not
```

### Resetting for Testing
```javascript
localStorage.removeItem('ivory_capture_onboarding_completed')
location.reload()
```

---

## User Experience Goals

✅ **Activate users in 30-60 seconds**
✅ **Show, don't tell** (interactive, not instructional)
✅ **Progressive disclosure** (one feature at a time)
✅ **Non-intrusive** (can skip at any time)
✅ **Contextual** (tooltips next to actual features)
✅ **Memorable** (visual effects make it engaging)

---

**Implementation Complete!** 🎉
All 7 steps are working with proper positioning, interaction, and completion logic.
