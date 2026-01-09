'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, User, XCircle, CheckCircle2, ArrowLeft, AlertTriangle, MessageCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { toast } from 'sonner';

export default function TechBookingsPage() {
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [actionType, setActionType] = useState<'cancel' | 'no_show' | 'complete' | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/auth');
        return;
      }

      const user = JSON.parse(userStr);
      
      const [pendingRes, upcomingRes, pastRes] = await Promise.all([
        fetch(`/api/bookings?status=pending&techId=${user.id}`),
        fetch(`/api/bookings?status=confirmed&techId=${user.id}`),
        fetch(`/api/bookings?status=completed,cancelled,no_show&techId=${user.id}`),
      ]);

      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingBookings(data.bookings || []);
      }
      if (upcomingRes.ok) {
        const data = await upcomingRes.json();
        setUpcomingBookings(data.bookings || []);
      }
      if (pastRes.ok) {
        const data = await pastRes.json();
        setPastBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingAction = async () => {
    if (!selectedBooking || !actionType) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          status: actionType === 'cancel' ? 'cancelled' : actionType,
          cancellationReason: actionType === 'cancel' ? cancellationReason : undefined,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        const actionMessages = {
          cancel: 'Booking cancelled',
          no_show: data.noShowFeeCharged 
            ? `Client marked as no-show. Fee of $${data.noShowFeeAmount} charged.`
            : 'Client marked as no-show',
          complete: 'Booking marked as complete',
        };
        toast.success(actionMessages[actionType]);
        setSelectedBooking(null);
        setActionType(null);
        setCancellationReason('');
        fetchBookings();
      } else {
        toast.error(data.error || 'Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const openActionDialog = (booking: any, action: 'cancel' | 'no_show' | 'complete') => {
    setSelectedBooking(booking);
    setActionType(action);
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
          <div className="flex justify-between text-xs sm:text-sm font-light">
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

  const renderBookingCard = (booking: any, showActions: boolean = false) => (
    <Card key={booking.id} className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all duration-700">
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2 font-serif font-light tracking-tight">
              <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" strokeWidth={1} />
              <span className="truncate">{booking.client?.username}</span>
            </CardTitle>
            <CardDescription className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light">
              {booking.service?.name}
            </CardDescription>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-[9px] tracking-wider uppercase font-light flex-shrink-0 ${
              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              booking.status === 'no_show' ? 'bg-orange-100 text-orange-700' :
              booking.status === 'completed' ? 'bg-blue-100 text-blue-700' : ''
            }`}
          >
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-light flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
            <span className="text-[#1A1A1A]">
              {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#6B6B6B]" strokeWidth={1} />
            <span className="text-[#1A1A1A]">
              {new Date(booking.appointmentDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
            </span>
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

        {/* No-show fee info if charged */}
        {booking.noShowFeeCharged && (
          <div className="bg-orange-50 p-3 sm:p-4 border border-orange-200">
            <p className="text-xs sm:text-sm font-medium text-orange-700 mb-1">No-Show Fee Charged</p>
            <p className="text-xs text-orange-600">${booking.noShowFeeAmount} charged to client</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2 sm:pt-3">
          <span className="text-xl sm:text-2xl font-light text-[#1A1A1A]">${booking.totalPrice}</span>
          
          {showActions && booking.status === 'confirmed' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/booking/${booking.id}`)}
                className="h-9 text-[11px] border-[#E8E8E8]"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openActionDialog(booking, 'complete')}
                className="h-9 text-[11px] border-green-300 text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openActionDialog(booking, 'no_show')}
                className="h-9 text-[11px] border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                No-Show
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openActionDialog(booking, 'cancel')}
                className="h-9 text-[11px] border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-24 lg:pl-20">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-md border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center justify-between">
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/tech/availability')}
              className="h-9 text-[11px] border-[#E8E8E8]"
            >
              <Calendar className="w-3.5 h-3.5 mr-1.5" strokeWidth={2} />
              Availability
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 py-5 sm:py-8 pb-safe">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full mb-4 sm:mb-5 grid grid-cols-3 h-auto bg-white border border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="pending"
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="past"
              className="text-[9px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.2em] uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] data-[state=active]:bg-[#F8F7F5] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-700 font-light"
            >
              Past ({pastBookings.length})
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
              pendingBookings.map((booking) => renderBookingCard(booking, false))
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
              upcomingBookings.map((booking) => renderBookingCard(booking, true))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 sm:space-y-5 mt-0">
            {pastBookings.length === 0 ? (
              <Card className="border-[#E8E8E8] bg-white shadow-sm">
                <CardContent className="py-12 sm:py-16 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-5 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                    <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-[#6B6B6B]" strokeWidth={1} />
                  </div>
                  <p className="text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#6B6B6B] font-light">No past appointments</p>
                </CardContent>
              </Card>
            ) : (
              pastBookings.map((booking) => renderBookingCard(booking, false))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => { setActionType(null); setSelectedBooking(null); setCancellationReason(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif font-light">
              {actionType === 'cancel' && 'Cancel Booking'}
              {actionType === 'no_show' && 'Mark as No-Show'}
              {actionType === 'complete' && 'Complete Booking'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'cancel' && 'Are you sure you want to cancel this booking? The client will be notified.'}
              {actionType === 'no_show' && (
                selectedBooking?.techProfile?.noShowFeeEnabled 
                  ? `The client will be charged a ${selectedBooking?.techProfile?.noShowFeePercent || 50}% no-show fee.`
                  : 'The client will be notified that they missed their appointment.'
              )}
              {actionType === 'complete' && 'Mark this appointment as completed? The client will be asked to leave a review.'}
            </DialogDescription>
          </DialogHeader>
          
          {actionType === 'cancel' && (
            <div className="py-4">
              <label className="text-[11px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-2 block font-light">
                Reason (optional)
              </label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Let the client know why..."
                className="w-full h-24 px-3 py-2 text-sm border border-[#E8E8E8] rounded-lg resize-none focus:border-[#8B7355] focus:outline-none"
              />
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setActionType(null); setSelectedBooking(null); }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookingAction}
              disabled={loading}
              className={`flex-1 ${
                actionType === 'cancel' ? 'bg-red-600 hover:bg-red-700' :
                actionType === 'no_show' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav onCenterAction={() => router.push('/capture')} centerActionLabel="Create" />
    </div>
  );
}
