# Complete Feature Flags Guide

## Overview

The Gift Card SaaS platform uses a comprehensive feature flag system to control access to features and pages. This allows administrators to enable/disable features without code changes.

## How Feature Flags Work

### Architecture

1. **Backend**: Feature flags are stored in the database (`feature_flags` table)
2. **Frontend**: Feature flags are cached in Zustand store with 5-minute cache
3. **Middleware**: Backend routes can be protected with feature flag checks
4. **Components**: Frontend components can conditionally render based on flags

### Feature Flag Structure

```typescript
{
  id: string;
  featureKey: string;        // Unique identifier (e.g., 'gift_card_products')
  featureName: string;       // Display name (e.g., 'Gift Card Products')
  description: string;       // Description of what the feature does
  category: 'PAGE' | 'FEATURE';  // PAGE = entire page, FEATURE = specific feature
  targetRole: 'MERCHANT' | 'CUSTOMER' | 'ALL';  // Who this applies to
  isEnabled: boolean;        // Whether feature is enabled
  metadata: Record<string, any>;  // Additional data
}
```

## Adding a New Feature Flag

### Step 1: Define in Constants

Add your feature flag definition to `backend/src/constants/feature-flags.ts`:

```typescript
// For PAGE-level features (entire pages/modules)
export const PAGE_LEVEL_FEATURES: FeatureFlagDefinition[] = [
  // ... existing flags
  {
    featureKey: 'my_new_feature',
    featureName: 'My New Feature',
    description: 'Description of what this feature does',
    category: FeatureFlagCategory.PAGE,
    targetRole: FeatureFlagTargetRole.MERCHANT,
    defaultEnabled: true,
  },
];

// For FEATURE-level features (specific features within pages)
export const FEATURE_LEVEL_FEATURES: FeatureFlagDefinition[] = [
  // ... existing flags
  {
    featureKey: 'my_new_subfeature',
    featureName: 'My New Subfeature',
    description: 'Description of what this subfeature does',
    category: FeatureFlagCategory.FEATURE,
    targetRole: FeatureFlagTargetRole.ALL,
    defaultEnabled: true,
  },
];
```

### Step 2: Use in Frontend

#### Option A: Using the Hook

```typescript
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

function MyComponent() {
  const isEnabled = useFeatureFlag('my_new_feature');
  
  if (!isEnabled) {
    return <div>Feature is disabled</div>;
  }
  
  return <div>Feature content</div>;
}
```

#### Option B: Using FeatureFlagGuard Component

```typescript
import { FeatureFlagGuard } from '@/components/FeatureFlagGuard';

function MyPage() {
  return (
    <FeatureFlagGuard feature="my_new_feature">
      <div>Protected content</div>
    </FeatureFlagGuard>
  );
}
```

#### Option C: In Navigation/Sidebar

```typescript
// In Sidebar.tsx
const navItems = [
  {
    label: 'My Feature',
    href: '/dashboard/my-feature',
    icon: MyIcon,
    roles: ['MERCHANT'],
    featureFlag: 'my_new_feature',  // Add this
  },
];
```

### Step 3: Protect Backend Routes (Optional)

```typescript
import { checkFeatureFlag } from '../middleware/feature-flag.middleware';

// Protect entire route
router.get(
  '/my-feature',
  authenticate,
  checkFeatureFlag('my_new_feature'),  // Add this
  myController.getData
);

// Or check in controller
import { requireFeatureFlag } from '../middleware/feature-flag.middleware';

async myController(req: AuthRequest, res: Response) {
  const isEnabled = await requireFeatureFlag('my_new_feature', req.user.role);
  if (!isEnabled) {
    return res.status(403).json({ error: 'Feature disabled' });
  }
  // ... rest of logic
}
```

### Step 4: Initialize in Database

Feature flags are automatically created when the system starts (via seed script or admin UI). You can also create them manually:

**Via Admin UI:**
1. Go to `/dashboard/admin/feature-flags`
2. Click "Add New Feature Flag"
3. Fill in the form
4. Save

**Via API:**
```bash
POST /api/v1/feature-flags
{
  "featureKey": "my_new_feature",
  "featureName": "My New Feature",
  "description": "Description",
  "category": "PAGE",
  "targetRole": "MERCHANT",
  "isEnabled": true
}
```

**Via Database:**
```sql
INSERT INTO feature_flags (
  id, feature_key, feature_name, description, 
  category, target_role, is_enabled, metadata
) VALUES (
  gen_random_uuid(),
  'my_new_feature',
  'My New Feature',
  'Description',
  'PAGE',
  'MERCHANT',
  true,
  '{}'::jsonb
);
```

