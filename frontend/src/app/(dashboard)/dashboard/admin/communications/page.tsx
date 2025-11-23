'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

interface CommunicationSettings {
  id: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  otpEnabled: boolean;
  pushEnabled: boolean;
  emailRateLimit: number;
  smsRateLimit: number;
  otpRateLimit: number;
  otpExpiryMinutes: number;
  otpLength: number;
  updatedAt: string;
  createdAt: string;
}

export default function AdminCommunicationsPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<CommunicationSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      window.location.href = '/dashboard';
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/communication-settings');
      setSettings(response.data.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await api.put('/admin/communication-settings', {
        emailEnabled: settings.emailEnabled,
        smsEnabled: settings.smsEnabled,
        otpEnabled: settings.otpEnabled,
        pushEnabled: settings.pushEnabled,
        emailRateLimit: settings.emailRateLimit,
        smsRateLimit: settings.smsRateLimit,
        otpRateLimit: settings.otpRateLimit,
        otpExpiryMinutes: settings.otpExpiryMinutes,
        otpLength: settings.otpLength,
      });

      setSettings(response.data.data);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof CommunicationSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Failed to load settings</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Communication Settings</h1>
        <p className="text-gray-600 mt-2">Manage global communication channel settings</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          {success}
        </div>
      )}

      <div className="grid gap-6">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable Email Service</label>
                  <p className="text-sm text-gray-600">Allow sending emails through the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailEnabled}
                    onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.emailEnabled && (
                <div>
                  <Input
                    label="Rate Limit (per hour)"
                    type="number"
                    min="1"
                    value={settings.emailRateLimit}
                    onChange={(e) => updateSetting('emailRateLimit', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SMS Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable SMS Service</label>
                  <p className="text-sm text-gray-600">Allow sending SMS messages through the platform</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsEnabled}
                    onChange={(e) => updateSetting('smsEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.smsEnabled && (
                <div>
                  <Input
                    label="Rate Limit (per hour)"
                    type="number"
                    min="1"
                    value={settings.smsRateLimit}
                    onChange={(e) => updateSetting('smsRateLimit', parseInt(e.target.value))}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle>OTP Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable OTP Service</label>
                  <p className="text-sm text-gray-600">Allow generating and sending OTP codes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.otpEnabled}
                    onChange={(e) => updateSetting('otpEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.otpEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Rate Limit (per hour per user)"
                      type="number"
                      min="1"
                      value={settings.otpRateLimit}
                      onChange={(e) => updateSetting('otpRateLimit', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Input
                      label="OTP Length (digits)"
                      type="number"
                      min="4"
                      max="8"
                      value={settings.otpLength}
                      onChange={(e) => updateSetting('otpLength', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Input
                      label="Expiry (minutes)"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.otpExpiryMinutes}
                      onChange={(e) => updateSetting('otpExpiryMinutes', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Push Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Push Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">Enable Push Notifications</label>
                <p className="text-sm text-gray-600">Allow sending push notifications (coming soon)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushEnabled}
                  onChange={(e) => updateSetting('pushEnabled', e.target.checked)}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 opacity-50 cursor-not-allowed"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={saving} disabled={saving}>
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}


