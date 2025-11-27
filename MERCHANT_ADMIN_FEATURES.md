# Merchant and Admin Features

This document provides a comprehensive list of all features available to **Merchants** and **Admins** in the Gift Card SaaS Platform.

---

## Table of Contents

1. [Merchant Features](#merchant-features)
2. [Admin Features](#admin-features)
3. [Shared Features](#shared-features)
4. [Feature Comparison](#feature-comparison)

---

## Merchant Features

Merchants are business owners who create, sell, and manage gift cards for their business.

### 1. Gift Card Management

#### 1.1 Gift Card Creation
- ✅ **Single Gift Card Creation**
  - Create individual gift cards with custom values
  - Set expiry dates
  - Add personalized messages
  - Configure recipient details (email, name)
  - Enable/disable partial redemption
  - Assign custom templates
  - Generate unique codes automatically
  - Generate QR codes for each gift card

- ✅ **Bulk Gift Card Creation**
  - Create multiple gift cards at once
  - Import via CSV/Excel files
  - Batch processing with progress tracking
  - Set default values for bulk operations

#### 1.2 Gift Card Operations
- ✅ **View Gift Cards**
  - List all gift cards (with pagination)
  - Filter by status (ACTIVE, REDEEMED, EXPIRED, CANCELLED)
  - Search by code
  - View gift card details
  - View QR codes

- ✅ **Update Gift Cards**
  - Update gift card details
  - Modify expiry dates
  - Update recipient information
  - Change gift card status
  - Update custom messages

- ✅ **Delete Gift Cards**
  - Soft delete gift cards
  - Cancel gift cards

- ✅ **Gift Card Lookup**
  - Search by gift card code
  - View gift card by ID
  - Access gift card QR codes

### 2. Gift Card Templates

- ✅ **Template Management**
  - Create custom gift card templates
  - Design templates with custom colors, images, and layouts
  - Set template as public or private
  - Update existing templates
  - Delete templates
  - View all templates
  - Apply templates to gift cards

### 3. Gift Card Products

- ✅ **Product Management**
  - Create gift card products (sellable gift card offerings)
  - Set product name, description, and images
  - Configure pricing (fixed amounts, variable amounts, custom amounts)
  - Set minimum and maximum amounts
  - Configure expiry days
  - Assign categories and tags
  - Set products as active/inactive
  - Make products public or private
  - Update product details
  - Delete products
  - View product listings (own products and public products)

### 4. Redemption Management

- ✅ **Gift Card Redemption**
  - Redeem gift cards via QR code scanning
  - Redeem gift cards via manual code entry
  - Redeem gift cards via link
  - Support partial redemption (if enabled)
  - Full redemption support
  - Add redemption notes and location
  - View redemption history

- ✅ **Redemption Validation**
  - Validate gift card codes
  - Check gift card balance
  - Verify gift card status
  - Check expiry dates

- ✅ **Redemption History**
  - View all redemptions
  - Filter redemptions by date, amount, method
  - View redemption details
  - View gift card transaction history
  - Track redemption patterns

### 5. Payment Management

- ✅ **Payment Operations**
  - View payment history
  - View payment details
  - Process refunds for payments
  - Track payment status
  - View payment methods used

- ✅ **Payment Tracking**
  - Monitor completed payments
  - Track failed payments
  - View refunded payments
  - Access payment metadata

### 6. Delivery Management

- ✅ **Gift Card Delivery**
  - Send gift cards via email
  - Send gift cards via SMS
  - Generate PDF gift cards
  - Download PDF gift cards
  - Schedule delivery
  - Send expiry reminders

- ✅ **Delivery Options**
  - Email delivery with HTML templates
  - SMS delivery via Twilio
  - PDF generation for offline access
  - Custom delivery messages

### 7. Analytics & Reporting

- ✅ **Sales Analytics**
  - View total revenue
  - Track total transactions
  - Calculate average transaction value
  - Revenue breakdown by payment method
  - Revenue breakdown by currency
  - View latest payments
  - Filter by date range

- ✅ **Redemption Analytics**
  - Total redemptions count
  - Total redemption value
  - Average redemption amount
  - Redemptions by method (QR, Code, Link, API)
  - Redemption trends over time
  - Filter by date range

- ✅ **Customer Analytics**
  - Total unique customers
  - Customer purchase frequency
  - Average customer value
  - Customer retention metrics
  - Top customers list
  - Filter by date range

- ✅ **Gift Card Statistics**
  - Total gift cards created
  - Active gift cards count
  - Redeemed gift cards count
  - Expired gift cards count
  - Total gift card value
  - Average gift card value
  - Gift card status distribution

### 8. File Management

- ✅ **File Upload**
  - Upload single images
  - Upload multiple images (up to 10 files)
  - Delete uploaded files
  - Manage business logos
  - Manage product images
  - Manage template images

### 9. Account Management

- ✅ **Profile Management**
  - View profile information
  - Update business details
  - Manage business name
  - Upload business logo
  - Update contact information

- ✅ **Authentication**
  - Login with email/password
  - Refresh authentication tokens
  - Secure session management

### 10. Merchant Balance

- ✅ **Balance Tracking**
  - View merchant balance (earnings from redemptions)
  - Track earnings from gift card redemptions
  - Monitor balance updates

---

## Admin Features

Admins have access to all merchant features **plus** additional platform-wide management capabilities.

### 1. All Merchant Features

Admins can perform all operations that merchants can do:
- ✅ All gift card management features
- ✅ All template management features
- ✅ All product management features
- ✅ All redemption features
- ✅ All payment features
- ✅ All delivery features
- ✅ All analytics features
- ✅ All file management features

**Note:** Admins can access and manage gift cards, products, and templates from **all merchants** (platform-wide access).

### 2. Platform-Wide Analytics

- ✅ **Cross-Merchant Analytics**
  - View analytics for any merchant (by merchantId)
  - Platform-wide sales analytics
  - Platform-wide redemption analytics
  - Platform-wide customer analytics
  - Platform-wide gift card statistics
  - Compare merchant performance
  - Aggregate platform metrics

### 3. Communication Management

- ✅ **Communication Settings**
  - Enable/disable email service globally
  - Enable/disable SMS service globally
  - Enable/disable OTP service globally
  - Enable/disable push notifications globally
  - Configure email rate limits (per hour)
  - Configure SMS rate limits (per hour)
  - Configure OTP rate limits (per hour per user)
  - Set OTP expiry minutes
  - Configure OTP length (4-8 digits)
  - View current communication settings
  - Update communication settings

- ✅ **Communication Logs**
  - View all communication logs
  - Filter logs by channel (EMAIL, SMS, OTP, PUSH)
  - Filter logs by recipient
  - Filter logs by status (SENT, FAILED, PENDING, BLOCKED)
  - View communication statistics
  - View channel-specific statistics
  - Monitor communication health
  - Track communication errors

### 4. Audit Logging

- ✅ **Audit Log Management**
  - View all audit logs
  - Filter logs by user
  - Filter logs by action type
  - Filter logs by resource type
  - Filter logs by date range
  - View audit log details
  - View audit log statistics
  - Export audit logs
  - Track all platform activities
  - Monitor user actions
  - Track system events

### 5. System Administration

- ✅ **Platform Management**
  - Access all merchant accounts
  - View all gift cards across platform
  - View all payments across platform
  - View all redemptions across platform
  - Monitor platform health
  - Manage system-wide settings

### 6. Enhanced Access Control

- ✅ **Cross-Merchant Access**
  - View any merchant's gift cards
  - View any merchant's products
  - View any merchant's templates
  - View any merchant's analytics
  - Access any merchant's data (for support/admin purposes)

---

## Shared Features

Features available to both Merchants and Admins:

### 1. Authentication & Security
- ✅ JWT-based authentication
- ✅ Refresh token support
- ✅ Secure session management
- ✅ Role-based access control

### 2. API Access
- ✅ RESTful API access
- ✅ API key management (for integrations)
- ✅ Webhook configuration
- ✅ API rate limiting

### 3. Data Management
- ✅ Pagination support
- ✅ Filtering and searching
- ✅ Sorting capabilities
- ✅ Date range filtering

### 4. Error Handling
- ✅ Comprehensive error messages
- ✅ Validation error handling
- ✅ Rate limiting protection

---

## Feature Comparison

| Feature | Merchant | Admin |
|---------|----------|-------|
| **Gift Card Management** |
| Create gift cards | ✅ | ✅ |
| View own gift cards | ✅ | ✅ |
| View all gift cards | ❌ | ✅ |
| Update own gift cards | ✅ | ✅ |
| Update any gift cards | ❌ | ✅ |
| Delete own gift cards | ✅ | ✅ |
| Delete any gift cards | ❌ | ✅ |
| Bulk create gift cards | ✅ | ✅ |
| **Templates** |
| Create templates | ✅ | ✅ |
| View own templates | ✅ | ✅ |
| View all templates | ❌ | ✅ |
| Update own templates | ✅ | ✅ |
| Update any templates | ❌ | ✅ |
| Delete own templates | ✅ | ✅ |
| Delete any templates | ❌ | ✅ |
| **Products** |
| Create products | ✅ | ✅ |
| View own products | ✅ | ✅ |
| View all products | ❌ | ✅ |
| Update own products | ✅ | ✅ |
| Update any products | ❌ | ✅ |
| Delete own products | ✅ | ✅ |
| Delete any products | ❌ | ✅ |
| **Redemption** |
| Redeem gift cards | ✅ | ✅ |
| View own redemptions | ✅ | ✅ |
| View all redemptions | ❌ | ✅ |
| **Payments** |
| View own payments | ✅ | ✅ |
| View all payments | ❌ | ✅ |
| Process refunds | ✅ | ✅ |
| **Delivery** |
| Send gift cards | ✅ | ✅ |
| Generate PDFs | ✅ | ✅ |
| Send reminders | ✅ | ✅ |
| **Analytics** |
| Own analytics | ✅ | ✅ |
| Any merchant analytics | ❌ | ✅ |
| Platform-wide analytics | ❌ | ✅ |
| **File Management** |
| Upload files | ✅ | ✅ |
| Delete files | ✅ | ✅ |
| **Communication** |
| Communication settings | ❌ | ✅ |
| Communication logs | ❌ | ✅ |
| **Audit Logs** |
| View audit logs | ❌ | ✅ |
| Export audit logs | ❌ | ✅ |
| **System Administration** |
| Platform management | ❌ | ✅ |
| Cross-merchant access | ❌ | ✅ |

---

## API Endpoints Summary

### Merchant-Only Endpoints
All endpoints that require `authorize('ADMIN', 'MERCHANT')` are accessible to both merchants and admins. Merchants can only access their own data.

### Admin-Only Endpoints
- `GET /api/v1/admin/communication-settings` - Get communication settings
- `PUT /api/v1/admin/communication-settings` - Update communication settings
- `GET /api/v1/admin/communication-logs/logs` - Get communication logs
- `GET /api/v1/admin/communication-logs/statistics` - Get communication statistics
- `GET /api/v1/admin/communication-logs/statistics/channels` - Get channel statistics
- `GET /api/v1/admin/audit-logs` - List audit logs
- `GET /api/v1/admin/audit-logs/:id` - Get audit log details
- `GET /api/v1/admin/audit-logs/statistics` - Get audit log statistics
- `GET /api/v1/admin/audit-logs/export` - Export audit logs

### Shared Endpoints (Merchant & Admin)
- All gift card endpoints (with merchant data filtering for merchants)
- All template endpoints (with merchant data filtering for merchants)
- All product endpoints (with merchant data filtering for merchants)
- All redemption endpoints
- All payment endpoints (with merchant data filtering for merchants)
- All delivery endpoints
- All analytics endpoints (with merchant data filtering for merchants)
- All file upload endpoints

---

## Notes

1. **Data Isolation**: Merchants can only view and manage their own data. Admins can view and manage data from all merchants.

2. **Analytics Filtering**: Merchants can filter analytics by their own merchantId. Admins can filter by any merchantId or view platform-wide analytics.

3. **Communication Controls**: Only admins can enable/disable communication channels and configure rate limits. This ensures platform-wide control over communication services.

4. **Audit Logging**: All admin actions are logged in the audit log system for security and compliance purposes.

5. **Future Features**: Some features mentioned in the documentation (like user management, system settings, feature flags) are planned but not yet fully implemented.

---

## Last Updated

This document was generated based on the current codebase state. Features are continuously being added and improved.


