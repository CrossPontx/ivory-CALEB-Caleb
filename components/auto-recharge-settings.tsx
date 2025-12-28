'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

export function AutoRechargeSettings() {
  const [enabled, setEnabled] = useState(false);
  const [amount, setAmount] = useState<5 | 10>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/user/auto-recharge');
      if (response.ok) {
        const data = await response.json();
        setEnabled(data.autoRechargeEnabled);
        setAmount(data.autoRechargeAmount);
      }
    } catch (error) {
      console.error('Error loading auto-recharge settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newEnabled: boolean, newAmount: 5 | 10) => {
    setSaving(true);
    try {
      const response = await fetch('/api/user/auto-recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          autoRechargeEnabled: newEnabled,
          autoRechargeAmount: newAmount,
        }),
      });

      if (response.ok) {
        setEnabled(newEnabled);
        setAmount(newAmount);
        toast.success('Auto-recharge settings updated');
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error saving auto-recharge settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (checked: boolean) => {
    saveSettings(checked, amount);
  };

  const handleAmountChange = (value: string) => {
    const newAmount = parseInt(value) as 5 | 10;
    saveSettings(enabled, newAmount);
  };

  if (loading) {
    return (
      <Card className="border-[#E8E8E8]">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#6B6B6B]" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#E8E8E8]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F8F7F5] rounded-lg">
              <Zap className="h-5 w-5 text-[#8B7355]" strokeWidth={1.5} />
            </div>
            <div>
              <CardTitle className="font-serif text-xl font-light text-[#1A1A1A] tracking-tight">
                Auto-Recharge
              </CardTitle>
              <CardDescription className="text-sm text-[#6B6B6B] font-light mt-1">
                Automatically purchase credits when you run out
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin text-[#6B6B6B]" />}
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={saving}
            />
          </div>
        </div>
      </CardHeader>

      {enabled && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-[#F8F7F5] rounded-lg">
              <Info className="h-4 w-4 text-[#8B7355] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-xs text-[#6B6B6B] font-light">
                When your credits reach 0, we'll automatically charge your payment method and add credits to your account.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-light text-[#1A1A1A]">
                Recharge Amount
              </Label>
              <RadioGroup
                value={amount.toString()}
                onValueChange={handleAmountChange}
                disabled={saving}
                className="space-y-3"
              >
                <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:border-[#8B7355] transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="5" id="amount-5" />
                    <Label
                      htmlFor="amount-5"
                      className="font-light text-[#1A1A1A] cursor-pointer"
                    >
                      5 Credits
                    </Label>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg font-light text-[#1A1A1A]">$7.50</div>
                    <div className="text-xs text-[#6B6B6B] font-light">$1.50/credit</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#E8E8E8] rounded-lg hover:border-[#8B7355] transition-colors">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="10" id="amount-10" />
                    <Label
                      htmlFor="amount-10"
                      className="font-light text-[#1A1A1A] cursor-pointer"
                    >
                      10 Credits
                    </Label>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-lg font-light text-[#1A1A1A]">$15.00</div>
                    <div className="text-xs text-[#6B6B6B] font-light">$1.50/credit</div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="pt-2 border-t border-[#E8E8E8]">
              <p className="text-xs text-[#6B6B6B] font-light">
                You can change or disable auto-recharge anytime. Your subscription credits will still renew monthly.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
