'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, MapPin, User, DollarSign, Sparkles, CheckCircle, XCircle, Star, Phone, Mail } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { BookingReviewDialog } from '@/components/booking-review-dialog';
import Image from 'next/image';

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'client' | 'tech'>('client');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/auth');
        return;
      }

      const user = JSON.parse(userStr);
      setUserId(user.id);
      setUserType(user.userType);

      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();
      
      if (response.ok) {
        setBooking(data.booking);
      } else {
        console.error('Failed to fetch booking');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        alert(`Booking ${status}!`);
        fetchBookingDetails();
      } else {
        alert('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center space-y-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto border border-[#E8E8E8] flex items-center justify-center">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#E8E8E8]" strokeWidth={1} />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] mb-4 tracking-[-0.01em]">
              Booking Not Found
            </h2>
            <p className="text-base text-[#6B6B6B] font-light tracking-wide">
              This booking doesn't exist or you don't have access to it
            </p>
          </div>
          <Button 
            onClick={() => router.back()}
            className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 px-10 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isClient = userType === 'client';
  const otherParty = isClient ? booking.techProfile : booking.client;

  return (
    <div className="min-h-screen bg-white pb-28 sm:pb-32">
      {/* Elegant Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-50 backdrop-blur-md bg-white/98">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 py-4 sm:py-6 lg:py-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light group mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-500" strokeWidth={1.5} />
            Back
          </button>
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em] mb-2 sm:mb-3">
                Appointment Details
              </h1>
              <p className="text-sm sm:text-base text-[#6B6B6B] font-light tracking-wide">
                Booking #{booking.id}
              </p>
            </div>
            <Badge className={`${getStatusColor(booking.status)} text-white text-[10px] sm:text-xs tracking-[0.2em] uppercase font-light px-3 sm:px-4 py-1.5 sm:py-2`}>
              {booking.status}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8 sm:space-y-12">
            
            {/* Appointment Info */}
            <div className="border border-[#E8E8E8] p-6 sm:p-8 lg:p-10">
              <div className="mb-6 sm:mb-8">
                <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">
                  Appointment
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                  {booking.service?.name}
                </h2>
              </div>

              <div className="space-y-5 sm:space-y-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-[#8B7355] flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-1 font-light">Date</p>
                    <p className="text-lg sm:text-xl font-light text-[#1A1A1A] tracking-wide">
                      {new Date(booking.appointmentDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-[#8B7355] flex-shrink-0 mt-1" strokeWidth={1.5} />
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-1 font-light">Time</p>
                    <p className="text-lg sm:text-xl font-light text-[#1A1A1A] tracking-wide">
                      {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {booking.duration && (
                      <p className="text-sm text-[#6B6B6B] font-light mt-1">
                        Duration: {booking.duration} minutes
                      </p>
                    )}
                  </div>
                </div>

                {isClient && booking.techProfile?.location && (
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-[#8B7355] flex-shrink-0 mt-1" strokeWidth={1.5} />
                    <div>
                      <p className="text-[10px] tracking-[0.25em] uppercase text-[#6B6B6B] mb-1 font-light">Location</p>
                      <p className="text-lg sm:text-xl font-light text-[#1A1A1A] tracking-wide">
                        {booking.techProfile.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Design Preview */}
            {booking.look && (
              <div className="border border-[#E8E8E8] p-6 sm:p-8 lg:p-10">
                <div className="mb-6 sm:mb-8">
                  <p className="text-[10px] tracking-[0.35em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">
                    Design
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1A1A1A] tracking-[-0.01em]">
                    {booking.look.title}
                  </h2>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden cursor-pointer group" onClick={() => window.open(booking.look.imageUrl, '_blank')}>
                  <Image
                    src={booking.look.imageUrl}
                    alt={booking.look.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                </div>
              </div>
            )}

            {/* Notes */}
            {(booking.clientNotes || booking.techNotes) && (
              <div className="border border-[#E8E8E8] p-6 sm:p-8 lg:p-10 space-y-6">
                {booking.clientNotes && (
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-light">
                      Client Notes
                    </p>
                    <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                      {booking.clientNotes}
                    </p>
                  </div>
                )}

                {booking.techNotes && (
                  <div>
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-3 font-light">
                      Tech Notes
                    </p>
                    <p className="text-base text-[#6B6B6B] font-light leading-[1.7] tracking-wide">
                      {booking.techNotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Actions for Tech */}
            {!isClient && booking.status === 'pending' && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleBookingAction('cancelled')}
                  className="flex-1 border-[#E8E8E8] hover:border-red-500 hover:bg-red-50 hover:text-red-600 h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                >
                  <XCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
                  Decline Booking
                </Button>
                <Button
                  onClick={() => handleBookingAction('confirmed')}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
                  Confirm Booking
                </Button>
              </div>
            )}

            {!isClient && booking.status === 'confirmed' && (
              <Button
                onClick={() => handleBookingAction('completed')}
                className="w-full bg-[#1A1A1A] hover:bg-[#8B7355] text-white h-14 text-[11px] tracking-[0.25em] uppercase rounded-none font-light transition-all duration-700"
              >
                <CheckCircle className="h-5 w-5 mr-2" strokeWidth={1.5} />
                Mark as Completed
              </Button>
            )}

            {/* Review for Client */}
            {isClient && booking.status === 'completed' && !booking.hasReview && (
              <div className="border border-[#E8E8E8] p-6 sm:p-8 lg:p-10 text-center">
                <p className="text-base text-[#6B6B6B] font-light mb-6 tracking-wide">
                  How was your experience?
                </p>
                <BookingReviewDialog
                  bookingId={booking.id}
                  techName={booking.techProfile?.businessName || booking.techProfile?.user?.username || 'this tech'}
                  onReviewSubmitted={fetchBookingDetails}
                />
              </div>
            )}
          </div>

          {/* Right Column - Contact & Payment */}
          <div className="lg:col-span-1 space-y-6 sm:space-y-8">
            {/* Contact Info */}
            <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#FAFAF8]">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-6 font-light">
                {isClient ? 'Nail Technician' : 'Client'}
              </p>

              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  {otherParty?.avatar && (
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={otherParty.avatar}
                        alt={otherParty.username}
                        fill
                        className="rounded-full object-cover border-2 border-[#E8E8E8]"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-light text-[#1A1A1A] tracking-wide truncate">
                      {isClient 
                        ? (booking.techProfile?.businessName || otherParty?.username)
                        : otherParty?.username
                      }
                    </h3>
                    {isClient && booking.techProfile?.rating && (
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 fill-[#8B7355] text-[#8B7355]" strokeWidth={1.5} />
                        <span className="text-sm font-light text-[#6B6B6B]">
                          {booking.techProfile.rating} ({booking.techProfile.totalReviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isClient && booking.techProfile?.phoneNumber && (
                  <a 
                    href={`tel:${booking.techProfile.phoneNumber}`}
                    className="flex items-center gap-3 text-sm text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light"
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                    {booking.techProfile.phoneNumber}
                  </a>
                )}

                {otherParty?.email && (
                  <a 
                    href={`mailto:${otherParty.email}`}
                    className="flex items-center gap-3 text-sm text-[#1A1A1A] hover:text-[#8B7355] transition-colors duration-500 font-light"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.5} />
                    {otherParty.email}
                  </a>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border border-[#E8E8E8] p-6 sm:p-8 bg-[#FAFAF8]">
              <p className="text-[10px] tracking-[0.25em] uppercase text-[#8B7355] mb-6 font-light">
                Payment Summary
              </p>

              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <span className="text-[#6B6B6B] font-light tracking-wide">Service Price</span>
                  <span className="font-light text-[#1A1A1A]">
                    ${parseFloat(booking.servicePrice).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-base">
                  <span className="text-[#6B6B6B] font-light tracking-wide">Service Fee (12.5%)</span>
                  <span className="font-light text-[#1A1A1A]">
                    ${parseFloat(booking.serviceFee).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between text-xl pt-4 border-t border-[#E8E8E8]">
                  <span className="font-serif font-light text-[#1A1A1A]">Total</span>
                  <span className="font-serif font-light text-[#1A1A1A]">
                    ${parseFloat(booking.totalPrice).toFixed(2)}
                  </span>
                </div>

                <div className="pt-4 border-t border-[#E8E8E8]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#6B6B6B] font-light tracking-wide">Payment Status</span>
                    <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}>
                      {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </div>
                  {booking.paidAt && (
                    <p className="text-xs text-[#6B6B6B] font-light tracking-wide">
                      Paid on {new Date(booking.paidAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {!isClient && booking.paymentStatus === 'paid' && (
                  <div className="pt-4 border-t border-[#E8E8E8] bg-green-50 -mx-6 sm:-mx-8 px-6 sm:px-8 py-4 -mb-6 sm:-mb-8">
                    <p className="text-xs text-green-800 font-light leading-[1.7] tracking-wide">
                      You'll receive ${parseFloat(booking.servicePrice).toFixed(2)} after the appointment is completed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
