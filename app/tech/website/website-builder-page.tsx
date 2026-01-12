'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WebsiteBuilderWizard } from '@/components/website-builder-wizard';
import { WebsiteManagementDashboard } from '@/components/website-management-dashboard';
import { BottomNav } from '@/components/bottom-nav';
import { 
  Globe, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteData {
  id: number;
  subdomain: string;
  customDomain?: string;
  demoUrl: string;
  deploymentUrl?: string;
  isPublished: boolean;
  fullUrl: string;
  themeSettings: any;
  seoSettings: any;
  sections: any[];
  customizations: any[];
}

export function WebsiteBuilderPage() {
  const router = useRouter();
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    loadWebsiteData();
  }, []);

  const loadWebsiteData = async () => {
    try {
      const response = await fetch('/api/websites');
      if (response.ok) {
        const data = await response.json();
        setWebsiteData(data);
      } else if (response.status === 404) {
        // No website exists yet or API route not available
        setWebsiteData(null);
      } else {
        throw new Error('Failed to load website data');
      }
    } catch (error) {
      console.error('Error loading website data:', error);
      // Don't show error toast for 404s - this is expected for new users
      if (error instanceof Error && !error.message.includes('404')) {
        toast.error('Failed to load website data');
      }
      setWebsiteData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteCreated = (newWebsiteData: any) => {
    setWebsiteData({
      id: newWebsiteData.websiteId,
      subdomain: newWebsiteData.subdomain.replace('.ivoryschoice.com', ''),
      demoUrl: newWebsiteData.demoUrl,
      isPublished: false,
      fullUrl: newWebsiteData.subdomain,
      themeSettings: {},
      seoSettings: {},
      sections: [],
      customizations: [],
    });
    setShowWizard(false);
    toast.success('Website created successfully!');
  };

  const handleWebsiteUpdate = (updatedData: WebsiteData) => {
    setWebsiteData(updatedData);
  };

  const handleBackClick = () => {
    if (showWizard) {
      // User clicked "Create My Website" button, go back to getting started page
      setShowWizard(false);
    } else {
      // User has no website and was automatically shown wizard, go back to dashboard
      router.push('/tech/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Show wizard if creating new website
  if (showWizard || (!websiteData && !isLoading)) {
    return (
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-5">
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                Website Builder
              </h1>
              <Button
                variant="outline"
                onClick={handleBackClick}
                className="h-9 sm:h-10 px-4 sm:px-5 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-700"
              >
                Back
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-safe">
          <WebsiteBuilderWizard onComplete={handleWebsiteCreated} />
        </main>

        {/* Navigation */}
        <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
      </div>
    );
  }

  // Show management dashboard if website exists
  if (websiteData) {
    return (
      <div className="min-h-screen bg-white pb-24">
        {/* Header */}
        <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-5">
            <div className="flex items-center justify-between">
              <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                Website Management
              </h1>
              <Button
                variant="outline"
                onClick={() => router.push('/tech/dashboard')}
                className="h-9 sm:h-10 px-4 sm:px-5 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-700"
              >
                Back
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-10 pb-safe">
          <WebsiteManagementDashboard 
            websiteData={websiteData}
            onUpdate={handleWebsiteUpdate}
          />
        </main>

        {/* Navigation */}
        <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
      </div>
    );
  }

  // Show getting started page
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 pt-safe">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-5">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
              Website Builder
            </h1>
            <Button
              variant="outline"
              onClick={() => router.push('/tech/dashboard')}
              className="h-9 sm:h-10 px-4 sm:px-5 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light transition-all duration-700"
            >
              Back
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 lg:py-10 pb-safe">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Build Your Professional Website
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create a stunning website for your nail tech business in minutes with AI-powered design
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <Sparkles className="w-8 h-8 text-primary mb-2" />
              <CardTitle>AI-Powered Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Our AI creates a professional website tailored to your nail tech business with your services, portfolio, and booking system.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Instant Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Integrated booking system connects directly to your Ivory dashboard. Clients can book appointments 24/7.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Professional Domain</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get a professional yourname.ivoryschoice.com domain instantly, or connect your own custom domain.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What You Get</CardTitle>
            <CardDescription>
              Everything you need for a professional online presence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Professional website design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Integrated booking system</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Portfolio gallery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Service menu with pricing</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Mobile-responsive design</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>SEO optimization</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Customer reviews display</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Easy AI customization</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            onClick={() => setShowWizard(true)}
            className="text-lg px-8 py-6"
          >
            Create My Website
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes less than 5 minutes • No coding required
          </p>
        </div>
      </main>

      {/* Navigation */}
      <BottomNav onCenterAction={() => router.push("/capture")} centerActionLabel="Create" />
    </div>
  );
}