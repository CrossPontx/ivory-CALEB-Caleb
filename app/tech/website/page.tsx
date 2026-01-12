import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { WebsiteBuilderPage } from './website-builder-page';

export default async function TechWebsitePage() {
  const session = await getSession();
  
  if (!session?.id) {
    redirect('/');
  }

  // Check if user exists and get user type from database if needed
  // The session might not have userType, so we'll let the component handle it
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        <WebsiteBuilderPage />
      </Suspense>
    </div>
  );
}