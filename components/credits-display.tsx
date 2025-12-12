'use client';

import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCredits } from '@/hooks/use-credits';

interface CreditsDisplayProps {
  className?: string;
  showLabel?: boolean;
  credits?: number | null; // Optional: pass credits from parent to avoid duplicate fetches
}

export function CreditsDisplay({ className, showLabel = true, credits: creditsProp }: CreditsDisplayProps) {
  const { credits: creditsFromHook, loading } = useCredits();
  
  // Use prop if provided, otherwise use hook
  const credits = creditsProp !== undefined ? creditsProp : creditsFromHook;
  
  // Only show loading if we're using the hook and it's loading
  const isLoading = creditsProp === undefined && loading;

  if (isLoading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Coins className="h-5 w-5 text-yellow-500 animate-pulse" />
        <span className="font-semibold">...</span>
        {showLabel && <span className="text-sm text-muted-foreground">credits</span>}
      </div>
    );
  }

  if (credits === null) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Coins className="h-5 w-5 text-yellow-500" />
      <span className="font-semibold">{credits}</span>
      {showLabel && <span className="text-sm text-muted-foreground">credits</span>}
    </div>
  );
}
