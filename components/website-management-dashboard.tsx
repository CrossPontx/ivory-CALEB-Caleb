'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  Globe, 
  Eye, 
  BarChart3, 
  Loader2, 
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw
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
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);

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
      toast.success(`Website ${published ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-2 tracking-tight leading-[1.1]">
                    Website Preview
                  </h2>
                  <p className="text-sm sm:text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                    {websiteData.fullUrl}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6B6B6B] font-light">Published</span>
                    <Switch
                      checked={websiteData.isPublished}
                      onCheckedChange={handlePublishToggle}
                      className="data-[state=checked]:bg-[#8B7355]"
                    />
                  </div>
                  <Button
                    onClick={() => window.open(websiteData.fullUrl, '_blank')}
                    variant="outline"
                    className="h-10 sm:h-12 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-4 sm:px-6 transition-all duration-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1} />
                    Visit Site
                  </Button>
                </div>
              </div>
            </div>

            {websiteData.demoUrl ? (
              <div className="w-full">
                {/* Website Preview - Full Width */}
                <div className="bg-white border border-[#E8E8E8] shadow-sm">
                  {/* Preview Header */}
                  <div className="p-3 sm:p-4 border-b border-[#E8E8E8] bg-gradient-to-r from-[#F8F7F5] to-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="text-xs text-[#6B6B6B] font-light tracking-wide">
                          {websiteData.fullUrl}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex border border-[#E8E8E8] rounded-lg overflow-hidden">
                          <button
                            onClick={() => setPreviewDevice('desktop')}
                            className={`p-2 transition-colors ${
                              previewDevice === 'desktop' 
                                ? 'bg-[#8B7355] text-white' 
                                : 'text-[#6B6B6B] hover:bg-[#F8F7F5]'
                            }`}
                          >
                            <Monitor className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('tablet')}
                            className={`p-2 transition-colors ${
                              previewDevice === 'tablet' 
                                ? 'bg-[#8B7355] text-white' 
                                : 'text-[#6B6B6B] hover:bg-[#F8F7F5]'
                            }`}
                          >
                            <Tablet className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => setPreviewDevice('mobile')}
                            className={`p-2 transition-colors ${
                              previewDevice === 'mobile' 
                                ? 'bg-[#8B7355] text-white' 
                                : 'text-[#6B6B6B] hover:bg-[#F8F7F5]'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        
                        <Button
                          onClick={() => {
                            setIsPreviewLoading(true);
                            const iframe = document.querySelector('iframe[title="Website Preview"]') as HTMLIFrameElement;
                            if (iframe) {
                              iframe.src = iframe.src;
                            }
                          }}
                          variant="outline"
                          size="sm"
                          className="border-[#E8E8E8] hover:border-[#8B7355] text-[#6B6B6B] hover:text-[#8B7355]"
                        >
                          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Preview Content */}
                  <div className="relative bg-[#F8F7F5] p-4 sm:p-6">
                    <div className={`mx-auto bg-white shadow-lg transition-all duration-300 ${
                      previewDevice === 'desktop' ? 'w-full' :
                      previewDevice === 'tablet' ? 'w-[768px] max-w-full' :
                      'w-[375px] max-w-full'
                    }`}>
                      {isPreviewLoading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <Loader2 className="w-6 h-6 animate-spin text-[#8B7355]" strokeWidth={1.5} />
                        </div>
                      )}
                      <iframe
                        src={websiteData.demoUrl}
                        title="Website Preview"
                        className="w-full h-[600px] lg:h-[700px] border-0"
                        onLoad={() => setIsPreviewLoading(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[#6B6B6B] font-light">No preview available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-[#F8F7F5] py-16 sm:py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-white flex items-center justify-center shadow-sm">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
          </div>
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">Website Management</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight leading-[1.1]">
            Your Professional Website
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
            Manage and optimize your online presence
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="space-y-8 sm:space-y-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Quick Stats */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Analytics</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                Website Stats
              </h3>
              <p className="text-sm text-[#6B6B6B] font-light leading-[1.7] tracking-wide mb-4">
                Monitor your website performance
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6B6B6B] font-light">Status</span>
                  <span className={`text-xs font-light ${websiteData.isPublished ? 'text-green-600' : 'text-orange-600'}`}>
                    {websiteData.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[#6B6B6B] font-light">Domain</span>
                  <span className="text-xs text-[#1A1A1A] font-light">{websiteData.subdomain}.ivoryschoice.com</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Quick Actions</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                Manage Site
              </h3>
              <p className="text-sm text-[#6B6B6B] font-light leading-[1.7] tracking-wide mb-4">
                Essential website controls
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(websiteData.fullUrl, '_blank')}
                  variant="outline"
                  className="w-full h-10 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" strokeWidth={1} />
                  Visit Website
                </Button>
                <div className="flex items-center justify-between p-3 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <span className="text-xs text-[#6B6B6B] font-light">Published</span>
                  <Switch
                    checked={websiteData.isPublished}
                    onCheckedChange={handlePublishToggle}
                    className="data-[state=checked]:bg-[#8B7355]"
                  />
                </div>
              </div>
            </div>

            {/* Website Info */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-[#8B7355]" strokeWidth={1} />
                <span className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Website Info</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] mb-2 tracking-tight">
                Site Details
              </h3>
              <p className="text-sm text-[#6B6B6B] font-light leading-[1.7] tracking-wide mb-4">
                Your website information
              </p>
              <div className="space-y-3">
                <div>
                  <span className="text-xs text-[#6B6B6B] font-light block mb-1">URL</span>
                  <p className="text-xs text-[#1A1A1A] font-light break-all">{websiteData.fullUrl}</p>
                </div>
                <div>
                  <span className="text-xs text-[#6B6B6B] font-light block mb-1">Sections</span>
                  <p className="text-xs text-[#1A1A1A] font-light">{websiteData.sections?.length || 0} sections</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}