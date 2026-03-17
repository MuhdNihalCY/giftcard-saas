# Gift Card SaaS Platform — Full Project Documentation

> A comprehensive digital gift card platform built with Node.js, Next.js, and PostgreSQL. Enables businesses to create, sell, and manage digital gift cards with multiple payment gateways, delivery options, and redemption methods.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Database Schema](#4-database-schema)
5. [API Endpoints](#5-api-endpoints)
6. [Business Logic](#6-business-logic)
7. [Authentication & Security](#7-authentication--security)
8. [Frontend Pages & Components](#8-frontend-pages--components)
9. [State Management & Utilities](#9-state-management--utilities)
10. [Infrastructure & DevOps](#10-infrastructure--devops)
11. [Environment Variables](#11-environment-variables)
12. [Package Dependencies](#12-package-dependencies)
13. [Project Statistics](#13-project-statistics)

---

## 1. Project Overview

**Name:** Gift Card SaaS Platform
**Version:** 1.0.0
**License:** ISC
**Status:** Production Ready

### What It Does

- Merchants create and sell branded digital gift cards
- Customers purchase gift cards via multiple payment gateways
- Merchants redeem gift cards (via QR, code entry, or public link)
- Platform takes a commission per redemption and manages merchant payouts
- Full admin panel for platform management

### Key Capabilities

| Feature | Details |
|---|---|
| Gift Card Creation | Single & bulk, custom templates, QR code, PDF |
| Payment Gateways | Stripe, PayPal, Razorpay, UPI |
| Delivery | Email, SMS, PDF download, shareable link, NFC |
| Redemption | QR scan, code entry, public link, API |
| Analytics | Sales, redemptions, customers, breakage, chargebacks |
| Security | JWT, 2FA (TOTP), CSRF, rate limiting, fraud prevention |
| Multi-currency | Configurable per gift card |
| Feature Flags | Per-role, gradual rollouts |
| Commission System | Per-merchant or global, percentage or fixed |
| Payout System | Immediate, daily, weekly, monthly schedules |

---

## 2. Tech Stack

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.18 |
| Language | TypeScript 5.3 |
| Database | PostgreSQL 15 |
| ORM | Prisma 5.7 |
| Cache | Redis 7 (ioredis) |
| Auth | JWT (jsonwebtoken) + TOTP (speakeasy) |
| Payment | Stripe 14, PayPal, Razorpay 2.9 |
| Email/SMS | Brevo, SendGrid, Twilio |
| Job Queue | BullMQ |
| Logging | Winston |
| Validation | Zod |
| Testing | Jest + Supertest |
| Security | Helmet, bcryptjs, CSRF, express-rate-limit |
| File Uploads | Multer + AWS S3 |
| PDF | PDFKit |
| QR Codes | qrcode |

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Library | React 18 |
| Language | TypeScript 5.3 |
| Styling | Tailwind CSS 3.4 |
| State | Zustand 4.4 |
| Forms | React Hook Form 7.49 + Zod |
| HTTP | Axios 1.6 |
| Charts | Recharts 2.10 |
| Icons | Lucide React |
| QR | html5-qrcode, react-qr-code |

### Infrastructure

| Layer | Technology |
|---|---|
| Database | PostgreSQL 15 (Docker) |
| Cache | Redis 7-alpine (Docker) |
| Containerization | Docker + Docker Compose |

---

## 3. Project Structure

### Root

```
giftcard-saas/
├── backend/              # Express.js API server
├── frontend/             # Next.js web application
├── docker-compose.yml    # PostgreSQL + Redis containers
├── setup-env.sh          # Generate .env files
├── documentation/        # Docs, SRS, guides
└── projectname.md        # This file
```

### Backend (`backend/src/`)

```
backend/src/
├── app.ts                          # Express app setup
├── config/
│   ├── database.ts                 # Prisma client
│   ├── env.ts                      # Env variable schema
│   ├── queue.ts                    # BullMQ config
│   ├── redis.ts                    # Redis client
│   └── session.ts                  # express-session config
│
├── controllers/                    # 27 request handlers
│   ├── admin-payout.controller.ts
│   ├── analytics.controller.ts
│   ├── api-docs.controller.ts
│   ├── audit-log.controller.ts
│   ├── auth.controller.ts
│   ├── blacklist.controller.ts
│   ├── breakage.controller.ts
│   ├── chargeback.controller.ts
│   ├── communicationLog.controller.ts
│   ├── communicationSettings.controller.ts
│   ├── delivery.controller.ts
│   ├── device.controller.ts
│   ├── emailVerification.controller.ts
│   ├── feature-flag.controller.ts
│   ├── giftcard-product.controller.ts
│   ├── giftcard-share.controller.ts
│   ├── giftcard.controller.ts
│   ├── health.controller.ts
│   ├── merchant-payment-gateway.controller.ts
│   ├── otp.controller.ts
│   ├── passwordReset.controller.ts
│   ├── payment.controller.ts
│   ├── payout.controller.ts
│   ├── redemption.controller.ts
│   ├── two-factor.controller.ts
│   ├── upload.controller.ts
│   └── webhook.controller.ts
│
├── services/                       # 40 business logic services
│   ├── analytics.service.ts
│   ├── audit-log.service.ts
│   ├── auth.service.ts
│   ├── blacklist.service.ts
│   ├── breakage.service.ts
│   ├── cache.service.ts
│   ├── chargeback.service.ts
│   ├── commission.service.ts
│   ├── communicationLog.service.ts
│   ├── communicationSettings.service.ts
│   ├── delivery/
│   ├── device.service.ts
│   ├── emailVerification.service.ts
│   ├── feature-flag.service.ts
│   ├── fraud-prevention.service.ts
│   ├── giftcard-product.service.ts
│   ├── giftcard-share.service.ts
│   ├── giftcard-template.service.ts
│   ├── giftcard.service.ts
│   ├── ip-tracking.service.ts
│   ├── merchant-payment-gateway.service.ts
│   ├── otp.service.ts
│   ├── passwordReset.service.ts
│   ├── payment/
│   │   ├── payment.service.ts
│   │   ├── paypal.service.ts
│   │   ├── paypal-connect.service.ts
│   │   ├── razorpay.service.ts
│   │   ├── stripe.service.ts
│   │   ├── stripe-connect.service.ts
│   │   └── upi.service.ts
│   ├── payout-settings.service.ts
│   ├── payout.service.ts
│   ├── pdf.service.ts
│   ├── qrcode.service.ts
│   ├── redemption.service.ts
│   ├── scheduler.service.ts
│   ├── two-factor.service.ts
│   └── upload.service.ts
│
├── routes/                         # 25 route files
│   ├── admin-payout.routes.ts
│   ├── analytics.routes.ts
│   ├── audit-log.routes.ts
│   ├── auth.routes.ts
│   ├── blacklist.routes.ts
│   ├── breakage.routes.ts
│   ├── chargeback.routes.ts
│   ├── communicationLog.routes.ts
│   ├── communicationSettings.routes.ts
│   ├── delivery.routes.ts
│   ├── device.routes.ts
│   ├── emailVerification.routes.ts
│   ├── feature-flag.routes.ts
│   ├── giftcard-product.routes.ts
│   ├── giftcard-share.routes.ts
│   ├── giftcard.routes.ts
│   ├── health.routes.ts
│   ├── merchant-payment-gateway.routes.ts
│   ├── otp.routes.ts
│   ├── passwordReset.routes.ts
│   ├── payment.routes.ts
│   ├── payout.routes.ts
│   ├── redemption.routes.ts
│   ├── two-factor.routes.ts
│   └── upload.routes.ts
│
├── middleware/                     # 9 middleware functions
│   ├── audit.middleware.ts         # Activity audit logging
│   ├── auth.middleware.ts          # JWT auth & RBAC
│   ├── csrf.middleware.ts          # CSRF token validation
│   ├── error.middleware.ts         # Centralized error handler
│   ├── feature-flag.middleware.ts  # Feature flag gate
│   ├── logger.middleware.ts        # HTTP request logging
│   ├── rateLimit.middleware.ts     # Rate limiting
│   ├── security-headers.middleware.ts  # CSP, HSTS, etc.
│   └── validation.middleware.ts    # Zod schema validation
│
├── validators/                     # 8 Zod schemas
│   ├── auth.validator.ts
│   ├── delivery.validator.ts
│   ├── giftcard-product.validator.ts
│   ├── giftcard.validator.ts
│   ├── password.validator.ts
│   ├── payment.validator.ts
│   ├── redemption.validator.ts
│   └── two-factor.validator.ts
│
├── jobs/                           # 4 cron jobs
│   ├── giftCardExpiry.job.ts       # Daily: expire cards
│   ├── expiryReminders.job.ts      # Daily: send reminders
│   ├── cleanupTokens.job.ts        # Daily: purge old tokens
│   └── scheduledDelivery.job.ts    # Every 5min: send deliveries
│
├── utils/
│   ├── constants.ts
│   ├── encryption.ts               # AES-256-GCM encryption
│   ├── errors.ts                   # Custom error classes
│   ├── helpers.ts
│   ├── logger.ts                   # Winston logger
│   ├── pagination.ts
│   ├── sanitize.ts                 # DOMPurify XSS sanitization
│   ├── template-design.util.ts
│   ├── validation.ts
│   └── validators.ts
│
├── types/
│   ├── api.ts
│   ├── domain.ts
│   ├── express.d.ts
│   ├── index.ts
│   └── payment.ts
│
├── constants/
│   ├── feature-flags.ts
│   └── index.ts
│
└── workers/
    └── index.ts
```

### Frontend (`frontend/src/`)

```
frontend/src/
├── app/                            # Next.js App Router
│   ├── layout.tsx
│   ├── page.tsx                    # Home
│   ├── (auth)/
│   │   ├── auth/page.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (public)/
│   │   ├── browse/page.tsx
│   │   ├── check-balance/page.tsx
│   │   ├── products/[id]/page.tsx
│   │   ├── purchase/[id]/page.tsx
│   │   ├── purchase/bulk/page.tsx
│   │   ├── redeem/[code]/page.tsx
│   │   ├── redeem/[code]/success/page.tsx
│   │   └── gift-cards/share/[token]/page.tsx
│   └── (dashboard)/
│       ├── dashboard/page.tsx
│       ├── dashboard/redeem/page.tsx
│       ├── gift-cards/page.tsx
│       ├── gift-cards/create/page.tsx
│       ├── gift-cards/[id]/page.tsx
│       ├── gift-cards/[id]/edit/page.tsx
│       ├── gift-card-products/page.tsx
│       ├── gift-card-products/create/page.tsx
│       ├── gift-card-products/[id]/edit/page.tsx
│       ├── templates/page.tsx
│       ├── templates/create/page.tsx
│       ├── payments/page.tsx
│       ├── redemptions/page.tsx
│       ├── delivery/page.tsx
│       ├── wallet/page.tsx
│       ├── payouts/page.tsx
│       ├── breakage/page.tsx
│       ├── chargebacks/page.tsx
│       ├── analytics/page.tsx
│       ├── reports/sales/page.tsx
│       ├── reports/redemptions/page.tsx
│       ├── settings/page.tsx
│       ├── settings/payment-gateways/page.tsx
│       ├── security/2fa/page.tsx
│       ├── security/devices/page.tsx
│       ├── users/page.tsx
│       └── admin/
│           ├── audit-logs/page.tsx
│           ├── blacklist/page.tsx
│           ├── communication-logs/page.tsx
│           ├── communications/page.tsx
│           ├── feature-flags/page.tsx
│           ├── payouts/page.tsx
│           └── system-status/page.tsx
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Textarea.tsx
│   │   ├── Card.tsx
│   │   ├── Label.tsx
│   │   ├── Badge.tsx
│   │   ├── Switch.tsx
│   │   ├── Skeleton.tsx
│   │   ├── DataTable.tsx
│   │   ├── ToastContainer.tsx
│   │   ├── Toast.tsx
│   │   └── ThemeToggle.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── MetricCard.tsx
│   │   ├── FilterBar.tsx
│   │   └── ChartContainer.tsx
│   ├── AmountSelector.tsx
│   ├── CurrencySelector.tsx
│   ├── ErrorBoundary.tsx
│   ├── FeatureFlag.tsx
│   ├── FeatureFlagGuard.tsx
│   ├── GiftCardDisplay.tsx
│   ├── GiftCardShare.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navigation.tsx
│   ├── NFCReader.tsx
│   ├── PasswordStrength.tsx
│   ├── ProductCard.tsx
│   ├── QRCodeScanner.tsx
│   ├── RecipientForm.tsx
│   ├── TemplateEditor.tsx
│   ├── TemplatePreview.tsx
│   ├── TemplateSelector.tsx
│   └── ClientProviders.tsx
│
├── store/
│   ├── authStore.ts               # Auth state + token management
│   ├── featureFlagStore.ts
│   └── themeStore.ts
│
├── hooks/
│   ├── useFeatureFlag.ts
│   ├── useAutocomplete.ts
│   └── useOnClickOutside.ts
│
├── lib/
│   ├── api.ts                     # Axios instance + interceptors + token refresh queue
│   ├── auth.ts                    # JWT decode + localStorage helpers
│   ├── logger.ts                  # Client-side logger
│   ├── utils.ts
│   ├── color-schemes.ts
│   ├── currencies.ts
│   ├── template-design.ts
│   └── template-presets.ts
│
├── services/
│   └── nfc.service.ts
│
└── types/
    ├── api.ts
    ├── domain.ts
    ├── transaction.ts
    ├── share.ts
    ├── nfc.ts
    └── nfc.d.ts
```

---

## 4. Database Schema

**ORM:** Prisma
**Database:** PostgreSQL 15+
**Total Models:** 23

### Enums

```
UserRole:             ADMIN | MERCHANT | CUSTOMER
GiftCardStatus:       ACTIVE | REDEEMED | EXPIRED | CANCELLED
PaymentMethod:        STRIPE | PAYPAL | RAZORPAY | UPI
GatewayType:          STRIPE | PAYPAL | RAZORPAY | UPI
VerificationStatus:   PENDING | VERIFIED | FAILED
CommissionType:       PERCENTAGE | FIXED
PayoutSchedule:       IMMEDIATE | DAILY | WEEKLY | MONTHLY
PayoutStatus:         PENDING | PROCESSING | COMPLETED | FAILED | CANCELLED
PaymentStatus:        PENDING | COMPLETED | FAILED | REFUNDED
RedemptionMethod:     QR_CODE | CODE_ENTRY | LINK | API
TransactionType:      PURCHASE | REDEMPTION | REFUND | EXPIRY
FeatureFlagCategory:  PAGE | FEATURE
FeatureFlagTargetRole: MERCHANT | CUSTOMER | ALL
BlacklistType:        EMAIL | IP | PHONE | PAYMENT_METHOD | USER_ID
BlacklistSeverity:    LOW | MEDIUM | HIGH | CRITICAL
```

### Models

#### User
```
id               String      @id @default(uuid())
email            String      @unique
password         String
firstName        String?
lastName         String?
role             UserRole    @default(CUSTOMER)
businessName     String?
businessLogo     String?
merchantBalance  Decimal     @default(0)
isActive         Boolean     @default(true)
isEmailVerified  Boolean     @default(false)
twoFactorEnabled Boolean     @default(false)
twoFactorSecret  String?
backupCodes      String[]
createdAt        DateTime
updatedAt        DateTime

Relations: giftCards, redemptions, payments, transactions, apiKeys,
           webhooks, refreshTokens, payouts, auditLogs, devices,
           communicationLogs, merchantPaymentGateways, commissionSettings,
           payoutSettings, otps, featureFlags
```

#### GiftCard
```
id                     String
merchantId             String         → User
productId              String?        → GiftCardProduct
templateId             String?        → GiftCardTemplate
code                   String         @unique
value                  Decimal
balance                Decimal
currency               String         @default("USD")
status                 GiftCardStatus @default(ACTIVE)
expiryDate             DateTime?
allowPartialRedemption Boolean        @default(true)
recipientEmail         String?
recipientName          String?
recipientPhone         String?
senderName             String?
personalMessage        String?
deliveredAt            DateTime?
metadata               Json?
shareToken             String?        @unique
shareTokenExpiresAt    DateTime?
createdAt              DateTime
updatedAt              DateTime

Relations: merchant, product, template, redemptions, transactions
Indexes: merchantId, code, status
```

#### GiftCardProduct
```
id                  String
merchantId          String         → User
templateId          String?        → GiftCardTemplate
name                String
description         String?
minAmount           Decimal?
maxAmount           Decimal?
minSalePrice        Decimal?
maxSalePrice        Decimal?
allowCustomAmount   Boolean        @default(false)
fixedAmounts        Json?
fixedSalePrices     Json?
currency            String         @default("USD")
isPublic            Boolean        @default(false)
isActive            Boolean        @default(true)
imageUrl            String?
category            String?
tags                String[]
createdAt           DateTime
updatedAt           DateTime

Relations: merchant, template, giftCards
```

#### GiftCardTemplate
```
id              String
merchantId      String?        → User
name            String
description     String?
design          Json           # Colors, fonts, layout
isDefault       Boolean        @default(false)
isPublic        Boolean        @default(false)
previewUrl      String?
createdAt       DateTime
updatedAt       DateTime

Relations: merchant, giftCards, products
```

#### Payment
```
id              String
giftCardId      String         → GiftCard
merchantId      String         → User
customerId      String?        → User
amount          Decimal
currency        String
status          PaymentStatus  @default(PENDING)
paymentMethod   PaymentMethod
gatewayPaymentId String?
gatewayOrderId  String?
gatewaySignature String?
metadata        Json?
refundedAt      DateTime?
refundAmount    Decimal?
createdAt       DateTime
updatedAt       DateTime

Relations: giftCard, merchant, customer
Indexes: giftCardId, merchantId, status
```

#### Redemption
```
id               String
giftCardId       String         → GiftCard
merchantId       String         → User
amount           Decimal
balanceBefore    Decimal
balanceAfter     Decimal
redemptionMethod RedemptionMethod
location         String?
notes            String?
createdAt        DateTime

Relations: giftCard, merchant
Indexes: giftCardId, merchantId
```

#### Transaction
```
id           String
giftCardId   String         → GiftCard
type         TransactionType
amount       Decimal
balanceBefore Decimal
balanceAfter  Decimal
userId       String?        → User
metadata     Json?
createdAt    DateTime

Relations: giftCard, user
```

#### Payout
```
id              String
merchantId      String         → User
amount          Decimal
currency        String
status          PayoutStatus   @default(PENDING)
payoutMethod    String
gatewayPayoutId String?
metadata        Json?
processedAt     DateTime?
failureReason   String?
createdAt       DateTime
updatedAt       DateTime

Relations: merchant
```

#### MerchantPaymentGateway
```
id                  String
merchantId          String         → User
gatewayType         GatewayType
isActive            Boolean        @default(false)
credentials         Json           # Encrypted gateway keys
verificationStatus  VerificationStatus @default(PENDING)
verifiedAt          DateTime?
metadata            Json?
createdAt           DateTime
updatedAt           DateTime

Relations: merchant
```

#### CommissionSettings
```
id             String
merchantId     String?        → User (null = global)
paymentMethod  PaymentMethod?
commissionType CommissionType @default(PERCENTAGE)
commissionRate Decimal
isActive       Boolean        @default(true)
createdAt      DateTime
updatedAt      DateTime

Relations: merchant
```

#### PayoutSettings
```
id             String
merchantId     String         → User @unique
payoutSchedule PayoutSchedule @default(WEEKLY)
minimumPayout  Decimal        @default(10)
payoutMethod   String
payoutDetails  Json           # Bank account / wallet info
isActive       Boolean        @default(true)
createdAt      DateTime
updatedAt      DateTime

Relations: merchant
```

#### FeatureFlag
```
id          String
featureKey  String         @unique
featureName String
category    FeatureFlagCategory @default(FEATURE)
targetRole  FeatureFlagTargetRole @default(ALL)
isEnabled   Boolean        @default(true)
metadata    Json?
createdBy   String?        → User
createdAt   DateTime
updatedAt   DateTime
```

#### FraudBlacklist
```
id          String
type        BlacklistType
value       String
reason      String
severity    BlacklistSeverity @default(MEDIUM)
isActive    Boolean        @default(true)
expiresAt   DateTime?
createdBy   String?
createdAt   DateTime
updatedAt   DateTime

Index: type + value (unique)
```

#### AuditLog
```
id         String
userId     String?        → User
action     String
resource   String
resourceId String?
oldValues  Json?
newValues  Json?
ipAddress  String?
userAgent  String?
metadata   Json?
createdAt  DateTime

Relations: user
```

#### RefreshToken
```
id        String
userId    String         → User
token     String         @unique
expiresAt DateTime
createdAt DateTime

Relations: user
```

#### EmailVerificationToken
```
id        String
userId    String         → User @unique
token     String         @unique
expiresAt DateTime
createdAt DateTime
```

#### PasswordResetToken
```
id        String
userId    String         → User
token     String         @unique
expiresAt DateTime
isUsed    Boolean        @default(false)
createdAt DateTime
```

#### OTP
```
id        String
userId    String         → User
code      String
expiresAt DateTime
isUsed    Boolean        @default(false)
createdAt DateTime
```

#### CommunicationSettings
```
id              String
merchantId      String?
emailProvider   String?
smsProvider     String?
emailConfig     Json?
smsConfig       Json?
isActive        Boolean @default(true)
createdAt       DateTime
updatedAt       DateTime
```

#### CommunicationTemplate
```
id          String
merchantId  String?
name        String
type        String        # email | sms
subject     String?
body        String
variables   String[]
isDefault   Boolean       @default(false)
createdAt   DateTime
updatedAt   DateTime
```

#### CommunicationLog
```
id          String
merchantId  String?       → User
userId      String?       → User
type        String
recipient   String
subject     String?
body        String
status      String
metadata    Json?
sentAt      DateTime?
createdAt   DateTime
```

#### ApiKey
```
id          String
merchantId  String         → User
name        String
key         String         @unique
isActive    Boolean        @default(true)
lastUsedAt  DateTime?
expiresAt   DateTime?
createdAt   DateTime
updatedAt   DateTime
```

#### Webhook
```
id         String
merchantId String         → User
url        String
events     String[]
secret     String
isActive   Boolean        @default(true)
createdAt  DateTime
updatedAt  DateTime
```

---

## 5. API Endpoints

**Base URL:** `http://localhost:5000/api/v1`

### Authentication

```
POST  /auth/register                     Public     Register new user
POST  /auth/login                        Public     Login, returns JWT tokens
POST  /auth/refresh                      Public     Refresh access token
GET   /auth/profile                      Auth       Get current user profile
```

### Gift Cards

```
POST  /gift-cards                        MERCHANT/ADMIN   Create gift card
GET   /gift-cards                        Auth             List gift cards
GET   /gift-cards/suggestions            Auth             Autocomplete
GET   /gift-cards/code/:code             Public           Get by code
GET   /gift-cards/:id                    Auth             Get by ID
PUT   /gift-cards/:id                    MERCHANT/ADMIN   Update
DELETE /gift-cards/:id                   MERCHANT/ADMIN   Delete
GET   /gift-cards/:id/qr                 Auth             Get QR code image
POST  /gift-cards/bulk                   MERCHANT/ADMIN   Bulk create (max 1000)
POST  /gift-cards/templates              MERCHANT/ADMIN   Create template
GET   /gift-cards/templates              Public           List templates
GET   /gift-cards/templates/:id          Public           Get template
PUT   /gift-cards/templates/:id          MERCHANT/ADMIN   Update template
DELETE /gift-cards/templates/:id         MERCHANT/ADMIN   Delete template
```

### Gift Card Products

```
POST  /gift-card-products                MERCHANT/ADMIN   Create product
GET   /gift-card-products                Auth             List products
GET   /gift-card-products/suggestions    Auth             Autocomplete
GET   /gift-card-products/public         Public           Browse public products
GET   /gift-card-products/:id            Public           Product details
PUT   /gift-card-products/:id            MERCHANT/ADMIN   Update
DELETE /gift-card-products/:id           MERCHANT/ADMIN   Delete
```

### Payments

```
POST  /payments/create-intent            Auth             Initiate payment
POST  /payments/confirm                  Public           Confirm payment
GET   /payments                          Auth             List payments
GET   /payments/suggestions              Auth             Autocomplete
GET   /payments/:id                      Auth             Payment details
POST  /payments/:id/refund               MERCHANT/ADMIN   Refund payment
POST  /payments/from-product             Auth             Pay from product
POST  /payments/bulk-purchase            Auth             Bulk purchase
POST  /payments/webhook/stripe           Public           Stripe webhook
POST  /payments/webhook/razorpay         Public           Razorpay webhook
POST  /payments/webhook/paypal/payout    Public           PayPal webhook
```

### Redemptions

```
POST  /redemptions/validate              Public           Validate code
POST  /redemptions/check-balance         Public           Check balance
POST  /redemptions/redeem                MERCHANT/ADMIN   Redeem (code/ID)
POST  /redemptions/redeem/qr             MERCHANT/ADMIN   Redeem via QR scan
POST  /redemptions/redeem/:code          Public           Redeem via link (must be card owner)
GET   /redemptions                       Auth             List redemptions
GET   /redemptions/suggestions           Auth             Autocomplete
GET   /redemptions/:id                   Auth             Redemption details
GET   /redemptions/gift-card/:id/history Auth             Card redemption history
GET   /redemptions/gift-card/:id/transactions Auth        Card transaction history
```

### Gift Card Sharing

```
POST  /gift-card-share/:giftCardId/generate-token   Auth     Create share link
GET   /gift-card-share/token/:token                  Public   View via share link
DELETE /gift-card-share/:giftCardId/revoke-token     Auth     Revoke link
GET   /gift-card-share/:giftCardId/nfc-data          Auth     Get NFC payload
```

### Delivery

```
POST  /delivery/deliver             MERCHANT/ADMIN   Send gift card (email/SMS)
POST  /delivery/reminder/:id        MERCHANT/ADMIN   Send reminder
GET   /delivery/pdf/:id             Auth             Generate PDF
GET   /delivery/pdf/:id/download    Auth             Download PDF
```

### Analytics

```
GET   /analytics/sales              MERCHANT/ADMIN   Sales metrics
GET   /analytics/redemptions        MERCHANT/ADMIN   Redemption metrics
GET   /analytics/customers          MERCHANT/ADMIN   Customer analytics
GET   /analytics/gift-cards         MERCHANT/ADMIN   Gift card stats
GET   /analytics/breakage           MERCHANT/ADMIN   Breakage analysis
```

### Payouts (Merchant)

```
GET   /payouts/available-balance    MERCHANT/ADMIN   Current balance
GET   /payouts/settings             MERCHANT/ADMIN   Payout settings
PUT   /payouts/settings             MERCHANT/ADMIN   Update settings
POST  /payouts/request              MERCHANT/ADMIN   Request payout
GET   /payouts                      MERCHANT/ADMIN   List payouts
GET   /payouts/:id                  MERCHANT/ADMIN   Payout details
```

### Admin Payouts

```
GET   /admin-payout                 ADMIN   All payouts
GET   /admin-payout/stats           ADMIN   Statistics
POST  /admin-payout/:id/process     ADMIN   Process payout
POST  /admin-payout/:id/retry       ADMIN   Retry failed payout
```

### Payment Gateway Configuration

```
POST  /merchant-payment-gateway/stripe/connect       MERCHANT/ADMIN   Connect Stripe
GET   /merchant-payment-gateway/stripe/connect-link  MERCHANT/ADMIN   Stripe onboarding link
POST  /merchant-payment-gateway/paypal/connect        MERCHANT/ADMIN   Connect PayPal
GET   /merchant-payment-gateway                       MERCHANT/ADMIN   List gateways
GET   /merchant-payment-gateway/:id                   MERCHANT/ADMIN   Gateway details
PUT   /merchant-payment-gateway/:id                   MERCHANT/ADMIN   Update config
POST  /merchant-payment-gateway/:id/verify            MERCHANT/ADMIN   Verify gateway
POST  /merchant-payment-gateway/:id/deactivate        MERCHANT/ADMIN   Deactivate
DELETE /merchant-payment-gateway/:id                  MERCHANT/ADMIN   Delete
```

### Two-Factor Authentication

```
GET   /two-factor/setup                 Auth     Get setup QR + secret
POST  /two-factor/enable                Auth     Enable 2FA (verify TOTP)
POST  /two-factor/verify                Public   Verify TOTP code
POST  /two-factor/verify-backup         Public   Use backup code
POST  /two-factor/disable               Auth     Disable 2FA
GET   /two-factor/backup-codes          Auth     View backup codes
POST  /two-factor/backup-codes/regenerate Auth   Regenerate backup codes
GET   /two-factor/status                Auth     Check if 2FA enabled
```

### Fraud & Security

```
GET   /blacklist/check       Auth    Check if value is blacklisted
GET   /blacklist             ADMIN   List all entries
POST  /blacklist             ADMIN   Add entry
PUT   /blacklist/:id         ADMIN   Update entry
DELETE /blacklist/:id        ADMIN   Remove entry
```

### Audit Logs (Admin)

```
GET   /audit-logs             ADMIN   List logs
GET   /audit-logs/statistics  ADMIN   Statistics
GET   /audit-logs/export      ADMIN   Export as CSV
GET   /audit-logs/:id         ADMIN   Log details
```

### Feature Flags

```
GET   /feature-flags                           Auth    Get flags for current user
GET   /feature-flags/check/:featureKey         Auth    Check single flag
GET   /feature-flags/admin/all                 ADMIN   All flags
GET   /feature-flags/admin/:id                 ADMIN   Flag details
POST  /feature-flags/admin                     ADMIN   Create flag
PUT   /feature-flags/admin/:id                 ADMIN   Update flag
POST  /feature-flags/admin/:id/toggle          ADMIN   Toggle on/off
DELETE /feature-flags/admin/:id                ADMIN   Delete flag
POST  /feature-flags/admin/batch-update        ADMIN   Batch update
GET   /feature-flags/admin/statistics          ADMIN   Usage stats
```

### Other Endpoints

```
POST  /email-verification/verify    Public   Verify email token
POST  /email-verification/resend    Public   Resend verification email
POST  /otp/generate                 Public   Generate OTP
POST  /otp/verify                   Public   Verify OTP
POST  /otp/resend                   Public   Resend OTP
POST  /password-reset/request       Public   Request password reset
POST  /password-reset/reset         Public   Reset password with token
GET   /communication-settings       ADMIN    Get settings
PUT   /communication-settings       ADMIN    Update settings
GET   /communication-logs/logs      ADMIN/MERCHANT  Message logs
GET   /communication-logs/statistics          ADMIN  Stats
GET   /communication-logs/statistics/channels ADMIN  Per-channel stats
POST  /upload/image                 MERCHANT/ADMIN   Upload single image
POST  /upload/images                MERCHANT/ADMIN   Upload multiple images
DELETE /upload/:filename            MERCHANT/ADMIN   Delete file
GET   /breakage/metrics             Auth   Breakage metrics
GET   /breakage/report              Auth   Full report
GET   /breakage/expired-cards       Auth   Expired card list
POST  /chargeback/webhook           Public   Chargeback notification
GET   /chargeback                   Auth     List chargebacks
GET   /chargeback/statistics        Auth     Stats
POST  /chargeback/:id/evidence      Auth     Submit evidence
PUT   /chargeback/:id/status        ADMIN    Update status
GET   /device                       Auth     Trusted devices
DELETE /device/:deviceId            Auth     Revoke device
DELETE /device                      Auth     Revoke all devices
GET   /health                       Public   Health check
GET   /health/detailed              Public   Full health status
GET   /health/metrics               Public   System metrics
GET   /health/status                Public   Status summary
GET   /health/docs                  Public   API reference
```

---

## 6. Business Logic

### Gift Card Lifecycle

```
Creation → ACTIVE → (fully redeemed) → REDEEMED
                  → (expiry date passed) → EXPIRED
                  → (manual action) → CANCELLED
```

**Creation:**
1. Merchant creates card with value, currency, optional expiry
2. Unique code generated (format: `GIFT-XXXX-XXXX-XXXX`, up to 10 retries)
3. QR code auto-generated
4. Template applied for visual design
5. Initial `balance = value`

**Bulk Creation:**
- Max 1,000 cards per request
- Same parameters, unique codes per card
- Efficient DB batch insertion

**Expiry (Cron - daily):**
- Checks all ACTIVE cards with `expiryDate < now`
- Sets status to EXPIRED
- Reminder emails sent 7 days before expiry
- Contributes to breakage metrics

---

### Payment Flow

**Step 1 — Create Intent:**
```
Client calls POST /payments/create-intent
→ Validate gift card (ACTIVE, not expired)
→ Fraud check (velocity, blacklist, IP)
→ Calculate commission
→ Create Payment record (PENDING)
→ Call gateway (Stripe/PayPal/Razorpay/UPI)
→ Return clientSecret / orderId to frontend
```

**Step 2 — Confirm:**
```
Client confirms on gateway side (3D Secure, etc.)
→ Webhook OR confirm endpoint called
→ Verify gateway signature
→ Update Payment status → COMPLETED
→ Create Transaction (type: PURCHASE)
→ Trigger delivery (email/SMS)
```

**Refund:**
```
POST /payments/:id/refund
→ Validate amount ≤ original payment
→ Call gateway refund API
→ Create Transaction (type: REFUND)
→ Update Payment status → REFUNDED
```

**Webhooks Supported:**
- Stripe: `payment_intent.succeeded`, `charge.refunded`
- PayPal: `payout.paid`, `payout.failed`
- Razorpay: payment confirmation events

---

### Redemption Flow

**Authorization Rule:** Only the merchant who created the gift card, or an ADMIN, can redeem it.

**Validate (public):**
```
POST /redemptions/validate { code }
→ Find card by code
→ Check status = ACTIVE
→ Check not expired
→ Return: valid, balance, allowPartialRedemption
```

**Redeem (authenticated MERCHANT/ADMIN):**
```
POST /redemptions/redeem OR /redemptions/redeem/qr
→ Fetch gift card
→ Verify req.user.id === giftCard.merchantId (or role = ADMIN)
→ Validate status = ACTIVE, not expired
→ Validate amount ≤ balance
→ Check allowPartialRedemption if amount < balance
→ Fraud pattern check (log, don't block)
→ Deduct balance
→ If balance = 0 → status = REDEEMED
→ Create Redemption record (balanceBefore, balanceAfter)
→ Create Transaction record (type: REDEMPTION)
→ Calculate commission on redeemed amount
→ Update merchant.merchantBalance += netAmount
→ Invalidate Redis cache
```

**QR Code Format:**
```json
{ "id": "uuid", "code": "GIFT-XXXX-XXXX-XXXX" }
// Falls back to plain string if not JSON
```

---

### Commission System

```
Priority: Merchant-specific rate > Global rate

if commissionType = PERCENTAGE:
  commission = amount × (rate / 100)
if commissionType = FIXED:
  commission = rate (flat amount)

netAmount = amount − commission
merchant.merchantBalance += netAmount
```

---

### Payout System

**Schedule options:** IMMEDIATE | DAILY | WEEKLY | MONTHLY

**Flow:**
1. Merchant requests payout or scheduler triggers
2. Calculate `availableBalance` (completed payments - commissions - previous payouts)
3. Validate amount ≥ `minimumPayout` threshold
4. Create Payout record (PENDING)
5. Call gateway (Stripe Connect, PayPal, bank transfer)
6. Update: PENDING → PROCESSING → COMPLETED | FAILED
7. On failure: retry up to 3 times, then flag for admin

---

### Fraud Prevention

**Velocity Limits (per day):**
- Max 10 gift cards per user
- Max 20 gift cards per IP
- Max $5,000 total value per user
- Max $10,000 per single gift card

**Blacklist Checks:**
- Email, IP, Phone, Payment method, User ID
- Severity: LOW | MEDIUM | HIGH | CRITICAL
- Expiration support for temporary blocks

**Risk Scoring:**
```
0–30   → LOW    (allow)
31–70  → MEDIUM (allow + log for review)
71–100 → HIGH   (block or require manual review)
```

---

### Delivery System

**Channels:** Email, SMS, PDF download, shareable link, NFC
**Scheduled delivery:** Cron runs every 5 minutes via BullMQ queue

**Email Providers:** Brevo, SendGrid, SMTP (nodemailer)
**SMS Providers:** Twilio, Brevo

**PDF Generation:** PDFKit — includes QR code, balance, expiry, branding

**Share Link:**
```
POST /gift-card-share/:giftCardId/generate-token
→ Generate unique token
→ Link: /gift-cards/share/:token (public view)
→ Token can be revoked
```

---

### Breakage Metrics

Breakage = value of gift cards that expire unredeemed (pure profit for merchant).

Tracked via:
- Expired card counts and values
- Partial redemption remainder at expiry
- Reports available in `/breakage/report`

---

## 7. Authentication & Security

### JWT Token Flow

```
Login → access token (7d) + refresh token (30d)
↓
Access token attached to every request: Authorization: Bearer <token>
↓
On 401: frontend queues requests, calls /auth/refresh
↓
New access token issued, queued requests retried
```

### Role-Based Access Control

```
ADMIN    → Full platform access, user management, all settings
MERCHANT → Create gift cards, view own analytics, request payouts
CUSTOMER → Purchase, check balance, redeem via link
```

### Two-Factor Authentication (TOTP)

1. User calls `/two-factor/setup` → receives QR code + base32 secret
2. Scans QR in Google Authenticator / Authy
3. Calls `/two-factor/enable` with 6-digit code → verified by speakeasy
4. 8 single-use backup codes generated and hashed
5. Subsequent logins require TOTP or backup code

### Password Security

- bcryptjs with 10 salt rounds
- Requirements: min 8 chars, uppercase, lowercase, number, special char
- Reset: token-based, single use, 1-hour expiry
- On reset: all refresh tokens invalidated

### CSRF Protection

- Token in server session, returned in `X-CSRF-Token` response header
- Frontend includes token in all POST/PUT/DELETE requests
- Validated server-side on every state-changing request

### Rate Limiting

- Auth endpoints: 5 requests / 15 min / IP
- General endpoints: 100 requests / 15 min / IP

### Security Headers

| Header | Value |
|---|---|
| Strict-Transport-Security | max-age=63,072,000; includeSubDomains |
| X-Frame-Options | SAMEORIGIN |
| X-Content-Type-Options | nosniff |
| X-XSS-Protection | 1; mode=block |
| Content-Security-Policy | Configured |
| Referrer-Policy | origin-when-cross-origin |

### Data Encryption

- Payment gateway credentials encrypted at rest (AES-256-GCM) before storing in DB
- `encryption.ts` utility handles encrypt/decrypt

### Input Sanitization

- `isomorphic-dompurify` strips dangerous HTML/scripts from user input
- Prevents stored XSS attacks

---

## 8. Frontend Pages & Components

### Route Groups

| Group | Purpose | Auth Required |
|---|---|---|
| `(auth)` | Login, Register | No |
| `(public)` | Browse, check balance, purchase, redeem | No |
| `(dashboard)` | Merchant/admin management UI | Yes |

### Dashboard Pages by Role

**MERCHANT:**
- Dashboard overview, analytics
- Gift card & product management (CRUD)
- Template editor
- Redemption interface (QR scanner + code entry + NFC)
- Delivery management
- Wallet & payout requests
- Sales & redemption reports
- Breakage & chargeback tracking
- Account settings + payment gateway setup
- 2FA & device management

**ADMIN (additional):**
- All merchant data
- Audit log viewer
- Blacklist management
- Communication settings & logs
- Feature flag management
- Payout processing
- System status

### Key Components

| Component | Purpose |
|---|---|
| `QRCodeScanner` | Camera-based QR code scanning (html5-qrcode) |
| `NFCReader` | NFC tag reading via Web NFC API |
| `TemplateEditor` | Visual gift card template builder |
| `GiftCardDisplay` | Rendered gift card preview |
| `GiftCardShare` | Share link generator |
| `FeatureFlagGuard` | Wraps UI elements with feature flag check |
| `ErrorBoundary` | Catches React render errors gracefully |
| `DataTable` | Sortable, paginated, filterable table |
| `ChartContainer` | Recharts wrapper for analytics |
| `PasswordStrength` | Real-time password strength indicator |

---

## 9. State Management & Utilities

### Zustand Stores

**authStore:**
- `user` — current user object
- `isAuthenticated` — boolean
- `setUser`, `setTokens`, `clearAuth`, `checkAuth`, `refreshToken`
- Persisted to localStorage via `zustand/middleware persist`

**featureFlagStore:**
- Stores loaded feature flags from API
- Used by `useFeatureFlag` hook and `FeatureFlagGuard`

**themeStore:**
- Dark/light mode preference
- Persisted to localStorage

### API Client (`lib/api.ts`)

- Axios instance pointing to `NEXT_PUBLIC_API_URL`
- **Request interceptor:** Injects `Authorization: Bearer <token>` + CSRF token
- **Response interceptor:** On 401 → queues pending requests → calls `/auth/refresh` → retries queue
- Handles token refresh race conditions safely

### Logger (`lib/logger.ts`)

- Wraps console with structured logging
- Levels: error, warn, info, debug
- Used throughout all components (no direct `console.error` calls)

---

## 10. Infrastructure & DevOps

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:15
    port: 5432
    database: giftcard_db
    volume: postgres_data

  redis:
    image: redis:7-alpine
    port: 6379
    volume: redis_data
```

### Cron Jobs

| Job | Schedule | Action |
|---|---|---|
| `giftCardExpiry` | Daily | Mark expired gift cards EXPIRED |
| `expiryReminders` | Daily | Email reminders 7 days before expiry |
| `cleanupTokens` | Daily | Purge expired JWT/reset/verification tokens |
| `scheduledDelivery` | Every 5 min | Process queued email/SMS deliveries |

### BullMQ Job Queue

- Uses Redis as backing store
- Handles async delivery jobs
- Retry logic for failed jobs

### Next.js Config

```javascript
output: 'standalone'       // Minimal Docker image
reactStrictMode: true
Security headers configured
Image domains: localhost, S3 bucket, CDN
```

### TypeScript — Both Strict Mode

- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- Path alias: `@/*` → `src/*`

---

## 11. Environment Variables

### Backend

```bash
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/giftcard_db"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET=<min 32 chars>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<min 32 chars>
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
PAYPAL_MODE=sandbox

# Razorpay
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Email
EMAIL_SERVICE=brevo          # brevo | sendgrid | smtp
SENDGRID_API_KEY=...
BREVO_API_KEY=...
EMAIL_FROM=noreply@giftcard.com
EMAIL_FROM_NAME=Gift Card SaaS

# SMS
SMS_SERVICE=twilio           # twilio | brevo
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
BREVO_SMS_SENDER=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend

```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=...
```

---

## 12. Package Dependencies

### Backend

```json
"dependencies": {
  "express": "^4.18.2",
  "@prisma/client": "^5.7.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "speakeasy": "^2.0.0",
  "ioredis": "^5.3.2",
  "connect-redis": "^9.0.0",
  "express-session": "^1.18.2",
  "csrf": "^3.1.0",
  "stripe": "^14.7.0",
  "razorpay": "^2.9.2",
  "@getbrevo/brevo": "^3.0.1",
  "nodemailer": "^6.9.7",
  "twilio": "^4.20.0",
  "bullmq": "^5.1.9",
  "winston": "^3.11.0",
  "zod": "^3.22.4",
  "multer": "^1.4.5-lts.1",
  "qrcode": "^1.5.3",
  "pdfkit": "^0.14.0",
  "node-cron": "^3.0.3",
  "helmet": "^7.1.0",
  "cors": "^2.8.5",
  "compression": "^1.7.4",
  "cookie-parser": "^1.4.7",
  "isomorphic-dompurify": "^2.33.0",
  "axios": "^1.6.2",
  "ua-parser-js": "^2.0.6",
  "dotenv": "^16.3.1"
}
```

### Frontend

```json
"dependencies": {
  "next": "^14.0.4",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.4.7",
  "react-hook-form": "^7.49.2",
  "@hookform/resolvers": "^3.3.2",
  "zod": "^3.22.4",
  "axios": "^1.6.2",
  "recharts": "^2.10.3",
  "react-qr-code": "^2.0.12",
  "html5-qrcode": "^2.3.8",
  "date-fns": "^3.0.6",
  "jwt-decode": "^4.0.0",
  "lucide-react": "^0.303.0",
  "tailwindcss": "^3.4.0",
  "tailwind-merge": "^2.2.0",
  "clsx": "^2.0.0"
}
```

---

## 13. Project Statistics

| Metric | Count |
|---|---|
| Backend Controllers | 27 |
| Backend Services | 40 |
| Backend Route Files | 25 |
| API Endpoints | 100+ |
| Database Models | 23 |
| Database Enums | 15 |
| Frontend Pages | 45 |
| Frontend Components | 36 |
| Zustand Stores | 3 |
| Custom Hooks | 3 |
| Middleware Functions | 9 |
| Zod Validators | 8 |
| Cron Jobs | 4 |
| Payment Gateways | 4 (Stripe, PayPal, Razorpay, UPI) |
| Delivery Channels | 5 (Email, SMS, PDF, Link, NFC) |
| Environment Variables | 40+ |
| Backend Code | ~22,000 lines |
| Frontend Code | ~15,000 lines |

---

*Last updated: 2026-03-18*
