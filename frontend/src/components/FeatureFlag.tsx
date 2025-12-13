'use client';

import { ReactNode } from 'react';
import { useFeatureFlag } from '../hooks/useFeatureFlag';

interface FeatureFlagProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on feature flag
 * If feature is disabled, renders fallback (or nothing) instead
 */
export function FeatureFlag({ feature, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(feature);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}






