# Apple Watch Visual Guide

## Before & After Comparison

### Home Page Header

**Before (Regular Device)**
```
┌─────────────────────────────────────┐
│  IVORY'S CHOICE                     │  ← Full brand name
│                                     │  ← 24px height
└─────────────────────────────────────┘
```

**After (Apple Watch)**
```
┌──────────────┐
│  IVORY'S     │  ← Shortened name
│              │  ← 16px height
└──────────────┘
```

### Design Grid

**Before (Regular Device)**
```
┌────────┬────────┬────────┬────────┐
│ Design │ Design │ Design │ Design │  ← 4 columns
│   1    │   2    │   3    │   4    │
├────────┼────────┼────────┼────────┤
│ Design │ Design │ Design │ Design │
│   5    │   6    │   7    │   8    │
└────────┴────────┴────────┴────────┘
```

**After (Apple Watch)**
```
┌──────────┐
│ Design 1 │  ← Single column
├──────────┤
│ Design 2 │
├──────────┤
│ Design 3 │
├──────────┤
│ Design 4 │
└──────────┘
```

### Bottom Navigation

**Before (Regular Device)**
```
┌─────────────────────────────────────┐
│                                     │
│  [Home]    [  +  ]    [Profile]    │  ← 16px height
│                                     │  ← 6x6 icons
└─────────────────────────────────────┘
```

**After (Apple Watch)**
```
┌──────────────┐
│ [H] [+] [P] │  ← 12px height
│ Home  Profile│  ← 4x4 icons + labels
└──────────────┘
```

### Buttons

**Before (Regular Device)**
```
┌─────────────────────────────────┐
│  ✨  CREATE DESIGN              │  ← 48px height
└─────────────────────────────────┘
```

**After (Apple Watch)**
```
┌──────────────┐
│ ✨ CREATE    │  ← Full width
└──────────────┘  ← Rounded corners
```

## Layout Patterns

### Card Layout

**Regular Device**
```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │  Card Content               │   │  ← Border
│  │  with padding               │   │  ← 24px padding
│  │                             │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Apple Watch**
```
┌──────────────┐
│ Card Content │  ← No border
│ compact pad  │  ← 8px padding
└──────────────┘
```

### Typography Hierarchy

**Regular Device**
```
H1: 32px  ━━━━━━━━━━━━━━━━
H2: 24px  ━━━━━━━━━━━━
H3: 20px  ━━━━━━━━━━
Body: 16px ━━━━━━━━
```

**Apple Watch**
```
H1: 16px  ━━━━━━━━
H2: 14px  ━━━━━━
H3: 12px  ━━━━━
Body: 11px ━━━━
```

## Touch Target Sizing

### Minimum Sizes (Apple HIG)

```
┌────────────────────────────────┐
│                                │
│         44px × 44px            │  ← Minimum touch target
│                                │
└────────────────────────────────┘
```

### Button Examples

**Too Small (❌)**
```
┌──────┐
│ Tap  │  ← 30px × 30px (too small)
└──────┘
```

**Correct (✅)**
```
┌──────────────┐
│              │
│     Tap      │  ← 44px × 44px (good)
│              │
└──────────────┘
```

## Spacing System

### Regular Device
```
Container padding: 24px
Card padding: 24px
Grid gap: 20px
Margin: 16px
```

### Apple Watch
```
Container padding: 12px
Card padding: 8px
Grid gap: 8px
Margin: 4px
```

## Color & Contrast

### Text Colors (Same on Both)
```
Primary:   #1A1A1A  ━━━━━━━━  (Dark gray)
Secondary: #6B6B6B  ━━━━━━━━  (Medium gray)
Accent:    #8B7355  ━━━━━━━━  (Brown)
```

### Contrast Ratios
```
Primary on White:   14.5:1  ✅ (Excellent)
Secondary on White:  5.7:1  ✅ (Good)
Accent on White:     4.8:1  ✅ (Good)
```

## Component Sizes

### Images

**Regular Device**
```
┌─────────────────┐
│                 │
│                 │  ← 300px max height
│     Image       │
│                 │
│                 │
└─────────────────┘
```

**Apple Watch**
```
┌──────────┐
│          │
│  Image   │  ← 120px max height
│          │
└──────────┘
```

### Icons

**Regular Device**
```
Navigation: 24px × 24px
Actions:    20px × 20px
Decorative: 16px × 16px
```

**Apple Watch**
```
Navigation: 16px × 16px
Actions:    14px × 14px
Decorative: 12px × 12px
```

## Viewport Breakpoints

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  Desktop/Tablet: >768px                        │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                 │
└─────────────────────────────────────────────────┘

┌──────────────────────────┐
│                          │
│  Mobile: 375px - 768px   │
│  ━━━━━━━━━━━━━━━━━━━━  │
│                          │
└──────────────────────────┘

┌──────────┐
│          │
│  Watch:  │  ← Detection threshold: ≤272px
│  ≤272px  │
│  ━━━━━━  │
│          │
└──────────┘
```

