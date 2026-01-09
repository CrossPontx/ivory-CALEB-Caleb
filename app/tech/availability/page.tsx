'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Clock, Plus, X, Loader2, Calendar, AlertCircle } from 'lucide-react';
import { BottomNav } from '@/components/bottom-nav';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const hour = Math.floor(i / 2) + 7; // Start at 7 AM
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

export default function TechAvailabilityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [techProfileId, setTechProfileId] = useState<number | null>(null);
  
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
      
      // Get tech profile
      const profileRes = await fetch(`/api/tech-profiles?userId=${user.id}`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        if (profile?.id) {
          setTechProfileId(profile.id);
          
          // Load availability
          const availRes = await fetch(`/api/tech/availability?techProfileId=${profile.id}`);
          if (availRes.ok) {
            const data = await availRes.json();
            
            // Convert availability to schedule format
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
            
            // Load time off
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

  const handleSave = async () => {
    if (!techProfileId) return;
    
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Convert schedule to API format
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
        toast.success('Availability saved');
      } else {
        toast.error('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('Failed to save availability');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeOff = async () => {
    if (!newTimeOff.startDate || !newTimeOff.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

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
      } else {
        toast.error('Failed to add time off');
      }
    } catch (error) {
      console.error('Error adding time off:', error);
      toast.error('Failed to add time off');
    }
  };

  const handleDeleteTimeOff = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tech/time-off?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        setTimeOffPeriods(timeOffPeriods.filter(t => t.id !== id));
        toast.success('Time off removed');
      }
    } catch (error) {
      console.error('Error deleting time off:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#8B7355]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#F8F7F5] pb-32">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-[#E8E8E8]/80 sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()} 
                className="h-10 w-10 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full"
              >
                <ArrowLeft className="h-5 w-5 text-[#8B7355]" strokeWidth={2} />
              </button>
              <div>
                <h1 className="font-semibold text-[15px] text-[#1A1A1A]">Availability</h1>
                <p className="text-[12px] text-[#6B6B6B]">Set your working hours</p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 bg-[#1A1A1A] hover:bg-[#8B7355] text-white text-[12px] font-medium rounded-lg px-4"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Weekly Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8E8E8]/50">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8B7355]" strokeWidth={2} />
              <span className="text-[13px] font-medium text-[#1A1A1A]">Weekly Schedule</span>
            </div>
          </div>
          
          <div className="divide-y divide-[#E8E8E8]/50">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[14px] font-medium text-[#1A1A1A]">{day.label}</span>
                  <Switch
                    checked={schedule[day.value].enabled}
                    onCheckedChange={(checked) => {
                      setSchedule({
                        ...schedule,
                        [day.value]: { ...schedule[day.value], enabled: checked },
                      });
                    }}
                  />
                </div>
                
                {schedule[day.value].enabled && (
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={schedule[day.value].startTime}
                      onChange={(e) => {
                        setSchedule({
                          ...schedule,
                          [day.value]: { ...schedule[day.value], startTime: e.target.value },
                        });
                      }}
                      className="flex-1 h-10 px-3 text-[13px] border border-[#E8E8E8] rounded-lg bg-white focus:border-[#8B7355] focus:outline-none"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                    <span className="text-[12px] text-[#6B6B6B]">to</span>
                    <select
                      value={schedule[day.value].endTime}
                      onChange={(e) => {
                        setSchedule({
                          ...schedule,
                          [day.value]: { ...schedule[day.value], endTime: e.target.value },
                        });
                      }}
                      className="flex-1 h-10 px-3 text-[13px] border border-[#E8E8E8] rounded-lg bg-white focus:border-[#8B7355] focus:outline-none"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time.value} value={time.value}>{time.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Time Off */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E8E8E8]/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E8E8E8]/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B7355]" strokeWidth={2} />
              <span className="text-[13px] font-medium text-[#1A1A1A]">Time Off</span>
            </div>
            <button
              onClick={() => setShowAddTimeOff(true)}
              className="h-8 px-3 flex items-center gap-1.5 text-[12px] font-medium text-[#8B7355] hover:bg-[#F8F7F5] rounded-lg"
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              Add
            </button>
          </div>

          {showAddTimeOff && (
            <div className="px-4 py-4 border-b border-[#E8E8E8]/50 bg-[#F8F7F5]">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={newTimeOff.startDate}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, startDate: e.target.value })}
                      className="w-full h-10 px-3 text-[13px] border border-[#E8E8E8] rounded-lg bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={newTimeOff.endDate}
                      onChange={(e) => setNewTimeOff({ ...newTimeOff, endDate: e.target.value })}
                      className="w-full h-10 px-3 text-[13px] border border-[#E8E8E8] rounded-lg bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-[#6B6B6B] uppercase tracking-wider mb-1 block">Reason (optional)</label>
                  <input
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff({ ...newTimeOff, reason: e.target.value })}
                    placeholder="e.g., Vacation, Personal day"
                    className="w-full h-10 px-3 text-[13px] border border-[#E8E8E8] rounded-lg bg-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAddTimeOff(false)}
                    variant="outline"
                    className="flex-1 h-10 text-[12px] rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTimeOff}
                    className="flex-1 h-10 bg-[#1A1A1A] hover:bg-[#8B7355] text-white text-[12px] rounded-lg"
                  >
                    Add Time Off
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="divide-y divide-[#E8E8E8]/50">
            {timeOffPeriods.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-[13px] text-[#6B6B6B]">No time off scheduled</p>
              </div>
            ) : (
              timeOffPeriods.map((period) => (
                <div key={period.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium text-[#1A1A1A]">
                      {new Date(period.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {period.startDate !== period.endDate && (
                        <> - {new Date(period.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                      )}
                    </p>
                    {period.reason && (
                      <p className="text-[12px] text-[#6B6B6B]">{period.reason}</p>
                    )}
                  </div>
                  <button
                    onClick={() => period.id && handleDeleteTimeOff(period.id)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-[#F8F7F5] rounded-full"
                  >
                    <X className="w-4 h-4 text-[#6B6B6B]" strokeWidth={2} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