## How Features Are Controlled

### Frontend Control

1. **Navigation Items**: Sidebar automatically hides items when feature flag is disabled
2. **Page Access**: `FeatureFlagGuard` component blocks access to pages
3. **Component Rendering**: `useFeatureFlag` hook conditionally renders components
4. **Caching**: Feature flags are cached for 5 minutes to reduce API calls

### Backend Control

1. **Route Protection**: Middleware can block entire routes
2. **Controller Logic**: Controllers can check flags before processing
3. **Role-Based**: Flags can target specific roles (MERCHANT, CUSTOMER, ALL)
4. **Admin Override**: Admins always have access regardless of flag status

### Behavior Rules

- **Admins**: Always have access to all features (bypass feature flags)
- **Missing Flags**: If a flag doesn't exist, feature defaults to **enabled** (backward compatibility)
- **Role Mismatch**: If flag doesn't apply to user's role, feature is **enabled**
- **Error Handling**: On errors, system defaults to **enabled** (fail-open)

## Current Feature Flags

### Page-Level Features (PAGE)

These control entire pages/modules:

1. **`gift_cards`** - Gift Cards Management page
2. **`gift_card_products`** - Product Catalog Management page
3. **`templates`** - Gift Card Templates page
4. **`analytics`** - Analytics Dashboard page
5. **`payments`** - Payments page
6. **`redemptions`** - Redemptions page
7. **`delivery`** - Delivery Management page
8. **`payouts`** - Payouts page
9. **`wallet`** (CUSTOMER) - Customer Wallet page

### Feature-Level Features (FEATURE)

These control specific features within pages:

1. **`bulk_gift_card_creation`** - Bulk creation feature
2. **`gift_card_sharing`** - Sharing via links/tokens
3. **`nfc_support`** - NFC-based sharing
4. **`pdf_generation`** - PDF gift card generation
5. **`sms_delivery`** - SMS delivery option
6. **`scheduled_delivery`** - Scheduled delivery feature
7. **`expiry_reminders`** - Automatic expiry reminders
8. **`breakage_tracking`** - Breakage tracking feature
9. **`chargeback_handling`** - Chargeback processing
10. **`merchant_payouts`** - Merchant payout system
11. **`payment_gateway_config`** - Payment gateway configuration
12. **`two_factor_auth`** - 2FA security
13. **`api_access`** - API key management
14. **`webhooks`** - Webhook configuration
15. **`public_gift_card_creation`** - Direct gift card creation without products

## Do All Features Work Based on Feature Flags?

### ✅ Features Controlled by Flags

- **Navigation items** in sidebar
- **Page access** (via FeatureFlagGuard)
- **Product catalog** system
- **Analytics dashboard**
- **Breakage tracking**
- **Chargeback handling**
- **Payout system**
- **Payment gateway configuration**
- **API access**
- **Webhooks**

### ⚠️ Features NOT Controlled by Flags (Core Functionality)

These are core features that always work:

- **Authentication** (login, register, password reset)
- **Basic gift card creation** (direct creation)
- **Gift card redemption** (core functionality)
- **Payment processing** (core functionality)
- **User management** (admin only, always available)
- **Settings** (always available)
- **Dashboard** (main page, always available)

### Why Some Features Aren't Flagged

Core business functionality (like gift card creation and redemption) are not behind feature flags because:
1. They are essential to the platform's operation
2. Disabling them would break the core value proposition
3. They don't need to be toggled on/off

## Admin Feature Flags UI

Access the admin UI at `/dashboard/admin/feature-flags`:

### Features:
- ✅ View all feature flags
- ✅ Filter by category (PAGE/FEATURE) and role
- ✅ Toggle individual flags on/off
- ✅ Batch update multiple flags
- ✅ Create new feature flags
- ✅ Edit existing feature flags
- ✅ Delete feature flags
- ✅ View statistics

### Usage:

1. **Toggle Feature**: Click the toggle switch next to any feature
2. **Batch Update**: Select multiple features, click "Batch Update"
3. **Add New**: Click "Add New Feature Flag" button
4. **Edit**: Click the edit icon on any feature flag
5. **Delete**: Click the delete icon (use with caution)

## API Endpoints

### Public Endpoints

```bash
# Get feature flags for current user's role
GET /api/v1/feature-flags

# Check if specific feature is enabled
GET /api/v1/feature-flags/check/:featureKey?role=MERCHANT
```

