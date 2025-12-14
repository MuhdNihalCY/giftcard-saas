# Gift Card SaaS Platform - Comprehensive Project Documentation

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture & Technology Stack](#architecture--technology-stack)
4. [Database Schema](#database-schema)
5. [Feature Documentation](#feature-documentation)
6. [API Architecture](#api-architecture)
7. [Frontend Architecture](#frontend-architecture)
8. [Security Implementation](#security-implementation)
9. [Payment Integration](#payment-integration)
10. [Delivery System](#delivery-system)
11. [Redemption System](#redemption-system)
12. [Analytics & Reporting](#analytics--reporting)
13. [Background Jobs & Scheduling](#background-jobs--scheduling)
14. [User Roles & Permissions](#user-roles--permissions)
15. [Deployment & Infrastructure](#deployment--infrastructure)
16. [Development Workflow](#development-workflow)
17. [Testing Strategy](#testing-strategy)
18. [Production Readiness](#production-readiness)

---

## Executive Summary

The Gift Card SaaS Platform is a comprehensive, production-ready digital gift card management system that enables businesses to create, sell, distribute, and manage digital gift cards with multiple payment gateways, delivery options, and redemption methods.

### Key Highlights

- **Multi-tenant SaaS Platform** supporting Admin, Merchant, and Customer roles
- **Multiple Payment Gateways** (Stripe, PayPal, Razorpay, UPI)
- **Flexible Redemption** (QR codes, manual codes, links, API)
- **Multi-channel Delivery** (Email, SMS, PDF)
- **Advanced Analytics** with comprehensive reporting
- **Enterprise Security** with 2FA, audit logging, fraud prevention
- **Production Ready** with health checks, monitoring, error handling

---

## Project Overview

### Purpose

To build a comprehensive, user-friendly SaaS platform that enables businesses of all sizes to create, sell, distribute, and manage digital gift cards with multiple redemption methods, seamless integrations, and powerful analytics capabilities.

### Core Value Proposition

1. **For Merchants**: Complete gift card lifecycle management with branding, analytics, and payout systems
2. **For Customers**: Easy purchase, redemption, and gift card sharing
3. **For Platform**: Scalable multi-tenant architecture with comprehensive admin controls

### Project Structure

```
giftcard-saas/
├── backend/              # Express.js API Server
│   ├── src/
│   │   ├── app.ts       # Main application entry
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Request handlers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   ├── utils/       # Utility functions
│   │   ├── validators/  # Input validation
│   │   ├── jobs/        # Background jobs
│   │   └── workers/      # Queue workers
│   ├── prisma/          # Database schema & migrations
│   └── tests/           # Test files
├── frontend/            # Next.js Application
│   └── src/
│       ├── app/         # Next.js pages (App Router)
│       ├── components/  # React components
│       ├── lib/         # Utilities & API clients
│       ├── hooks/       # React hooks
│       ├── store/       # State management (Zustand)
│       └── types/       # TypeScript types
└── documentation/       # Project documentation
```

---

## Architecture & Technology Stack

### Backend Stack

**Runtime & Framework:**
- **Node.js** 18+ with TypeScript
- **Express.js** 4.18+ for RESTful API
- **Prisma** ORM for database management
- **PostgreSQL** 15+ as primary database
- **Redis** 7+ for caching and sessions

**Key Libraries:**
- **JWT** (jsonwebtoken) for authentication
- **BullMQ** for job queues
- **Winston** for logging
- **Helmet** for security headers
- **Express Rate Limit** for API throttling
- **Zod** for schema validation
- **Multer** for file uploads
- **PDFKit** for PDF generation
- **QRCode** for QR code generation

**Payment Gateways:**
- **Stripe** SDK
- **PayPal** SDK
- **Razorpay** SDK
- **UPI** integration

**Communication Services:**
- **Brevo** (Sendinblue) for email
- **Twilio** for SMS
- **Nodemailer** for SMTP fallback

### Frontend Stack

**Framework:**
- **Next.js** 14+ (App Router)
- **React** 18+
- **TypeScript** 5.3+

**UI & Styling:**
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Recharts** for data visualization

**State Management:**
- **Zustand** for global state
- **React Hook Form** for form management

**Additional Libraries:**
- **Axios** for API calls
- **html5-qrcode** for QR code scanning
- **qrcode.react** for QR code display
- **date-fns** for date manipulation
- **jwt-decode** for token decoding

### Infrastructure

**Containerization:**
- **Docker** & Docker Compose
- Separate containers for PostgreSQL and Redis

**Development Tools:**
- **ESLint** for code linting
- **Prettier** for code formatting
- **Jest** for testing
- **Prisma Studio** for database GUI

---

## Database Schema

### Core Models

#### User Model
- **Roles**: ADMIN, MERCHANT, CUSTOMER
- **Authentication**: Email/password with 2FA support
- **Security**: Failed login attempts tracking, account locking
- **Merchant Features**: Balance tracking, business information
- **Relations**: Gift cards, payments, redemptions, templates, products

#### GiftCard Model
- **Unique Code**: Auto-generated unique identifier
- **QR Code**: Generated QR code URL
- **Value & Balance**: Decimal precision (10,2)
- **Status**: ACTIVE, REDEEMED, EXPIRED, CANCELLED
- **Sharing**: Share tokens with expiry
- **Relations**: Merchant, Template, Product, Payments, Redemptions, Transactions

#### GiftCardTemplate Model
- **Design Data**: JSON structure for colors, images, layouts
- **Visibility**: Public or private templates
- **Relations**: Merchant, Gift Cards, Products

#### GiftCardProduct Model
- **Pricing**: Fixed amounts, variable amounts, custom amounts
- **Sale Prices**: Separate from gift card values (supports discounts)
- **Visibility**: Public or private products
- **Relations**: Merchant, Template, Gift Cards

#### Payment Model
- **Payment Methods**: STRIPE, PAYPAL, RAZORPAY, UPI
- **Status**: PENDING, COMPLETED, FAILED, REFUNDED
- **Fraud Prevention**: IP address, user agent, device fingerprint
- **Commission**: Commission amount and net amount tracking
- **Relations**: Gift Card, Customer

#### Redemption Model
- **Methods**: QR_CODE, CODE_ENTRY, LINK, API
- **Tracking**: Balance before/after, location, notes
- **Relations**: Gift Card, Merchant

#### Transaction Model
- **Types**: PURCHASE, REDEMPTION, REFUND, EXPIRY
- **Balance Tracking**: Before and after balances
- **Metadata**: JSON for additional information
- **Relations**: Gift Card, User

### Supporting Models

- **ApiKey**: API key management for integrations
- **Webhook**: Webhook configuration for merchants
- **EmailVerificationToken**: Email verification tokens
- **PasswordResetToken**: Password reset tokens
- **RefreshToken**: JWT refresh token management
- **CommunicationSettings**: Global communication configuration
- **CommunicationLog**: Logs for all communications
- **AuditLog**: Comprehensive audit trail
- **OTP**: One-time password management
- **MerchantPaymentGateway**: Merchant-specific gateway configs
- **CommissionSettings**: Commission configuration
- **PayoutSettings**: Merchant payout configuration
- **Payout**: Payout transaction records

### Database Features

- **Indexes**: Optimized indexes on frequently queried fields
- **Cascading Deletes**: Proper cleanup of related records
- **Soft Deletes**: Status-based soft deletion
- **Timestamps**: Automatic createdAt and updatedAt tracking
- **Decimal Precision**: Financial data with proper precision

---

## Feature Documentation

### 1. User Management & Authentication

#### Registration & Login
- Email/password registration
- Email verification system
- Password reset functionality
- JWT-based authentication
- Refresh token rotation
- Session management with Redis

#### Two-Factor Authentication (2FA)
- TOTP-based 2FA (Google Authenticator compatible)
- Backup codes generation
- Device management
- Trusted device tracking

#### Security Features
- Account locking after failed login attempts
- Password strength validation
- IP tracking and suspicious activity detection
- Device fingerprinting
- Audit logging for all authentication events

### 2. Gift Card Management

#### Creation
- **Single Creation**: Individual gift cards with custom values
- **Bulk Creation**: CSV/Excel import, batch processing
- **Auto-generation**: Unique codes and QR codes
- **Customization**: Templates, messages, expiry dates
- **Recipient Management**: Email, name, delivery preferences

#### Operations
- **View & List**: Pagination, filtering, searching
- **Update**: Modify details, expiry, status
- **Delete**: Soft delete with status change
- **Lookup**: Search by code, view by ID

#### Templates
- **Design System**: Custom colors, images, layouts
- **Visibility Control**: Public or private templates
- **Reusability**: Apply to multiple gift cards

#### Products
- **Product Catalog**: Sellable gift card offerings
- **Pricing Models**: Fixed, variable, custom amounts
- **Sale Pricing**: Separate sale prices from gift card values
- **Visibility**: Public products for customer browsing
- **Categories & Tags**: Organization and discovery

### 3. Payment Processing

#### Supported Gateways
- **Stripe**: Full integration with Connect support
- **PayPal**: PayPal and PayPal Connect
- **Razorpay**: Indian payment gateway
- **UPI**: Unified Payments Interface

#### Payment Flow
1. **Create Intent**: Initialize payment with gateway
2. **Customer Payment**: Redirect to gateway or embedded form
3. **Webhook Handling**: Process payment confirmation
4. **Gift Card Activation**: Activate gift card on successful payment
5. **Commission Calculation**: Calculate and track commissions

#### Refund Processing
- Full and partial refunds
- Automatic gift card invalidation
- Balance adjustments
- Refund tracking

#### Fraud Prevention
- Velocity limits (per user, per IP, per day)
- Unusual pattern detection
- Risk scoring (0-100)
- Device fingerprinting
- IP tracking
- Blacklist management
- Manual review triggers

### 4. Delivery System

#### Email Delivery
- **Service**: Brevo (Sendinblue) integration
- **Templates**: HTML email templates
- **Personalization**: Custom messages, recipient details
- **Scheduling**: Scheduled delivery support
- **Rate Limiting**: Configurable rate limits

#### SMS Delivery
- **Service**: Twilio integration
- **Templates**: SMS message templates
- **Personalization**: Custom messages
- **Rate Limiting**: Configurable rate limits

#### PDF Generation
- **Format**: Professional PDF gift cards
- **Branding**: Custom templates and logos
- **Download**: Direct download links
- **Storage**: Local or S3 storage

#### Expiry Reminders
- **Automated**: Scheduled job for expiry reminders
- **Email Notifications**: Reminder emails before expiry
- **Configurable**: Days before expiry to send reminders

### 5. Redemption System

#### Redemption Methods

**QR Code Scanning:**
- Frontend QR code scanner
- Merchant POS integration
- Real-time validation

**Manual Code Entry:**
- Code validation endpoint
- Balance checking
- Merchant redemption interface

**Link-Based Redemption:**
- Public redemption links
- No authentication required
- One-time redemption support

**API-Based Redemption:**
- RESTful API for POS systems
- Webhook notifications
- Integration support

#### Redemption Features
- **Partial Redemption**: Support for partial amounts
- **Full Redemption**: Complete balance redemption
- **Validation**: Code validation before redemption
- **Balance Checking**: Real-time balance queries
- **History Tracking**: Complete redemption history
- **Location Tracking**: Optional location information

### 6. Gift Card Sharing

#### Share Tokens
- **Generation**: Create shareable tokens
- **Expiry**: Configurable token expiry
- **Revocation**: Revoke share tokens
- **Public Access**: View gift cards via token (no auth)

#### NFC Support
- **NFC Data**: Generate NFC-compatible data
- **Contactless**: NFC-based sharing and redemption
- **Mobile Integration**: Mobile app compatibility

### 7. Analytics & Reporting

#### Sales Analytics
- Total revenue tracking
- Transaction counts
- Average transaction value
- Revenue by payment method
- Revenue by currency
- Date range filtering
- Export capabilities

#### Redemption Analytics
- Total redemptions count
- Total redemption value
- Average redemption amount
- Redemptions by method
- Redemption trends over time
- Date range filtering

#### Customer Analytics
- Total unique customers
- Customer purchase frequency
- Average customer value
- Customer retention metrics
- Top customers list
- Date range filtering

#### Gift Card Statistics
- Total gift cards created
- Active/expired/redeemed counts
- Total gift card value
- Average gift card value
- Status distribution

#### Platform Analytics (Admin Only)
- Cross-merchant analytics
- Platform-wide metrics
- Merchant performance comparison
- Aggregate platform statistics

### 8. Communication Management (Admin Only)

#### Communication Settings
- Enable/disable email service
- Enable/disable SMS service
- Enable/disable OTP service
- Rate limit configuration
- OTP configuration (length, expiry)

#### Communication Logs
- View all communication logs
- Filter by channel, recipient, status
- Communication statistics
- Channel-specific statistics
- Error tracking

### 9. Audit Logging (Admin Only)

#### Audit Log Features
- **Comprehensive Logging**: All platform activities
- **User Actions**: Track user actions
- **System Events**: Track system events
- **Filtering**: Filter by user, action, resource, date
- **Statistics**: Audit log statistics
- **Export**: Export audit logs

### 10. Fraud Prevention & Security

#### Fraud Prevention System
- **Velocity Limits**: Per user, per IP, per day
- **Pattern Detection**: Unusual activity detection
- **Risk Scoring**: 0-100 risk score
- **Device Fingerprinting**: Device-based tracking
- **IP Tracking**: IP-based activity tracking
- **Blacklist Management**: Email, IP, phone, user blacklisting

#### Breakage Calculation
- **30-Day Grace Period**: After expiry
- **Unredeemed Value**: Track unredeemed amounts
- **Reporting**: Monthly/quarterly reports
- **Merchant Visibility**: Dashboard visibility

#### Chargeback Handling
- **Automatic Invalidation**: Gift card invalidation on chargeback
- **Balance Adjustment**: Merchant balance adjustment
- **Dispute Resolution**: Workflow for disputes
- **Evidence Submission**: Support for evidence
- **Webhook Integration**: Stripe & Razorpay webhooks

### 11. Merchant Payout System

#### Payout Features
- **Balance Tracking**: Merchant earnings tracking
- **Payout Methods**: Stripe Connect, PayPal, Bank Transfer
- **Payout Schedules**: Immediate, Daily, Weekly, Monthly
- **Minimum Amounts**: Configurable minimum payout amounts
- **Commission Deduction**: Automatic commission calculation
- **Payout History**: Complete payout transaction history

#### Payout Settings
- **Merchant Configuration**: Per-merchant payout settings
- **Gateway Configuration**: Payment gateway setup
- **Verification**: Gateway account verification
- **Status Tracking**: Payout status tracking

---

## API Architecture

### API Structure

**Base URL**: `/api/v1`

**Authentication**: JWT Bearer tokens

**Response Format**: JSON

**Error Handling**: Standardized error responses

### Main API Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /refresh` - Refresh access token
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `POST /2fa/enable` - Enable 2FA
- `POST /2fa/verify` - Verify 2FA
- `GET /devices` - List trusted devices
- `DELETE /devices/:id` - Remove device

#### Gift Cards (`/api/v1/gift-cards`)
- `GET /` - List gift cards (paginated, filtered)
- `POST /` - Create gift card
- `POST /bulk` - Bulk create gift cards
- `GET /:id` - Get gift card details
- `PUT /:id` - Update gift card
- `DELETE /:id` - Delete gift card
- `GET /code/:code` - Get gift card by code
- `GET /:id/qr` - Get QR code

#### Gift Card Products (`/api/v1/gift-card-products`)
- `GET /` - List products
- `GET /public` - List public products (no auth)
- `POST /` - Create product
- `GET /:id` - Get product details
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product

#### Gift Card Templates (`/api/v1/gift-card-templates`)
- `GET /` - List templates
- `POST /` - Create template
- `GET /:id` - Get template details
- `PUT /:id` - Update template
- `DELETE /:id` - Delete template

#### Payments (`/api/v1/payments`)
- `POST /create-intent` - Create payment intent
- `POST /confirm` - Confirm payment
- `POST /from-product` - Purchase from product
- `POST /bulk-purchase` - Bulk purchase
- `GET /` - List payments
- `GET /:id` - Get payment details
- `POST /:id/refund` - Process refund

#### Redemptions (`/api/v1/redemptions`)
- `POST /validate` - Validate gift card code (public)
- `POST /check-balance` - Check balance (public)
- `POST /redeem` - Redeem gift card (authenticated)
- `POST /redeem/qr` - Redeem via QR code
- `POST /redeem/:code` - Redeem via link (public)
- `GET /` - List redemptions
- `GET /:id` - Get redemption details
- `GET /gift-card/:id/history` - Get gift card history
- `GET /gift-card/:id/transactions` - Get transaction history

#### Delivery (`/api/v1/delivery`)
- `POST /deliver` - Deliver gift card
- `POST /reminder/:id` - Send expiry reminder
- `GET /pdf/:id` - Generate PDF
- `GET /pdf/:id/download` - Download PDF

#### Analytics (`/api/v1/analytics`)
- `GET /sales` - Sales analytics
- `GET /redemptions` - Redemption analytics
- `GET /customers` - Customer analytics
- `GET /gift-cards` - Gift card statistics
- `GET /platform` - Platform analytics (admin only)

#### Gift Card Sharing (`/api/v1/gift-card-share`)
- `POST /:giftCardId/generate-token` - Generate share token
- `GET /token/:token` - View via share token (public)
- `DELETE /:giftCardId/revoke-token` - Revoke share token
- `GET /:giftCardId/nfc-data` - Get NFC data

#### Admin Endpoints (`/api/v1/admin`)
- `GET /communication-settings` - Get communication settings
- `PUT /communication-settings` - Update communication settings
- `GET /communication-logs/logs` - Get communication logs
- `GET /communication-logs/statistics` - Get communication statistics
- `GET /audit-logs` - List audit logs
- `GET /audit-logs/:id` - Get audit log details
- `GET /audit-logs/statistics` - Get audit log statistics
- `GET /audit-logs/export` - Export audit logs
- `GET /blacklist` - List blacklisted items
- `POST /blacklist` - Add to blacklist
- `DELETE /blacklist/:id` - Remove from blacklist
- `GET /payouts` - List all payouts
- `PUT /payouts/:id/approve` - Approve payout
- `PUT /payouts/:id/reject` - Reject payout

#### Health & Monitoring (`/health`)
- `GET /` - Basic health check
- `GET /detailed` - Detailed health check
- `GET /metrics` - System metrics
- `GET /status` - System status
- `GET /docs` - API documentation

### API Features

#### Rate Limiting
- Configurable rate limits per endpoint
- IP-based throttling
- User-based throttling
- Redis-backed rate limiting

#### Input Validation
- Zod schema validation
- Request body validation
- Query parameter validation
- URL parameter validation
- XSS prevention
- SQL injection prevention

#### Error Handling
- Standardized error responses
- Error logging
- Error recovery mechanisms
- User-friendly error messages

#### Security
- CSRF protection
- CORS configuration
- Security headers (Helmet)
- Input sanitization
- JWT token validation
- Role-based access control

---

## Frontend Architecture

### Next.js App Router Structure

```
src/app/
├── (auth)/              # Authentication pages
│   ├── login/
│   └── register/
├── (dashboard)/         # Protected dashboard pages
│   └── dashboard/
│       ├── gift-cards/
│       ├── gift-card-products/
│       ├── templates/
│       ├── payments/
│       ├── redemptions/
│       ├── analytics/
│       ├── delivery/
│       ├── settings/
│       ├── security/
│       └── admin/        # Admin-only pages
└── (public)/            # Public pages
    ├── browse/
    ├── products/
    ├── purchase/
    └── redeem/
```

### Component Architecture

#### Layout Components
- **Sidebar**: Navigation sidebar
- **TopBar**: Top navigation bar
- **ErrorBoundary**: Error boundary wrapper
- **ClientProviders**: Client-side providers

#### Dashboard Components
- **MetricCard**: Dashboard metric cards
- **ChartContainer**: Chart wrapper
- **FilterBar**: Filtering interface
- **DataTable**: Data table component

#### Form Components
- **AmountSelector**: Amount selection
- **CurrencySelector**: Currency selection
- **RecipientForm**: Recipient information form
- **TemplateEditor**: Template editing interface
- **TemplateSelector**: Template selection

#### Gift Card Components
- **GiftCardDisplay**: Gift card display
- **GiftCardShare**: Sharing interface
- **QRCodeScanner**: QR code scanner
- **NFCReader**: NFC reader component

#### UI Components
- **Button**: Button component
- **Input**: Input component
- **Card**: Card component
- **Badge**: Badge component
- **Toast**: Toast notifications
- **LoadingSpinner**: Loading spinner
- **Skeleton**: Loading skeleton

### State Management

#### Zustand Stores
- **Auth Store**: Authentication state
- **User Store**: User profile state
- **Gift Card Store**: Gift card state
- **Payment Store**: Payment state

#### React Hook Form
- Form validation
- Form state management
- Error handling
- Submission handling

### API Integration

#### Axios Configuration
- Base URL configuration
- Request interceptors
- Response interceptors
- Error handling
- Token management

#### API Services
- Centralized API client
- Type-safe API calls
- Error handling
- Loading states

### Routing & Navigation

#### Protected Routes
- Authentication check
- Role-based access
- Redirect handling
- Loading states

#### Public Routes
- No authentication required
- Product browsing
- Gift card redemption
- Public gift card viewing

---

## Security Implementation

### Authentication Security

#### JWT Tokens
- **Access Tokens**: Short-lived (7 days)
- **Refresh Tokens**: Long-lived (30 days)
- **Token Rotation**: Refresh token rotation
- **Token Storage**: Secure cookie storage
- **Token Validation**: Signature verification

#### Password Security
- **Hashing**: bcryptjs with salt rounds
- **Strength Validation**: Password strength requirements
- **Reset Tokens**: Secure password reset flow
- **Account Locking**: Lock after failed attempts

#### Two-Factor Authentication
- **TOTP**: Time-based one-time passwords
- **Backup Codes**: Recovery codes
- **Device Management**: Trusted device tracking
- **QR Code Setup**: Easy setup flow

### API Security

#### CSRF Protection
- **Double-Submit Cookie**: CSRF token in cookie and header
- **Token Generation**: Per-session CSRF tokens
- **Validation**: State-changing operations
- **Exclusions**: Public endpoints, webhooks

#### Rate Limiting
- **API Rate Limiting**: Per-endpoint limits
- **IP-Based**: IP address throttling
- **User-Based**: User-specific limits
- **Redis-Backed**: Distributed rate limiting

#### Input Validation
- **Zod Schemas**: Type-safe validation
- **XSS Prevention**: Input sanitization
- **SQL Injection**: Prisma ORM protection
- **File Upload**: File type and size validation

#### Security Headers
- **Helmet.js**: Security headers middleware
- **CSP**: Content Security Policy
- **HSTS**: HTTP Strict Transport Security
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME type sniffing protection

### Data Security

#### Encryption
- **Sensitive Data**: Encrypted storage
- **Payment Credentials**: Encrypted gateway credentials
- **Session Data**: Encrypted session storage

#### Audit Logging
- **Comprehensive Logging**: All sensitive operations
- **User Tracking**: User actions tracking
- **IP Tracking**: IP address logging
- **Metadata**: Additional context information

### Fraud Prevention

#### Velocity Limits
- **Per User**: User-specific limits
- **Per IP**: IP-based limits
- **Per Day**: Daily transaction limits
- **Configurable**: Admin-configurable limits

#### Risk Scoring
- **0-100 Score**: Risk assessment
- **Pattern Detection**: Unusual activity detection
- **Device Fingerprinting**: Device-based tracking
- **IP Tracking**: IP-based activity tracking

#### Blacklist Management
- **Email Blacklist**: Email-based blocking
- **IP Blacklist**: IP-based blocking
- **Phone Blacklist**: Phone-based blocking
- **User Blacklist**: User-based blocking
- **Auto-Blacklist**: Automatic blacklisting on high risk

---

## Payment Integration

### Payment Gateway Architecture

#### Stripe Integration
- **Payment Intents**: Stripe Payment Intents API
- **Connect**: Stripe Connect for merchant payouts
- **Webhooks**: Webhook handling for payment events
- **Refunds**: Refund processing
- **Chargebacks**: Chargeback handling

#### PayPal Integration
- **PayPal SDK**: PayPal Node.js SDK
- **Connect**: PayPal Connect for merchant payouts
- **Webhooks**: Webhook handling
- **Refunds**: Refund processing

#### Razorpay Integration
- **Razorpay SDK**: Razorpay Node.js SDK
- **Payment Links**: Payment link generation
- **Webhooks**: Webhook handling
- **Refunds**: Refund processing

#### UPI Integration
- **UPI SDK**: UPI payment integration
- **Payment Links**: UPI payment links
- **Webhooks**: Webhook handling

### Complete Payment Flow - Step by Step

#### Phase 1: Payment Intent Creation

**1.1 Customer Initiates Payment**
- Customer selects gift card or product
- Chooses payment method (Stripe, PayPal, Razorpay, UPI)
- Provides recipient details (email, name, custom message)
- Frontend calls `POST /api/v1/payments/create-intent` or `POST /api/v1/payments/from-product`

**1.2 Backend Payment Service Processing**
```typescript
// PaymentService.createPayment() or createPaymentFromProduct()
```

**Step-by-step backend processing:**

1. **Gift Card Validation**
   - Verify gift card exists and is ACTIVE
   - Validate payment amount (must be ≤ gift card value, allows discounts)
   - For products: Validate amount against product constraints (min/max, fixed amounts)

2. **Fraud Prevention Check**
   - Perform fraud check via `fraudPreventionService.performFraudCheck()`
   - Checks include:
     - Velocity limits (per user, per IP, per day)
     - Risk scoring (0-100)
     - Device fingerprinting
     - IP tracking
     - Blacklist verification
   - If blocked: Transaction rejected with reason
   - If flagged: Logged for manual review but allowed

3. **Commission Calculation**
   - Calculate platform commission via `commissionService.calculateCommission()`
   - Supports percentage-based or fixed amount commissions
   - Can be merchant-specific or gateway-specific
   - Returns: `commissionAmount`, `netAmount`, `commissionRate`, `commissionType`

4. **Merchant Gateway Check**
   - Check if merchant has their own payment gateway configured
   - For Stripe: Check for Stripe Connect account
   - For PayPal: Check for PayPal Connect account
   - If merchant gateway exists and is active: Use merchant gateway
   - Otherwise: Use platform gateway (backward compatibility)

5. **Payment Gateway Integration**
   - **Stripe**: 
     - Create Payment Intent via Stripe API
     - If merchant gateway: Use Stripe Connect with application fee (commission)
     - Returns: `paymentIntentId`, `clientSecret`, `status`
   - **PayPal**:
     - Create Order via PayPal API
     - Requires `returnUrl` and `cancelUrl`
     - Returns: `orderId`, `approvalUrl`
   - **Razorpay**:
     - Create Order via Razorpay API
     - Returns: `orderId`
   - **UPI**:
     - Create Order via UPI service
     - Returns: `orderId`

6. **IP Tracking & Device Fingerprinting**
   - Track IP address via `ipTrackingService.trackIP()`
   - Generate device fingerprint from user agent + IP address
   - Store in payment record for fraud analysis

7. **Payment Record Creation**
   - Create payment record in database with status `PENDING`
   - Store: `paymentIntentId`/`orderId`, `commissionAmount`, `netAmount`, `ipAddress`, `userAgent`, `deviceFingerprint`
   - Metadata includes: `returnUrl`, `cancelUrl`, `useMerchantGateway`, commission details

8. **Response to Frontend**
   - Returns: `payment`, `clientSecret` (Stripe), `orderId` (PayPal/Razorpay/UPI), `paymentIntentId`

#### Phase 2: Customer Payment Processing

**2.1 Frontend Payment Handling**

- **Stripe**: 
  - Use `clientSecret` with Stripe.js
  - Redirect to Stripe Checkout or use embedded form
  - Customer completes payment on Stripe's secure page

- **PayPal**:
  - Redirect customer to `approvalUrl`
  - Customer logs in and approves payment
  - PayPal redirects back to `returnUrl` with `orderId`

- **Razorpay**:
  - Initialize Razorpay checkout
  - Customer completes payment
  - Razorpay redirects back with payment details

- **UPI**:
  - Initialize UPI payment
  - Customer completes payment via UPI app
  - Returns with payment details

**2.2 Payment Confirmation**

**Option A: Manual Confirmation (Frontend calls backend)**
- Frontend calls `POST /api/v1/payments/confirm` after payment
- Backend verifies payment with gateway
- Updates payment status

**Option B: Webhook Confirmation (Automatic)**
- Payment gateway sends webhook notification
- Backend verifies webhook signature
- Automatically processes payment confirmation

#### Phase 3: Payment Confirmation Processing

**3.1 Payment Verification**

```typescript
// PaymentService.confirmPayment()
```

**For each payment method:**

- **Stripe**:
  - Verify payment intent status
  - If merchant gateway: Retrieve payment intent (already confirmed)
  - If platform gateway: Confirm payment intent
  - Get `transactionId` from charge ID

- **PayPal**:
  - Capture order via PayPal API
  - Verify order status is `COMPLETED`
  - Get `transactionId` from capture

- **Razorpay**:
  - Verify payment signature
  - Retrieve payment details
  - Verify status is `captured`
  - Get `transactionId`

- **UPI**:
  - Verify payment signature
  - Retrieve payment details
  - Verify status is `captured`
  - Get `transactionId`

**3.2 Payment Status Update**
- Update payment record: `status = COMPLETED`, `transactionId = <gateway_transaction_id>`
- If verification fails: `status = FAILED`

**3.3 Transaction Record Creation**
- Create transaction record:
  - `type = PURCHASE`
  - `amount = payment.amount`
  - `balanceBefore = 0`
  - `balanceAfter = payment.amount`
  - `metadata = { paymentId, paymentMethod }`

**3.4 Gift Card Delivery**
- If single purchase: Deliver gift card to recipient email
- If bulk purchase: Deliver all gift cards to respective recipients
- Delivery method: Email (default), SMS, or PDF
- Delivery errors are logged but don't fail the transaction

#### Phase 4: Webhook Processing (Alternative/Additional Confirmation)

**4.1 Webhook Receipt**
- Payment gateway sends webhook to `/api/v1/payments/webhook/{gateway}`
- Webhook contains payment event data

**4.2 Webhook Verification**
- **Stripe**: Verify signature using `stripe-signature` header
- **Razorpay**: Verify HMAC signature using `x-razorpay-signature` header
- **PayPal**: Verify signature using PayPal webhook verification

**4.3 Event Processing**

**Stripe Events:**
- `payment_intent.succeeded`: Update payment to COMPLETED, create transaction
- `payment_intent.payment_failed`: Update payment to FAILED
- `charge.refunded`: Handle refund event
- `payout.paid/failed/canceled`: Handle payout status updates

**Razorpay Events:**
- `payment.captured`: Update payment to COMPLETED, create transaction
- `payment.failed`: Update payment to FAILED
- `refund.created`: Handle refund event

**4.4 Idempotency**
- Webhook handlers check if payment already processed
- Prevents duplicate processing
- Ensures idempotent operations

### Payment from Product Flow

**Special handling for product-based purchases:**

1. **Product Validation**
   - Retrieve product details
   - Validate amount against product constraints:
     - If `allowCustomAmount`: Check min/max amounts
     - If fixed amounts: Verify amount is in fixed list

2. **Sale Price Calculation**
   - Calculate sale price (what customer pays)
   - Supports discounts:
     - Variable amounts: Linear interpolation between min/max sale prices
     - Fixed amounts: Use corresponding fixed sale price
   - Default: Sale price = gift card value (no discount)

3. **Gift Card Creation**
   - Create gift card with actual gift card value (what customer gets)
   - Apply product template if configured
   - Set expiry date from product `expiryDays`

4. **Payment Creation**
   - Create payment using sale price (what customer pays)
   - Gift card value may be higher than sale price (discount scenario)

### Bulk Purchase Flow

**Special handling for multiple gift cards:**

1. **Recipient Validation**
   - Validate all recipients (max 50)
   - Verify all emails are valid
   - Validate amounts against product (if product provided)

2. **Gift Card Creation**
   - Create multiple gift cards (one per recipient)
   - Each with recipient-specific details (email, name, message, amount)

3. **Total Calculation**
   - Calculate total sale price (sum of all recipient sale prices)
   - Calculate total gift card value (sum of all gift card values)

4. **Single Payment**
   - Create single payment for total sale price
   - Payment metadata includes:
     - `type: 'bulk_purchase'`
     - `giftCardIds: [array of all gift card IDs]`
     - `recipientCount: number`
     - `totalGiftCardValue: number`
     - `totalSalePrice: number`

5. **Delivery**
   - On payment confirmation: Deliver all gift cards
   - Each gift card delivered to its respective recipient

### Commission System

#### Commission Calculation
- **Percentage-Based**: Percentage of payment amount
  - Example: 5% commission on $100 = $5 commission, $95 net
- **Fixed Amount**: Fixed commission per transaction
  - Example: $2 commission per transaction
- **Merchant-Specific**: Per-merchant commission rates
  - Different merchants can have different rates
- **Gateway-Specific**: Per-gateway commission rates
  - Different rates for Stripe vs PayPal vs Razorpay

#### Commission Tracking
- **Commission Amount**: Tracked in payment record
- **Net Amount**: Net amount after commission (what merchant receives)
- **Merchant Balance**: Updated on redemption (not on payment)
- **Payout Deduction**: Commission deducted from payouts

#### Merchant Gateway Commission
- When using merchant's own gateway (Stripe Connect/PayPal Connect):
  - Platform commission collected as application fee
  - Merchant receives net amount directly
  - Platform commission tracked separately

### Refund Processing

#### Refund Flow
1. **Refund Request**: Merchant or admin initiates refund via `POST /api/v1/payments/:id/refund`
2. **Payment Validation**: Verify payment is COMPLETED and has transaction ID
3. **Gateway Refund**: Process refund through original payment gateway
   - **Stripe**: Refund via charge ID
   - **PayPal**: Refund via transaction ID
   - **Razorpay**: Refund via payment ID
   - **UPI**: Refund via payment ID
4. **Payment Status Update**: Update payment status to `REFUNDED`
5. **Gift Card Invalidation**: 
   - Reduce gift card balance by refund amount
   - If balance reaches 0: Set status to `CANCELLED`
6. **Merchant Balance Adjustment**: Deduct refund amount from merchant balance
7. **Transaction Record**: Create refund transaction record

#### Refund Types
- **Full Refund**: Complete refund of payment amount
- **Partial Refund**: Partial amount refund (if gateway supports)
- **Chargeback Refund**: Chargeback-initiated refund (handled via webhook)

### Security & Fraud Prevention in Payments

#### Fraud Prevention Checks
- **Velocity Limits**: Per user, per IP, per day
- **Risk Scoring**: 0-100 risk score calculation
- **Device Fingerprinting**: Track device characteristics
- **IP Tracking**: Monitor IP address activity
- **Blacklist Checking**: Verify against blacklisted emails, IPs, phones, users
- **Pattern Detection**: Detect unusual transaction patterns

#### Payment Security
- **Webhook Signature Verification**: All webhooks verified before processing
- **Payment Intent Verification**: Payment status verified with gateway
- **Transaction ID Tracking**: All transactions tracked with gateway transaction IDs
- **Idempotency**: Webhook handlers prevent duplicate processing

### Payment Status Lifecycle

```
PENDING → COMPLETED (on successful payment)
PENDING → FAILED (on payment failure)
COMPLETED → REFUNDED (on refund)
```

### Error Handling

#### Payment Creation Errors
- Gift card not found or not active
- Invalid amount validation
- Fraud prevention blocking
- Payment gateway errors
- Commission calculation errors

#### Payment Confirmation Errors
- Payment not found
- Payment already completed
- Invalid payment signature (Razorpay/UPI)
- Gateway verification failure
- Transaction ID not found

#### Webhook Errors
- Invalid webhook signature
- Unknown event type
- Payment not found
- Duplicate event processing

### Payment Data Model

**Payment Record Fields:**
- `id`: Unique payment ID
- `giftCardId`: Associated gift card
- `customerId`: Customer who made payment
- `amount`: Payment amount (what customer paid)
- `currency`: Payment currency
- `paymentMethod`: STRIPE, PAYPAL, RAZORPAY, UPI
- `paymentIntentId`: Gateway payment intent/order ID
- `status`: PENDING, COMPLETED, FAILED, REFUNDED
- `transactionId`: Gateway transaction ID
- `commissionAmount`: Platform commission
- `netAmount`: Net amount after commission
- `ipAddress`: Customer IP address
- `userAgent`: Customer user agent
- `deviceFingerprint`: Device fingerprint hash
- `metadata`: Additional payment metadata (JSON)

---

## Payment Gateway Configuration

### Overview

The platform supports a **multi-tenant payment model** where:
- **Merchants** can connect their own payment gateway accounts (Stripe Connect, PayPal, Razorpay, UPI)
- **Admins** can configure platform-wide payment gateways
- **Payments** go directly to merchant accounts when merchant gateways are configured
- **Platform** takes a commission on each transaction
- **Fallback** to platform gateways if merchant gateway is not configured

### Architecture

#### Two-Tier Payment System

1. **Merchant-Specific Gateways** (Preferred)
   - Each merchant can connect their own payment gateway
   - Payments processed through merchant's account
   - Platform commission collected as application fee
   - Merchant receives net amount directly

2. **Platform Gateways** (Fallback)
   - Platform-wide payment gateway configuration
   - Used when merchant doesn't have their own gateway
   - Payments processed through platform account
   - Commission deducted from merchant balance

### Merchant Payment Gateway Configuration

#### Access Control
- **Who Can Configure**: Merchants and Admins
- **Route**: `/api/v1/merchant/payment-gateways`
- **Authentication**: Required (JWT token)
- **Authorization**: `ADMIN` or `MERCHANT` role

#### Supported Payment Gateways

1. **Stripe Connect** (Recommended)
   - OAuth-based connection
   - Express or Standard accounts
   - Automatic onboarding flow
   - No API credentials needed

2. **PayPal**
   - API credentials (Client ID, Client Secret)
   - Live or Sandbox mode
   - Business account required

3. **Razorpay**
   - API credentials (Key ID, Key Secret)
   - Live or Test mode

4. **UPI**
   - API credentials
   - Indian payment gateway

### Configuration Flow - Step by Step

#### For Merchants

**Step 1: Access Payment Gateway Settings**
- **Direct URL**: Navigate to `/dashboard/settings/payment-gateways`
- **Note**: Currently not linked in navigation menu - use direct URL
- Requires: Merchant or Admin authentication
- **Alternative**: Add navigation link in Settings page or Sidebar (see implementation notes below)

**Step 2: Choose Payment Gateway**

**Option A: Stripe Connect (Recommended)**

1. **Create Stripe Connect Account**
   ```
   POST /api/v1/merchant/payment-gateways/stripe/connect
   Body: {
     email: "merchant@example.com",
     country: "US",
     type: "express" // or "standard"
   }
   ```

2. **Get Onboarding Link**
   ```
   GET /api/v1/merchant/payment-gateways/stripe/connect-link
   Query: {
     returnUrl: "https://yourdomain.com/dashboard/settings/payment-gateways?stripe=success",
     refreshUrl: "https://yourdomain.com/dashboard/settings/payment-gateways?stripe=refresh",
     type: "account_onboarding"
   }
   ```

3. **Redirect to Stripe Onboarding**
   - Frontend redirects merchant to Stripe onboarding URL
   - Merchant completes Stripe account setup
   - Stripe redirects back to `returnUrl`

4. **Backend Processing**
   - Stripe Connect account created
   - `connectAccountId` stored in `MerchantPaymentGateway` table
   - Status: `PENDING` (requires verification)

5. **Verify Account**
   ```
   POST /api/v1/merchant/payment-gateways/:id/verify
   ```
   - Backend verifies Stripe Connect account
   - Checks: `charges_enabled` and `payouts_enabled`
   - If verified: Status → `VERIFIED`, `isActive` → `true`

**Option B: PayPal Connection**

1. **Connect PayPal Account**
   ```
   POST /api/v1/merchant/payment-gateways/paypal/connect
   Body: {
     gatewayType: "PAYPAL",
     credentials: {
       clientId: "your_paypal_client_id",
       clientSecret: "your_paypal_client_secret",
       mode: "live" // or "sandbox"
     }
   }
   ```

2. **Backend Processing**
   - Validates credentials by getting access token
   - Retrieves merchant info from PayPal
   - Encrypts credentials
   - Stores in `MerchantPaymentGateway` table
   - Status: `PENDING`

3. **Verify Account**
   ```
   POST /api/v1/merchant/payment-gateways/:id/verify
   ```
   - Backend verifies PayPal account
   - Tests API access
   - If verified: Status → `VERIFIED`, `isActive` → `true`

**Option C: Razorpay/UPI (Manual Credentials)**

1. **Create Gateway Configuration**
   ```
   POST /api/v1/merchant/payment-gateways
   Body: {
     gatewayType: "RAZORPAY", // or "UPI"
     credentials: {
       keyId: "your_key_id",
       keySecret: "your_key_secret"
     }
   }
   ```

2. **Backend Processing**
   - Encrypts credentials
   - Stores in `MerchantPaymentGateway` table
   - Status: `PENDING`

3. **Verify Account**
   ```
   POST /api/v1/merchant/payment-gateways/:id/verify
   ```
   - Backend verifies credentials
   - If verified: Status → `VERIFIED`, `isActive` → `true`

**Step 3: Activate Gateway**
- Gateway automatically activates when verified
- Or manually activate: `PUT /api/v1/merchant/payment-gateways/:id` with `isActive: true`
- Note: Cannot activate unverified gateways

**Step 4: Use Merchant Gateway**
- When merchant gateway is active and verified:
  - Payments use merchant's gateway
  - Platform commission collected as application fee (Stripe Connect)
  - Merchant receives net amount directly

### Admin Payment Gateway Configuration

#### Platform-Wide Configuration

**Environment Variables** (Backend `.env`):
```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
PAYPAL_MODE=live

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# UPI
UPI_MERCHANT_ID=...
UPI_API_KEY=...
```

**Usage:**
- Used as fallback when merchant doesn't have their own gateway
- All merchants can use platform gateways
- Commission deducted from merchant balance on redemption

### Gateway Management Operations

#### List Gateways
```
GET /api/v1/merchant/payment-gateways
Query: {
  active: "true" // Optional: filter active only
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gateway-id",
      "gatewayType": "STRIPE",
      "isActive": true,
      "connectAccountId": "acct_...",
      "verificationStatus": "VERIFIED",
      "metadata": {},
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Gateway Details
```
GET /api/v1/merchant/payment-gateways/:id
```

**Response:**
- Does NOT include credentials (for security)
- Includes `hasCredentials: true/false`

#### Update Gateway
```
PUT /api/v1/merchant/payment-gateways/:id
Body: {
  credentials: { ... }, // Optional: update credentials
  isActive: true,      // Optional: activate/deactivate
  metadata: { ... }    // Optional: update metadata
}
```

**Notes:**
- Updating credentials requires re-verification
- Cannot activate unverified gateway
- Credentials are encrypted before storage

#### Verify Gateway
```
POST /api/v1/merchant/payment-gateways/:id/verify
```

**Verification Process:**
- **Stripe Connect**: Checks `charges_enabled` and `payouts_enabled`
- **PayPal**: Tests API access with credentials
- **Razorpay/UPI**: Validates credentials format

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "gatewayId": "gateway-id"
  },
  "message": "Gateway verified successfully"
}
```

#### Deactivate Gateway
```
POST /api/v1/merchant/payment-gateways/:id/deactivate
```

**Effect:**
- Sets `isActive: false`
- Payments will use platform gateway (fallback)
- Gateway configuration remains (can be reactivated)

#### Delete Gateway
```
DELETE /api/v1/merchant/payment-gateways/:id
```

**Effect:**
- Permanently deletes gateway configuration
- Cannot be undone
- Payments will use platform gateway (fallback)

### Security Features

#### Credential Encryption
- **Storage**: All credentials encrypted before database storage
- **Encryption**: Uses AES-256 encryption
- **Decryption**: Only decrypted for internal use (payment processing)
- **API Response**: Credentials never returned in API responses

#### Verification Status
- **PENDING**: Gateway created but not verified
- **VERIFIED**: Gateway verified and ready to use
- **FAILED**: Verification failed

#### Activation Rules
- Gateway must be `VERIFIED` before activation
- Cannot activate `PENDING` or `FAILED` gateways
- Updating credentials resets status to `PENDING`

### Payment Processing with Merchant Gateways

#### How It Works

1. **Payment Creation**
   - System checks if merchant has active gateway
   - If yes: Use merchant gateway
   - If no: Use platform gateway (fallback)

2. **Stripe Connect Flow**
   - Create payment intent with `on_behalf_of` parameter
   - Set `application_fee_amount` (platform commission)
   - Payment goes to merchant's Stripe account
   - Platform commission collected automatically

3. **PayPal Flow**
   - Use merchant's PayPal credentials
   - Create order with merchant's account
   - Payment goes to merchant's PayPal account
   - Commission tracked separately

4. **Razorpay/UPI Flow**
   - Use merchant's API credentials
   - Create order with merchant's account
   - Payment goes to merchant's account
   - Commission tracked separately

### Frontend UI Flow

#### Payment Gateway Settings Page

**Location**: `/dashboard/settings/payment-gateways`

**Note**: The page exists but may not be linked in navigation. To access:
- Direct URL: `/dashboard/settings/payment-gateways`
- Or add navigation link in Settings page or Sidebar

**Features:**
1. **Available Gateways Section**
   - Shows all supported gateways
   - "Connect" button for unconnected gateways
   - "Connected" badge for connected gateways

2. **Connected Gateways Section**
   - Lists all merchant gateways
   - Shows verification status
   - Shows active/inactive status
   - Actions: Verify, Deactivate, Delete

3. **Stripe Connect Flow**
   - Click "Connect Stripe"
   - Backend creates Connect account
   - Redirects to Stripe onboarding
   - Returns after completion
   - Shows verification status

4. **PayPal Connection Flow**
   - Click "Connect PayPal"
   - Form to enter credentials
   - Backend validates and stores
   - Shows verification status

**Current Navigation Status:**
- ✅ Page exists at `/dashboard/settings/payment-gateways/page.tsx`
- ❌ Not linked in Sidebar navigation
- ❌ Not linked in Settings page tabs
- ✅ API endpoints are functional
- ✅ Backend services are implemented

**To Add Navigation:**
1. Add link in Settings page tabs (Profile, Password, Notifications, **Payment Gateways**)
2. Or add direct link in Sidebar for Merchants/Admins
3. Or add submenu under Settings in Sidebar

### Database Schema

#### MerchantPaymentGateway Model

```prisma
model MerchantPaymentGateway {
  id                String            @id @default(uuid())
  merchantId        String            @map("merchant_id")
  gatewayType       GatewayType       @map("gateway_type")
  isActive          Boolean           @default(false) @map("is_active")
  credentials       String            @db.Text // Encrypted JSON
  connectAccountId  String?           @map("connect_account_id")
  verificationStatus VerificationStatus @default(PENDING) @map("verification_status")
  metadata          Json?
  createdAt         DateTime          @default(now()) @map("created_at")
  updatedAt         DateTime          @updatedAt @map("updated_at")

  merchant User @relation(fields: [merchantId], references: [id], onDelete: Cascade)

  @@unique([merchantId, gatewayType])
  @@index([merchantId])
  @@index([gatewayType])
  @@index([isActive])
  @@index([verificationStatus])
  @@map("merchant_payment_gateways")
}
```

**Key Fields:**
- `credentials`: Encrypted JSON containing API keys/secrets
- `connectAccountId`: Stripe Connect account ID (if applicable)
- `verificationStatus`: PENDING, VERIFIED, FAILED
- `isActive`: Whether gateway is currently active
- `metadata`: Additional gateway-specific data

### Best Practices

#### For Merchants

1. **Use Stripe Connect** (if available in your region)
   - Easiest setup
   - No API credentials to manage
   - Automatic compliance

2. **Verify Before Activating**
   - Always verify gateway before activating
   - Test with small transaction first

3. **Keep Credentials Secure**
   - Never share credentials
   - Rotate credentials periodically
   - Use environment-specific credentials (sandbox/live)

4. **Monitor Gateway Status**
   - Check verification status regularly
   - Monitor for failed verifications
   - Update credentials if expired

#### For Admins

1. **Platform Gateway Configuration**
   - Set up platform gateways in environment variables
   - Use production credentials in production
   - Keep credentials secure

2. **Monitor Merchant Gateways**
   - Track which merchants have their own gateways
   - Monitor verification failures
   - Provide support for gateway setup

3. **Commission Configuration**
   - Configure commission rates per gateway
   - Set different rates for merchant vs platform gateways
   - Monitor commission collection

### Troubleshooting

#### Common Issues

1. **Verification Fails**
   - Check credentials are correct
   - Verify API keys have proper permissions
   - Check gateway account status

2. **Payments Not Using Merchant Gateway**
   - Verify gateway is `isActive: true`
   - Verify gateway is `VERIFIED`
   - Check payment service logs

3. **Stripe Connect Onboarding Issues**
   - Check return URL is correct
   - Verify account link hasn't expired
   - Check Stripe account status

4. **PayPal Connection Issues**
   - Verify Client ID and Secret are correct
   - Check mode (sandbox/live) matches credentials
   - Verify PayPal account is business account

---

## Delivery System

### Email Delivery

#### Brevo Integration
- **API Integration**: Brevo (Sendinblue) API
- **Templates**: HTML email templates
- **Personalization**: Dynamic content
- **Rate Limiting**: Configurable rate limits
- **Error Handling**: Retry logic

#### Email Templates
- **Gift Card Delivery**: Gift card delivery emails
- **Expiry Reminders**: Expiry reminder emails
- **Password Reset**: Password reset emails
- **Email Verification**: Email verification emails

### SMS Delivery

#### Twilio Integration
- **API Integration**: Twilio API
- **Templates**: SMS message templates
- **Personalization**: Dynamic content
- **Rate Limiting**: Configurable rate limits
- **Error Handling**: Retry logic

### PDF Generation

#### PDF Service
- **PDFKit**: PDF generation library
- **Templates**: Custom PDF templates
- **Branding**: Logo and branding support
- **Storage**: Local or S3 storage
- **Download Links**: Secure download links

### Scheduled Delivery

#### Job Queue System
- **BullMQ**: Redis-backed job queue
- **Scheduled Jobs**: Scheduled delivery jobs
- **Retry Logic**: Automatic retry on failure
- **Job Monitoring**: Job status tracking

#### Expiry Reminders
- **Scheduled Job**: Cron-based scheduled job
- **Configurable**: Days before expiry
- **Email Notifications**: Reminder emails
- **Batch Processing**: Batch reminder sending

---

## Redemption System

### Redemption Methods

#### QR Code Redemption
- **QR Code Generation**: Unique QR codes per gift card
- **QR Code Scanning**: Frontend QR code scanner
- **POS Integration**: Merchant POS integration
- **Real-Time Validation**: Instant validation

#### Manual Code Entry
- **Code Validation**: Validate gift card codes
- **Balance Checking**: Check gift card balance
- **Merchant Interface**: Merchant redemption interface
- **Customer Interface**: Customer redemption interface

#### Link-Based Redemption
- **Public Links**: Public redemption links
- **No Authentication**: No authentication required
- **One-Time Redemption**: Single-use redemption links
- **Expiry Support**: Link expiry support

#### API-Based Redemption
- **RESTful API**: RESTful redemption API
- **POS Integration**: POS system integration
- **Webhook Notifications**: Real-time notifications
- **Authentication**: API key authentication

### Redemption Flow

1. **Validation**
   - Validate gift card code
   - Check gift card status
   - Verify expiry date
   - Check balance

2. **Redemption Processing**
   - Calculate redemption amount
   - Update gift card balance
   - Create redemption record
   - Create transaction record

3. **Confirmation**
   - Return redemption confirmation
   - Send confirmation notification
   - Update merchant balance (if applicable)

### Partial Redemption

#### Support
- **Configurable**: Per-gift-card configuration
- **Balance Tracking**: Track remaining balance
- **Multiple Redemptions**: Support multiple redemptions
- **Status Management**: Status remains ACTIVE until fully redeemed

---

## Analytics & Reporting

### Analytics Architecture

#### Data Aggregation
- **Real-Time**: Real-time data aggregation
- **Cached**: Redis caching for performance
- **Scheduled**: Scheduled aggregation jobs
- **Export**: CSV/Excel export support

#### Analytics Types

**Sales Analytics:**
- Total revenue
- Transaction counts
- Average transaction value
- Revenue by payment method
- Revenue by currency
- Date range filtering

**Redemption Analytics:**
- Total redemptions
- Redemption value
- Average redemption amount
- Redemptions by method
- Redemption trends

**Customer Analytics:**
- Unique customers
- Purchase frequency
- Average customer value
- Customer retention
- Top customers

**Gift Card Statistics:**
- Total gift cards
- Active/expired/redeemed counts
- Total value
- Average value
- Status distribution

### Reporting

#### Report Generation
- **Dashboard**: Real-time dashboard
- **Exports**: CSV/Excel exports
- **Scheduled Reports**: Scheduled report generation
- **Email Reports**: Email report delivery

#### Visualization
- **Charts**: Recharts integration
- **Graphs**: Line, bar, pie charts
- **Trends**: Trend analysis
- **Comparisons**: Period comparisons

---

## Background Jobs & Scheduling

### Job Queue System

#### BullMQ Integration
- **Redis-Backed**: Redis-backed job queue
- **Job Types**: Different job types
- **Priority**: Job priority support
- **Retry Logic**: Automatic retry on failure
- **Job Monitoring**: Job status tracking

### Scheduled Jobs

#### Expiry Reminders
- **Cron Schedule**: Daily cron job
- **Batch Processing**: Batch reminder sending
- **Email Notifications**: Reminder emails
- **Configurable**: Days before expiry

#### Gift Card Expiry
- **Cron Schedule**: Daily cron job
- **Status Update**: Update expired gift cards
- **Notification**: Notify merchants
- **Breakage Calculation**: Calculate breakage

#### Token Cleanup
- **Cron Schedule**: Daily cron job
- **Expired Tokens**: Clean up expired tokens
- **Refresh Tokens**: Clean up expired refresh tokens
- **Verification Tokens**: Clean up expired verification tokens

#### Scheduled Delivery
- **Job Queue**: BullMQ job queue
- **Scheduled Jobs**: Scheduled delivery jobs
- **Retry Logic**: Retry on failure
- **Status Tracking**: Job status tracking

### Worker System

#### Worker Architecture
- **Separate Process**: Separate worker process
- **Job Processing**: Process jobs from queue
- **Error Handling**: Error handling and retry
- **Logging**: Comprehensive logging

---

## User Roles & Permissions

### Role-Based Access Control

#### Admin Role
- **Full Access**: Access to all features
- **Platform Management**: Platform-wide management
- **Cross-Merchant Access**: Access to all merchant data
- **System Configuration**: System configuration
- **Communication Management**: Communication settings
- **Audit Logs**: Audit log access

#### Merchant Role
- **Own Data**: Access to own data only
- **Gift Card Management**: Create and manage gift cards
- **Product Management**: Create and manage products
- **Template Management**: Create and manage templates
- **Redemption**: Process redemptions
- **Analytics**: View own analytics
- **Payouts**: Manage payouts

#### Customer Role
- **Purchase**: Purchase gift cards
- **View Own**: View own gift cards
- **Redemption**: Redeem own gift cards (via link)
- **Payment History**: View payment history
- **Gift Card Sharing**: Share gift cards

### Permission System

#### Data Isolation
- **Merchant Isolation**: Merchants can only access own data
- **Customer Isolation**: Customers can only access own data
- **Admin Override**: Admins can access all data

#### Feature Access
- **Role-Based**: Features based on role
- **Endpoint Protection**: Middleware-based protection
- **Frontend Protection**: Route-based protection

---

## Deployment & Infrastructure

### Docker Configuration

#### Docker Compose
- **PostgreSQL**: PostgreSQL container
- **Redis**: Redis container
- **Health Checks**: Container health checks
- **Volume Management**: Data persistence

#### Dockerfiles
- **Backend Dockerfile**: Backend container configuration
- **Frontend Dockerfile**: Frontend container configuration
- **Multi-Stage Builds**: Optimized builds
- **Production Ready**: Production configurations

### Environment Configuration

#### Backend Environment Variables
- **Database**: DATABASE_URL
- **JWT**: JWT_SECRET, JWT_REFRESH_SECRET
- **Payment Gateways**: Stripe, PayPal, Razorpay keys
- **Email/SMS**: Brevo, Twilio credentials
- **AWS**: AWS credentials (if using S3)
- **Redis**: REDIS_URL
- **CORS**: CORS_ORIGIN

#### Frontend Environment Variables
- **API URL**: NEXT_PUBLIC_API_URL
- **Environment**: NODE_ENV

### Production Deployment

#### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

#### Deployment Steps
1. **Environment Setup**: Configure environment variables
2. **Database Migration**: Run Prisma migrations
3. **Build**: Build backend and frontend
4. **Start Services**: Start PostgreSQL and Redis
5. **Start Backend**: Start backend server
6. **Start Frontend**: Start frontend server

### Health Monitoring

#### Health Endpoints
- **Basic Health**: `/health`
- **Detailed Health**: `/health/detailed`
- **Metrics**: `/health/metrics`
- **Status**: `/health/status`
- **API Docs**: `/health/docs`

#### Monitoring
- **System Metrics**: CPU, memory, disk
- **Database Health**: Database connection status
- **Redis Health**: Redis connection status
- **Service Status**: Service availability

---

## Development Workflow

### Setup Instructions

#### Prerequisites Installation
```bash
# Install Node.js 18+
# Install PostgreSQL 15+
# Install Redis 7+
# Install Docker (optional)
```

#### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Docker Setup
```bash
docker-compose up -d
```

### Development Commands

#### Backend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:studio` - Open Prisma Studio
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

#### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npm run format` - Format code

### Code Quality

#### Linting
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

#### Testing
- **Jest**: Testing framework
- **Supertest**: API testing
- **Test Coverage**: Coverage reports

---

## Testing Strategy

### Test Types

#### Unit Tests
- **Services**: Service layer tests
- **Utils**: Utility function tests
- **Validators**: Validation tests

#### Integration Tests
- **API Tests**: API endpoint tests
- **Database Tests**: Database integration tests
- **Payment Tests**: Payment gateway tests

#### E2E Tests
- **User Flows**: End-to-end user flows
- **Payment Flows**: Payment flow tests
- **Redemption Flows**: Redemption flow tests

### Test Coverage

#### Coverage Goals
- **Services**: 80%+ coverage
- **Controllers**: 70%+ coverage
- **Utils**: 90%+ coverage

---

## Production Readiness

### Production Features

#### Health Checks
- ✅ Basic health check endpoint
- ✅ Detailed health check endpoint
- ✅ System metrics endpoint
- ✅ Service status endpoint

#### Error Handling
- ✅ Error boundaries
- ✅ Comprehensive error handling
- ✅ Error logging
- ✅ User-friendly error messages

#### Monitoring
- ✅ System metrics
- ✅ Database health
- ✅ Redis health
- ✅ Service status

#### Security
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Input validation
- ✅ Security headers
- ✅ Audit logging
- ✅ Fraud prevention

#### Performance
- ✅ Redis caching
- ✅ Database indexing
- ✅ Query optimization
- ✅ Compression

### Production Checklist

- ✅ All features implemented
- ✅ Health checks configured
- ✅ Monitoring set up
- ✅ Error handling in place
- ✅ Security measures active
- ✅ Validation comprehensive
- ✅ Documentation complete
- ✅ Testing completed
- ✅ Performance optimized
- ✅ Scalability considered

---

## Conclusion

The Gift Card SaaS Platform is a comprehensive, production-ready digital gift card management system with:

- **Complete Feature Set**: All core and advanced features implemented
- **Enterprise Security**: Comprehensive security measures
- **Scalable Architecture**: Multi-tenant SaaS architecture
- **Payment Integration**: Multiple payment gateway support
- **Flexible Redemption**: Multiple redemption methods
- **Advanced Analytics**: Comprehensive reporting and analytics
- **Production Ready**: Health checks, monitoring, error handling

The platform is ready for production deployment and can scale to support thousands of merchants and millions of gift cards.

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: Development Team

