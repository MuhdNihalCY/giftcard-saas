# Guide: Disable Product Sections & Enable Public Gift Card Creation

This guide explains how to disable the product sections and enable direct public gift card creation.

## Overview

The system supports:
- **Product-based gift cards**: Gift cards created through product catalog
- **Direct gift card creation**: Gift cards created directly without products (public creation)

You can disable the product sections while keeping direct gift card creation enabled.

## Feature Flags

The system uses feature flags to control access to different features:

1. **`gift_card_products`** (PAGE): Controls access to product catalog management
2. **`public_gift_card_creation`** (FEATURE): Allows direct gift card creation without products

## How to Disable Products

### Option 1: Via Admin Dashboard (Recommended)

1. Log in as an **ADMIN** user
2. Navigate to **Dashboard → Feature Flags** (`/dashboard/admin/feature-flags`)
3. Find the **"Gift Card Products"** feature flag
4. Toggle it to **Disabled**
5. The product sections will be hidden from the sidebar and navigation

### Option 2: Via API

```bash
# Get all feature flags
curl -X GET http://localhost:8000/api/v1/feature-flags \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Find the feature flag ID for 'gift_card_products'

# Toggle the feature flag
curl -X POST http://localhost:8000/api/v1/feature-flags/{flagId}/toggle \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Option 3: Via Database

```sql
-- Disable gift card products feature
UPDATE feature_flags 
SET is_enabled = false 
WHERE feature_key = 'gift_card_products';
```

## What Gets Hidden When Products Are Disabled

When `gift_card_products` is disabled:

- ✅ **Products** menu item removed from sidebar
- ✅ **Product creation/editing pages** become inaccessible
- ✅ **Product-related API endpoints** still work but are hidden from UI
- ✅ **Direct gift card creation** still works (via `/dashboard/gift-cards/create`)
- ✅ **Gift card management** continues to work normally

## Public Gift Card Creation

The `public_gift_card_creation` feature flag (enabled by default) allows:

- Direct gift card creation without requiring products
- Gift cards can be created with custom values
- No product catalog needed

### Creating Gift Cards Directly

1. Navigate to **Gift Cards → Create** (`/dashboard/gift-cards/create`)
2. Fill in:
   - Value (amount)
   - Currency
   - Expiry Date (optional)
   - Recipient details (optional)
   - Template (optional)
3. Click **Create Gift Card**

## Enabling/Disabling Features

### Enable Public Creation Only (No Products)

```bash
# Disable products
UPDATE feature_flags SET is_enabled = false WHERE feature_key = 'gift_card_products';

# Ensure public creation is enabled
UPDATE feature_flags SET is_enabled = true WHERE feature_key = 'public_gift_card_creation';
```

### Re-enable Products

```bash
UPDATE feature_flags SET is_enabled = true WHERE feature_key = 'gift_card_products';
```

## Frontend Behavior

The frontend automatically:
- Hides product-related navigation items when the feature flag is disabled
- Shows/hides UI elements based on feature flag status
- Allows direct gift card creation regardless of product status

## Backend Behavior

The backend:
- Still accepts product-related API calls (for backward compatibility)
- Allows gift card creation with or without `productId`
- Validates gift cards the same way regardless of product usage

## Testing

1. **Disable products** via admin dashboard
2. **Verify**:
   - Products menu item is hidden
   - Direct gift card creation still works
   - Existing gift cards still function
3. **Re-enable products** to restore full functionality

## Notes

- Disabling products does **not** delete existing products or gift cards
- Gift cards created from products continue to work normally
- You can re-enable products at any time
- Feature flags are role-based and can be configured per role