### Admin Endpoints (Require Admin Role)

```bash
# Get all feature flags
GET /api/v1/feature-flags/all

# Get feature flag by ID
GET /api/v1/feature-flags/:id

# Create feature flag
POST /api/v1/feature-flags
{
  "featureKey": "string",
  "featureName": "string",
  "description": "string",
  "category": "PAGE" | "FEATURE",
  "targetRole": "MERCHANT" | "CUSTOMER" | "ALL",
  "isEnabled": boolean,
  "metadata": {}
}

# Update feature flag
PUT /api/v1/feature-flags/:id
{
  "featureName": "string",
  "description": "string",
  "category": "PAGE" | "FEATURE",
  "targetRole": "MERCHANT" | "CUSTOMER" | "ALL",
  "isEnabled": boolean,
  "metadata": {}
}

# Toggle feature flag
POST /api/v1/feature-flags/:id/toggle

# Batch update
POST /api/v1/feature-flags/batch-update
{
  "updates": [
    { "id": "uuid", "isEnabled": true },
    { "id": "uuid", "isEnabled": false }
  ]
}

# Delete feature flag
DELETE /api/v1/feature-flags/:id

# Get statistics
GET /api/v1/feature-flags/statistics
```

## Best Practices

1. **Use Descriptive Keys**: Use snake_case and be descriptive (`gift_card_products` not `products`)

2. **Choose Right Category**:
   - Use `PAGE` for entire pages/modules
   - Use `FEATURE` for specific features within pages

3. **Set Target Role Correctly**:
   - `MERCHANT`: Only for merchant users
   - `CUSTOMER`: Only for customer users
   - `ALL`: For all users

4. **Default to Enabled**: New features should default to `isEnabled: true` for backward compatibility

5. **Document Flags**: Always add descriptions explaining what the flag controls

6. **Test Both States**: Test your feature with flag both enabled and disabled

7. **Fail Open**: On errors, default to enabled (already implemented)

8. **Cache Considerations**: Frontend caches flags for 5 minutes - changes may take time to reflect

## Troubleshooting

### Feature Not Showing/Hiding

1. **Check Flag Status**: Verify flag is enabled/disabled in admin UI
2. **Check Role**: Ensure flag's `targetRole` matches user's role
3. **Clear Cache**: Clear browser localStorage or wait 5 minutes
4. **Check Implementation**: Verify `useFeatureFlag` or `FeatureFlagGuard` is used correctly

### Admin Can't Access Feature

- Admins should always have access. If not, check:
  1. Backend middleware implementation
  2. Frontend hook implementation
  3. User role is actually ADMIN

### Flag Not Found Error

- If flag doesn't exist, feature defaults to enabled
- Create the flag in admin UI or database
- Check `featureKey` spelling matches exactly

## Examples

### Example 1: Adding a New Page Feature

```typescript
// 1. Add to constants
{
  featureKey: 'reports',
  featureName: 'Reports',
  description: 'Advanced reporting and analytics',
  category: FeatureFlagCategory.PAGE,
  targetRole: FeatureFlagTargetRole.MERCHANT,
  defaultEnabled: true,
}

// 2. Use in sidebar
{
  label: 'Reports',
  href: '/dashboard/reports',
  icon: FileText,
  roles: ['MERCHANT'],
  featureFlag: 'reports',
}

// 3. Protect page
<FeatureFlagGuard feature="reports">
  <ReportsPage />
</FeatureFlagGuard>
```

### Example 2: Adding a Feature Within a Page

```typescript
// 1. Add to constants
{
  featureKey: 'export_to_csv',
  featureName: 'Export to CSV',
  description: 'Export data to CSV format',
  category: FeatureFlagCategory.FEATURE,
  targetRole: FeatureFlagTargetRole.MERCHANT,
  defaultEnabled: true,
}

// 2. Use in component
function ReportsPage() {
  const canExport = useFeatureFlag('export_to_csv');
  
  return (
    <div>
      <ReportsTable />
      {canExport && <ExportButton />}
    </div>
  );
}
```

## Summary

- ✅ Feature flags control **most** features, but not core functionality
- ✅ Easy to add new flags via constants file and admin UI
- ✅ Frontend and backend both support feature flags
- ✅ Admins always have access (bypass flags)
- ✅ System fails open (defaults to enabled on errors)
- ✅ Flags are cached for performance
- ✅ Role-based targeting available


