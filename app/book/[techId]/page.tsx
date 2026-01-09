'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ArrowLeft, Clock, CheckCircle2, Loader2, Sparkles, MapPin, Star, Info } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import Image from 'next/image';

const CONVENIENCE_FEE_PERCENT = 0.15; // 15% convenience fee

// Native haptic feedback
const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.haptics) {
    (window as any).webkit.messageHandlers.haptics.postMessage({ style })
  }
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.techId as string;

  const [tech, setTech] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTechDetails();
  }, [techId]);

  useEffect(() => {
    if (selectedDate) {
      generateAvailableTimes();
    }
  }, [selectedDate]);

  const fetchTechDetails = async () => {
    try {
      const response = await fetch(`/api/tech/${techId}`);
      const data = await response.json();
      if (response.ok) {
        setTech(data.tech);
        setServices(data.tech.services || []);
      }
    } catch (error) {
      console.error('Error fetching tech:', error);
    }
  };

  const generateAvailableTimes = () => {
    const times: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break;
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const timeStr = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
        times.push(timeStr);
      }
    }
    setAvailableTimes(times);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please select service, date, and time');
      return;
    }

    setLoading(true);
    triggerHaptic('medium');
    
    try {
      const appointmentDateTime = new Date(selectedDate);
      const timeMatch = selectedTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const period = timeMatch[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        appointmentDateTime.setHours(hours, minutes);
      }

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          techProfileId: parseInt(techId),
          serviceId: parseInt(selectedService),
          appointmentDate: appointmentDateTime.toISOString(),
        }),
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        alert(bookingData.error || 'Failed to create booking');
        return;
      }

      await handleStripePayment(bookingData.booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async (booking: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/create-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to create payment session');
        return;
      }

      const data = await response.json();
      triggerHaptic('success');
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  if (!tech) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] pb-40 lg:pb-28">
      {/* Header - iOS Native Style */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#E8E8E8]/80 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                triggerHaptic('light');
                router.back();
              }} 
              className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full active:scale-90 transition-all duration-150"
            >
              <ArrowLeft className="h-5 w-5 text-[#8B7355]" strokeWidth={2} />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-[15px] text-[#1A1A1A]">Book Appointment</h1>
              <p className="text-[12px] text-[#6B6B6B] truncate">{tech.businessName || tech.user?.username}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tech Info Card */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#E8E8E8]/50">
          <div className="flex items-center gap-3">
            {tech.portfolioImages?.[0] ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={tech.portfolioImages[0].imageUrl}
                  alt={tech.businessName || 'Tech'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-[#F8F7F5] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-[#8B7355]" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-medium text-[15px] text-[#1A1A1A] truncate">
                {tech.businessName || tech.user?.username}
              </h2>
              {tech.location && (
                <div className="flex items-center gap-1 text-[12px] text-[#6B6B6B]">
                  <MapPin className="w-3 h-3" strokeWidth={2} />
                  <span className="truncate">{tech.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 mt-0.5">
                <Star className="w-3 h-3 fill-[#8B7355] text-[#8B7355]" />
                <span className="text-[12px] text-[#1A1A1A] font-medium">{tech.rating || '5.0'}</span>
                <span className="text-[12px] text-[#6B6B6B]">({tech.totalReviews || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 space-y-4">
        
        {/* Service Selection */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E8E8]/50">
          <div className="px-4 py-3 border-b border-[#E8E8E8]/50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#8B7355] text-white text-[11px] font-medium flex items-center justify-center">1</div>
              <span className="text-[13px] font-medium text-[#1A1A1A]">Select Service</span>
            </div>
          </div>
          <div className="p-2">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedService(service.id.toString());
                }}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                  selectedService === service.id.toString()
                    ? 'bg-[#8B7355]/10 border-2 border-[#8B7355]'
                    : 'hover:bg-[#F8F7F5] border-2 border-transparent'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[#1A1A1A] mb-0.5">{service.name}</h3>
                    {service.description && (
                      <p className="text-[12px] text-[#6B6B6B] line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[16px] font-semibold text-[#1A1A1A]">${service.price}</p>
                    <div className="flex items-center gap-1 text-[11px] text-[#6B6B6B]">
                      <Clock className="w-3 h-3" strokeWidth={2} />
                      <span>{service.duration}min</span>
                    </div>
                  </div>
                </div>
                {selectedService === service.id.toString() && (
                  <div className="mt-2 flex items-center gap-1.5 text-[#8B7355]">
                    <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                    <span className="text-[11px] font-medium">Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Date & Time Selection */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#E8E8E8]/50">
          <div className="px-4 py-3 border-b border-[#E8E8E8]/50">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full text-[11px] font-medium flex items-center justify-center ${
                selectedService ? 'bg-[#8B7355] text-white' : 'bg-[#E8E8E8] text-[#6B6B6B]'
              }`}>2</div>
              <span className="text-[13px] font-medium text-[#1A1A1A]">Date & Time</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex justify-center mb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  triggerHaptic('light');
                  setSelectedDate(date);
                  setSelectedTime('');
                }}
                disabled={(date) => date < new Date()}
                className="rounded-xl border-0"
              />
            </div>

            {selectedDate && (
              <div className="pt-4 border-t border-[#E8E8E8]/50">
                <p className="text-[11px] tracking-[0.15em] uppercase text-[#6B6B6B] mb-3 font-medium">Available Times</p>
                <div className="grid grid-cols-4 gap-2">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedTime(time);
                      }}
                      className={`py-2.5 text-[12px] font-medium rounded-lg transition-all duration-200 active:scale-95 ${
                        selectedTime === time
                          ? 'bg-[#8B7355] text-white shadow-md'
                          : 'bg-[#F8F7F5] text-[#1A1A1A] hover:bg-[#E8E8E8]'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom - Booking Summary */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E8E8] pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Price Breakdown */}
          {selectedServiceData && (
            <div className="mb-3 pb-3 border-b border-[#E8E8E8]/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[13px] font-medium text-[#1A1A1A]">{selectedServiceData.name}</p>
                <p className="text-[13px] text-[#1A1A1A]">${parseFloat(selectedServiceData.price).toFixed(2)}</p>
              </div>
              
              {/* Fee breakdown */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <p className="text-[12px] text-[#6B6B6B]">Convenience fee (15%)</p>
                  <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-[#8B7355] cursor-help" strokeWidth={2} />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#1A1A1A] text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                      This fee helps us maintain the platform, provide customer support, and ensure secure payments.
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1A1A1A]" />
                    </div>
                  </div>
                </div>
                <p className="text-[12px] text-[#6B6B6B]">
                  ${(parseFloat(selectedServiceData.price) * CONVENIENCE_FEE_PERCENT).toFixed(2)}
                </p>
              </div>
              
              {/* Total */}
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#E8E8E8]">
                <p className="text-[14px] font-semibold text-[#1A1A1A]">Total</p>
                <p className="text-[18px] font-semibold text-[#1A1A1A]">
                  ${(parseFloat(selectedServiceData.price) * (1 + CONVENIENCE_FEE_PERCENT)).toFixed(2)}
                </p>
              </div>
              
              {/* Date/Time info */}
              <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B] mt-2">
                {selectedDate && (
                  <span>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                )}
                {selectedTime && (
                  <>
                    <span>•</span>
                    <span>{selectedTime}</span>
                  </>
                )}
              </div>
            </div>
          )}
          
          <Button
            onClick={handleBooking}
            disabled={loading || !selectedService || !selectedDate || !selectedTime}
            className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-12 text-[13px] font-medium rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Continue to Payment'
            )}
          </Button>
          
          <p className="text-[10px] text-center text-[#6B6B6B] mt-2">
            Secure payment via Stripe • Booking confirmed after payment
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
