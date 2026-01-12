'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUpload } from '@/components/image-upload';
import { Loader2, Check, X, Globe, Sparkles, CreditCard, Image, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteBuilderWizardProps {
  onComplete: (websiteData: any) => void;
}

interface WebsitePreferences {
  customPrompt?: string;
  websiteImages: string[];
}

export function WebsiteBuilderWizard({ onComplete }: WebsiteBuilderWizardProps) {
  const [step, setStep] = useState(1);
  const [subdomain, setSubdomain] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [preferences, setPreferences] = useState<WebsitePreferences>({
    customPrompt: '',
    websiteImages: [],
  });
  const [isCreating, setIsCreating] = useState(false);
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

  const handleImageUpload = (url: string) => {
    setPreferences(prev => ({
      ...prev,
      websiteImages: [...prev.websiteImages, url]
    }));
  };

  const handleImageRemove = (url: string) => {
    setPreferences(prev => ({
      ...prev,
      websiteImages: prev.websiteImages.filter(img => img !== url)
    }));
  };

  const handleCreateWebsite = async () => {
    if (subdomainStatus !== 'available') {
      toast.error('Please choose an available subdomain');
      return;
    }

    if (!preferences.customPrompt || preferences.customPrompt.trim().length === 0) {
      toast.error('Please describe your website vision before creating');
      return;
    }

    if (userCredits === null || userCredits < 1) {
      toast.error('Insufficient credits. Website creation requires 1 credit.');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subdomain,
          preferences,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create website');
      }

      const websiteData = await response.json();
      toast.success('Website created successfully!');
      setUserCredits(websiteData.creditsRemaining);
      onComplete(websiteData);
    } catch (error) {
      console.error('Error creating website:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create website');
    } finally {
      setIsCreating(false);
    }
  };

  const canProceedToStep2 = subdomain.length >= 3 && subdomainStatus === 'available';
  const canProceedToStep3 = preferences.customPrompt && preferences.customPrompt.trim().length > 0;
  const canCreateWebsite = userCredits !== null && userCredits >= 1;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-12 sm:py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 border border-[#E8E8E8] bg-white flex items-center justify-center">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
          </div>
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-3 sm:mb-4 font-light">AI Website Builder</p>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] mb-4 sm:mb-6 tracking-tight leading-[1.1]">
            Create Your Professional Website
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-[#6B6B6B] font-light max-w-2xl mx-auto leading-[1.7] tracking-wide">
            Build a stunning website in minutes using AI. Showcase your work, accept bookings, and grow your business.
          </p>
        </div>
      </div>

      {/* Credits Alert */}
      {userCredits !== null && userCredits < 1 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex items-center justify-between p-4 sm:p-5 bg-blue-50 border border-blue-200">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="text-sm sm:text-base font-medium text-blue-800">
                Credits: {userCredits} • Website creation costs 1 credit
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Progress Steps */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16">
        <div className="flex items-center justify-center space-x-6 sm:space-x-8">
          <div className={`flex items-center space-x-3 ${step >= 1 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500 ${
              step >= 1 ? 'bg-[#1A1A1A] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}>
              {step > 1 ? <Check className="w-5 h-5" strokeWidth={1.5} /> : '1'}
            </div>
            <span className="text-sm sm:text-base font-light tracking-wide">Domain</span>
          </div>
          <div className={`w-12 h-px transition-all duration-500 ${step >= 2 ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`} />
          <div className={`flex items-center space-x-3 ${step >= 2 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500 ${
              step >= 2 ? 'bg-[#1A1A1A] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}>
              {step > 2 ? <Check className="w-5 h-5" strokeWidth={1.5} /> : '2'}
            </div>
            <span className="text-sm sm:text-base font-light tracking-wide">Design</span>
          </div>
          <div className={`w-12 h-px transition-all duration-500 ${step >= 3 ? 'bg-[#1A1A1A]' : 'bg-[#E8E8E8]'}`} />
          <div className={`flex items-center space-x-3 ${step >= 3 ? 'text-[#1A1A1A]' : 'text-[#6B6B6B]'}`}>
            <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500 ${
              step >= 3 ? 'bg-[#8B7355] text-white' : 'bg-[#F8F7F5] text-[#6B6B6B]'
            }`}>
              <Sparkles className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <span className="text-sm sm:text-base font-light tracking-wide">Create</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Step 1: Domain Selection */}
        {step === 1 && (
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Step 1</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                Choose Your Website Address
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                Pick a unique subdomain for your professional website
              </p>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div>
                <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 sm:mb-4 font-light">
                  Subdomain
                </Label>
                <div className="flex items-center">
                  <Input
                    placeholder="yourname"
                    value={subdomain}
                    onChange={(e) => handleSubdomainChange(e.target.value)}
                    className="flex-1 h-14 sm:h-16 text-base sm:text-lg border-[#E8E8E8] rounded-none focus:border-[#8B7355] focus:ring-0 font-light transition-all duration-300"
                  />
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-[#6B6B6B] font-light">.ivoryschoice.com</span>
                    {subdomainStatus === 'checking' && <Loader2 className="w-5 h-5 animate-spin text-[#8B7355]" />}
                    {subdomainStatus === 'available' && <Check className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                    {subdomainStatus === 'taken' && <X className="w-5 h-5 text-red-500" strokeWidth={1.5} />}
                  </div>
                </div>
                {subdomain && (
                  <p className="text-sm text-[#6B6B6B] mt-3 font-light">
                    Your website will be available at: <strong className="text-[#1A1A1A]">{subdomain}.ivoryschoice.com</strong>
                  </p>
                )}
                {subdomainStatus === 'taken' && (
                  <p className="text-sm text-red-500 mt-3 font-light">This subdomain is already taken</p>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={!canProceedToStep2}
                  className="h-12 sm:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 px-8 sm:px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
                >
                  Next: Design Options
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Design Preferences */}
        {step === 2 && (
          <div className="space-y-8 sm:space-y-12">
            {/* Custom Prompt */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Step 2A</p>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                  Describe Your Vision
                </h2>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  We have your profile info. Describe how you want your website to look and feel.
                </p>
              </div>

              <div>
                <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-4 sm:mb-6 font-light">
                  Website Style & Feel <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="How do you want your website to look and feel? For example: 'Modern and minimalist with soft colors' or 'Bold and vibrant with lots of personality' or 'Elegant and luxurious with gold accents'"
                  value={preferences.customPrompt}
                  onChange={(e) => setPreferences(prev => ({ ...prev, customPrompt: e.target.value }))}
                  rows={3}
                  className={`text-sm sm:text-base rounded-none focus:ring-0 resize-none font-light leading-[1.7] tracking-wide transition-all duration-300 ${
                    preferences.customPrompt?.trim() 
                      ? 'border-[#E8E8E8] focus:border-[#8B7355]' 
                      : 'border-red-200 focus:border-red-400'
                  }`}
                  required
                />
                <p className="text-xs text-[#6B6B6B] mt-3 font-light leading-relaxed">
                  <span className="text-red-500">*Required:</span> Describe the visual style and mood you want for your website.
                </p>
                {!preferences.customPrompt?.trim() && (
                  <p className="text-xs text-red-500 mt-2 font-light">
                    Please describe your website vision to continue
                  </p>
                )}
              </div>
            </div>

            {/* Website Images */}
            <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
              <div className="mb-8 sm:mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <Image className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                  <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Step 2B</p>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                  Website Images
                </h2>
                <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                  Add specific images you want featured on your website (optional)
                </p>
              </div>

              <div>
                <Label className="block text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-4 sm:mb-6 font-light">
                  Featured Images (Optional)
                </Label>
                <ImageUpload
                  onUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  images={preferences.websiteImages}
                  buttonText="Add Website Images"
                  multiple={true}
                />
                <p className="text-xs text-[#6B6B6B] mt-3 font-light leading-relaxed">
                  These images will be featured prominently on your website. Your portfolio images from your profile will also be included automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="h-12 sm:h-14 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-8 sm:px-10 transition-all duration-700"
              >
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)} 
                disabled={!canProceedToStep3 || !canCreateWebsite}
                className="h-12 sm:h-14 bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-700 px-8 sm:px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98]"
              >
                Next: Create Website
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Create Website */}
        {step === 3 && (
          <div className="border border-[#E8E8E8] hover:border-[#8B7355]/30 transition-all duration-700 p-8 sm:p-10 lg:p-12">
            <div className="mb-8 sm:mb-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1} />
                <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] font-light">Step 3</p>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-3 tracking-tight leading-[1.1]">
                Create Your Website
              </h2>
              <p className="text-base sm:text-lg text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                Review your choices and create your professional website
              </p>
            </div>

            <div className="space-y-8 sm:space-y-10">
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <div className="p-6 sm:p-8 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <Label className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 block font-light">Website Address</Label>
                  <p className="font-mono text-lg sm:text-xl text-[#1A1A1A] font-light">{subdomain}.ivoryschoice.com</p>
                </div>
              </div>

              {preferences.customPrompt && (
                <div className="p-6 sm:p-8 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <Label className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-3 block font-light">Website Vision</Label>
                  <p className="text-sm sm:text-base text-[#1A1A1A] font-light leading-relaxed">{preferences.customPrompt}</p>
                </div>
              )}

              {preferences.websiteImages.length > 0 && (
                <div className="p-6 sm:p-8 bg-[#F8F7F5] border border-[#E8E8E8]">
                  <Label className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-4 block font-light">Website Images</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {preferences.websiteImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-white border border-[#E8E8E8] overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Website image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 sm:p-5 bg-blue-50 border border-blue-200">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Mobile-Optimized Website</p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Your website will be fully optimized for mobile devices with all essential sections: Hero, Services, Portfolio Gallery, About, and Contact & Booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(2)}
                  className="h-12 sm:h-14 border-[#E8E8E8] hover:border-[#1A1A1A] hover:bg-transparent text-[#1A1A1A] rounded-none text-[11px] tracking-[0.25em] uppercase font-light px-8 sm:px-10 transition-all duration-700"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleCreateWebsite} 
                  disabled={isCreating}
                  className="h-12 sm:h-14 bg-[#8B7355] text-white hover:bg-[#1A1A1A] transition-all duration-700 px-8 sm:px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light hover:scale-[1.02] active:scale-[0.98] min-w-[180px]"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Website'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}