## Watch Models & Sizes

### Apple Watch Series 9/8/7

**45mm (Larger)**
```
┌────────────────┐
│                │
│   396 × 484    │  ← Pixels
│                │
│   1.901 inch   │  ← Diagonal
│                │
└────────────────┘
```

**41mm (Smaller)**
```
┌──────────────┐
│              │
│  352 × 430   │  ← Pixels
│              │
│  1.691 inch  │  ← Diagonal
│              │
└──────────────┘
```

### Apple Watch SE

**44mm (Larger)**
```
┌────────────────┐
│                │
│   368 × 448    │  ← Pixels
│                │
│   1.732 inch   │  ← Diagonal
│                │
└────────────────┘
```

**40mm (Smaller)**
```
┌──────────────┐
│              │
│  324 × 394   │  ← Pixels
│              │
│  1.571 inch  │  ← Diagonal
│              │
└──────────────┘
```

## Safe Areas

### Regular Device
```
┌─────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Status bar
├─────────────────────────────────┤
│                                 │
│         Content Area            │
│                                 │
├─────────────────────────────────┤
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ ← Home indicator
└─────────────────────────────────┘
```

### Apple Watch (Rounded Display)
```
    ┌───────────────┐
   ╱                 ╲
  │                   │
  │   Content Area    │  ← Rounded corners
  │                   │
   ╲                 ╱
    └───────────────┘
```

## Animation & Transitions

### Regular Device
```
Transition: 300ms ease
Scale: 0.95 on active
Hover effects: Enabled
```

### Apple Watch
```
Transition: 200ms ease  ← Faster
Scale: 0.95 on active
Hover effects: Disabled  ← No hover on watch
```

## Content Priority

### Show on Watch (Essential)
```
✅ Current designs
✅ Create button
✅ Credits balance
✅ Navigation
✅ Primary actions
```

### Hide on Watch (Non-essential)
```
❌ Marketing banners
❌ Detailed descriptions
❌ Social features
❌ Advanced settings
❌ Complex forms
```

## Testing Viewports

### Browser DevTools Setup

**Chrome/Edge**
```
1. F12 (Open DevTools)
2. Ctrl+Shift+M (Toggle device toolbar)
3. Custom device: 272 × 340
4. Device pixel ratio: 2
```

**Safari**
```
1. Cmd+Opt+I (Open DevTools)
2. Cmd+Opt+R (Responsive mode)
3. Custom: 272 × 340
```

**Firefox**
```
1. F12 (Open DevTools)
2. Ctrl+Shift+M (Responsive mode)
3. Custom: 272 × 340
```

## CSS Media Query

```css
/* Regular devices */
@media (min-width: 273px) {
  /* Standard styles */
}

/* Apple Watch */
@media (max-width: 272px) {
  /* Watch-optimized styles */
  :root {
    font-size: 12px;
  }
  
  button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

## Component Usage Examples

### Conditional Rendering
```tsx
const isWatch = useIsAppleWatch()

{isWatch ? (
  <CompactView />    // Watch version
) : (
  <FullView />       // Regular version
)}
```

### Hide on Watch
```tsx
<HideOnWatch>
  <ComplexFeature />  // Hidden on watch
</HideOnWatch>
```

### Watch-Only Content
```tsx
<WatchOnly>
  <SimplifiedView />  // Only on watch
</WatchOnly>
```

### Watch Button
```tsx
<WatchButton onClick={handleClick}>
  Create Design
</WatchButton>
```

## Performance Targets

```
Metric                    Target    Watch
─────────────────────────────────────────
First Contentful Paint    <1.5s    <1.0s
Time to Interactive       <3.0s    <2.0s
Largest Contentful Paint  <2.5s    <1.5s
Cumulative Layout Shift   <0.1     <0.05
First Input Delay         <100ms   <50ms
```

## Accessibility

### Text Contrast
```
Minimum ratio: 4.5:1 for normal text
Minimum ratio: 3:1 for large text (18px+)

Current ratios:
Primary (#1A1A1A):   14.5:1 ✅
Secondary (#6B6B6B):  5.7:1 ✅
Accent (#8B7355):     4.8:1 ✅
```

### Touch Targets
```
Minimum: 44 × 44 pixels
Recommended: 48 × 48 pixels
Spacing: 8px between targets
```

### Focus Indicators
```
Outline: 2px solid
Color: #8B7355 (accent)
Offset: 2px
```

---

**This visual guide helps you understand the design decisions and implementation details for Apple Watch optimization.**
