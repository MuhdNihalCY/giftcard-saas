'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, usePathname } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { useFeatureFlagStore } from '@/store/featureFlagStore';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  businessName: z.string().optional(),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'payment-gateways'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Check if user is merchant or admin
  const isMerchantOrAdmin = user?.role === 'MERCHANT' || user?.role === 'ADMIN';
  
  // Get feature flag store to force refresh
  const { fetchFlags } = useFeatureFlagStore();
  
  // Check if payments feature is enabled
  const isPaymentsEnabled = useFeatureFlag('payments');

  // Set active tab based on pathname
  useEffect(() => {
    if (pathname?.includes('/payment-gateways')) {
      setActiveTab('payment-gateways');
    }
  }, [pathname]);

  // Force refresh feature flags when component mounts or user changes
  useEffect(() => {
    if (user) {
      // Force refresh flags to get latest values (bypass cache)
      fetchFlags(true);
    }
  }, [user, fetchFlags]);

  // Also refresh flags when pathname changes (user navigates to settings)
  useEffect(() => {
    if (user && pathname?.includes('/settings')) {
      fetchFlags(true);
    }
  }, [pathname, user, fetchFlags]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      businessName: user?.businessName || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      const response = await api.put('/auth/profile', data);
      setUser(response.data.data);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to update profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setIsLoading(true);
      setMessage(null);
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setMessage({ type: 'success', text: 'Password updated successfully' });
      passwordForm.reset();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error?.message || 'Failed to update password',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-transition">
      <h1 className="text-4xl font-serif font-bold text-slate-900 dark:text-slate-100 mb-4">Settings</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg">Manage your account preferences</p>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-700 mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'password'
              ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
          }`}
        >
          Password
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'notifications'
              ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
          }`}
        >
          Notifications
        </button>
        {isMerchantOrAdmin && isPaymentsEnabled && (
          <button
            onClick={() => {
              setActiveTab('payment-gateways');
              router.push('/dashboard/settings/payment-gateways');
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'payment-gateways'
                ? 'border-b-2 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400'
            }`}
          >
            Payment Gateways
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  error={profileForm.formState.errors.firstName?.message}
                  {...profileForm.register('firstName')}
                />
                <Input
                  label="Last Name"
                  error={profileForm.formState.errors.lastName?.message}
                  {...profileForm.register('lastName')}
                />
                <Input
                  label="Email"
                  type="email"
                  error={profileForm.formState.errors.email?.message}
                  {...profileForm.register('email')}
                />
                {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && (
                  <Input
                    label="Business Name"
                    error={profileForm.formState.errors.businessName?.message}
                    {...profileForm.register('businessName')}
                  />
                )}
              </div>
              
              {/* Merchant ID Display */}
              {(user?.role === 'MERCHANT' || user?.role === 'ADMIN') && user?.id && (
                <div className="mt-6 p-6 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-serif font-semibold text-slate-900 dark:text-slate-100">Your Merchant ID</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Use this ID when redeeming gift cards via public links
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-cyan-600 dark:text-cyan-400 break-all max-w-xs">
                        {user.id}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(user.id!);
                          alert('Merchant ID copied to clipboard!');
                        }}
                        className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 underline transition-colors"
                      >
                        Copy ID
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'password' && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                error={passwordForm.formState.errors.currentPassword?.message}
                {...passwordForm.register('currentPassword')}
              />
              <Input
                label="New Password"
                type="password"
                error={passwordForm.formState.errors.newPassword?.message}
                {...passwordForm.register('newPassword')}
              />
              <Input
                label="Confirm New Password"
                type="password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
              <Button type="submit" variant="primary" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Email Notifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive email updates about your account</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Gift Card Redemptions</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Get notified when gift cards are redeemed</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" defaultChecked />
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">Payment Notifications</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Receive notifications about payments</p>
                </div>
                <input type="checkbox" className="h-4 w-4 text-cyan-500 focus:ring-cyan-500 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800" defaultChecked />
              </div>
              <Button variant="primary">Save Preferences</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'payment-gateways' && isMerchantOrAdmin && isPaymentsEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Gateways</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Connect and manage your payment gateways to receive payments directly to your account.
              </p>
              <Button
                variant="primary"
                onClick={() => router.push('/dashboard/settings/payment-gateways')}
              >
                Manage Payment Gateways
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

