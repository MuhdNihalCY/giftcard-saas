# Payment Access Control via Feature Flags

## Overview

Payment processing and viewing are now controlled by feature flags. By default, the payments section is **hidden** from customers and merchants. It must be explicitly enabled via the feature flag system.

## Feature Flag Configuration

### Payments Feature Flag

- **Feature Key**: `payments`
- **Category**: `PAGE` (controls entire payments page)
- **Target Role**: `MERCHANT` (applies to merchants and admins)
- **Default Enabled**: `false` (hidden by default)
- **Description**: "Access to payment history and management. Controls visibility of payments page for merchants and admins."

## Access Control

### Who Can Access Payments

1. **Admins**: Always have access (bypass feature flags)
2. **Merchants**: Only if `payments` feature flag is **enabled**
3. **Customers**: **Never** have access (redirected to dashboard)

### What's Protected

#### Frontend Protection:
- ✅ Payments page (`/dashboard/payments`) - Protected by `FeatureFlagGuard`
- ✅ Payments menu item in sidebar - Hidden when flag is disabled
- ✅ Customer access - Automatically redirected to dashboard

#### Backend Protection:
- ✅ `GET /api/v1/payments` - List payments (protected by feature flag)
- ✅ `GET /api/v1/payments/:id` - Get payment details (protected by feature flag)
- ✅ `POST /api/v1/payments/:id/refund` - Refund payment (protected by feature flag)

#### NOT Protected (Core Functionality):
- ✅ `POST /api/v1/payments/create-intent` - Create payment intent (core functionality)
- ✅ `POST /api/v1/payments/confirm` - Confirm payment (core functionality)
- ✅ `POST /api/v1/payments/from-product` - Create payment from product (core functionality)
- ✅ `POST /api/v1/payments/bulk-purchase` - Bulk purchase (core functionality)
- ✅ Webhook endpoints - Required for payment processing

**Note**: Payment **processing** (creating payments, confirming payments) is core functionality and always works. Only payment **viewing/management** is controlled by feature flags.

## How to Enable Payments Access

### Option 1: Via Admin Dashboard (Recommended)

1. Log in as **ADMIN**
2. Navigate to **Dashboard → Feature Flags** (`/dashboard/admin/feature-flags`)
3. Find **"Payments"** feature flag
4. Toggle it to **Enabled**
5. Merchants will now see the Payments menu item and can access the page

### Option 2: Via API

```bash
# Get all feature flags
GET /api/v1/feature-flags/admin/all

# Find the payments flag ID, then toggle it
POST /api/v1/feature-flags/admin/{flagId}/toggle
```

### Option 3: Via Database

```sql
-- Enable payments feature flag
UPDATE feature_flags 
SET is_enabled = true 
WHERE feature_key = 'payments';
```

## Implementation Details

### Backend Routes

```typescript
// Protected routes (require feature flag)
router.get('/', authenticate, checkFeatureFlag('payments'), ...);
router.get('/:id', authenticate, checkFeatureFlag('payments'), ...);
router.post('/:id/refund', authenticate, checkFeatureFlag('payments'), ...);

// Core functionality (always available)
router.post('/create-intent', authenticate, ...); // Not protected
router.post('/confirm', ...); // Not protected
```

### Frontend Page

```typescript
// Payments page is wrapped with FeatureFlagGuard
<FeatureFlagGuard feature="payments" redirectTo="/dashboard">
  <PaymentsPageContent />
</FeatureFlagGuard>

// Customers are automatically redirected
if (user?.role === 'CUSTOMER') {
  window.location.href = '/dashboard';
}
```

### Sidebar Navigation

```typescript
// Payments menu item is filtered by feature flag
{
  label: 'Payments',
  href: '/dashboard/payments',
  icon: CreditCard,
  roles: ['ADMIN', 'MERCHANT'],
  featureFlag: 'payments', // Hidden when disabled
}
```

## Behavior

### When Feature Flag is Disabled (Default):

- ❌ Payments menu item hidden from sidebar
- ❌ `/dashboard/payments` page shows "Feature Disabled" message
- ❌ `GET /api/v1/payments` returns 403 Forbidden
- ❌ `GET /api/v1/payments/:id` returns 403 Forbidden
- ❌ `POST /api/v1/payments/:id/refund` returns 403 Forbidden
- ✅ Payment processing still works (create-intent, confirm)
- ✅ Admins can still access (bypass feature flags)

### When Feature Flag is Enabled:

- ✅ Payments menu item visible in sidebar
- ✅ `/dashboard/payments` page accessible
- ✅ `GET /api/v1/payments` works
- ✅ `GET /api/v1/payments/:id` works
- ✅ `POST /api/v1/payments/:id/refund` works
- ✅ Payment processing continues to work
- ❌ Customers still cannot access (role-based restriction)

## Security Notes

1. **Payment Processing**: Core payment functionality (creating payments, confirming payments) is **never** blocked by feature flags. This ensures the platform can always process payments.

2. **Viewing Only**: Feature flags only control the ability to **view and manage** payment history, not the ability to **process** payments.

3. **Customer Restriction**: Customers are **always** blocked from accessing payments, regardless of feature flag status. This is enforced at both frontend and backend levels.

4. **Admin Override**: Admins always have access to payments, even when the feature flag is disabled. This allows admins to manage the system.

## Testing

1. **Default State** (Flag Disabled):
   - Login as merchant → Payments menu item should be hidden
   - Try to access `/dashboard/payments` → Should show "Feature Disabled"
   - Try `GET /api/v1/payments` → Should return 403

2. **Enabled State**:
   - Enable flag via admin dashboard
   - Login as merchant → Payments menu item should be visible
   - Access `/dashboard/payments` → Should show payments page
   - `GET /api/v1/payments` → Should return payment list

3. **Customer Access**:
   - Login as customer → Payments menu item should never appear
   - Try to access `/dashboard/payments` → Should redirect to dashboard

4. **Admin Access**:
   - Login as admin → Payments always accessible regardless of flag
   - Can toggle feature flag to control merchant access

## Summary

- ✅ Payments viewing/management controlled by feature flags
- ✅ Hidden by default for merchants
- ✅ Never accessible to customers
- ✅ Admins always have access
- ✅ Payment processing (core functionality) always works
- ✅ Easy to enable/disable via admin dashboard


