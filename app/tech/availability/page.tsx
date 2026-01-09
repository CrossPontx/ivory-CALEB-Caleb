'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Clock, Plus, X, Loader2, Calendar, Sparkles, Check } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { value: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { value: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { value: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { value: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { value: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { value: 'sunday', label: 'Sun', fullLabel: 'Sunday' },
];

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7;
  const minute = (i % 2) * 30;
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    label: `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`,
  };
});

type DaySchedule = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

type TimeOff = {
  id?: number;
  startDate: string;
  endDate: string;
  reason: string;
};

// Native haptic feedback
const triggerHaptic = (style: 'light' | 'medium' | 'success' = 'light') => {
  if (typeof window !== 'undefined' && (window as any).webkit?.messageHandlers?.haptics) {
    (window as any).webkit.messageHandlers.haptics.postMessage({ style });
  }
};

export default function TechAvailabilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techProfileId, setTechProfileId] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
    saturday: { enabled: false, startTime: '10:00', endTime: '16:00' },
    sunday: { enabled: false, startTime: '10:00', endTime: '16:00' },
  });

  const [timeOffPeriods, setTimeOffPeriods] = useState<TimeOff[]>([]);
  const [showAddTimeOff, setShowAddTimeOff] = useState(false);
  const [newTimeOff, setNewTimeOff] = useState<TimeOff>({
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    try {
      const userStr = localStorage.getItem('ivoryUser');
      if (!userStr) {
        router.push('/');
        return;
      }

      const user = JSON.parse(userStr);
      
      const profileRes = await fetch(`/api/tech-profiles?userId=${user.id}`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile?.id) {
          setTechProfileId(profile.id);
          
          const availRes = await fetch(`/api/tech/availability?techProfileId=${profile.id}`);
          if (availRes.ok) {
            const data = await availRes.json();
            
            if (data.availability?.length > 0) {
              const newSchedule = { ...schedule };
              DAYS_OF_WEEK.forEach(day => {
                newSchedule[day.value] = { enabled: false, startTime: '09:00', endTime: '17:00' };
              });
              
              data.availability.forEach((slot: any) => {
                newSchedule[slot.dayOfWeek] = {
                  enabled: true,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                };
              });
              setSchedule(newSchedule);
            }
            
            if (data.timeOff?.length > 0) {
              setTimeOffPeriods(data.timeOff.map((t: any) => ({
                id: t.id,
                startDate: t.startDate.split('T')[0],
                endDate: t.endDate.split('T')[0],
                reason: t.reason || '',
              })));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = (day: string, updates: Partial<DaySchedule>) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ...updates },
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!techProfileId) return;
    
    setSaving(true);
    triggerHaptic('medium');
    
    try {
      const token = localStorage.getItem('token');
      
      const scheduleData = Object.entries(schedule)
        .filter(([_, value]) => value.enabled)
        .map(([day, value]) => ({
          dayOfWeek: day,
          startTime: value.startTime,
          endTime: value.endTime,
        }));

      const response = await fetch('/api/tech/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ schedule: scheduleData }),
      });

      if (response.ok) {
        toast.success('Schedule saved');
        triggerHaptic('success');
        setHasChanges(false);
      } else {
        toast.error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeOff = async () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      toast.error('Please select dates');
      return;
    }

    triggerHaptic('medium');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tech/time-off', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTimeOff),
      });

      if (response.ok) {
        const data = await response.json();
        setTimeOffPeriods([...timeOffPeriods, { ...newTimeOff, id: data.timeOff.id }]);
        setNewTimeOff({ startDate: '', endDate: '', reason: '' });
        setShowAddTimeOff(false);
        toast.success('Time off added');
        triggerHaptic('success');
      } else {
        toast.error('Failed to add time off');
      }
    } catch (error) {
      console.error('Error adding time off:', error);
      toast.error('Failed to add time off');
    }
  };

  const handleDeleteTimeOff = async (id: number) => {
    triggerHaptic('light');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tech/time-off?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setTimeOffPeriods(timeOffPeriods.filter(t => t.id !== id));
        toast.success('Time off removed');
        triggerHaptic('success');
      }
    } catch (error) {
      console.error('Error deleting time off:', error);
    }
  };

  const formatTimeLabel = (time: string) => {
    const option = TIME_OPTIONS.find(t => t.value === time);
    return option?.label || time;
  };

  const workingDaysCount = Object.values(schedule).filter(s => s.enabled).length;

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#8B7355] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[11px] tracking-[0.25em] uppercase text-[#6B6B6B] font-light">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-white pb-32">
      {/* Header */}
      <header className="bg-white/98 backdrop-blur-xl border-b border-[#E8E8E8]/60 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  router.back();
                }} 
                className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full active:scale-90 transition-all duration-150"
              >
                <ArrowLeft className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
              </button>
              <div>
                <h1 className="font-serif text-lg sm:text-xl font-light text-[#1A1A1A] tracking-tight">Availability</h1>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`h-10 px-5 text-[11px] tracking-[0.15em] uppercase font-light rounded-none transition-all duration-500 ${
                hasChanges 
                  ? 'bg-[#1A1A1A] hover:bg-[#8B7355] text-white' 
                  : 'bg-[#E8E8E8] text-[#6B6B6B] cursor-not-allowed'
              }`}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[#F8F7F5] to-white py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 border border-[#E8E8E8] bg-white flex items-center justify-center">
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-[#8B7355]" strokeWidth={1} />
          </div>
          <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-2 sm:mb-3 font-light">Your Schedule</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1A1A1A] mb-2 tracking-tight">
            Set Your Working Hours
          </h2>
          <p className="text-sm sm:text-base text-[#6B6B6B] font-light max-w-md mx-auto leading-relaxed">
            Let clients know when you're available for appointments
          </p>
          
          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">{workingDaysCount}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Working Days</p>
            </div>
            <div className="w-px h-10 bg-[#E8E8E8]" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-light text-[#1A1A1A]">{timeOffPeriods.length}</p>
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] font-light">Days Off</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-12">
        
        {/* Weekly Schedule */}
        <section>
          <div className="mb-5 sm:mb-6">
            <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-1 sm:mb-2 font-light">Section I</p>
            <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">Weekly Schedule</h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div 
                key={day.value} 
                className={`border transition-all duration-500 ${
                  schedule[day.value].enabled 
                    ? 'border-[#8B7355]/30 bg-[#FAFAF8]' 
                    : 'border-[#E8E8E8] bg-white'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-all duration-500 ${
                        schedule[day.value].enabled 
                          ? 'bg-[#8B7355] text-white' 
                          : 'bg-[#F8F7F5] text-[#6B6B6B]'
                      }`}>
                        <span className="text-[11px] sm:text-xs font-medium tracking-wider">{day.label}</span>
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-[#1A1A1A]">{day.fullLabel}</p>
                        {schedule[day.value].enabled && (
                          <p className="text-[11px] sm:text-xs text-[#6B6B6B] font-light mt-0.5">
                            {formatTimeLabel(schedule[day.value].startTime)} – {formatTimeLabel(schedule[day.value].endTime)}
                          </p>
                        )}
                      </div>
                    </div>
                    <Switch
                      checked={schedule[day.value].enabled}
                      onCheckedChange={(checked) => {
                        triggerHaptic('light');
                        updateSchedule(day.value, { enabled: checked });
                      }}
                    />
                  </div>
                  
                  {schedule[day.value].enabled && (
                    <div className="mt-4 pt-4 border-t border-[#E8E8E8]/60">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-1.5 block font-light">Start</label>
                          <select
                            value={schedule[day.value].startTime}
                            onChange={(e) => updateSchedule(day.value, { startTime: e.target.value })}
                            className="w-full h-11 sm:h-12 px-3 text-[13px] sm:text-sm border border-[#E8E8E8] bg-white focus:border-[#8B7355] focus:outline-none font-light transition-colors"
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time.value} value={time.value}>{time.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="pt-5">
                          <span className="text-[#6B6B6B] text-sm">to</span>
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-1.5 block font-light">End</label>
                          <select
                            value={schedule[day.value].endTime}
                            onChange={(e) => updateSchedule(day.value, { endTime: e.target.value })}
                            className="w-full h-11 sm:h-12 px-3 text-[13px] sm:text-sm border border-[#E8E8E8] bg-white focus:border-[#8B7355] focus:outline-none font-light transition-colors"
                          >
                            {TIME_OPTIONS.map((time) => (
                              <option key={time.value} value={time.value}>{time.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Time Off */}
        <section>
          <div className="flex items-start justify-between mb-5 sm:mb-6">
            <div>
              <p className="text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#8B7355] mb-1 sm:mb-2 font-light">Section II</p>
              <h3 className="font-serif text-xl sm:text-2xl font-light text-[#1A1A1A] tracking-tight">Time Off</h3>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-light mt-1">Block dates when you're unavailable</p>
            </div>
            <Button
              onClick={() => {
                triggerHaptic('light');
                setShowAddTimeOff(true);
              }}
              variant="outline"
              className="h-10 sm:h-11 px-4 sm:px-5 border-[#E8E8E8] hover:border-[#8B7355] hover:bg-transparent text-[#1A1A1A] rounded-none text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-light transition-all duration-500"
            >
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={1.5} />
              Add
            </Button>
          </div>

          {/* Add Time Off Form */}
          {showAddTimeOff && (
            <div className="border border-[#8B7355]/30 bg-[#FAFAF8] p-5 sm:p-6 mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-[#8B7355]" strokeWidth={1.5} />
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#8B7355] font-light">New Time Off</p>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-1.5 block font-light">Start Date</label>
                    <input
                      type="date"
                      value={newTimeOff.startDate}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3 text-[13px] sm:text-sm border border-[#E8E8E8] bg-white focus:border-[#8B7355] focus:outline-none font-light"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-1.5 block font-light">End Date</label>
                    <input
                      type="date"
                      value={newTimeOff.endDate}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
                      className="w-full h-11 sm:h-12 px-3 text-[13px] sm:text-sm border border-[#E8E8E8] bg-white focus:border-[#8B7355] focus:outline-none font-light"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.2em] uppercase text-[#6B6B6B] mb-1.5 block font-light">Reason (optional)</label>
                  <input
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                    placeholder="e.g., Vacation, Personal day"
                    className="w-full h-11 sm:h-12 px-3 text-[13px] sm:text-sm border border-[#E8E8E8] bg-white focus:border-[#8B7355] focus:outline-none font-light placeholder:text-[#B0B0B0]"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={() => {
                      triggerHaptic('light');
                      setShowAddTimeOff(false);
                      setNewTimeOff({ startDate: '', endDate: '', reason: '' });
                    }}
                    variant="outline"
                    className="flex-1 h-11 sm:h-12 border-[#E8E8E8] hover:border-[#1A1A1A] text-[#1A1A1A] rounded-none text-[11px] tracking-[0.15em] uppercase font-light"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTimeOff}
                    className="flex-1 h-11 sm:h-12 bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none text-[11px] tracking-[0.15em] uppercase font-light transition-all duration-500"
                  >
                    Add Time Off
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Time Off List */}
          {timeOffPeriods.length === 0 && !showAddTimeOff ? (
            <div className="border border-dashed border-[#E8E8E8] py-12 sm:py-16 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 border border-[#E8E8E8] bg-[#F8F7F5] flex items-center justify-center">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#8B7355]" strokeWidth={1} />
              </div>
              <p className="text-sm sm:text-base text-[#1A1A1A] font-light mb-1">No time off scheduled</p>
              <p className="text-xs sm:text-sm text-[#6B6B6B] font-light">Add dates when you won't be available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeOffPeriods.map((period) => (
                <div 
                  key={period.id} 
                  className="border border-[#E8E8E8] bg-white p-4 sm:p-5 flex items-center justify-between group hover:border-[#8B7355]/30 transition-all duration-500"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F8F7F5] flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-[#8B7355]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-medium text-[#1A1A1A]">
                        {new Date(period.startDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {period.startDate !== period.endDate && (
                          <span className="text-[#6B6B6B] font-light">
                            {' '}– {new Date(period.endDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </p>
                      {period.reason && (
                        <p className="text-xs sm:text-sm text-[#6B6B6B] font-light mt-0.5">{period.reason}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => period.id && handleDeleteTimeOff(period.id)}
                    className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center hover:bg-[#F8F7F5] opacity-60 group-hover:opacity-100 transition-all duration-300 active:scale-90"
                  >
                    <X className="w-4 h-4 text-[#6B6B6B]" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Fixed Save Button - Mobile */}
      {hasChanges && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-[#E8E8E8]/60 sm:hidden">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 bg-[#1A1A1A] hover:bg-[#8B7355] text-white rounded-none text-[11px] tracking-[0.2em] uppercase font-light transition-all duration-500 active:scale-[0.98]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" strokeWidth={1.5} />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
