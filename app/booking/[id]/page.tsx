'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign, Sparkles, CheckCircle, XCircle, Star, Phone, Mail, Send, Paperclip, FileText, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { BookingReviewDialog } from '@/components/booking-review-dialog';
import { toast } from 'sonner';
import Image from 'next/image';

// Native haptic feedback
const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.haptics) {
    (window as any).webkit.messageHandlers.haptics.postMessage({ style })
  }
}

type Message = {
  id: string
  sender: "client" | "tech"
  type: "text" | "image" | "file"
  content: string
  fileName?: string
  timestamp: Date
  senderName?: string
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'client' | 'tech'>('client');
  const [userId, setUserId] = useState<number | null>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

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
        // Load messages after booking is loaded
        await loadMessages(parseInt(bookingId));
      } else {
        console.error('Failed to fetch booking');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (bookingId: number) => {
    try {
      const messagesRes = await fetch(`/api/bookings/${bookingId}/messages`);
      
      if (messagesRes.ok) {
        const dbMessages = await messagesRes.json();
        
        const convertedMessages: Message[] = dbMessages.map((msg: any) => ({
          id: msg.id.toString(),
          sender: msg.senderType as "client" | "tech",
          type: msg.messageType as "text" | "image" | "file",
          content: msg.content,
          fileName: msg.fileName,
          timestamp: new Date(msg.createdAt),
          senderName: msg.sender?.username,
        }));
        
        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !booking || !userId) return;
    
    setSendingMessage(true);
    triggerHaptic('light');
    
    try {
      const response = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          senderType: userType,
          messageType: 'text',
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        
        const message: Message = {
          id: savedMessage.id.toString(),
          sender: userType,
          type: "text",
          content: newMessage.trim(),
          timestamp: new Date(savedMessage.createdAt),
        };
        
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        triggerHaptic('success');
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !booking || !userId) return;
    
    const isImage = file.type.startsWith('image/');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadRes.ok) {
        toast.error('Failed to upload file');
        return;
      }
      
      const { url } = await uploadRes.json();
      
      const response = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          senderType: userType,
          messageType: isImage ? 'image' : 'file',
          content: url,
          fileName: file.name,
        }),
      });

      if (response.ok) {
        const savedMessage = await response.json();
        
        const message: Message = {
          id: savedMessage.id.toString(),
          sender: userType,
          type: isImage ? "image" : "file",
          content: url,
          fileName: file.name,
          timestamp: new Date(savedMessage.createdAt),
        };
        
        setMessages(prev => [...prev, message]);
        triggerHaptic('success');
      } else {
        toast.error('Failed to send file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBookingAction = async (status: string) => {
    try {
      triggerHaptic('medium');
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
        toast.success(`Booking ${status}!`);
        triggerHaptic('success');
        fetchBookingDetails();
      } else {
        toast.error('Failed to update booking');
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      toast.error('Failed to update booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[#34C759]';
      case 'pending': return 'bg-[#FF9500]';
      case 'cancelled': return 'bg-[#FF3B30]';
      case 'completed': return 'bg-[#007AFF]';
      default: return 'bg-[#8E8E93]';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center p-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto border border-[#E8E8E8] rounded-2xl flex items-center justify-center bg-white">
            <Sparkles className="w-10 h-10 text-[#E8E8E8]" strokeWidth={1} />
          </div>
          <div>
            <h2 className="font-semibold text-xl text-[#1A1A1A] mb-2">Booking Not Found</h2>
            <p className="text-sm text-[#6B6B6B] font-normal">This booking doesn't exist or you don't have access</p>
          </div>
          <Button 
            onClick={() => {
              triggerHaptic('light');
              router.back();
            }}
            className="bg-[#8B7355] hover:bg-[#7A6548] text-white h-12 px-8 text-[13px] font-medium rounded-full transition-all duration-150 active:scale-95"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const isClient = userType === 'client';
  const otherParty = isClient ? booking.techProfile : booking.client;
  const otherPartyName = isClient 
    ? (booking.techProfile?.businessName || otherParty?.username || 'Nail Tech')
    : (otherParty?.username || 'Client');

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex flex-col">
      {/* Header - iOS Native Style */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#E8E8E8]/80 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  triggerHaptic('light');
                  router.back();
                }}
                className="h-11 w-11 p-0 hover:bg-[#F8F7F5] rounded-full flex-shrink-0 active:scale-90 transition-all duration-150"
              >
                <ArrowLeft className="w-5 h-5 text-[#8B7355]" strokeWidth={2} />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-semibold text-[15px] sm:text-base text-[#1A1A1A] truncate">
                  {otherPartyName}
                </h1>
                <div className="flex items-center gap-2">
                  <Badge className={`${getStatusColor(booking.status)} text-white text-[10px] font-medium px-2 py-0.5 rounded-full`}>
                    {booking.status}
                  </Badge>
                  <span className="text-[11px] text-[#6B6B6B]">
                    {new Date(booking.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Summary Card */}
      <div className="bg-white border-b border-[#E8E8E8]/60">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            {booking.look && (
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={booking.look.imageUrl}
                  alt={booking.look.title}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-[14px] text-[#1A1A1A] mb-1">{booking.service?.name}</h3>
              <div className="flex items-center gap-3 text-[12px] text-[#6B6B6B]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {new Date(booking.appointmentDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                  {new Date(booking.appointmentDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-[13px] font-medium text-[#8B7355] mt-1">${parseFloat(booking.totalPrice).toFixed(2)}</p>
            </div>
          </div>
          
          {/* Quick Actions */}
          {!isClient && booking.status === 'pending' && (
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => handleBookingAction('cancelled')}
                className="flex-1 border-[#FF3B30]/30 text-[#FF3B30] hover:bg-[#FF3B30]/10 h-10 text-[12px] font-medium rounded-full"
              >
                Decline
              </Button>
              <Button
                onClick={() => handleBookingAction('confirmed')}
                className="flex-1 bg-[#34C759] hover:bg-[#30B350] text-white h-10 text-[12px] font-medium rounded-full"
              >
                Confirm
              </Button>
            </div>
          )}
          
          {!isClient && booking.status === 'confirmed' && (
            <Button
              onClick={() => handleBookingAction('completed')}
              className="w-full mt-4 bg-[#007AFF] hover:bg-[#0066DD] text-white h-10 text-[12px] font-medium rounded-full"
            >
              Mark Complete
            </Button>
          )}
          
          {isClient && booking.status === 'completed' && !booking.hasReview && (
            <div className="mt-4">
              <BookingReviewDialog
                bookingId={booking.id}
                techName={otherPartyName}
                onReviewSubmitted={fetchBookingDetails}
              />
            </div>
          )}
        </div>
      </div>

      {/* Chat Toggle */}
      <button
        onClick={() => {
          triggerHaptic('light');
          setShowChat(!showChat);
        }}
        className="bg-white/80 backdrop-blur-sm border-b border-[#E8E8E8]/60 px-4 py-2.5 flex items-center justify-between active:bg-[#F8F7F5] transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[#8B7355]" strokeWidth={2} />
          <span className="text-[13px] font-medium text-[#1A1A1A]">Messages</span>
          {messages.length > 0 && (
            <span className="bg-[#8B7355] text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {messages.length}
            </span>
          )}
        </div>
        {showChat ? (
          <ChevronUp className="w-4 h-4 text-[#8E8E93]" strokeWidth={2} />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#8E8E93]" strokeWidth={2} />
        )}
      </button>

      {/* Messages Area - iMessage Style */}
      {showChat && (
        <div className="flex-1 overflow-y-auto overscroll-contain pb-[calc(80px+env(safe-area-inset-bottom))]">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-1">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-[#E8E8E8] mx-auto mb-3" strokeWidth={1} />
                <p className="text-[13px] text-[#8E8E93]">No messages yet</p>
                <p className="text-[12px] text-[#8E8E93] mt-1">Start a conversation about your appointment</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const isMe = message.sender === userType;
                const showTimestamp = index === 0 || 
                  (new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) > 300000;
                
                return (
                  <div key={message.id}>
                    {showTimestamp && (
                      <p className="text-[11px] text-[#8E8E93] font-normal text-center py-2 sm:py-3">
                        {formatTime(message.timestamp)}
                      </p>
                    )}
                    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-0.5`}>
                      <div className={`max-w-[80%] sm:max-w-[75%]`}>
                        {message.type === "text" && (
                          <div className={`px-4 py-2.5 ${
                            isMe 
                              ? "bg-[#8B7355] text-white rounded-[20px] rounded-br-[6px]" 
                              : "bg-[#E9E9EB] text-[#1A1A1A] rounded-[20px] rounded-bl-[6px]"
                          }`}>
                            <p className="text-[15px] sm:text-[16px] font-normal leading-[1.35]">{message.content}</p>
                          </div>
                        )}
                        
                        {message.type === "image" && (
                          <div className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-sm ${
                            isMe ? "rounded-br-[6px]" : "rounded-bl-[6px]"
                          }`}>
                            <Image
                              src={message.content}
                              alt="Shared image"
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="(max-width: 640px) 176px, 208px"
                            />
                          </div>
                        )}
                        
                        {message.type === "file" && (
                          <div className={`flex items-center gap-3 px-4 py-3 ${
                            isMe 
                              ? "bg-[#8B7355] text-white rounded-[20px] rounded-br-[6px]" 
                              : "bg-[#E9E9EB] text-[#1A1A1A] rounded-[20px] rounded-bl-[6px]"
                          }`}>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isMe ? "bg-white/20" : "bg-[#8B7355]/10"
                            }`}>
                              <FileText className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <span className="text-[14px] font-normal truncate max-w-[160px] sm:max-w-[200px]">{message.fileName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input Area - iOS Native Style */}
      {showChat && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[#E8E8E8]/80 pb-[env(safe-area-inset-bottom)] z-40">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 py-2">
            <div className="flex items-end gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  triggerHaptic('light');
                  fileInputRef.current?.click();
                }}
                className="h-10 w-10 p-0 hover:bg-[#F8F7F5] rounded-full flex-shrink-0 active:scale-90 transition-all duration-150 touch-manipulation"
              >
                <Paperclip className="w-5 h-5 text-[#8B7355]" strokeWidth={2} />
              </Button>
              
              <div className="flex-1 relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message"
                  className="min-h-[40px] max-h-[120px] py-2.5 px-4 resize-none border-[#E8E8E8] focus:border-[#8B7355] rounded-[20px] text-[16px] font-normal bg-[#F8F7F5] placeholder:text-[#8E8E93]"
                  style={{ fontSize: '16px' }}
                  rows={1}
                />
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="h-10 w-10 p-0 bg-[#8B7355] hover:bg-[#7A6548] text-white rounded-full flex-shrink-0 disabled:opacity-40 active:scale-90 transition-all duration-150 touch-manipulation shadow-sm"
              >
                {sendingMessage ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" strokeWidth={2} />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
