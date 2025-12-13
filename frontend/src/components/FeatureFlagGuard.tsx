'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent } from './ui/Card';
import { Shield, AlertCircle } from 'lucide-react';

interface FeatureFlagGuardProps {
  feature: string;
  children: React.ReactNode;
  redirectTo?: string;
  showMessage?: boolean;
}

/**
 * Component that protects routes based on feature flags
 * Redirects or shows message if feature is disabled
 */
export function FeatureFlagGuard({
  feature,
  children,
  redirectTo = '/dashboard',
  showMessage = true,
}: FeatureFlagGuardProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const isEnabled = useFeatureFlag(feature);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Admins always have access
    if (user?.role === 'ADMIN') {
      setChecked(true);
      return;
    }

    // Check if feature is enabled
    if (!isEnabled) {
      setChecked(false);
      if (!showMessage) {
        // Redirect immediately if not showing message
        router.replace(redirectTo);
      }
    } else {
      setChecked(true);
    }
  }, [isEnabled, user, router, redirectTo, showMessage]);

  // If feature is disabled and we should show message
  if (!isEnabled && showMessage && user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-navy-50 mb-2">Feature Disabled</h2>
                <p className="text-navy-200">
                  This feature is currently disabled. Please contact support if you believe this is an error.
                </p>
              </div>
              <button
                onClick={() => router.push(redirectTo)}
                className="px-4 py-2 bg-plum-600 hover:bg-plum-700 text-white rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If feature is enabled or user is admin, show children
  if (checked || user?.role === 'ADMIN') {
    return <>{children}</>;
  }

  // Loading state
  return null;
}






