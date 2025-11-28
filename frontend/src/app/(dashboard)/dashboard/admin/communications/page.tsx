'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { MessageSquare, Mail, MessageCircle, Bell, Save } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

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
  const [stats, setStats] = useState<any>(null);
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
    fetchStatistics();
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

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/communication-logs/statistics');
      setStats(response.data.data);
    } catch (err: any) {
      console.error('Failed to load statistics:', err);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center text-red-400 py-8">Failed to load settings</div>
    );
  }

  const channelStatsData = stats?.byChannel
    ? Object.entries(stats.byChannel).map(([channel, data]: [string, any]) => ({
        channel,
        sent: data.sent || 0,
        failed: data.failed || 0,
        successRate: data.successRate || 0,
      }))
    : [];

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-serif font-bold text-plum-300 mb-2 flex items-center space-x-3">
          <MessageSquare className="w-8 h-8" />
          <span>Communication Settings</span>
        </h1>
        <p className="text-navy-200 text-lg">
          Manage global communication channel settings and monitor performance
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400">
          {success}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartContainer
            title="Communication Statistics"
            description="Messages sent by channel"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a0d21" />
                <XAxis dataKey="channel" stroke="#b48dc9" />
                <YAxis stroke="#b48dc9" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0a1428',
                    border: '1px solid #341a42',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="sent" fill="#ffd700" name="Sent" />
                <Bar dataKey="failed" fill="#ef4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>

          <Card>
            <CardHeader>
              <CardTitle>Success Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channelStatsData.map((stat) => (
                  <div key={stat.channel} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-plum-300 capitalize">{stat.channel}</span>
                      <span className="text-navy-50 font-semibold">
                        {stat.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-navy-700 rounded-full h-2">
                      <div
                        className="bg-gold-500 h-2 rounded-full transition-all"
                        style={{ width: `${stat.successRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings */}
      <div className="grid gap-6 mb-6">
        {/* Email Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Email Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-plum-200">Enable Email Service</label>
                  <p className="text-sm text-navy-300 mt-1">
                    Allow sending emails through the platform
                  </p>
                </div>
                <Switch
                  checked={settings.emailEnabled}
                  onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
                />
              </div>

              {settings.emailEnabled && (
                <div>
                  <Input
                    label="Rate Limit (per hour)"
                    type="number"
                    min="1"
                    value={settings.emailRateLimit}
                    onChange={(e) =>
                      updateSetting('emailRateLimit', parseInt(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* SMS Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>SMS Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-plum-200">Enable SMS Service</label>
                  <p className="text-sm text-navy-300 mt-1">
                    Allow sending SMS messages through the platform
                  </p>
                </div>
                <Switch
                  checked={settings.smsEnabled}
                  onChange={(e) => updateSetting('smsEnabled', e.target.checked)}
                />
              </div>

              {settings.smsEnabled && (
                <div>
                  <Input
                    label="Rate Limit (per hour)"
                    type="number"
                    min="1"
                    value={settings.smsRateLimit}
                    onChange={(e) =>
                      updateSetting('smsRateLimit', parseInt(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* OTP Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>OTP Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-plum-200">Enable OTP Service</label>
                  <p className="text-sm text-navy-300 mt-1">
                    Allow generating and sending OTP codes
                  </p>
                </div>
                <Switch
                  checked={settings.otpEnabled}
                  onChange={(e) => updateSetting('otpEnabled', e.target.checked)}
                />
              </div>

              {settings.otpEnabled && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Rate Limit (per hour per user)"
                    type="number"
                    min="1"
                    value={settings.otpRateLimit}
                    onChange={(e) =>
                      updateSetting('otpRateLimit', parseInt(e.target.value))
                    }
                  />
                  <Input
                    label="OTP Length (digits)"
                    type="number"
                    min="4"
                    max="8"
                    value={settings.otpLength}
                    onChange={(e) => updateSetting('otpLength', parseInt(e.target.value))}
                  />
                  <Input
                    label="Expiry (minutes)"
                    type="number"
                    min="1"
                    max="60"
                    value={settings.otpExpiryMinutes}
                    onChange={(e) =>
                      updateSetting('otpExpiryMinutes', parseInt(e.target.value))
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Push Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Push Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-plum-200">
                  Enable Push Notifications
                </label>
                <p className="text-sm text-navy-300 mt-1">
                  Allow sending push notifications (coming soon)
                </p>
              </div>
              <Switch checked={settings.pushEnabled} disabled />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          isLoading={saving}
          disabled={saving}
          variant="gold"
          className="flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </Button>
      </div>
    </div>
  );
}
