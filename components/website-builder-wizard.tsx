'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, X, Globe, Sparkles, CreditCard, User, MapPin, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteBuilderWizardProps {
  onComplete: (websiteData: any) => void;
}

interface TechProfile {
  businessName?: string;
  location?: string;
  bio?: string;
  phoneNumber?: string;
  instagramHandle?: string;
  services: Array<{
    name: string;
    description?: string;
    price: string;
    duration?: number;
  }>;
  portfolioImages: Array<{
    imageUrl: string;
    caption?: string;
  }>;
}

export function WebsiteBuilderWizard({ onComplete }: WebsiteBuilderWizardProps) {
  const [subdomain, setSubdomain] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [isCreating, setIsCreating] = useState(false);
  const [creationProgress, setCreationProgress] = useState(0);
  const [creationStage, setCreationStage] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [techProfile, setTechProfile] = useState<TechProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Load user profile and credits on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load user status (credits)
        const statusResponse = await fetch('/api/user/status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setUserCredits(statusData.credits);
        }

        // Load tech profile
        const profileResponse = await fetch('/api/tech/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setTechProfile(profileData);
          
          // Auto-suggest subdomain based on business name or username
          if (profileData.businessName) {
            const suggested = profileData.businessName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '')
              .substring(0, 20);
            setSubdomain(suggested);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    loadUserData();
  }, []);

  // Check subdomain availability with debounce
  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainStatus('idle');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSubdomainStatus('checking');
      try {
        const response = await fetch(`/api/subdomains/check?subdomain=${encodeURIComponent(subdomain)}`);
        const data = await response.json();
        
        if (data.available) {
          setSubdomainStatus('available');
        } else {
          setSubdomainStatus('taken');
        }
      } catch (error) {
        console.error('Error checking subdomain:', error);
        setSubdomainStatus('idle');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [subdomain]);

  const handleSubdomainChange = (value: string) => {
    // Clean and validate subdomain
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(cleaned);
  };

  const handleCancelCreation = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsCreating(false);
      setCreationProgress(0);
      setCreationStage('');
      toast.info('Website creation cancelled. No credits were charged.');
    }
  };

  const handleCreateWebsite = async () => {
    if (subdomainStatus !== 'available') {
      toast.error('Please choose an available subdomain');
      return;
    }

    if (userCredits === null || userCredits < 1) {
      toast.error('Insufficient credits. Website creation requires 1 credit.');
      return;
    }

    if (!techProfile) {
      toast.error('Unable to load your profile information. Please try again.');
      return;
    }

    setIsCreating(true);
    setCreationProgress(0);
    setCreationStage('Initializing...');
    
    // Create AbortController for cancellation
    const controller = new AbortController();
    setAbortController(controller);
    
    // Simulate progress stages
    const progressStages = [
      { progress: 10, stage: 'Analyzing your profile...', duration: 1000 },
      { progress: 25, stage: 'Connecting to V0 AI...', duration: 2000 },
      { progress: 40, stage: 'Generating website structure...', duration: 3000 },
      { progress: 60, stage: 'Creating beautiful design...', duration: 4000 },
      { progress: 80, stage: 'Optimizing for mobile...', duration: 2000 },
      { progress: 95, stage: 'Finalizing your website...', duration: 1000 },
    ];

    // Start progress animation
    let currentStageIndex = 0;
    const progressInterval = setInterval(() => {
      if (currentStageIndex < progressStages.length) {
        const stage = progressStages[currentStageIndex];
        setCreationProgress(stage.progress);
        setCreationStage(stage.stage);
        currentStageIndex++;
      }
    }, 3000);

    try {
      // Create AbortController for timeout handling - increased to 3 minutes
      const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          // Use profile data automatically - no custom preferences needed
          preferences: {
            customPrompt: `Create a professional, modern nail technician website that showcases my services and portfolio. Use a clean, elegant design that builds trust and makes it easy for clients to book appointments.`,
            websiteImages: [], // Will use portfolio images from profile
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        
        // Handle cancellation specifically
        if (response.status === 499 || error.cancelled) {
          // Don't show error for user-initiated cancellation
          return;
        }
        
        throw new Error(error.error || 'Failed to create website');
      }

      const websiteData = await response.json();
      
      // Complete the progress
      setCreationProgress(100);
      setCreationStage('Website created successfully!');
      
      // Small delay to show completion
      setTimeout(() => {
        toast.success('Website created successfully!');
        setUserCredits(websiteData.creditsRemaining);
        onComplete(websiteData);
      }, 500);
      
    } catch (error) {
      console.error('Error creating website:', error);
      clearInterval(progressInterval);
      
      if (error instanceof Error && error.name === 'AbortError') {
        // Check if it was user cancellation or timeout
        if (controller.signal.aborted) {
          toast.info('Website creation was cancelled. No credits were charged.');
        } else {
          toast.error('Website creation timed out. The V0 AI service is experiencing high demand. Please try again in a few minutes.');
        }
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to create website');
      }
    } finally {
      setAbortController(null);
      setTimeout(() => {
        setIsCreating(false);
        setCreationProgress(0);
        setCreationStage('');
      }, 1000);
    }
  };

  const canCreateWebsite = subdomain.length >= 3 && 
                          subdomainStatus === 'available' && 
                          userCredits !== null && 
                          userCredits >= 1 &&
                          techProfile;

  if (isLoadingProfile) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8B7355] mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-[#6B6B6B] font-light">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">AI Website Builder</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight leading-[1.1]">
            Create Your Professional Website
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] font-light max-w-3xl mx-auto leading-[1.7] tracking-wide">
            We'll use your profile information to create a stunning website automatically. Just choose your domain name.
          </p>
        </div>
      </div>

      {/* Credits Alert */}
      {userCredits !== null && userCredits < 1 && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <Alert className="border-red-200 bg-red-50">
            <CreditCard className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Insufficient Credits:</strong> Website creation requires 1 credit. You have {userCredits} credits remaining.
              <Button variant="link" className="p-0 h-auto text-red-800 underline ml-1">
                Buy credits
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Credits Display */}
      {userCredits !== null && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between p-4 sm:p-5 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-blue-800">
                Credits: {userCredits} • Website creation costs 1 credit
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Domain Selection */}
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10 shadow-sm">
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
                <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Website Domain</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                Choose Your Website Address
              </h2>
              <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                Pick a unique domain for your professional website
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 font-light">
                  Subdomain
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="yourname"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="flex-1 h-12 sm:h-14 text-base border-[#E8E8E8] rounded-lg focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355]/20 font-light transition-all duration-300"
                  />
                  <div className="flex items-center gap-2">
                    {subdomainStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-[#8B7355]" strokeWidth={1.5} />}
                    {subdomainStatus === 'available' && <Check className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                    {subdomainStatus === 'taken' && <X className="w-5 h-5 text-red-500" strokeWidth={1.5} />}
                  </div>
                </div>
                <p className="text-sm text-[#6B6B6B] mt-2 font-light">
                  .ivoryschoice.com
                </p>
                {subdomain && (
                  <p className="text-sm text-[#6B6B6B] mt-3 font-light">
                    Your website: <strong className="text-[#1A1A1A]">{subdomain}.ivoryschoice.com</strong>
                  </p>
                )}
                {subdomainStatus === 'taken' && (
                  <p className="text-sm text-red-500 mt-2 font-light">This domain is already taken</p>
                )}
              </div>

              <div className="pt-4">
                {isCreating ? (
                  <div className="w-full space-y-4">
                    {/* Progress Bar */}
                    <div className="w-full bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg overflow-hidden">
                      <div 
                        className="h-3 bg-gradient-to-r from-[#8B7355] to-[#6B5B47] transition-all duration-1000 ease-out"
                        style={{ width: `${creationProgress}%` }}
                      />
                    </div>
                    
                    {/* Loading Animation */}
                    <div className="flex items-center justify-center p-6 bg-gradient-to-br from-[#F8F7F5] to-white border border-[#E8E8E8] rounded-lg">
                      <div className="text-center">
                        {/* Animated Sparkles */}
                        <div className="relative mb-4">
                          <div className="w-16 h-16 mx-auto relative">
                            <div className="absolute inset-0 rounded-full border-4 border-[#8B7355]/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#8B7355] animate-spin"></div>
                            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#6B5B47] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-[#8B7355] animate-pulse" strokeWidth={1.5} />
                          </div>
                        </div>
                        
                        {/* Progress Text */}
                        <h3 className="font-serif text-lg font-light text-[#1A1A1A] mb-2 tracking-tight">
                          Creating Your Website
                        </h3>
                        <p className="text-sm text-[#6B6B6B] font-light mb-3 animate-pulse">
                          {creationStage}
                        </p>
                        <p className="text-xs text-[#8B7355] font-light">
                          {creationProgress}% Complete
                        </p>
                        
                        {/* Cancel Button */}
                        <div className="mt-4">
                          <Button
                            onClick={handleCancelCreation}
                            variant="outline"
                            size="sm"
                            className="text-xs text-[#6B6B6B] border-[#E8E8E8] hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
                          >
                            <X className="w-3 h-3 mr-1" strokeWidth={1.5} />
                            Cancel
                          </Button>
                        </div>
                        
                        {/* Floating Elements Animation */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-[#8B7355]/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}></div>
                          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-[#6B5B47]/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}></div>
                          <div className="absolute bottom-1/3 left-1/3 w-1 h-1 bg-[#8B7355]/50 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tips */}
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 text-center font-light">
                        💡 <strong>Tip:</strong> V0 AI is analyzing your profile and creating a custom website design. This process can take 1-3 minutes depending on server load.
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={handleCreateWebsite} 
                    disabled={!canCreateWebsite}
                    className="w-full h-12 sm:h-14 bg-gradient-to-br from-[#8B7355] to-[#6B5B47] hover:from-[#1A1A1A] hover:to-[#2A2A2A] text-white rounded-lg text-[11px] tracking-[0.25em] uppercase font-light transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" strokeWidth={1.5} />
                    Create My Website
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Profile Preview */}
          {techProfile && (
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="mb-6 sm:mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Your Profile</p>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                  Website Content
                </h2>
                <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  We'll use this information to create your website
                </p>
              </div>

              <div className="space-y-4">
                {techProfile.businessName && (
                  <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                    <div className="w-8 h-8 bg-[#8B7355]/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-[#8B7355]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide">Business Name</p>
                      <p className="text-sm text-[#1A1A1A] font-light">{techProfile.businessName}</p>
                    </div>
                  </div>
                )}

                {techProfile.location && (
                  <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                    <div className="w-8 h-8 bg-[#8B7355]/10 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#8B7355]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide">Location</p>
                      <p className="text-sm text-[#1A1A1A] font-light">{techProfile.location}</p>
                    </div>
                  </div>
                )}

                {techProfile.phoneNumber && (
                  <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                    <div className="w-8 h-8 bg-[#8B7355]/10 rounded-full flex items-center justify-center">
                      <Phone className="w-4 h-4 text-[#8B7355]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide">Phone</p>
                      <p className="text-sm text-[#1A1A1A] font-light">{techProfile.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {techProfile.instagramHandle && (
                  <div className="flex items-center gap-3 p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                    <div className="w-8 h-8 bg-[#8B7355]/10 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-[#8B7355]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide">Instagram</p>
                      <p className="text-sm text-[#1A1A1A] font-light">@{techProfile.instagramHandle}</p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                  <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide mb-2">Services</p>
                  <p className="text-sm text-[#1A1A1A] font-light">
                    {techProfile.services.length} service{techProfile.services.length !== 1 ? 's' : ''} configured
                  </p>
                </div>

                <div className="p-3 bg-[#F8F7F5] border border-[#E8E8E8] rounded-lg">
                  <p className="text-xs text-[#6B6B6B] font-light uppercase tracking-wide mb-2">Portfolio</p>
                  <p className="text-sm text-[#1A1A1A] font-light">
                    {techProfile.portfolioImages.length} portfolio image{techProfile.portfolioImages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Automatic Website Creation</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your website will include all essential sections: Hero, Services, Portfolio, About, and Contact with booking functionality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}