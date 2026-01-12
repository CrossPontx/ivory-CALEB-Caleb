'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  Palette,
  Layout,
  MessageSquare,
  Crown,
  CreditCard
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
  const [customizationPrompt, setCustomizationPrompt] = useState('');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

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
  const [seoSettings, setSeoSettings] = useState<{
    title?: string;
    description?: string;
    keywords?: string[];
  }>(websiteData.seoSettings || {});

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
    try {
      const response = await fetch(`/api/websites/${websiteData.id}/customize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: customizationPrompt }),
      });

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
      toast.success('Website updated successfully!');
    } catch (error) {
      console.error('Error customizing website:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to customize website');
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

  return (
    <div className="space-y-6">
      {/* Credits Alert */}
      {userCredits !== null && userCredits < 1 && (
        <Alert className="border-red-200 bg-red-50">
          <CreditCard className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Insufficient Credits:</strong> Website customization requires 1 credit. You have {userCredits} credits remaining.
            <Button variant="link" className="p-0 h-auto text-red-800 underline ml-1">
              Buy credits
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Credits Display */}
      {userCredits !== null && (
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Credits: {userCredits} • Website customization costs 1 credit
            </span>
          </div>
        </div>
      )}

      {/* Website Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Your Website</span>
              </CardTitle>
              <CardDescription>
                Manage your professional nail tech website
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={websiteData.isPublished ? 'default' : 'secondary'}>
                {websiteData.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Button variant="outline" size="sm" asChild>
                <a href={websiteData.demoUrl} target="_blank" rel="noopener noreferrer">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Website Address</Label>
              <p className="text-lg font-mono">{websiteData.fullUrl}</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={websiteData.isPublished}
                onCheckedChange={handlePublishToggle}
              />
              <Label>Publish website (make it live)</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Management Tabs */}
      <Tabs defaultValue="customize" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="customize" className="flex items-center space-x-2">
            <Edit3 className="w-4 h-4" />
            <span>Customize</span>
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center space-x-2">
            <Layout className="w-4 h-4" />
            <span>Sections</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Customize Tab */}
        <TabsContent value="customize" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>AI Customization</span>
              </CardTitle>
              <CardDescription>
                Describe changes you want to make to your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customization">What would you like to change?</Label>
                <Textarea
                  id="customization"
                  placeholder="e.g., Change the hero section background to a soft pink color, add a testimonials section, make the booking button more prominent..."
                  value={customizationPrompt}
                  onChange={(e) => setCustomizationPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleCustomization} 
                disabled={isCustomizing || !customizationPrompt.trim()}
                className="w-full"
              >
                {isCustomizing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating Website...
                  </>
                ) : (
                  'Update Website'
                )}
              </Button>

              {/* Customization History */}
              {websiteData.customizations && websiteData.customizations.length > 0 && (
                <div className="mt-6">
                  <Label className="text-sm font-medium">Recent Changes</Label>
                  <div className="mt-2 space-y-2">
                    {websiteData.customizations.slice(-3).map((customization, index) => (
                      <div key={index} className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{customization.prompt}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(customization.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Sections</CardTitle>
              <CardDescription>
                Manage the sections on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {websiteData.sections.map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium capitalize">{section.sectionType}</div>
                      <div className="text-sm text-muted-foreground">
                        {section.sectionType === 'hero' && 'Main banner with call-to-action'}
                        {section.sectionType === 'services' && 'Services menu and pricing'}
                        {section.sectionType === 'gallery' && 'Portfolio showcase'}
                        {section.sectionType === 'about' && 'About you and your business'}
                        {section.sectionType === 'contact' && 'Contact information and booking'}
                        {section.sectionType === 'reviews' && 'Customer testimonials'}
                      </div>
                    </div>
                    <Switch checked={section.isEnabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Optimize your website for search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Page Title</Label>
                <Input
                  id="seo-title"
                  value={seoSettings.title || ''}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Your Business Name - Professional Nail Services"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seo-description">Meta Description</Label>
                <Textarea
                  id="seo-description"
                  value={seoSettings.description || ''}
                  onChange={(e) => setSeoSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Book professional nail services with expert nail technician..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Keywords</Label>
                <Input
                  id="seo-keywords"
                  value={seoSettings.keywords?.join(', ') || ''}
                  onChange={(e) => setSeoSettings(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean)
                  }))}
                  placeholder="nail tech, nail art, manicure, pedicure"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Domain Settings</CardTitle>
              <CardDescription>
                Manage your website domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Domain</Label>
                <p className="font-mono text-sm">{websiteData.fullUrl}</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain (Optional)</Label>
                <Input
                  id="custom-domain"
                  placeholder="www.yourbusiness.com"
                  value={websiteData.customDomain || ''}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Custom domains are available with Pro plan
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Website Analytics</CardTitle>
              <CardDescription>
                Track your website performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Website analytics will be available once your site is published and receiving traffic.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}