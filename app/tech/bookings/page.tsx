'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, User, Sparkles, CheckCircle, XCircle } from 'lucide-react';

export default function TechBookingsPage() {
  const router = useRouter();
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdown, setBreakdown] = useState<any>(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);
  const [techNotes, setTechNotes] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch pending
      const pendingRes = await fetch('/api/bookings?status=pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pendingData = await pendingRes.json();
      if (pendingRes.ok) setPendingBookings(pendingData.bookings);

      // Fetch confirmed
      const upcomingRes = await fetch('/api/bookings?status=confirmed', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const upcomingData = await upcomingRes.json();
      if (upcomingRes.ok) setUpcomingBookings(upcomingData.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingAction = async (bookingId: number, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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

  const generateDesignBreakdown = async (lookId: number, bookingId: number) => {
    setLoadingBreakdown(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/design-breakdown', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lookId, bookingId }),
      });

      const data = await response.json();
      if (response.ok) {
        setBreakdown(data.breakdown);
        setShowBreakdown(true);
      } else {
        alert(data.error || 'Failed to generate breakdown');
      }
    } catch (error) {
      console.error('Error generating breakdown:', error);
      alert('Failed to generate breakdown');
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const BookingCard = ({ booking, isPending }: { booking: any; isPending: boolean }) => (
    <Card className="border-[#E8E8E8] hover:border-[#8B7355] hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              {booking.client?.username}
            </CardTitle>
            <CardDescription>{booking.service?.name}</CardDescription>
          </div>
          <Badge variant={isPending ? 'secondary' : 'default'}>
            {booking.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-gray-500" />
            {new Date(booking.appointmentDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-gray-500" />
            {new Date(booking.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {booking.look && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <img
                src={booking.look.imageUrl}
                alt="Design"
                className="w-20 h-20 object-cover rounded cursor-pointer"
                onClick={() => window.open(booking.look.imageUrl, '_blank')}
              />
              <div className="flex-1">
                <p className="font-medium">{booking.look.title}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all"
                  onClick={() => generateDesignBreakdown(booking.look.id, booking.id)}
                  disabled={loadingBreakdown}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {loadingBreakdown ? 'Generating...' : 'Get Design Breakdown'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Info */}
        <div className="bg-[#F8F7F5] p-3 rounded border border-[#E8E8E8]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-[#1A1A1A]">Payment</span>
            <Badge className="bg-green-500">Paid</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Service Price:</span>
            <span className="font-medium">${booking.servicePrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#6B6B6B]">Platform Fee:</span>
            <span className="font-medium">${booking.serviceFee}</span>
          </div>
          <div className="flex justify-between text-sm font-bold border-t border-[#E8E8E8] pt-1 mt-1">
            <span>Total Paid:</span>
            <span>${booking.totalPrice}</span>
          </div>
          <p className="text-xs text-[#6B6B6B] mt-2">
            You'll receive ${booking.servicePrice} after the appointment is completed.
          </p>
        </div>

        {booking.clientNotes && (
          <div className="bg-[#F8F7F5] p-3 rounded border border-[#E8E8E8]">
            <p className="text-sm font-medium mb-1 text-[#1A1A1A]">Client Notes:</p>
            <p className="text-sm text-[#6B6B6B]">{booking.clientNotes}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <span className="text-lg font-bold">${booking.totalPrice}</span>
          <div className="flex gap-2">
            {isPending ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#E8E8E8] hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
                  onClick={() => {
                    setSelectedBooking(booking);
                    handleBookingAction(booking.id, 'cancelled');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Decline
                </Button>
                <Button
                  size="sm"
                  className="bg-[#1A1A1A] hover:bg-[#8B7355] text-white transition-all"
                  onClick={() => {
                    setSelectedBooking(booking);
                    handleBookingAction(booking.id, 'confirmed');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-[#E8E8E8] hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white transition-all"
                onClick={() => handleBookingAction(booking.id, 'completed')}
              >
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-[#E8E8E8] sticky top-0 z-10 safe-top">
        <div className="max-w-screen-xl mx-auto px-5 sm:px-6 py-4 sm:py-5">
          <h1 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">
            MY BOOKINGS
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 sm:pb-32">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="w-full mb-6 sm:mb-8 grid grid-cols-2 h-auto bg-white border-b border-[#E8E8E8] p-0 rounded-none">
            <TabsTrigger 
              value="pending"
              className="text-xs sm:text-sm font-light tracking-wider uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-300"
            >
              Requests ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming"
              className="text-xs sm:text-sm font-light tracking-wider uppercase rounded-none border-b-2 border-transparent data-[state=active]:border-[#1A1A1A] data-[state=active]:text-[#1A1A1A] text-[#6B6B6B] py-3 sm:py-4 transition-all duration-300"
            >
              Upcoming ({upcomingBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No pending booking requests
                </CardContent>
              </Card>
            ) : (
              pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPending={true} />
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4 mt-6">
            {upcomingBookings.length === 0 ? (
              <Card className="border-[#E8E8E8]">
                <CardContent className="py-12 text-center text-[#6B6B6B]">
                  No upcoming appointments
                </CardContent>
              </Card>
            ) : (
              upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isPending={false} />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Design Breakdown Dialog */}
        <Dialog open={showBreakdown} onOpenChange={setShowBreakdown}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Design Breakdown</DialogTitle>
              <DialogDescription>
                Step-by-step instructions to recreate this design
              </DialogDescription>
            </DialogHeader>

            {breakdown && (
              <div className="space-y-6">
                {/* Overview */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Difficulty</p>
                    <p className="font-semibold capitalize">{breakdown.difficulty}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Est. Time</p>
                    <p className="font-semibold">{breakdown.estimatedTime} min</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">Steps</p>
                    <p className="font-semibold">{breakdown.breakdown?.steps?.length || 0}</p>
                  </div>
                </div>

                {/* Products Needed */}
                {breakdown.productsNeeded && breakdown.productsNeeded.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Products & Tools Needed:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {breakdown.productsNeeded.map((product: string, idx: number) => (
                        <li key={idx} className="text-sm">{product}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Techniques */}
                {breakdown.techniques && breakdown.techniques.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Techniques Used:</h3>
                    <div className="flex flex-wrap gap-2">
                      {breakdown.techniques.map((technique: string, idx: number) => (
                        <Badge key={idx} variant="secondary">{technique}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Steps */}
                {breakdown.breakdown?.steps && (
                  <div>
                    <h3 className="font-semibold mb-3">Step-by-Step Instructions:</h3>
                    <div className="space-y-4">
                      {breakdown.breakdown.steps.map((step: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-primary pl-4">
                          <h4 className="font-semibold">
                            Step {step.stepNumber}: {step.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                          {step.tips && (
                            <p className="text-sm text-primary mt-2">
                              💡 <strong>Tip:</strong> {step.tips}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pro Tips */}
                {breakdown.breakdown?.proTips && breakdown.breakdown.proTips.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Pro Tips:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {breakdown.breakdown.proTips.map((tip: string, idx: number) => (
                        <li key={idx} className="text-sm">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Common Mistakes */}
                {breakdown.breakdown?.commonMistakes && breakdown.breakdown.commonMistakes.length > 0 && (
                  <div className="bg-red-50 p-4 rounded">
                    <h3 className="font-semibold mb-2">Common Mistakes to Avoid:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {breakdown.breakdown.commonMistakes.map((mistake: string, idx: number) => (
                        <li key={idx} className="text-sm">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
