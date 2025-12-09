# All User Features - Gift Card SaaS Platform

This document provides a comprehensive list of all features available to **Admins**, **Merchants**, and **Customers** in the Gift Card SaaS Platform.

---

## Table of Contents

1. [Admin Features](#admin-features)
2. [Merchant Features](#merchant-features)
3. [Customer Features](#customer-features)
4. [Public Features](#public-features)
5. [Feature Comparison Matrix](#feature-comparison-matrix)
6. [API Endpoints Summary](#api-endpoints-summary)

---

## Admin Features

Admins have full platform-wide access and can manage all merchants, customers, and system settings.

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
  - Filter by date ranges
  - Export analytics data

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
  - Export communication logs

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
  - Search audit logs

### 5. System Administration

- ✅ **Platform Management**
  - Access all merchant accounts
  - View all gift cards across platform
  - View all payments across platform
  - View all redemptions across platform
  - Monitor platform health
  - Manage system-wide settings
  - View all user accounts
  - Manage user roles (future feature)

### 6. Enhanced Access Control

- ✅ **Cross-Merchant Access**
  - View any merchant's gift cards
  - View any merchant's products
  - View any merchant's templates
  - View any merchant's analytics
  - Access any merchant's data (for support/admin purposes)
  - Manage any merchant's gift cards
  - Process refunds for any merchant

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
  - List all own gift cards (with pagination)
  - Filter by status (ACTIVE, REDEEMED, EXPIRED, CANCELLED)
  - Search by code
  - View gift card details
  - View QR codes

- ✅ **Update Gift Cards**
  - Update own gift card details
  - Modify expiry dates
  - Update recipient information
  - Change gift card status
  - Update custom messages

- ✅ **Delete Gift Cards**
  - Soft delete own gift cards
  - Cancel own gift cards

- ✅ **Gift Card Lookup**
  - Search by gift card code
  - View gift card by ID
  - Access gift card QR codes

### 2. Gift Card Templates

- ✅ **Template Management**
  - Create custom gift card templates
  - Design templates with custom colors, images, and layouts
  - Set template as public or private
  - Update own templates
  - Delete own templates
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
  - Update own product details
  - Delete own products
  - View own product listings
  - View public products from other merchants

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
  - View all own redemptions
  - Filter redemptions by date, amount, method
  - View redemption details
  - View gift card transaction history
  - Track redemption patterns

### 5. Payment Management

- ✅ **Payment Operations**
  - View own payment history
  - View payment details
  - Process refunds for own payments
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
  - View total revenue (own sales)
  - Track total transactions
  - Calculate average transaction value
  - Revenue breakdown by payment method
  - Revenue breakdown by currency
  - View latest payments
  - Filter by date range

- ✅ **Redemption Analytics**
  - Total redemptions count (own)
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
  - Total gift cards created (own)
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

## Customer Features

Customers are end-users who purchase and use gift cards.

### 1. Gift Card Browsing & Discovery

- ✅ **Browse Products**
  - View public gift card products
  - Search products by name, category, or tags
  - Filter products by merchant
  - View product details (description, images, pricing)
  - View product availability
  - Browse product categories

- ✅ **Product Information**
  - View product pricing options
  - See available denominations
  - Check product expiry terms
  - View merchant information
  - See product images and designs

### 2. Gift Card Purchase

- ✅ **Single Purchase**
  - Purchase gift cards from products
  - Select gift card amount (if variable)
  - Choose from fixed amount options
  - Enter custom amount (if allowed)
  - Add personalized message
  - Set recipient details (email, name)
  - Select payment method (Stripe, PayPal, Razorpay, UPI)
  - Complete payment securely
  - Receive gift card after purchase

- ✅ **Bulk Purchase**
  - Purchase multiple gift cards at once
  - Set different amounts for each recipient
  - Add personalized messages per gift card
  - Set different recipients
  - Single payment for all gift cards
  - Receive all gift cards after purchase

- ✅ **Direct Purchase**
  - Purchase gift cards directly (without product)
  - Set custom gift card value
  - Configure gift card details
  - Complete payment
  - Receive gift card

### 3. Payment Management

- ✅ **Payment Processing**
  - Create payment intents
  - Confirm payments
  - Multiple payment gateway support
  - Secure payment processing
  - Payment confirmation

- ✅ **Payment History**
  - View own payment history
  - Filter payments by status
  - Filter payments by method
  - View payment details
  - Track payment status
  - View payment receipts

### 4. Gift Card Management

- ✅ **View Gift Cards**
  - View all purchased gift cards
  - View received gift cards (if recipient)
  - Filter by status
  - View gift card details
  - View gift card codes
  - View QR codes
  - Check gift card balance
  - View expiry dates

- ✅ **Gift Card Information**
  - View gift card value
  - Check current balance
  - View gift card status
  - See merchant information
  - View gift card design/template
  - Check expiry date
  - View transaction history

### 5. Gift Card Validation & Balance

- ✅ **Validation**
  - Validate gift card codes (public endpoint)
  - Check if gift card is valid
  - Verify gift card status
  - Check expiry status

- ✅ **Balance Checking**
  - Check gift card balance (public endpoint)
  - View available balance
  - See remaining balance
  - Check if balance is sufficient

### 6. Gift Card Redemption

- ✅ **Link-Based Redemption**
  - Redeem gift cards via redemption link (public)
  - Access redemption page via link
  - View gift card details before redemption
  - Complete redemption process
  - Receive redemption confirmation

- ✅ **Redemption History**
  - View redemption history for own gift cards
  - See redemption details
  - Track redemption transactions
  - View redemption amounts
  - See redemption dates

### 7. Gift Card Sharing

- ✅ **Share Gift Cards**
  - Generate share tokens for gift cards
  - Set share token expiry (hours)
  - Create shareable links
  - Share gift cards with others
  - Revoke share tokens
  - Control sharing permissions

- ✅ **View Shared Gift Cards**
  - View gift cards via share token (public)
  - Access gift card information through share link
  - See gift card details without authentication

- ✅ **NFC Support**
  - Get NFC data for gift cards
  - Enable NFC-based sharing
  - Use NFC for contactless redemption

### 8. Transaction History

- ✅ **Transaction Tracking**
  - View gift card transaction history
  - See all transactions for a gift card
  - Track purchase transactions
  - Track redemption transactions
  - View transaction amounts
  - See transaction dates
  - View transaction metadata

### 9. Account Management

- ✅ **Registration & Authentication**
  - Register new account
  - Login with email/password
  - Refresh authentication tokens
  - Secure session management
  - Email verification
  - Password reset

- ✅ **Profile Management**
  - View profile information
  - Update personal details
  - Manage account settings
  - Update email address
  - Change password

### 10. Digital Wallet (Conceptual)

- ✅ **Gift Card Storage**
  - Store purchased gift cards
  - Organize gift cards
  - Quick access to gift cards
  - View wallet balance (sum of all gift cards)

---

## Public Features

Features available without authentication:

### 1. Product Discovery
- ✅ Browse public gift card products
- ✅ View product details
- ✅ Search products
- ✅ Filter products

### 2. Gift Card Validation
- ✅ Validate gift card codes
- ✅ Check gift card balance
- ✅ Verify gift card status

### 3. Gift Card Redemption
- ✅ Redeem gift cards via link
- ✅ Access redemption pages

### 4. Gift Card Sharing
- ✅ View gift cards via share token
- ✅ Access shared gift card information

### 5. Authentication
- ✅ User registration
- ✅ User login
- ✅ Password reset
- ✅ Email verification

---

## Feature Comparison Matrix

| Feature | Admin | Merchant | Customer | Public |
|---------|-------|----------|----------|--------|
| **Gift Card Management** |
| Create gift cards | ✅ | ✅ | ❌ | ❌ |
| View own gift cards | ✅ | ✅ | ✅ | ❌ |
| View all gift cards | ✅ | ❌ | ❌ | ❌ |
| Update gift cards | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Delete gift cards | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Bulk create | ✅ | ✅ | ❌ | ❌ |
| **Templates** |
| Create templates | ✅ | ✅ | ❌ | ❌ |
| View templates | ✅ (all) | ✅ (all) | ❌ | ❌ |
| Update templates | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Delete templates | ✅ (all) | ✅ (own) | ❌ | ❌ |
| **Products** |
| Create products | ✅ | ✅ | ❌ | ❌ |
| View own products | ✅ | ✅ | ❌ | ❌ |
| View public products | ✅ | ✅ | ✅ | ✅ |
| Update products | ✅ (all) | ✅ (own) | ❌ | ❌ |
| Delete products | ✅ (all) | ✅ (own) | ❌ | ❌ |
| **Purchase** |
| Purchase gift cards | ✅ | ❌ | ✅ | ❌ |
| Bulk purchase | ✅ | ❌ | ✅ | ❌ |
| View purchases | ✅ | ❌ | ✅ | ❌ |
| **Redemption** |
| Redeem (QR/Code) | ✅ | ✅ | ❌ | ❌ |
| Redeem via link | ✅ | ✅ | ✅ | ✅ |
| Validate codes | ✅ | ✅ | ✅ | ✅ |
| Check balance | ✅ | ✅ | ✅ | ✅ |
| View redemption history | ✅ (all) | ✅ (own) | ✅ (own) | ❌ |
| **Payments** |
| Create payments | ✅ | ❌ | ✅ | ❌ |
| View payments | ✅ (all) | ✅ (own) | ✅ (own) | ❌ |
| Process refunds | ✅ | ✅ | ❌ | ❌ |
| **Delivery** |
| Send gift cards | ✅ | ✅ | ❌ | ❌ |
| Generate PDFs | ✅ | ✅ | ✅ | ❌ |
| **Analytics** |
| Own analytics | ✅ | ✅ | ❌ | ❌ |
| Any merchant analytics | ✅ | ❌ | ❌ | ❌ |
| Platform analytics | ✅ | ❌ | ❌ | ❌ |
| **Sharing** |
| Generate share tokens | ✅ | ✅ | ✅ | ❌ |
| View via share token | ✅ | ✅ | ✅ | ✅ |
| Revoke tokens | ✅ | ✅ | ✅ | ❌ |
| NFC data | ✅ | ✅ | ✅ | ❌ |
| **File Management** |
| Upload files | ✅ | ✅ | ❌ | ❌ |
| Delete files | ✅ | ✅ | ❌ | ❌ |
| **Communication** |
| Manage settings | ✅ | ❌ | ❌ | ❌ |
| View logs | ✅ | ❌ | ❌ | ❌ |
| **Audit Logs** |
| View logs | ✅ | ❌ | ❌ | ❌ |
| Export logs | ✅ | ❌ | ❌ | ❌ |
| **Account** |
| Register | ✅ | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ | ✅ |
| View profile | ✅ | ✅ | ✅ | ❌ |
| Update profile | ✅ | ✅ | ✅ | ❌ |

---

## API Endpoints Summary

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

### Merchant & Admin Endpoints
- All gift card CRUD endpoints (with merchant data filtering for merchants)
- All template CRUD endpoints (with merchant data filtering for merchants)
- All product CRUD endpoints (with merchant data filtering for merchants)
- All redemption endpoints (merchants can redeem)
- Payment refund endpoints
- All delivery endpoints
- All analytics endpoints (with merchant data filtering for merchants)
- All file upload endpoints

### Customer Endpoints
- `POST /api/v1/payments/create-intent` - Create payment
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/from-product` - Purchase from product
- `POST /api/v1/payments/bulk-purchase` - Bulk purchase
- `GET /api/v1/payments` - List own payments
- `GET /api/v1/payments/:id` - Get payment details
- `GET /api/v1/giftcards` - List own gift cards
- `GET /api/v1/giftcards/:id` - Get gift card details
- `GET /api/v1/giftcards/code/:code` - Get gift card by code
- `GET /api/v1/giftcards/:id/qr` - Get QR code
- `GET /api/v1/giftcard-products/public` - Browse public products
- `GET /api/v1/giftcard-products/:id` - Get product details
- `POST /api/v1/giftcard-share/:giftCardId/generate-token` - Generate share token
- `GET /api/v1/giftcard-share/token/:token` - View via share token
- `DELETE /api/v1/giftcard-share/:giftCardId/revoke-token` - Revoke share token
- `GET /api/v1/giftcard-share/:giftCardId/nfc-data` - Get NFC data
- `GET /api/v1/redemptions` - List own redemptions
- `GET /api/v1/redemptions/:id` - Get redemption details
- `GET /api/v1/redemptions/gift-card/:id/history` - Get gift card history
- `GET /api/v1/redemptions/gift-card/:id/transactions` - Get transaction history
- `GET /api/v1/delivery/pdf/:id` - Generate PDF
- `GET /api/v1/delivery/pdf/:id/download` - Download PDF

### Public Endpoints (No Authentication)
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/giftcard-products/public` - Browse public products
- `GET /api/v1/giftcard-products/:id` - Get product details
- `GET /api/v1/giftcards/code/:code` - Get gift card by code
- `POST /api/v1/redemptions/validate` - Validate gift card
- `POST /api/v1/redemptions/check-balance` - Check balance
- `POST /api/v1/redemptions/redeem/:code` - Redeem via link
- `GET /api/v1/giftcard-share/token/:token` - View via share token
- `POST /api/v1/password-reset/request` - Request password reset
- `POST /api/v1/password-reset/reset` - Reset password
- `POST /api/v1/email-verification/resend` - Resend verification email
- `POST /api/v1/email-verification/verify` - Verify email

---

## Notes

1. **Data Isolation**: 
   - Merchants can only view and manage their own data
   - Customers can only view their own purchases and gift cards
   - Admins can view and manage data from all users

2. **Analytics Filtering**: 
   - Merchants can filter analytics by their own merchantId
   - Admins can filter by any merchantId or view platform-wide analytics
   - Customers do not have analytics access

3. **Communication Controls**: 
   - Only admins can enable/disable communication channels and configure rate limits
   - This ensures platform-wide control over communication services

4. **Audit Logging**: 
   - All admin actions are logged in the audit log system
   - Customer and merchant actions may be logged for security purposes

5. **Public Access**: 
   - Some features are available without authentication (product browsing, gift card validation, link-based redemption)
   - This enables easy gift card sharing and redemption

6. **Future Features**: 
   - Some features mentioned in the documentation (like user management, system settings, feature flags) are planned but not yet fully implemented
   - Digital wallet features are conceptual and may be enhanced in future versions

---

## Last Updated

This document was generated based on the current codebase state. Features are continuously being added and improved.









