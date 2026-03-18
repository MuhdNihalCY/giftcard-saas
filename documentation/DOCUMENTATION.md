# Gift Card SaaS Platform - Complete Documentation

## Table of Contents

1. [Software Requirements Specification (SRS)](#1-software-requirements-specification-srs)
2. [Quick Start Guide](#2-quick-start-guide)
3. [Setup Instructions](#3-setup-instructions)
4. [API Documentation](#4-api-documentation)
5. [Redemption Guide](#5-redemption-guide)
6. [Merchant Payment Flow](#6-merchant-payment-flow)
7. [Project Structure](#7-project-structure)
8. [Environment Variables](#8-environment-variables)

---

## 1. Software Requirements Specification (SRS)

### 1.1 Purpose
To build a comprehensive, user-friendly SaaS platform that enables businesses of all sizes to create, sell, distribute, and manage digital gift cards with multiple redemption methods, seamless integrations, and powerful analytics capabilities.

### 1.2 Scope
Provides a complete gift card ecosystem including online creation, purchase, multi-channel delivery, flexible redemption options (QR codes, codes, links, mobile apps), admin dashboard, advanced analytics, API integrations, and compatibility with POS systems and e-commerce platforms.

### 1.3 Key Features

#### User Management
- User registration, login, and profile management
- Role-based access control (Admin, Merchant, Customer)
- JWT authentication with refresh tokens

#### Gift Card Creation
- Single and bulk gift card creation
- Custom templates and branding
- Unique codes and QR code generation
- Configurable expiry dates and terms

#### Payment Integration
- Multiple payment gateways (Stripe, PayPal, Razorpay, UPI)
- Multi-currency support
- Refund processing
- Payment webhooks

#### Delivery System
- Email delivery with HTML templates
- SMS delivery via Twilio
- PDF generation for offline access
- Scheduled delivery

#### Redemption System
- QR code scanning
- Manual code entry
- Link-based redemption
- API-based redemption for POS systems
- Partial redemption support

#### Analytics Dashboard
- Sales analytics and trends
- Redemption analytics
- Customer analytics
- Custom reports and exports

---

## 2. Quick Start Guide

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Quick Setup

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Setup backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev  # Runs on port 5000

# 3. Setup frontend
cd frontend
npm install
npm run dev  # Runs on port 3001
```

Visit http://localhost:3001

---

## 3. Setup Instructions

### 3.1 Environment Setup

#### Backend (.env)
```env
# Required
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/giftcard_db?schema=public"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
SESSION_SECRET="your-session-secret-min-32-chars"
PORT=5000

# CORS / URLs
CORS_ORIGIN="http://localhost:3001"
FRONTEND_URL="http://localhost:3001"
BACKEND_URL="http://localhost:5000"

# Redis
REDIS_URL="redis://localhost:6379"

# Optional - Payment Gateways
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PAYPAL_CLIENT_ID="..."
PAYPAL_SECRET="..."
PAYPAL_MODE="sandbox"        # sandbox | live
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."

# Optional - Email
EMAIL_SERVICE="sendgrid"     # sendgrid | brevo
SENDGRID_API_KEY="..."
BREVO_API_KEY="..."
EMAIL_FROM="noreply@giftcard.com"
EMAIL_FROM_NAME="Gift Card SaaS"

# Optional - SMS
SMS_SERVICE="twilio"         # twilio | brevo
TWILIO_ACCOUNT_SID="..."
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="..."
BREVO_SMS_SENDER="..."

# Optional - Storage
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
AWS_REGION="us-east-1"

# Optional - Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

Note: if you start via `./start.sh`, the script may automatically select different local ports (e.g. `5433`/`6380`) to avoid conflicts with other projects. In that case, update `DATABASE_URL` (and optionally `REDIS_URL`) to match the printed ports.

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
```

### 3.2 Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 3.3 Generate JWT Secrets

```bash
# Generate secure secrets
openssl rand -base64 32
```

---

## 4. API Documentation

### Base URL
`http://localhost:5000/api/v1`

### Authentication
Protected endpoints require Bearer token:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `POST /auth/refresh` - Refresh access token
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update profile

#### Two-Factor Authentication
- `POST /auth/2fa/enable` - Enable 2FA
- `POST /auth/2fa/verify` - Verify 2FA setup
- `POST /auth/2fa/disable` - Disable 2FA
- `POST /auth/2fa/validate` - Validate 2FA code on login

#### Device Management
- `GET /auth/devices` - List trusted devices
- `DELETE /auth/devices/:id` - Remove trusted device

#### Email & Password
- `POST /email-verification/send` - Send verification email
- `POST /email-verification/verify` - Verify email
- `POST /password-reset/request` - Request password reset
- `POST /password-reset/reset` - Reset password

#### OTP
- `POST /otp/send` - Send OTP
- `POST /otp/verify` - Verify OTP

#### Gift Cards
- `GET /gift-cards` - List gift cards
- `POST /gift-cards` - Create gift card
- `GET /gift-cards/:id` - Get gift card details
- `PUT /gift-cards/:id` - Update gift card
- `DELETE /gift-cards/:id` - Delete gift card
- `POST /gift-cards/bulk` - Bulk create
- `GET /gift-cards/:id/qr` - Get QR code

#### Gift Card Share
- `POST /gift-card-share` - Share a gift card
- `GET /gift-card-share/:token` - Get shared gift card

#### Gift Card Products
- `GET /gift-card-products` - List products
- `POST /gift-card-products` - Create product
- `PUT /gift-card-products/:id` - Update product
- `DELETE /gift-card-products/:id` - Delete product

#### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/:id/refund` - Process refund
- `GET /payments` - List payments

#### Merchant Payment Gateways
- `GET /merchant/payment-gateways` - List configured gateways
- `POST /merchant/payment-gateways` - Add gateway config
- `PUT /merchant/payment-gateways/:id` - Update gateway config
- `DELETE /merchant/payment-gateways/:id` - Remove gateway config

#### Redemptions
- `POST /redemptions/validate` - Validate gift card code
- `POST /redemptions/check-balance` - Check balance
- `POST /redemptions/redeem` - Redeem (authenticated merchant)
- `POST /redemptions/redeem/qr` - Redeem via QR code
- `POST /redemptions/redeem/:code` - Redeem via link (public)
- `GET /redemptions/gift-card/:id/history` - Get redemption history

#### Delivery
- `POST /delivery/deliver` - Deliver gift card
- `POST /delivery/reminder/:id` - Send expiry reminder
- `GET /delivery/pdf/:id` - Generate PDF

#### Analytics
- `GET /analytics/sales` - Sales analytics
- `GET /analytics/redemptions` - Redemption analytics
- `GET /analytics/customers` - Customer analytics

#### Breakage & Chargebacks
- `GET /breakage` - Breakage analytics
- `GET /chargebacks` - Chargeback records
- `POST /chargebacks` - File chargeback

#### Payouts
- `GET /payouts` - List merchant payouts
- `POST /payouts/request` - Request payout
- `GET /admin/payouts` - Admin: list all payouts
- `PUT /admin/payouts/:id` - Admin: approve/reject payout

#### Upload
- `POST /upload` - Upload file (templates, assets)

#### Feature Flags
- `GET /feature-flags` - Get feature flags
- `PUT /feature-flags/:flag` - Toggle feature flag

#### Admin
- `GET /admin/communication-settings` - Get communication settings
- `PUT /admin/communication-settings` - Update settings
- `GET /admin/communication-logs` - Get communication logs
- `GET /admin/audit-logs` - Get audit logs
- `GET /admin/blacklist` - Get blacklisted IPs/devices
- `POST /admin/blacklist` - Add to blacklist
- `DELETE /admin/blacklist/:id` - Remove from blacklist

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

---

## 5. Redemption Guide

### Redemption Methods

#### 1. Link-Based Redemption (Public)
- URL: `/redeem/[code]`
- Anyone with the link can redeem
- Requires merchant ID

#### 2. QR Code Redemption (Merchant Dashboard)
- Merchant scans QR code
- Authenticated merchants only
- Automatic merchant ID from session

#### 3. Manual Code Entry (Merchant Dashboard)
- Enter gift card code manually
- Authenticated merchants only
- Real-time validation

#### 4. API-Based Redemption
- For POS system integration
- RESTful API endpoint
- Requires API key authentication

### Redemption Flow

1. **Customer receives gift card** via email/SMS
2. **Customer visits merchant** and makes purchase
3. **Merchant redeems** via QR scan, code entry, or link
4. **System validates** gift card (status, balance, expiry)
5. **Balance deducted** from gift card
6. **Redemption record created** with transaction log
7. **Confirmation** sent to both parties

### Redemption Rules

- Gift card must be `ACTIVE`
- Must not be expired
- Balance must be sufficient
- Partial redemption only if allowed

### Use Cases

**Partial Redemption:**
- Customer has $50 gift card
- Buys $30 item
- Balance: $50 → $20 (can use again)

**Full Redemption:**
- Customer has $100 gift card
- Makes $100 purchase
- Balance: $100 → $0
- Status: ACTIVE → REDEEMED

---

## 6. Merchant Payment Flow

### How Merchants Get Paid

When a gift card is redeemed at a merchant:

1. **Redemption Occurs**
   - Customer redeems gift card (e.g., $50)
   - Gift card balance deducted
   - Redemption record created

2. **Merchant Earnings Tracked**
   - Merchant balance increases by redemption amount
   - Earnings tracked in merchant account
   - Available for payout

3. **Payout to Merchant**
   - **Immediate Payout**: Real-time via Stripe Connect/PayPal
   - **Scheduled Payout**: Daily/weekly/monthly batch processing
   - Payment methods: Stripe Connect, PayPal Payouts, Bank Transfer

4. **Payment Confirmation**
   - Merchant receives notification
   - Funds appear in merchant account
   - Transaction recorded in history

### Commission Structure

- Platform fee: 2-5% (configurable)
- Merchant receives: 95-98% of redemption amount
- Example: $50 redemption → Merchant receives $47.50 (5% commission)

### Current Status

⚠️ **Note**: Merchant payout system is in development. Redemptions are tracked but automated payouts need to be configured.

**To Enable Payouts:**
1. Set up payment provider (Stripe Connect/PayPal)
2. Configure merchant payout accounts
3. Enable automatic or manual payouts
4. Set commission rates

---

## 7. Project Structure

```
giftcard-saas/
├── backend/                   # Express.js API (Modular Monolith)
│   ├── src/
│   │   ├── infrastructure/    # Core singletons (database, redis, session, env)
│   │   ├── server/            # App bootstrap
│   │   │   ├── middleware.ts  # Middleware chain configuration
│   │   │   └── module-registry.ts  # Centralized route registration
│   │   ├── modules/           # Feature modules
│   │   │   ├── admin/
│   │   │   ├── analytics/
│   │   │   ├── auth/
│   │   │   ├── delivery/
│   │   │   ├── fraud/
│   │   │   ├── gift-cards/
│   │   │   ├── notifications/
│   │   │   ├── payments/
│   │   │   ├── payouts/
│   │   │   ├── redemptions/
│   │   │   └── users/
│   │   ├── config/            # App configuration
│   │   ├── controllers/       # HTTP request handlers
│   │   ├── services/          # Business logic services
│   │   ├── routes/            # Route definitions
│   │   ├── middleware/        # Express middleware
│   │   ├── validators/        # Zod schema validators
│   │   ├── shared/            # Shared utilities (cache, scheduler)
│   │   ├── jobs/              # BullMQ job definitions
│   │   ├── workers/           # BullMQ workers
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   └── constants/         # App constants
│   └── prisma/                # Database schema & migrations
├── frontend/                  # Next.js 14 App Router
│   └── src/
│       ├── app/               # Pages & layouts (App Router)
│       │   ├── (auth)/        # Auth route group
│       │   ├── (dashboard)/   # Dashboard route group
│       │   └── (public)/      # Public route group
│       ├── features/          # Feature-colocated modules
│       │   ├── auth/          # api/, store/, hooks/, types/
│       │   ├── gift-cards/
│       │   ├── payments/
│       │   ├── redemptions/
│       │   ├── analytics/
│       │   ├── admin/
│       │   └── payouts/
│       ├── components/        # Reusable React components
│       │   ├── ui/            # UI primitives (Button, Card, Input…)
│       │   └── ...
│       ├── lib/               # Utilities (api client, auth, logger)
│       ├── shared/            # Shared hooks, types, store
│       └── store/             # Global Zustand state
└── docker-compose.yml         # Docker services (PostgreSQL + Redis)
```

### Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL + Prisma ORM
- Redis
- JWT Authentication

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)

---

## 8. Environment Variables

### Required Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 32 chars)
- `SESSION_SECRET` - Session signing secret (min 32 chars)
- `PORT` - Server port (default: 5000)

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL (e.g. `http://localhost:5000/api/v1`)

### Optional Variables

**CORS / URLs:**
- `CORS_ORIGIN` - Allowed frontend origin (default: `http://localhost:3001`)
- `FRONTEND_URL` - Frontend base URL
- `BACKEND_URL` - Backend base URL

**Redis:**
- `REDIS_URL` - Redis connection URL (default: `redis://localhost:6379`)

**Payment Gateways:**
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `PAYPAL_CLIENT_ID` - PayPal client ID
- `PAYPAL_SECRET` - PayPal secret
- `PAYPAL_MODE` - `sandbox` or `live` (default: `sandbox`)
- `RAZORPAY_KEY_ID` - Razorpay key ID
- `RAZORPAY_KEY_SECRET` - Razorpay secret

**Email:**
- `EMAIL_SERVICE` - `sendgrid` or `brevo` (default: `sendgrid`)
- `SENDGRID_API_KEY` - SendGrid API key
- `BREVO_API_KEY` - Brevo (Sendinblue) API key
- `EMAIL_FROM` - Sender email address
- `EMAIL_FROM_NAME` - Sender display name

**SMS:**
- `SMS_SERVICE` - `twilio` or `brevo` (default: `twilio`)
- `TWILIO_ACCOUNT_SID` - Twilio account SID
- `TWILIO_AUTH_TOKEN` - Twilio auth token
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `BREVO_SMS_SENDER` - Brevo SMS sender name

**Storage:**
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET` - S3 bucket name
- `AWS_REGION` - AWS region (default: `us-east-1`)

**Rate Limiting:**
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in ms (default: `900000`)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: `1000`)

---

## Test Accounts

After running `npx prisma db seed`, you can use:

**Admin:**
- Email: `admin@giftcard.com`
- Password: `admin123`

**Merchant:**
- Email: `merchant@giftcard.com`
- Password: `merchant123`

**Customer:**
- Email: `customer@giftcard.com`
- Password: `customer123`

---

## Development Commands

### Backend
```bash
npm run dev          # Development server
npm run build        # Build for production
npm run start        # Production server
npx prisma studio    # Database GUI
npx prisma migrate dev  # Create migration
```

### Frontend
```bash
npm run dev          # Development server (port 3001)
npm run build        # Build for production
npm run start        # Production server
npm run lint         # Run linter
```

---

## Support & Troubleshooting

### Common Issues

**Port conflicts:**
- Backend: Change `PORT` in `.env`
- Frontend: Use `npm run dev -- -p 3001`

**Database connection:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env`
- Verify database exists

**Authentication errors:**
- Check JWT secrets are set
- Verify token expiration
- Clear browser localStorage

---

**Last Updated**: 2026-03-18
**Version**: 1.0.0

