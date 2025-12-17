'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Clock, DollarSign } from 'lucide-react';

export default function BookAppointmentPage() {
  const router = useRouter();
  const params = useParams();
  const techId = params.techId as string;

  const [tech, setTech] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [myDesigns, setMyDesigns] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDesign, setSelectedDesign] = useState<string>('');
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
    // Generate time slots from 9 AM to 6 PM in 30-minute intervals
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

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please select service, date, and time');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));

      // Step 1: Create booking
      const bookingResponse = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          techProfileId: parseInt(techId),
          serviceId: parseInt(selectedService),
          lookId: selectedDesign ? parseInt(selectedDesign) : null,
          appointmentDate: appointmentDateTime.toISOString(),
          clientNotes,
        }),
      });

      const bookingData = await bookingResponse.json();
      if (!bookingResponse.ok) {
        alert(bookingData.error || 'Failed to create booking');
        return;
      }

      // Step 2: Create Stripe checkout session
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

      // Step 3: Redirect to Stripe Checkout
      window.location.href = checkoutData.url;
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (!tech) {
    return <div className="p-4">Loading...</div>;
  }

  const selectedServiceData = services.find(s => s.id.toString() === selectedService);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()} className="hover:bg-[#F8F7F5]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
              BOOK APPOINTMENT
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">

        {/* Tech Info */}
        <Card className="mb-6 border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">{tech.businessName || tech.user?.username}</CardTitle>
            <CardDescription className="text-[#6B6B6B]">{tech.location}</CardDescription>
          </CardHeader>
        </Card>

        {/* Service Selection */}
        <Card className="mb-6 border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">Select Service</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedService} onValueChange={setSelectedService}>
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center space-x-2 p-3 border border-[#E8E8E8] rounded-lg hover:bg-[#F8F7F5] hover:border-[#8B7355] transition-all">
                    <RadioGroupItem value={service.id.toString()} id={`service-${service.id}`} />
                    <Label htmlFor={`service-${service.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{service.name}</div>
                          <div className="text-sm text-gray-500">{service.description}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {service.price}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-3 w-3" />
                            {service.duration} min
                          </div>
                        </div>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Design Selection */}
        <Card className="mb-6 border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">Select Design (Optional)</CardTitle>
            <CardDescription className="text-[#6B6B6B]">Choose a design you want the tech to recreate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${!selectedDesign ? 'border-[#1A1A1A]' : 'border-[#E8E8E8] hover:border-[#8B7355]'}`}
                onClick={() => setSelectedDesign('')}
              >
                <div className="aspect-square bg-[#F8F7F5] rounded flex items-center justify-center text-sm text-[#6B6B6B]">
                  No design
                </div>
              </div>
              {myDesigns.map((design) => (
                <div
                  key={design.id}
                  className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${selectedDesign === design.id.toString() ? 'border-[#1A1A1A]' : 'border-[#E8E8E8] hover:border-[#8B7355]'}`}
                  onClick={() => setSelectedDesign(design.id.toString())}
                >
                  <img
                    src={design.imageUrl}
                    alt={design.title}
                    className="w-full aspect-square object-cover rounded"
                  />
                  <p className="text-xs mt-1 truncate">{design.title}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Date & Time Selection */}
        <Card className="mb-6 border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">Select Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {selectedDate && (
              <div>
                <Label>Time</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="mb-6 border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">Additional Notes</CardTitle>
            <CardDescription className="text-[#6B6B6B]">Any special requests or information for the nail tech</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="E.g., allergies, preferred colors, modifications to the design..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Summary & Book */}
        <Card className="border-[#E8E8E8] shadow-sm">
          <CardHeader>
            <CardTitle className="font-serif text-lg font-light tracking-tight">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedServiceData && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-semibold">{selectedServiceData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-semibold">{selectedServiceData.duration} minutes</span>
                </div>
                <div className="border-t border-[#E8E8E8] pt-3 mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Service Price:</span>
                    <span className="font-medium">${parseFloat(selectedServiceData.price).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6B6B6B]">Service Fee (12.5%):</span>
                    <span className="font-medium">${(parseFloat(selectedServiceData.price) * 0.125).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-[#E8E8E8] pt-2">
                    <span>Total:</span>
                    <span>${(parseFloat(selectedServiceData.price) * 1.125).toFixed(2)}</span>
                  </div>
                </div>
              </>
            )}
            {selectedDate && selectedTime && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date & Time:</span>
                <span className="font-semibold">
                  {selectedDate.toLocaleDateString()} at {selectedTime}
                </span>
              </div>
            )}
            <Button
              className="w-full mt-4 bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all"
              size="lg"
              onClick={handleBooking}
              disabled={loading || !selectedService || !selectedDate || !selectedTime}
            >
              {loading ? 'Processing...' : 'Continue to Payment'}
            </Button>
            <p className="text-xs text-center text-[#6B6B6B] mt-2">
              You'll be redirected to secure payment. Booking will be sent to the nail tech after payment.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
