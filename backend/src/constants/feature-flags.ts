/**
 * Feature Flag Constants
 * Defines all available feature flags in the system
 */

export enum FeatureFlagCategory {
  PAGE = 'PAGE',
  FEATURE = 'FEATURE',
}

export enum FeatureFlagTargetRole {
  MERCHANT = 'MERCHANT',
  CUSTOMER = 'CUSTOMER',
  ALL = 'ALL',
}

export interface FeatureFlagDefinition {
  featureKey: string;
  featureName: string;
  description: string;
  category: FeatureFlagCategory;
  targetRole: FeatureFlagTargetRole;
  defaultEnabled: boolean;
}

/**
 * Page-Level Feature Flags
 * Control entire pages/modules
 */
export const PAGE_LEVEL_FEATURES: FeatureFlagDefinition[] = [
  {
    featureKey: 'gift_cards',
    featureName: 'Gift Cards Management',
    description: 'Access to gift cards creation, management, and viewing',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'gift_card_products',
    featureName: 'Gift Card Products',
    description: 'Access to product catalog management',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'templates',
    featureName: 'Gift Card Templates',
    description: 'Access to template creation and management',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'analytics',
    featureName: 'Analytics Dashboard',
    description: 'Access to analytics and reporting',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'payments',
    featureName: 'Payments',
    description: 'Access to payment history and management. Controls visibility of payments page for merchants and admins.',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: false, // Hidden by default - must be enabled via feature flags
  },
  {
    featureKey: 'redemptions',
    featureName: 'Redemptions',
    description: 'Access to redemption history and management',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'delivery',
    featureName: 'Delivery Management',
    description: 'Access to delivery options and management',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'payouts',
    featureName: 'Payouts',
    description: 'Access to payout management',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'reports',
    featureName: 'Reports',
    description: 'Access to sales and redemption reports',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'wallet',
    featureName: 'Digital Wallet',
    description: 'Access to customer wallet and gift card storage',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.CUSTOMER,
    defaultEnabled: true,
  },
];

/**
 * Feature-Level Feature Flags
 * Control specific features within pages
 */
export const FEATURE_LEVEL_FEATURES: FeatureFlagDefinition[] = [
  {
    featureKey: 'bulk_gift_card_creation',
    featureName: 'Bulk Gift Card Creation',
    description: 'Ability to create multiple gift cards at once',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'gift_card_sharing',
    featureName: 'Gift Card Sharing',
    description: 'Ability to share gift cards via links and tokens',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.ALL,
    defaultEnabled: true,
  },
  {
    featureKey: 'public_gift_card_creation',
    featureName: 'Public Gift Card Creation',
    description: 'Allow direct gift card creation without requiring products',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.ALL,
    defaultEnabled: true,
  },
  {
    featureKey: 'nfc_support',
    featureName: 'NFC Support',
    description: 'NFC-based gift card sharing and redemption',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.ALL,
    defaultEnabled: true,
  },
  {
    featureKey: 'pdf_generation',
    featureName: 'PDF Generation',
    description: 'Ability to generate PDF gift cards',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'sms_delivery',
    featureName: 'SMS Delivery',
    description: 'Ability to send gift cards via SMS',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'scheduled_delivery',
    featureName: 'Scheduled Delivery',
    description: 'Ability to schedule gift card delivery',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'expiry_reminders',
    featureName: 'Expiry Reminders',
    description: 'Automatic expiry reminder emails',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'breakage_tracking',
    featureName: 'Breakage Tracking',
    description: 'Track unredeemed gift card value (breakage)',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'chargeback_handling',
    featureName: 'Chargeback Handling',
    description: 'Automatic chargeback processing and gift card invalidation',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'merchant_payouts',
    featureName: 'Merchant Payouts',
    description: 'Merchant payout system and balance management',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'payment_gateway_config',
    featureName: 'Payment Gateway Configuration',
    description: 'Ability to configure merchant payment gateways',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'two_factor_auth',
    featureName: 'Two-Factor Authentication',
    description: '2FA security features',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.ALL,
    defaultEnabled: true,
  },
  {
    featureKey: 'api_access',
    featureName: 'API Access',
    description: 'API key management and API access',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
  {
    featureKey: 'webhooks',
    featureName: 'Webhooks',
    description: 'Webhook configuration and management',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
];

/**
 * All feature flags combined
 */
export const ALL_FEATURE_FLAGS: FeatureFlagDefinition[] = [
  ...PAGE_LEVEL_FEATURES,
  ...FEATURE_LEVEL_FEATURES,
];

/**
 * Get feature flag definition by key
 */
export function getFeatureFlagDefinition(featureKey: string): FeatureFlagDefinition | undefined {
  return ALL_FEATURE_FLAGS.find((flag) => flag.featureKey === featureKey);
}

/**
 * Get feature flags by category
 */
export function getFeatureFlagsByCategory(
  category: FeatureFlagCategory
): FeatureFlagDefinition[] {
  return ALL_FEATURE_FLAGS.filter((flag) => flag.category === category);
}

/**
 * Get feature flags by target role
 */
export function getFeatureFlagsByRole(
  targetRole: FeatureFlagTargetRole
): FeatureFlagDefinition[] {
  return ALL_FEATURE_FLAGS.filter(
    (flag) => flag.targetRole === targetRole || flag.targetRole === FeatureFlagTargetRole.ALL
  );
}






