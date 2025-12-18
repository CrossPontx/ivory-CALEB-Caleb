'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Clock, DollarSign, Calendar as CalendarIcon, Image as ImageIcon, CheckCircle2, Loader2 } from 'lucide-react';

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.techId as string;

  const [tech, setTech] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [clientNotes, setClientNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTechDetails();
    fetchMyDesigns();
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

  const fetchMyDesigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/looks?my=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setMyDesigns(data.looks || []);
      }
    } catch (error) {
      console.error('Error fetching designs:', error);
    }
  };

  const generateAvailableTimes = () => {
    const times: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeStr);
      }
    }
    setAvailableTimes(times);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      
      // Create a look for this uploaded image
      const lookResponse = await fetch('/api/looks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Uploaded Design - ${new Date().toLocaleDateString()}`,
          imageUrl: uploadData.url,
          isPublic: false,
        }),
      });

      if (!lookResponse.ok) {
        throw new Error('Failed to save design');
      }

      const lookData = await lookResponse.json();
      setUploadedImage(uploadData.url);
      setSelectedDesign(lookData.look.id.toString());
      
      // Clear any previously selected design from gallery
      setMyDesigns([lookData.look, ...myDesigns]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please select service, date, and time');
      return;
    }

    if (!selectedDesign && !uploadedImage) {
      alert('Please select or upload a design for your appointment');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          techProfileId: parseInt(techId),
          serviceId: parseInt(selectedService),
          lookId: parseInt(selectedDesign),
          appointmentDate: appointmentDateTime.toISOString(),
          clientNotes,
        }),
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        alert(bookingData.error || 'Failed to create booking');
        return;
      }

      const checkoutResponse = await fetch('/api/stripe/create-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: bookingData.booking.id,
        }),
      });

      const checkoutData = await checkoutResponse.json();
      if (!checkoutResponse.ok) {
        alert(checkoutData.error || 'Failed to create payment session');
        return;
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!tech) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Loading</p>
        </div>
      </div>
    );
  }

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-[#E8E8E8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-xs tracking-widest uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-300 mb-6 font-light group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Back
          </button>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-[#1A1A1A] tracking-tight">
            Book Appointment
          </h1>
          <p className="text-sm sm:text-base text-[#6B6B6B] mt-3 font-light">
            Reserve your session with {tech.businessName || tech.user?.username}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-12 sm:py-16 lg:py-20">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            
            {/* Service Selection */}
            <div>
              <div className="mb-6">
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Step 1</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                  Select Service
                </h2>
              </div>
              <RadioGroup value={selectedService} onValueChange={setSelectedService}>
                <div className="space-y-4">
                  {services.map((service) => (
                    <label
                      key={service.id}
                      htmlFor={`service-${service.id}`}
                      className={`block border p-6 sm:p-8 cursor-pointer transition-all duration-500 group ${
                        selectedService === service.id.toString()
                          ? 'border-[#8B7355] bg-[#FAFAF8]'
                          : 'border-[#E8E8E8] hover:border-[#8B7355]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <RadioGroupItem value={service.id.toString()} id={`service-${service.id}`} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-light text-[#1A1A1A] tracking-tight mb-2">
                                {service.name}
                              </h3>
                              <p className="text-sm text-[#6B6B6B] font-light leading-relaxed">
                                {service.description}
                              </p>
                            </div>
                            <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-5 w-5 text-[#8B7355]" />
                                <span className="text-xl sm:text-2xl font-light text-[#1A1A1A]">{service.price}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-[#6B6B6B] font-light">
                                <Clock className="h-4 w-4" />
                                <span>{service.duration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Design Selection */}
            <div>
              <div className="mb-6">
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Step 2</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                  Select Design
                  <span className="text-red-500 ml-2">*</span>
                </h2>
                <p className="text-sm text-[#6B6B6B] mt-2 font-light">
                  Choose a design you want the tech to recreate (required)
                </p>
              </div>

              {/* Upload Option */}
              <div className="mb-6 p-6 border-2 border-dashed border-[#8B7355]/30 bg-[#FAFAF8] hover:border-[#8B7355] transition-all duration-500">
                <label htmlFor="design-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-white border border-[#E8E8E8] flex items-center justify-center">
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 text-[#8B7355] animate-spin" />
                      ) : (
                        <svg className="h-8 w-8 text-[#8B7355]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-light text-[#1A1A1A] mb-1">
                        {uploadingImage ? 'Uploading...' : 'Upload Your Design'}
                      </p>
                      <p className="text-xs text-[#6B6B6B] font-light">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </div>
                  <input
                    id="design-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Design Gallery */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {myDesigns.map((design) => (
                  <button
                    key={design.id}
                    onClick={() => {
                      setSelectedDesign(design.id.toString());
                      setUploadedImage('');
                    }}
                    className={`border-2 p-4 transition-all duration-500 group ${
                      selectedDesign === design.id.toString()
                        ? 'border-[#8B7355] bg-[#FAFAF8]'
                        : 'border-[#E8E8E8] hover:border-[#8B7355]'
                    }`}
                  >
                    <div className="aspect-square overflow-hidden mb-3 relative">
                      <img
                        src={design.imageUrl}
                        alt={design.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {selectedDesign === design.id.toString() && (
                        <div className="absolute inset-0 bg-[#8B7355]/20 flex items-center justify-center">
                          <CheckCircle2 className="w-8 h-8 text-[#8B7355]" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-[#1A1A1A] font-light truncate">{design.title}</p>
                  </button>
                ))}
              </div>

              {myDesigns.length === 0 && !uploadedImage && (
                <div className="text-center py-8 border border-[#E8E8E8] mt-4">
                  <p className="text-sm text-[#6B6B6B] font-light">
                    No saved designs yet. Upload an image or create one in the app.
                  </p>
                </div>
              )}
            </div>

            {/* Date & Time Selection */}
            <div>
              <div className="mb-6">
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Step 3</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                  Select Date & Time
                </h2>
              </div>
              <div className="border border-[#E8E8E8] p-6 sm:p-8 space-y-6">
                <div>
                  <Label className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-4 block font-light">
                    Date
                  </Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border-0"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <Label className="text-xs tracking-[0.2em] uppercase text-[#1A1A1A] mb-4 block font-light">
                      Time
                    </Label>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-3 text-sm font-light transition-all duration-300 ${
                            selectedTime === time
                              ? 'bg-[#1A1A1A] text-white'
                              : 'border border-[#E8E8E8] text-[#1A1A1A] hover:border-[#8B7355]'
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

            {/* Notes */}
            <div>
              <div className="mb-6">
                <p className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-2 font-light">Step 4</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] tracking-tight">
                  Additional Notes
                </h2>
                <p className="text-sm text-[#6B6B6B] mt-2 font-light">
                  Any special requests or information for the nail tech
                </p>
              </div>
              <Textarea
                placeholder="E.g., allergies, preferred colors, modifications to the design..."
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                rows={5}
                className="border-[#E8E8E8] focus:border-[#8B7355] font-light"
              />
            </div>
          </div>

          {/* Right Column - Summary (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-32">
              <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#FAFAF8]">
                <h3 className="text-xs tracking-[0.3em] uppercase text-[#8B7355] mb-6 font-light">
                  Booking Summary
                </h3>
                
                <div className="space-y-4 mb-6">
                  {selectedServiceData && (
                    <>
                      <div className="pb-4 border-b border-[#E8E8E8]">
                        <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Service</p>
                        <p className="text-base font-light text-[#1A1A1A]">{selectedServiceData.name}</p>
                      </div>
                      <div className="pb-4 border-b border-[#E8E8E8]">
                        <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Duration</p>
                        <p className="text-base font-light text-[#1A1A1A]">{selectedServiceData.duration} minutes</p>
                      </div>
                    </>
                  )}
                  
                  {selectedDate && selectedTime && (
                    <div className="pb-4 border-b border-[#E8E8E8]">
                      <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Date & Time</p>
                      <p className="text-base font-light text-[#1A1A1A]">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-base font-light text-[#1A1A1A] mt-1">{selectedTime}</p>
                    </div>
                  )}

                  {selectedServiceData && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B6B6B] font-light">Service Price</span>
                        <span className="font-light text-[#1A1A1A]">
                          ${parseFloat(selectedServiceData.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B6B6B] font-light">Service Fee (12.5%)</span>
                        <span className="font-light text-[#1A1A1A]">
                          ${(parseFloat(selectedServiceData.price) * 0.125).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg pt-3 border-t border-[#E8E8E8]">
                        <span className="font-light text-[#1A1A1A]">Total</span>
                        <span className="font-light text-[#1A1A1A]">
                          ${(parseFloat(selectedServiceData.price) * 1.125).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedDesign && (
                    <div className="pb-4 border-b border-[#E8E8E8]">
                      <p className="text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 font-light">Selected Design</p>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-light text-[#1A1A1A]">Design attached</p>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleBooking}
                  disabled={loading || !selectedService || !selectedDate || !selectedTime || !selectedDesign}
                  className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all duration-500 h-12 text-xs tracking-widest uppercase rounded-none font-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Continue to Payment'}
                </Button>
                
                {!selectedDesign && (
                  <p className="text-xs text-center text-red-500 mt-2 font-light">
                    Please select or upload a design to continue
                  </p>
                )}
                
                <p className="text-xs text-center text-[#6B6B6B] mt-4 font-light leading-relaxed">
                  Secure payment via Stripe. Your booking will be confirmed after payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
