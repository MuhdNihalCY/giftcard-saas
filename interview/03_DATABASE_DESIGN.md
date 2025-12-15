# Database Design - Interview Preparation

## Overview

This document covers the complete database schema design, including all 23 models, 15 enums, relationships, indexing strategy, and design decisions.

---

## Database Choice: PostgreSQL

**Why PostgreSQL?**
- **ACID Compliance:** Critical for financial transactions
- **Relational Data:** Complex relationships between entities
- **Decimal Precision:** Accurate financial calculations (`Decimal(10, 2)`)
- **JSON Support:** Flexible metadata storage
- **Advanced Features:** Full-text search, arrays, custom types
- **Performance:** Excellent query optimizer
- **Reliability:** Battle-tested for production

**Alternatives:**
- **MySQL:** Less advanced features, weaker JSON support
- **MongoDB:** No ACID guarantees, no joins
- **SQLite:** Single-user, no concurrent writes

---

## Schema Overview

### Models (23 Total)

1. User
2. GiftCardTemplate
3. GiftCard
4. GiftCardProduct
5. Payment
6. Redemption
7. Transaction
8. ApiKey
9. Webhook
10. EmailVerificationToken
11. PasswordResetToken
12. Payout
13. CommunicationSettings
14. AuditLog
15. RefreshToken
16. CommunicationLog
17. CommunicationTemplate
18. OTP
19. MerchantPaymentGateway
20. CommissionSettings
21. PayoutSettings
22. FeatureFlag
23. FraudBlacklist

### Enums (15 Total)

