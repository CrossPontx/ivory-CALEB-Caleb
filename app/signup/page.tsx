'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Get the ref parameter if it exists
    const ref = searchParams.get('ref');
    
    // Redirect to main page with ref parameter
    if (ref) {
      router.replace(`/?ref=${ref}`);
    } else {
      router.replace('/');
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ivory via-sand to-blush flex items-center justify-center">
      <div className="text-charcoal">Redirecting...</div>
    </div>
  );
}
