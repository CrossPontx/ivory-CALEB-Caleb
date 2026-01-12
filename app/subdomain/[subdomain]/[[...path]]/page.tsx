import { notFound } from 'next/navigation';
import { db } from '@/db';
import { techWebsites } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface SubdomainPageProps {
  params: Promise<{ subdomain: string; path?: string[] }>;
}

async function getWebsiteBySubdomain(subdomain: string) {
  try {
    const [website] = await db
      .select({
        id: techWebsites.id,
        subdomain: techWebsites.subdomain,
        demoUrl: techWebsites.demoUrl,
        isPublished: techWebsites.isPublished,
      })
      .from(techWebsites)
      .where(eq(techWebsites.subdomain, subdomain))
      .limit(1);

    return website;
  } catch (error) {
    console.error('Error fetching website:', error);
    return null;
  }
}

async function fetchWebsiteContent(demoUrl: string) {
  try {
    const response = await fetch(demoUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Website-Fetcher/1.0)',
      },
    });
    
    if (response.ok) {
      return await response.text();
    }
  } catch (error) {
    console.error('Error fetching website content:', error);
  }
  return null;
}

export default async function SubdomainCatchAllPage({ params }: SubdomainPageProps) {
  const { subdomain, path } = await params;
  
  const website = await getWebsiteBySubdomain(subdomain);
  
  if (!website) {
    notFound();
  }

  if (!website.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">🚧</span>
          </div>
          <h1 className="text-2xl font-light text-gray-800 mb-4">Website Under Construction</h1>
          <p className="text-gray-600 leading-relaxed">
            This website is currently being prepared and will be available soon.
          </p>
        </div>
      </div>
    );
  }

  // If we have a demo URL, try to fetch and display the content
  if (website.demoUrl) {
    const content = await fetchWebsiteContent(website.demoUrl);
    
    if (content) {
      // Return the HTML content directly
      return (
        <div 
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ minHeight: '100vh' }}
        />
      );
    }
  }

  // Fallback: show a coming soon page
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 max-w-lg">
        <div className="w-20 h-20 mx-auto mb-8 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-3xl">✨</span>
        </div>
        <h1 className="text-3xl font-light text-gray-800 mb-6">Professional Website</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          This beautiful website is being finalized and will be live shortly.
        </p>
        <div className="text-sm text-gray-500">
          Powered by Ivory Choice
        </div>
      </div>
    </div>
  );
}