1. UserRole (ADMIN, MERCHANT, CUSTOMER)
2. GiftCardStatus (ACTIVE, REDEEMED, EXPIRED, CANCELLED)
3. PaymentMethod (STRIPE, PAYPAL, RAZORPAY, UPI)
4. GatewayType (STRIPE, PAYPAL, RAZORPAY, UPI)
5. VerificationStatus (PENDING, VERIFIED, FAILED)
6. CommissionType (PERCENTAGE, FIXED)
7. PayoutSchedule (IMMEDIATE, DAILY, WEEKLY, MONTHLY)
8. FeatureFlagCategory (PAGE, FEATURE)
9. FeatureFlagTargetRole (MERCHANT, CUSTOMER, ALL)
10. PaymentStatus (PENDING, COMPLETED, FAILED, REFUNDED)
11. RedemptionMethod (QR_CODE, CODE_ENTRY, LINK, API)
12. TransactionType (PURCHASE, REDEMPTION, REFUND, EXPIRY)
13. PayoutStatus (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
14. BlacklistType (EMAIL, IP, PHONE, PAYMENT_METHOD, USER_ID)
15. BlacklistSeverity (LOW, MEDIUM, HIGH, CRITICAL)

---

## Core Models Detailed

### 1. User Model

**Purpose:** Central user/merchant/customer entity

**Key Fields:**
- `id`: UUID primary key
- `email`: Unique email address
- `passwordHash`: Bcrypt hashed password
- `role`: UserRole enum (ADMIN, MERCHANT, CUSTOMER)
- `merchantBalance`: Decimal(10, 2) - Merchant's balance
- `twoFactorEnabled`: Boolean - 2FA status
- `twoFactorSecret`: Encrypted TOTP secret
- `failedLoginAttempts`: Account lockout tracking
- `lockedUntil`: Account lockout timestamp

**Relations:**
- One-to-many: GiftCards, Payments, Redemptions, Transactions
- One-to-many: ApiKeys, Webhooks
- One-to-one: PayoutSettings

**Indexes:**
- `email` (unique)
- Implicit indexes on foreign keys

**Design Decisions:**
- **Password Hash:** Stored as hash, never plain text
- **Merchant Balance:** Decimal for precision
- **2FA Backup Codes:** JSON array of hashed codes
- **Account Lockout:** Prevents brute force attacks

---

### 2. GiftCard Model

**Purpose:** Core gift card entity

**Key Fields:**
- `id`: UUID primary key
- `merchantId`: Foreign key to User
- `code`: Unique gift card code
- `qrCodeUrl`: QR code image URL
- `value`: Decimal(10, 2) - Original value
- `balance`: Decimal(10, 2) - Remaining balance
- `status`: GiftCardStatus enum
- `expiryDate`: Optional expiry timestamp
- `templateId`: Optional template reference
- `productId`: Optional product reference
- `shareToken`: Unique token for sharing
- `allowPartialRedemption`: Boolean

**Relations:**
- Many-to-one: Merchant (User)
- Many-to-one: Template (GiftCardTemplate)
- Many-to-one: Product (GiftCardProduct)
- One-to-many: Payments, Redemptions, Transactions

**Indexes:**
- `merchantId` - Filter by merchant
- `code` (unique) - Fast code lookup
- `status` - Filter by status
- `productId` - Filter by product

**Design Decisions:**
- **Decimal Precision:** Decimal(10, 2) for financial accuracy
- **Status Tracking:** Enum for type safety
- **Share Token:** Enables secure sharing without exposing code
- **Partial Redemption:** Flexible redemption options

---

### 3. Payment Model

**Purpose:** Payment transaction records

**Key Fields:**
- `id`: UUID primary key
- `giftCardId`: Foreign key to GiftCard
- `customerId`: Optional customer reference
- `amount`: Decimal(10, 2) - Payment amount
- `paymentMethod`: PaymentMethod enum
- `paymentIntentId`: Gateway payment intent ID
- `status`: PaymentStatus enum
- `commissionAmount`: Decimal(10, 2) - Platform commission
- `netAmount`: Decimal(10, 2) - Amount after commission
- `ipAddress`: Fraud tracking
- `deviceFingerprint`: Fraud prevention

**Relations:**
- Many-to-one: GiftCard
- Many-to-one: Customer (User, optional)

**Indexes:**
- `giftCardId` - Payments per gift card
- `customerId` - Customer payment history
- `paymentIntentId` - Gateway lookup

**Design Decisions:**
- **Commission Tracking:** Separate fields for commission and net
- **Fraud Prevention:** IP address and device fingerprint
- **Gateway Integration:** paymentIntentId for webhook matching

---

### 4. Redemption Model

**Purpose:** Gift card redemption records

**Key Fields:**
- `id`: UUID primary key
- `giftCardId`: Foreign key to GiftCard
- `merchantId`: Merchant who processed redemption
- `amount`: Decimal(10, 2) - Redemption amount
- `balanceBefore`: Decimal(10, 2) - Balance before
- `balanceAfter`: Decimal(10, 2) - Balance after
- `redemptionMethod`: RedemptionMethod enum
- `location`: Optional location string

**Relations:**
- Many-to-one: GiftCard
- Many-to-one: Merchant (User)

**Indexes:**
- `giftCardId` - Redemptions per gift card
- `merchantId` - Merchant redemption history

**Design Decisions:**
- **Balance Tracking:** Before/after for audit trail
- **Redemption Method:** Track how redemption occurred
- **Location:** Optional for physical redemptions

---

### 5. Transaction Model

**Purpose:** Complete transaction history

**Key Fields:**
- `id`: UUID primary key
- `giftCardId`: Foreign key to GiftCard
- `type`: TransactionType enum
- `amount`: Decimal(10, 2)
- `balanceBefore`: Decimal(10, 2)
- `balanceAfter`: Decimal(10, 2)
- `userId`: Optional user reference
- `metadata`: JSON for additional data

**Relations:**
- Many-to-one: GiftCard
- Many-to-one: User (optional)

**Indexes:**
- `giftCardId` - Transaction history per card
- `userId` - User transaction history
- `type` - Filter by transaction type

**Design Decisions:**
- **Transaction Types:** PURCHASE, REDEMPTION, REFUND, EXPIRY
- **Balance Tracking:** Complete audit trail
- **Metadata:** JSON for flexible additional data

---

## Supporting Models

### 6. GiftCardTemplate

**Purpose:** Reusable gift card templates

**Key Fields:**
- `designData`: JSON - Template design configuration
- `isPublic`: Boolean - Public visibility

**Design:** JSON field for flexible design data (colors, images, layout)

---

### 7. GiftCardProduct

**Purpose:** Product catalog for gift cards

**Key Fields:**
- `minAmount`/`maxAmount`: Gift card value range
- `minSalePrice`/`maxSalePrice`: Sale price range
- `fixedAmounts`: JSON array - Fixed gift card values
- `fixedSalePrices`: JSON array - Corresponding sale prices
- `allowCustomAmount`: Boolean
- `expiryDays`: Days until expiry

**Design:** Flexible pricing with fixed amounts or ranges

---

### 8. Payout Model

**Purpose:** Merchant payout records

**Key Fields:**
- `amount`: Decimal(10, 2)
- `status`: PayoutStatus enum
- `payoutMethod`: String (STRIPE_CONNECT, PAYPAL, BANK_TRANSFER)
- `scheduledFor`: Optional scheduled timestamp
- `retryCount`: Retry tracking
- `webhookData`: JSON - Gateway webhook data

**Indexes:**
- `merchantId` - Merchant payouts
- `status` - Filter by status
- `scheduledFor` - Scheduled payout queries

---

### 9. RefreshToken Model

**Purpose:** Refresh token storage for JWT authentication

**Key Fields:**
- `token`: Unique token string
- `deviceName`: Device identifier
- `deviceType`: MOBILE, DESKTOP, TABLET
- `lastUsedAt`: Last usage timestamp
- `expiresAt`: Expiration timestamp
- `revokedAt`: Optional revocation timestamp

**Indexes:**
- `userId` - User's tokens
- `token` (unique) - Token lookup
- `expiresAt` - Cleanup queries

**Design:** Enables token rotation and device management

---

### 10. AuditLog Model

**Purpose:** Complete audit trail

**Key Fields:**
- `action`: String (LOGIN, PAYMENT_CREATED, etc.)
- `resourceType`: String (User, Payment, GiftCard)
- `resourceId`: Optional resource ID
- `ipAddress`: Request IP
- `userAgent`: Request user agent
- `metadata`: JSON for additional data

**Indexes:**
- `userId` - User actions
- `action` - Filter by action type
- `resourceType` - Filter by resource
- `createdAt` - Time-based queries

---

## Security Models

### 11. ApiKey Model

**Purpose:** API key management

**Key Fields:**
- `keyHash`: Hashed API key (never store plain)
- `permissions`: JSON array of permissions
- `lastUsedAt`: Last usage tracking
- `expiresAt`: Optional expiration

**Security:** Keys stored as hash, never plain text

---

### 12. Webhook Model

**Purpose:** Webhook endpoint configuration

**Key Fields:**
- `url`: Webhook URL
- `events`: JSON array of event types
- `secret`: Webhook secret for verification
- `lastTriggeredAt`: Last trigger timestamp

---

### 13. FraudBlacklist Model

**Purpose:** Fraud prevention blacklist

**Key Fields:**
- `type`: BlacklistType enum
- `value`: Blacklisted value
- `severity`: BlacklistSeverity enum
- `autoBlock`: Boolean
- `expiresAt`: Optional expiration

**Indexes:**
- `type` + `value` (unique) - Fast lookup
- `severity` - Filter by severity
- `expiresAt` - Cleanup queries

---

## Communication Models

### 14. CommunicationLog

**Purpose:** Communication delivery tracking

**Key Fields:**
- `channel`: EMAIL, SMS, OTP, PUSH
- `recipient`: Email or phone
- `status`: SENT, FAILED, PENDING, BLOCKED
- `errorMessage`: Error details

**Indexes:**
- `channel` - Filter by channel
- `recipient` - Recipient history
- `status` - Filter by status
- `createdAt` - Time-based queries

---

### 15. CommunicationTemplate

**Purpose:** Reusable communication templates

**Key Fields:**
- `type`: EMAIL, SMS, OTP
- `body`: Template body with variables
- `variables`: JSON - Available variables
- `version`: Version tracking

**Design:** Versioned templates for A/B testing

---

### 16. OTP Model

**Purpose:** One-time password storage

**Key Fields:**
- `identifier`: Email or phone
- `code`: OTP code
- `type`: LOGIN, VERIFICATION, PASSWORD_RESET, TRANSACTION
- `expiresAt`: Expiration timestamp
- `used`: Boolean - Usage tracking
- `attempts`: Failed attempt counter

**Indexes:**
- `identifier` - User OTPs
- `code` - Code lookup
- `expiresAt` - Cleanup queries

---

## Configuration Models

### 17. MerchantPaymentGateway

**Purpose:** Merchant payment gateway configuration

**Key Fields:**
- `gatewayType`: GatewayType enum
- `credentials`: Encrypted JSON (encrypted at application level)
- `connectAccountId`: Gateway Connect account ID
- `verificationStatus`: VerificationStatus enum

**Security:** Credentials encrypted before storage

---

### 18. CommissionSettings

**Purpose:** Commission configuration

**Key Fields:**
- `merchantId`: Optional (null for global)
- `commissionRate`: Decimal(5, 2) - Percentage or fixed
- `commissionType`: CommissionType enum
- `appliesTo`: JSON array of payment methods

**Design:** Supports global and merchant-specific rates

---

### 19. PayoutSettings

**Purpose:** Merchant payout configuration

**Key Fields:**
- `payoutMethod`: STRIPE_CONNECT, PAYPAL, BANK_TRANSFER
- `payoutSchedule`: PayoutSchedule enum
- `minimumPayoutAmount`: Decimal(10, 2)
- `payoutAccountId`: Gateway account ID

**Design:** One-to-one with User (merchant)

---

### 20. FeatureFlag

**Purpose:** Feature flag management

**Key Fields:**
- `featureKey`: Unique feature identifier
- `category`: PAGE or FEATURE
- `targetRole`: MERCHANT, CUSTOMER, ALL
- `isEnabled`: Boolean flag
- `metadata`: JSON for additional config

**Indexes:**
- `featureKey` (unique) - Fast lookup
- `targetRole` - Role-based filtering
- `isEnabled` - Enabled features

---

## Indexing Strategy

### Primary Indexes

Every model has:
- Primary key index on `id` (UUID)
- Unique constraints create indexes automatically

### Foreign Key Indexes

All foreign keys are indexed:
- `merchantId` in GiftCard, Payment, etc.
- `giftCardId` in Payment, Redemption, Transaction
- `userId` in various models

### Query Optimization Indexes

**GiftCard:**
- `code` (unique) - Fast code lookup
- `status` - Filter active/expired cards
- `productId` - Product-based queries

**Payment:**
- `paymentIntentId` - Webhook matching
- `customerId` - Customer history

**Transaction:**
- `type` - Filter by transaction type
- `createdAt` - Time-based queries

**AuditLog:**
- `action` - Action-based queries
- `resourceType` - Resource-based queries
- `createdAt` - Time-based queries

**OTP:**
- `identifier` - User OTP lookup
- `code` - Code verification
- `expiresAt` - Cleanup queries

---

## Relationship Design

### One-to-Many Relationships

**User → GiftCards**
- One merchant has many gift cards
- Cascade delete: Deleting user deletes gift cards

**User → Payments**
- One customer can have many payments
- Set null on delete: Payments preserved

**GiftCard → Payments**
- One gift card can have multiple payments (top-ups)
- Cascade delete: Deleting card deletes payments

**GiftCard → Redemptions**
- One gift card can have multiple redemptions
- Cascade delete: Deleting card deletes redemptions

**GiftCard → Transactions**
- One gift card has many transactions
- Cascade delete: Deleting card deletes transactions

### Many-to-One Relationships

**GiftCard → Template**
- Many gift cards can use one template
- Set null on delete: Cards preserved if template deleted

**GiftCard → Product**
- Many gift cards from one product
- Set null on delete: Cards preserved if product deleted

### One-to-One Relationships

**User → PayoutSettings**
- One merchant has one payout setting
- Cascade delete: Deleting user deletes settings

---

## Data Integrity Constraints

### Unique Constraints

- `User.email` - Unique email addresses
- `GiftCard.code` - Unique gift card codes
- `GiftCard.shareToken` - Unique share tokens
- `ApiKey.keyHash` - Unique API keys
- `RefreshToken.token` - Unique refresh tokens
- `FeatureFlag.featureKey` - Unique feature keys
- `FraudBlacklist.type + value` - Unique blacklist entries

### Foreign Key Constraints

- All foreign keys have referential integrity
- Cascade delete where appropriate
- Set null for optional relationships

### Check Constraints

- Decimal precision enforced by database
- Enum values enforced by Prisma
- Not null constraints where required

---

## JSON Fields Usage

### Flexible Schema Fields

**GiftCardTemplate.designData**
- Template design configuration
- Colors, images, layout settings
- No migration needed for design changes

**GiftCardProduct.fixedAmounts / fixedSalePrices**
- Arrays of fixed amounts/prices
- Flexible product configuration

**Payment.metadata**
- Additional payment data
- Gateway-specific information
- Flexible without schema changes

**Transaction.metadata**
- Additional transaction context
- Flexible audit trail data

**User.twoFactorBackupCodes**
- Array of hashed backup codes
- Flexible code management

**Webhook.events**
- Array of event types
- Flexible webhook configuration

**CommissionSettings.appliesTo**
- Array of payment methods
- Flexible commission rules

**FeatureFlag.metadata**
- Additional feature configuration
- Flexible feature flags

---

## Decimal Precision

### Financial Fields

All monetary fields use `Decimal(10, 2)`:
- `User.merchantBalance`
- `GiftCard.value` / `balance`
- `Payment.amount` / `commissionAmount` / `netAmount`
- `Redemption.amount` / `balanceBefore` / `balanceAfter`
- `Transaction.amount` / `balanceBefore` / `balanceAfter`
- `Payout.amount` / `commissionAmount` / `netAmount`
- `CommissionSettings.commissionRate`
- `PayoutSettings.minimumPayoutAmount`
- `GiftCardProduct` amount/price fields

**Why Decimal?**
- **Precision:** No floating-point errors
- **Accuracy:** Critical for financial calculations
- **Compliance:** Required for financial systems

---

## Migration Strategy

### Prisma Migrations

- **Version Control:** Migrations in `prisma/migrations/`
- **Rollback:** Can rollback migrations
- **Environment:** Different migrations per environment
- **Testing:** Test migrations before production

### Migration Best Practices

1. **Backup:** Always backup before migration
2. **Test:** Test migrations in staging
3. **Review:** Review migration SQL
4. **Rollback Plan:** Have rollback plan ready
5. **Zero Downtime:** Use zero-downtime migrations when possible

---

## Query Optimization

### Common Optimizations

1. **Indexes:** Proper indexes on frequently queried fields
2. **Select Fields:** Only select needed fields
3. **Includes:** Use Prisma `include` for relations
4. **Pagination:** Always paginate large result sets
5. **Connection Pooling:** Prisma handles connection pooling

### Example Optimized Query

```typescript
// Optimized: Only select needed fields, use indexes
const giftCards = await prisma.giftCard.findMany({
  where: {
    merchantId: userId,
    status: 'ACTIVE',
  },
  select: {
    id: true,
    code: true,
    value: true,
    balance: true,
  },
  take: 20,
  skip: 0,
});
```

---

## Interview Questions & Answers

### Q: Why PostgreSQL over MongoDB?

**A:** PostgreSQL chosen because:
1. **ACID Compliance:** Critical for financial transactions
2. **Relational Data:** Complex relationships (users, gift cards, payments)
3. **Data Integrity:** Foreign keys ensure consistency
4. **Decimal Precision:** Accurate financial calculations
5. **JSON Support:** Still get flexibility with JSON fields

MongoDB's eventual consistency and lack of ACID guarantees make it unsuitable for payment processing.

### Q: Explain your indexing strategy.

**A:** Indexing strategy:
1. **Primary Keys:** All models have UUID primary keys
2. **Foreign Keys:** All foreign keys indexed for joins
3. **Unique Fields:** Unique constraints create indexes
4. **Query Patterns:** Indexes on frequently queried fields:
   - `GiftCard.code` - Fast code lookup
   - `GiftCard.status` - Filter active cards
   - `Payment.paymentIntentId` - Webhook matching
   - `Transaction.type` - Filter by type
   - `AuditLog.createdAt` - Time-based queries

### Q: Why use JSON fields?

**A:** JSON fields for flexibility:
1. **Template Design:** `designData` - Flexible design config
2. **Metadata:** Additional data without schema changes
3. **Arrays:** `fixedAmounts`, `events`, `permissions`
4. **Future-Proof:** Can add fields without migration

Trade-off: Less queryable than normalized fields, but provides flexibility.

### Q: How do you ensure data integrity?

**A:** Data integrity via:
1. **Foreign Keys:** Referential integrity enforced
2. **Unique Constraints:** Prevent duplicates
3. **Enums:** Type safety for status fields
4. **Decimal Precision:** Accurate financial calculations
5. **Cascade Rules:** Appropriate cascade/set null on delete
6. **Validation:** Application-level validation with Zod

### Q: Explain your relationship design.

**A:** Relationship design:
1. **One-to-Many:** User → GiftCards, GiftCard → Payments
2. **Many-to-One:** GiftCard → Template, GiftCard → Product
3. **One-to-One:** User → PayoutSettings
4. **Cascade Rules:**
   - Cascade delete for dependent data (gift cards, payments)
   - Set null for optional relationships (template, product)

---

## Key Takeaways

1. **23 Models** covering all platform features
2. **15 Enums** for type safety
3. **Decimal Precision** for financial accuracy
4. **JSON Fields** for flexibility
5. **Proper Indexing** for query performance
6. **Referential Integrity** via foreign keys
7. **Audit Trail** via Transaction and AuditLog models
8. **Security** via encrypted credentials, hashed tokens

---

*See other documents for implementation details and code examples.*
