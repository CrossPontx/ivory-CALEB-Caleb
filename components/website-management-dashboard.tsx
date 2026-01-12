'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Edit3, 
  Eye, 
  Settings, 
  BarChart3, 
  Loader2, 
  ExternalLink,
  CreditCard,
  Sparkles,
  Search,
  Undo2,
  Redo2,
  History,
  Monitor,
  Tablet,
  Smartphone
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

interface WebsiteManagementDashboardProps {
  websiteData: WebsiteData;
  onUpdate: (updatedData: WebsiteData) => void;
}

export function WebsiteManagementDashboard({ 
  websiteData, 
  onUpdate 
}: WebsiteManagementDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [customizationPrompt, setCustomizationPrompt] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [chatHistory, setChatHistory] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [seoSettings, setSeoSettings] = useState<{
    title?: string;
    description?: string;
    keywords?: string[];
  }>(websiteData.seoSettings || {});

  // Load chat history when customize tab is opened
  useEffect(() => {
    if (activeTab === 'customize' && !chatHistory) {
      loadChatHistory();
    }
  }, [activeTab]);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`/api/websites/${websiteData.id}/history`);
      if (response.ok) {
        const history = await response.json();
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleNavigateVersion = async (versionId?: string, action?: 'undo' | 'redo') => {
    setIsNavigating(true);
    try {
      const response = await fetch(`/api/websites/${websiteData.id}/navigate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ versionId, action }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to navigate version');
      }

      const result = await response.json();
      
      // Update the demo URL
      const updatedData = {
        ...websiteData,
        demoUrl: result.demoUrl || websiteData.demoUrl,
      };
      
      onUpdate(updatedData);
      
      // Reload chat history to get updated state
      await loadChatHistory();
      
      toast.success(result.message || 'Successfully navigated to version');
    } catch (error) {
      console.error('Error navigating version:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to navigate version');
    } finally {
      setIsNavigating(false);
    }
  };

  // Check user credits on mount
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const response = await fetch('/api/user/status');
        if (response.ok) {
          const data = await response.json();
          setUserCredits(data.credits);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      }
    };
    
    checkUserStatus();
  }, []);

  const handleCustomization = async () => {
    if (!customizationPrompt.trim()) {
      toast.error('Please enter a customization request');
      return;
    }

    if (userCredits === null || userCredits < 1) {
      toast.error('Insufficient credits. Website customization requires 1 credit.');
      return;
    }

    setIsCustomizing(true);
    
    // Show progress toast
    const progressToast = toast.loading('Customizing your website with AI... This may take 30-60 seconds.', {
      duration: 120000, // 2 minutes
    });

    try {
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

      const response = await fetch(`/api/websites/${websiteData.id}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customizationPrompt }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      toast.dismiss(progressToast);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to customize website');
      }

      const result = await response.json();
      
      // Update credits
      if (result.creditsRemaining !== undefined) {
        setUserCredits(result.creditsRemaining);
      }

      // Update the demo URL
      const updatedData = {
        ...websiteData,
        demoUrl: result.demoUrl || websiteData.demoUrl,
      };
      
      onUpdate(updatedData);
      setCustomizationPrompt('');
      
      // Refresh the preview if it exists
      setIsPreviewLoading(true);
      const iframe = document.querySelector('iframe[title="Website Preview"]') as HTMLIFrameElement;
      if (iframe) {
        // Small delay to ensure the new demo URL is ready
        setTimeout(() => {
          iframe.src = result.demoUrl || iframe.src;
        }, 1000);
      }
      
      toast.success('Website updated successfully!');
    } catch (error) {
      console.error('Error customizing website:', error);
      toast.dismiss(progressToast);
      
      if (error instanceof Error && error.name === 'AbortError') {
        toast.error('Website customization timed out. Please try again.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to customize website');
      }
    } finally {
      setIsCustomizing(false);
    }
  };

  const handlePublishToggle = async (published: boolean) => {
    try {
      const response = await fetch(`/api/websites/${websiteData.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published }),
      });

      if (!response.ok) {
        throw new Error('Failed to update publish status');
      }

      const updatedData = { ...websiteData, isPublished: published };
      onUpdate(updatedData);
      toast.success(published ? 'Website published!' : 'Website unpublished');
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'customize', label: 'Customize', icon: Edit3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Website Preview - Top of Page */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-8 sm:py-12 border-b border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10 bg-white shadow-sm">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                <span className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Live Preview</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 tracking-tight leading-[1.1]">
                Website Preview
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] font-light leading-[1.7] tracking-wide max-w-2xl">
                See how your website looks to visitors across all devices
              </p>
            </div>
            
            {websiteData.demoUrl ? (
              <div className="relative">
                <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-4 rounded-none">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                      <div className="flex-1 bg-white border border-[#E8E8E8] px-3 py-1 text-xs text-[#6B6B6B] font-mono ml-2">
                        {websiteData.isPublished ? `https://${websiteData.subdomain}.ivoryschoice.com` : 'Preview Mode'}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        variant={previewDevice === 'desktop' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewDevice('desktop')}
                        className="h-7 w-7 p-0 rounded-none"
                      >
                        <Monitor className="w-3 h-3" strokeWidth={1} />
                      </Button>
                      <Button
                        variant={previewDevice === 'tablet' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewDevice('tablet')}
                        className="h-7 w-7 p-0 rounded-none"
                      >
                        <Tablet className="w-3 h-3" strokeWidth={1} />
                      </Button>
                      <Button
                        variant={previewDevice === 'mobile' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewDevice('mobile')}
                        className="h-7 w-7 p-0 rounded-none"
                      >
                        <Smartphone className="w-3 h-3" strokeWidth={1} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div 
                      className={`bg-white border border-[#E8E8E8] overflow-hidden transition-all duration-500 relative shadow-sm ${
                        previewDevice === 'desktop' ? 'w-full h-[600px]' :
                        previewDevice === 'tablet' ? 'w-[768px] h-[600px] max-w-full' :
                        'w-[375px] h-[667px] max-w-full'
                      }`}
                    >
                      {isPreviewLoading && (
                        <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-[#8B7355] mx-auto mb-3" strokeWidth={1} />
                            <p className="text-sm text-[#6B6B6B] font-light">Loading preview...</p>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={websiteData.demoUrl}
                        className="w-full h-full border-0"
                        title="Website Preview"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                        loading="lazy"
                        onLoad={() => setIsPreviewLoading(false)}
                        onError={() => setIsPreviewLoading(false)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                  <div className="text-xs text-[#6B6B6B] font-light">
                    {websiteData.isPublished ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Live website preview</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>Draft preview - not visible to public</span>
                      </div>
                    )}
                    <div className="mt-1 text-[10px] opacity-75">
                      {previewDevice === 'desktop' ? 'Desktop View (1200px+)' : 
                       previewDevice === 'tablet' ? 'Tablet View (768px)' : 'Mobile View (375px)'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsPreviewLoading(true);
                        const iframe = document.querySelector('iframe[title="Website Preview"]') as HTMLIFrameElement;
                        if (iframe) {
                          iframe.src = iframe.src;
                        }
                      }}
                      className="h-9 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light px-4 transition-all duration-700"
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-9 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light px-4 transition-all duration-700"
                    >
                      <a 
                        href={websiteData.isPublished ? `https://${websiteData.subdomain}.ivoryschoice.com` : websiteData.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" strokeWidth={1} />
                        Open Full
                      </a>
                    </Button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-[#F8F7F5] border border-[#E8E8E8]">
                      <Switch
                        checked={websiteData.isPublished}
                        onCheckedChange={handlePublishToggle}
                      />
                      <span className="text-xs font-light text-[#1A1A1A] tracking-wide">Publish</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#F8F7F5] border border-[#E8E8E8] p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-white border border-[#E8E8E8] flex items-center justify-center">
                  <Eye className="w-6 h-6 text-[#6B6B6B]" strokeWidth={1} />
                </div>
                <h3 className="text-lg font-light text-[#1A1A1A] mb-2">Preview Not Available</h3>
                <p className="text-sm text-[#6B6B6B] font-light mb-4">
                  Your website is being generated. The preview will appear here once it's ready.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="h-8 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] tracking-[0.2em] uppercase font-light px-4 transition-all duration-700"
                >
                  Refresh Page
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-[#F8F7F5] py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-white flex items-center justify-center">
              <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
            </div>
            <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Website Management</p>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight leading-[1.1]">
              Your Professional Website
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
              Manage, customize, and optimize your online presence
            </p>
          </div>

          {/* Website Status Card */}
          <div className="max-w-4xl mx-auto border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10 bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${websiteData.isPublished ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-[11px] tracking-[0.25em] uppercase font-light text-[#6B6B6B]">
                    {websiteData.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-[#6B6B6B] font-light mb-1">Your website address</p>
                  <p className="font-mono text-lg sm:text-xl text-[#1A1A1A] font-light mb-2">{websiteData.fullUrl}</p>
                  {websiteData.isPublished ? (
                    <p className="text-xs text-green-600 font-light">
                      ✓ Live and accessible to visitors
                    </p>
                  ) : (
                    <p className="text-xs text-yellow-600 font-light">
                      ⚠ Not published - only you can see the preview
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {websiteData.demoUrl ? (
                  <Button 
                    variant="outline" 
                    asChild
                    className="h-12 sm:h-14 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-6 sm:px-8 transition-all duration-700"
                  >
                    <a 
                      href={websiteData.isPublished ? `https://${websiteData.subdomain}.ivoryschoice.com` : websiteData.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Eye className="w-4 h-4 mr-2" strokeWidth={1} />
                      {websiteData.isPublished ? 'View Live Site' : 'Preview'}
                      <ExternalLink className="w-3 h-3 ml-2" strokeWidth={1} />
                    </a>
                  </Button>
                ) : (
                  <div className="h-12 sm:h-14 border border-[#E8E8E8] bg-gray-50 text-gray-400 rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-6 sm:px-8 flex items-center justify-center">
                    <Eye className="w-4 h-4 mr-2" strokeWidth={1} />
                    Preview Unavailable
                  </div>
                )}
                
                <div className="flex items-center gap-3 px-4 py-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <Switch
                    checked={websiteData.isPublished}
                    onCheckedChange={handlePublishToggle}
                  />
                  <span className="text-sm font-light text-[#1A1A1A]">Publish</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        {userCredits !== null && userCredits < 1 && (
          <Alert className="border-red-200 bg-red-50 mb-6">
            <CreditCard className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Insufficient Credits:</strong> Website customization requires 1 credit. You have {userCredits} credits remaining.
              <Button variant="link" className="p-0 h-auto text-red-800 underline ml-1">
                Buy credits
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {userCredits !== null && (
          <div className="flex items-center justify-between p-4 sm:p-5 bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-blue-800">
                Credits: {userCredits} • Website customization costs 1 credit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="border-b border-[#E8E8E8]">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 sm:px-8 py-4 sm:py-5 text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-500 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#1A1A1A] border-b-2 border-[#8B7355]'
                      : 'text-[#6B6B6B] hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-12">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Quick Stats */}
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Analytics</span>
                </div>
                <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2">0</p>
                <p className="text-sm text-[#6B6B6B] font-light">Total page views</p>
              </div>

              {/* Customizations */}
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Edit3 className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Updates</span>
                </div>
                <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2">{websiteData.customizations?.length || 0}</p>
                <p className="text-sm text-[#6B6B6B] font-light">AI customizations applied</p>
              </div>

              {/* Status */}
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                  <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Status</span>
                </div>
                <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2">
                  {websiteData.isPublished ? 'Live' : 'Draft'}
                </p>
                <p className="text-sm text-[#6B6B6B] font-light">
                  {websiteData.isPublished ? 'Visible to everyone' : 'Only visible to you'}
                </p>
              </div>
            </div>

            {/* Recent Activity */}
            {websiteData.customizations && websiteData.customizations.length > 0 && (
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10">
                <div className="mb-6 sm:mb-8">
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-tight">Recent Updates</h2>
                  <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                    Your latest website customizations
                  </p>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {websiteData.customizations.slice(-3).map((customization, index) => (
                    <div key={index} className="flex gap-4 p-4 sm:p-6 bg-[#F8F7F5] border border-[#E8E8E8]">
                      <div className="w-2 h-2 bg-[#8B7355] rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-[#1A1A1A] font-light leading-[1.7] mb-2">{customization.prompt}</p>
                        <p className="text-xs text-[#6B6B6B] font-light tracking-wide">
                          {new Date(customization.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customize Tab */}
        {activeTab === 'customize' && (
          <div className="space-y-8 sm:space-y-12">
            {/* Version History Navigation */}
            {chatHistory && chatHistory.versions && chatHistory.versions.length > 1 && (
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <History className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                    <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Version History</p>
                  </div>
                  <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                    Navigate Versions
                  </h3>
                  <p className="text-sm text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                    Go back and forth through your website versions
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={() => handleNavigateVersion(undefined, 'undo')}
                    disabled={isNavigating || !chatHistory.versions || chatHistory.versions.length < 2}
                    variant="outline"
                    className="h-10 sm:h-12 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-4 sm:px-6 transition-all duration-700"
                  >
                    <Undo2 className="w-4 h-4 mr-2" strokeWidth={1} />
                    Undo
                  </Button>
                  
                  <Button
                    onClick={() => handleNavigateVersion(undefined, 'redo')}
                    disabled={isNavigating}
                    variant="outline"
                    className="h-10 sm:h-12 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-4 sm:px-6 transition-all duration-700"
                  >
                    <Redo2 className="w-4 h-4 mr-2" strokeWidth={1} />
                    Redo
                  </Button>

                  <div className="flex-1 text-center">
                    <p className="text-xs text-[#6B6B6B] font-light">
                      Version {chatHistory.versions.length} of {chatHistory.versions.length}
                    </p>
                  </div>
                </div>

                {/* Version Timeline */}
                {chatHistory.versions.length > 1 && (
                  <div className="mt-6 p-4 bg-[#F8F7F5] border border-[#E8E8E8]">
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {chatHistory.versions.map((version: any, index: number) => (
                        <button
                          key={version.id}
                          onClick={() => handleNavigateVersion(version.id)}
                          disabled={isNavigating}
                          className={`flex-shrink-0 w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                            index === chatHistory.versions.length - 1
                              ? 'bg-[#8B7355] border-[#8B7355] text-white'
                              : 'bg-white border-[#E8E8E8] text-[#6B6B6B] hover:border-[#8B7355]'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Customization */}
            <div className="max-w-4xl mx-auto">
              <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
                <div className="mb-8 sm:mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                    <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">AI Customization</p>
                  </div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                    Customize Your Website
                  </h2>
                  <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                    Describe the changes you want to make and our AI will update your website
                  </p>
                </div>

                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                      What would you like to change? <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      placeholder="e.g., Change the hero section background to a soft pink color, add a testimonials section, make the booking button more prominent, update the color scheme to be more modern..."
                      value={customizationPrompt}
                      onChange={(e) => setCustomizationPrompt(e.target.value)}
                      rows={4}
                      className={`text-sm sm:text-base rounded-none focus:ring-0 resize-none font-light leading-[1.7] tracking-wide transition-all duration-300 ${
                        customizationPrompt?.trim() 
                          ? 'border-[#E8E8E8] focus:border-[#8B7355]' 
                          : 'border-red-200 focus:border-red-400'
                      }`}
                      required
                    />
                    {!customizationPrompt?.trim() && (
                      <p className="text-xs text-red-500 mt-2 font-light">
                        Please describe your customization request
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button 
                      onClick={handleCustomization} 
                      disabled={isCustomizing || !customizationPrompt.trim() || (userCredits !== null && userCredits < 1)}
                      className="h-12 sm:h-14 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 px-8 sm:px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98] min-w-[200px]"
                    >
                      {isCustomizing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                          Updating with AI...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" strokeWidth={1} />
                          Update Website
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8 sm:space-y-12">
            {/* SEO Settings */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Search className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Search Optimization</p>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                  SEO Settings
                </h2>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Optimize your website for search engines
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                    Page Title
                  </Label>
                  <Input
                    value={seoSettings.title || ''}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Your Business Name - Professional Nail Services"
                    className="h-12 sm:h-14 text-base sm:text-lg border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                  />
                </div>
                
                <div>
                  <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                    Meta Description
                  </Label>
                  <Textarea
                    value={seoSettings.description || ''}
                    onChange={(e) => setSeoSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Book professional nail services with expert nail technician..."
                    rows={3}
                    className="text-sm sm:text-base rounded-none focus:ring-0 resize-none font-light leading-[1.7] tracking-wide border-[#E8E8E8] focus:border-[#8B7355] transition-all duration-300"
                  />
                </div>
                
                <div>
                  <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                    Keywords
                  </Label>
                  <Input
                    value={seoSettings.keywords?.join(', ') || ''}
                    onChange={(e) => setSeoSettings(prev => ({ 
                      ...prev, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                    }))}
                    placeholder="nail tech, nail art, manicure, pedicure"
                    className="h-12 sm:h-14 text-base sm:text-lg border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Domain Settings */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Domain Management</p>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                  Domain Settings
                </h2>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Manage your website domain and URL
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div>
                  <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                    Current Domain
                  </Label>
                  <div className="p-4 sm:p-5 bg-[#F8F7F5] border border-[#E8E8E8]">
                    <p className="font-mono text-sm sm:text-base text-[#1A1A1A] font-light">{websiteData.fullUrl}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                    Custom Domain (Optional)
                  </Label>
                  <Input
                    placeholder="www.yourbusiness.com"
                    value={websiteData.customDomain || ''}
                    disabled
                    className="h-12 sm:h-14 text-base sm:text-lg border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300 bg-[#F8F7F5]"
                  />
                  <p className="text-xs text-[#6B6B6B] mt-3 font-light leading-relaxed">
                    Custom domains are available with Pro plan
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}