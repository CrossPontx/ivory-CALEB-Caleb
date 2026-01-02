'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, User, XCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';

export default function TechBookingsPage() {
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [techNotes, setTechNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      console.log('User from localStorage:', userStr ? 'Found' : 'null');
      
      if (!userStr) {
        console.error('No user found in localStorage');
        router.push('/auth');
        return;
      }

      const user = JSON.parse(userStr);
      
      const pendingRes = await fetch(`/api/bookings?status=pending&techId=${user.id}`);
      const pendingData = await pendingRes.json();
      console.log('Pending bookings response:', pendingRes.status, pendingData);
      if (pendingRes.ok) setPendingBookings(pendingData.bookings || []);

      const upcomingRes = await fetch(`/api/bookings?status=confirmed&techId=${user.id}`);
      const upcomingData = await upcomingRes.json();
      console.log('Upcoming bookings response:', upcomingRes.status, upcomingData);
      if (upcomingRes.ok) setUpcomingBookings(upcomingData.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, techNotes }),
      });

      if (response.ok) {
        alert(`Booking ${status}!`);
        setSelectedBooking(null);
        setTechNotes('');
        fetchBookings();
      } else {
        alert('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const renderPaymentSection = (booking: any) => (
    <div className="bg-[#F8F7F5] p-3 sm:p-4 border border-[#E8E8E8]">
      <div className="flex justify-between items-center mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-light tracking-wide text-[#1A1A1A]">Payment</span>
        <Badge className={booking.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}>
          <span className="text-[9px] tracking-wider uppercase font-light text-white">
            {booking.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
          </span>
        </Badge>
      </div>
      {booking.paymentStatus === 'paid' ? (
        <>
          <div className="flex justify-between text-xs sm:text-sm font-light mb-1">
            <span className="text-[#6B6B6B]">Service Price:</span>
            <span className="text-[#1A1A1A]">${booking.servicePrice}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm font-light ">
            <span className="text-[#6B6B6B]">Platform Fee:</span>
            <span className="text-[#1A1A1A]">${booking.serviceFee}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm font-light border-t border-[#E8E8E8] pt-2 mt-2">
            <span className="text-[#1A1A1A]">Total Paid:</span>
            <span className="text-[#1A1A1A] font-medium">${booking.totalPrice}</span>
          </div>
          <p className="text-[10px] sm:text-xs text-[#6B6B6B] mt-2 sm:mt-3 font-light leading-relaxed">
            You'll receive ${booking.servicePrice} after completion.
          </p>
        </>
      ) : (
        <div className="p-2.5 sm:p-3 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs sm:text-sm text-yellow-700 font-light leading-relaxed">
            ⏳ Waiting for client payment
          </p>
        </div>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 lg:pl-20">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="w-9 h-9 flex items-center justify-center hover:bg-[#F8F7F5] active:scale-95 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#1A1A1A]" strokeWidth={1} />
            </button>
            <h1 className="font-serif text-lg sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
              Bookings
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 pb-safe">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-4 sm:mb-5 grid grid-cols-2 h-auto bg-white border border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="pending"
              className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 sm:space-y-5 mt-0">
            {pendingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="py-12 sm:py-16 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-[#6B6B6B]" strokeWidth={1} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#6B6B6B] font-light">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-serif font-light tracking-tight">
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" strokeWidth={1} />
                          <span className="truncate">{booking.client?.username}</span>
                        </CardTitle>
                        <CardDescription className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light">{booking.service?.name}</CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-[9px] tracking-wider uppercase font-light flex-shrink-0">
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-light flex-wrap">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {booking.look && (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700 flex-shrink-0"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif font-light text-sm sm:text-base tracking-tight truncate">{booking.look.title}</p>
                          </div>
                        </div>
                    )}

                    {renderPaymentSection(booking)}

                    {booking.clientNotes && (
                      <div className="bg-[#F8F7F5] p-3 sm:p-4 border border-[#E8E8E8]">
                        <p className="text-xs sm:text-sm font-light mb-1.5 sm:mb-2 text-[#1A1A1A] tracking-wide">Client Notes:</p>
                        <p className="text-xs sm:text-sm text-[#6B6B6B] font-light leading-relaxed">{booking.clientNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 sm:pt-3">
                      <span className="text-xl sm:text-2xl font-light text-[#1A1A1A]">${booking.totalPrice}</span>
                      <div className="flex gap-3">
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 sm:space-y-5 mt-0">
            {upcomingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="py-12 sm:py-16 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-[#6B6B6B]" strokeWidth={1} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#6B6B6B] font-light">No upcoming appointments</p>
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-serif font-light tracking-tight">
                          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" strokeWidth={1} />
                          <span className="truncate">{booking.client?.username}</span>
                        </CardTitle>
                        <CardDescription className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light">{booking.service?.name}</CardDescription>
                      </div>
                      <Badge className="text-[9px] tracking-wider uppercase font-light flex-shrink-0">
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-light flex-wrap">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
                        <span className="text-[#1A1A1A]">{new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {booking.look && (
                        <div className="flex items-center gap-3 sm:gap-4">
                          <img
                            src={booking.look.imageUrl}
                            alt="Design"
                            className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-[#E8E8E8] cursor-pointer hover:border-[#8B7355] transition-all duration-700 flex-shrink-0"
                            onClick={() => window.open(booking.look.imageUrl, '_blank')}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-serif font-light text-sm sm:text-base tracking-tight truncate">{booking.look.title}</p>
                          </div>
                        </div>
                    )}

                    {renderPaymentSection(booking)}

                    {booking.clientNotes && (
                      <div className="bg-[#F8F7F5] p-3 sm:p-4 border border-[#E8E8E8]">
                        <p className="text-xs sm:text-sm font-light mb-1.5 sm:mb-2 text-[#1A1A1A] tracking-wide">Client Notes:</p>
                        <p className="text-xs sm:text-sm text-[#6B6B6B] font-light leading-relaxed">{booking.clientNotes}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2 sm:pt-3">
                      <span className="text-xl sm:text-2xl font-light text-[#1A1A1A]">${booking.totalPrice}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom Navigation */}
      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
