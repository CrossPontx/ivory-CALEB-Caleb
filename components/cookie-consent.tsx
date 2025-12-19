'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show popup after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('cookie-consent', 'all');
    closePopup();
  };

  const handleRejectAll = () => {
    localStorage.setItem('cookie-consent', 'essential');
    closePopup();
  };

  const handleSetPreferences = () => {
    // For now, just accept all. You can expand this later with a preferences modal
    localStorage.setItem('cookie-consent', 'custom');
    closePopup();
  };

  const closePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-[100] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={closePopup}
      />

      {/* Cookie Consent Popup */}
      <div 
        className={`fixed bottom-0 left-0 right-0 md:bottom-6 md:left-6 md:right-auto md:max-w-md z-[101] transition-all duration-300 ${
          isClosing ? 'translate-y-full md:translate-y-0 md:translate-x-[-120%] opacity-0' : 'translate-y-0 md:translate-x-0 opacity-100'
        }`}
      >
        <div className="bg-white border-t md:border border-[#E8E8E8] md:shadow-2xl p-6 md:p-8 relative">
          {/* Close button - desktop only */}
          <button
            onClick={closePopup}
            className="hidden md:block absolute top-4 right-4 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" strokeWidth={1} />
          </button>

          {/* Content */}
          <div className="space-y-4 md:space-y-6">
            <div>
              <h3 className="font-serif text-lg md:text-xl font-light text-[#1A1A1A] tracking-tight mb-3">
                Cookie Preferences
              </h3>
              <p className="text-xs md:text-sm text-[#6B6B6B] leading-relaxed font-light">
                Ivory's Choice uses cookies and similar technologies for analytics, to personalize your experience, 
                and for advertising purposes. You have the right to accept or reject all cookies. 
                <button 
                  onClick={handleSetPreferences}
                  className="text-[#8B7355] hover:text-[#1A1A1A] underline ml-1 transition-colors"
                >
                  Learn more
                </button>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2 md:gap-3">
              <Button
                onClick={handleAcceptAll}
                className="w-full bg-[#1A1A1A] text-white hover:bg-[#8B7355] transition-all duration-300 h-11 md:h-12 text-xs tracking-widest uppercase rounded-none font-light"
              >
                Accept All
              </Button>
              <Button
                onClick={handleRejectAll}
                variant="outline"
                className="w-full border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all duration-300 h-11 md:h-12 text-xs tracking-widest uppercase rounded-none font-light"
              >
                Reject All
              </Button>
              <button
                onClick={handleSetPreferences}
                className="w-full text-xs tracking-wider uppercase text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors font-light py-2"
              >
                Set Cookie Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
