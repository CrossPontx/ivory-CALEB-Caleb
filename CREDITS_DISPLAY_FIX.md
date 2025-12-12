# Credits Display Inconsistency Fix

## Problem

The UI was showing inconsistent credit values in different parts of the same page:
- Header showed one value (e.g., "4 credits")
- Warning message showed a different value (e.g., "You have 2 credits left")

## Root Cause

The `CreditsDisplay` component and the parent page (e.g., `capture/page.tsx`) were both independently calling the `useCredits()` hook. This created two separate instances of the credit state that could become out of sync, especially after credit-consuming operations like generating designs.

```typescript
// In capture/page.tsx
const { credits, hasCredits, refresh: refreshCredits } = useCredits()

// In CreditsDisplay component (separate instance!)
const { credits, loading } = useCredits()
```

## Solution

Modified `CreditsDisplay` to accept an optional `credits` prop. When provided, it uses the prop value instead of fetching independently:

```typescript
interface CreditsDisplayProps {
  className?: string;
  showLabel?: boolean;
  credits?: number | null; // Optional: pass credits from parent
}

export function CreditsDisplay({ className, showLabel = true, credits: creditsProp }: CreditsDisplayProps) {
  const { credits: creditsFromHook, loading } = useCredits();
  
  // Use prop if provided, otherwise use hook
  const credits = creditsProp !== undefined ? creditsProp : creditsFromHook;
  
  // Only show loading if we're using the hook and it's loading
  const isLoading = creditsProp === undefined && loading;
  
  // ... rest of component
}
```

## Changes Made

1. **components/credits-display.tsx**
   - Added optional `credits` prop
   - Component now uses prop value when provided, falls back to hook otherwise
   - Fixed loading state to only show when actually fetching

2. **app/capture/page.tsx**
   - Updated `<CreditsDisplay>` to pass the `credits` prop
   - Now both the header and warning message use the same credit value

3. **db/schema.ts**
   - Fixed TypeScript circular reference errors in the users table
   - Added type annotations to resolve self-referencing foreign key issues

## Benefits

- **Consistency**: All credit displays on the same page now show the same value
- **Performance**: Reduces duplicate API calls when parent already has credit data
- **Backward Compatible**: Components without a parent managing credits can still use the hook independently

## Testing

To verify the fix:
1. Navigate to the capture page
2. Check that the header credit count matches the warning message credit count
3. Generate a design (consumes 1 credit)
4. Verify both displays update to show the new balance consistently

## Future Improvements

For a more robust solution across the entire app, consider:
- Implementing a global state management solution (React Context, Zustand, or Redux)
- Creating a credits provider that wraps the app
- Using SWR or React Query for better cache management
