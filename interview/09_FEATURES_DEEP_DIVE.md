# Features Deep Dive - Interview Preparation

## Overview

This document covers detailed implementation of all major features: gift card creation, templates, products, payments, redemptions, delivery, analytics, payouts, and more.

---

## Gift Card Creation

### Single Gift Card Creation

**Flow:**
1. User provides gift card details (value, currency, recipient)
2. System generates unique code
3. System creates QR code
4. System creates gift card record
5. System schedules delivery (if recipient provided)

**Code Example:**
```typescript
async createGiftCard(data: CreateGiftCardData) {
  // Generate unique code
  const code = generateGiftCardCode();
  
  // Generate QR code
  const qrCodeUrl = await qrCodeService.generateQRCode(code);
  
  // Create gift card
  const giftCard = await prisma.giftCard.create({
    data: {
      merchantId: data.merchantId,
      code,
      qrCodeUrl,
      value: new Decimal(data.value),
      balance: new Decimal(data.value),
      currency: data.currency || 'USD',
      expiryDate: data.expiryDate,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      status: GiftCardStatus.ACTIVE,
    },
  });
  
  // Schedule delivery if recipient provided
  if (data.recipientEmail) {
    await deliveryService.scheduleDelivery(giftCard.id, 'email');
  }
  
  return giftCard;
}
```

---

### Bulk Gift Card Creation

**Purpose:** Create multiple gift cards at once

**Flow:**
1. User provides list of recipients
2. System creates gift cards in batch
3. System schedules deliveries
4. System returns summary

**Code Example:**
```typescript
async createBulkGiftCards(data: BulkCreateData) {
  const results = [];
  
  for (const recipient of data.recipients) {
    const giftCard = await this.createGiftCard({
      merchantId: data.merchantId,
      value: recipient.amount,
      recipientEmail: recipient.email,
      recipientName: recipient.name,
    });
    
    results.push(giftCard);
  }
  
  return {
    created: results.length,
    giftCards: results,
  };
}
```

---

## Template System

### Template Creation

**Purpose:** Reusable gift card designs

**Features:**
- Design data (colors, images, layout)
- Public/private templates
- Template preview

**Code Example:**
```typescript
async createTemplate(data: CreateTemplateData) {
  const template = await prisma.giftCardTemplate.create({
    data: {
      merchantId: data.merchantId,
      name: data.name,
      description: data.description,
      designData: {
        backgroundColor: data.backgroundColor,
        textColor: data.textColor,
        logo: data.logo,
        layout: data.layout,
      },
      isPublic: data.isPublic || false,
    },
  });
  
  return template;
}
```

---

### Template Usage

**Applying template to gift card:**
```typescript
const giftCard = await prisma.giftCard.create({
  data: {
    templateId: templateId,
    // ... other fields
  },
  include: {
    template: true, // Include template data
  },
});
```

---

## Product Catalog

### Product Creation

**Purpose:** Pre-configured gift card products

**Features:**
- Fixed amounts or ranges
- Sale prices (can differ from gift card value)
- Categories and tags
- Public/private products

**Code Example:**
```typescript
async createProduct(data: CreateProductData) {
  const product = await prisma.giftCardProduct.create({
    data: {
      merchantId: data.merchantId,
      name: data.name,
      description: data.description,
      minAmount: data.minAmount,
      maxAmount: data.maxAmount,
      minSalePrice: data.minSalePrice,
      maxSalePrice: data.maxSalePrice,
      allowCustomAmount: data.allowCustomAmount,
      fixedAmounts: data.fixedAmounts, // JSON array
      fixedSalePrices: data.fixedSalePrices, // JSON array
      currency: data.currency || 'USD',
      expiryDays: data.expiryDays,
      category: data.category,
      tags: data.tags, // JSON array
      isActive: true,
      isPublic: data.isPublic || false,
    },
  });
  
  return product;
}
```

---

### Product Purchase Flow

**Flow:**
1. Customer selects product
2. Customer chooses amount (if custom allowed)
3. Customer provides recipient details
4. System creates gift card from product
5. Customer pays
6. Gift card delivered

**Code Example:**
```typescript
async purchaseFromProduct(productId: string, data: PurchaseData) {
  const product = await prisma.giftCardProduct.findUnique({
    where: { id: productId },
  });
  
  // Validate amount
  if (data.customAmount) {
    if (data.customAmount < product.minAmount || data.customAmount > product.maxAmount) {
      throw new ValidationError('Amount out of range');
    }
  }
  
  // Create gift card
  const giftCard = await this.createGiftCard({
    merchantId: product.merchantId,
    value: data.customAmount || product.fixedAmounts[0],
    expiryDate: product.expiryDays ? addDays(new Date(), product.expiryDays) : null,
    templateId: product.templateId,
    recipientEmail: data.recipientEmail,
  });
  
  // Create payment
  const payment = await paymentService.createPayment({
    giftCardId: giftCard.id,
    amount: data.salePrice,
    paymentMethod: data.paymentMethod,
  });
  
  return { giftCard, payment };
}
```

---

## Payment Processing

### Payment Flow

**Steps:**
1. Create payment intent
2. Calculate commission
3. Check merchant gateway preference
4. Create payment with gateway
5. Return payment intent/client secret
6. Client completes payment
7. Webhook updates payment status
8. Gift card activated

**See Payment Integration document for details.**

---

## Redemption System

### Redemption Methods

**4 Methods:**
1. **QR Code:** Scan QR code
2. **Code Entry:** Enter gift card code
3. **Link:** Click redemption link
4. **API:** Programmatic redemption

---

### QR Code Redemption

**Flow:**
1. Merchant scans QR code
2. System validates code
3. System checks balance
4. System processes redemption
5. System updates balance
6. System creates transaction record

**Code Example:**
```typescript
async redeemByQRCode(code: string, merchantId: string, amount: number) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { code },
  });
  
  if (!giftCard || giftCard.status !== 'ACTIVE') {
    throw new ValidationError('Invalid gift card');
  }
  
  if (giftCard.balance < amount) {
    throw new ValidationError('Insufficient balance');
  }
  
  const balanceBefore = giftCard.balance;
  const balanceAfter = balanceBefore - new Decimal(amount);
  
  // Update gift card
  await prisma.giftCard.update({
    where: { id: giftCard.id },
    data: {
      balance: balanceAfter,
      status: balanceAfter.equals(0) ? GiftCardStatus.REDEEMED : GiftCardStatus.ACTIVE,
    },
  });
  
  // Create redemption record
  await prisma.redemption.create({
    data: {
      giftCardId: giftCard.id,
      merchantId,
      amount: new Decimal(amount),
      balanceBefore,
      balanceAfter,
      redemptionMethod: RedemptionMethod.QR_CODE,
    },
  });
  
  // Create transaction record
  await prisma.transaction.create({
    data: {
      giftCardId: giftCard.id,
      type: TransactionType.REDEMPTION,
      amount: new Decimal(amount),
      balanceBefore,
      balanceAfter,
    },
  });
  
  return { success: true, balanceAfter };
}
```

---

### Partial Redemption

**Support:** Gift cards can be partially redeemed

**Implementation:**
- `allowPartialRedemption` flag on gift card
- Multiple redemptions allowed
- Balance tracked per redemption
- Status changes to REDEEMED when balance reaches 0

---

## Delivery System

### Delivery Channels

**3 Channels:**
1. **Email:** Send via email
2. **SMS:** Send via SMS
3. **Link:** Generate shareable link

---

### Email Delivery

**Implementation:**
- Template-based emails
- HTML email with gift card details
- QR code image included
- Customizable design

**Code Example:**
```typescript
async sendGiftCardEmail(giftCardId: string, recipientEmail: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
    include: { template: true },
  });
  
  const emailHtml = await this.renderEmailTemplate(giftCard);
  
  await emailService.send({
    to: recipientEmail,
    subject: `Your Gift Card from ${giftCard.merchant.businessName}`,
    html: emailHtml,
  });
  
  // Log delivery
  await prisma.communicationLog.create({
    data: {
      channel: 'EMAIL',
      recipient: recipientEmail,
      status: 'SENT',
      userId: giftCard.merchantId,
    },
  });
}
```

---

### SMS Delivery

**Implementation:**
- SMS with gift card code
- Link to redeem
- Template-based messages

**Code Example:**
```typescript
async sendGiftCardSMS(giftCardId: string, recipientPhone: string) {
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });
  
  const message = `Your gift card code: ${giftCard.code}. Redeem at: ${redeemUrl}`;
  
  await smsService.send({
    to: recipientPhone,
    message,
  });
  
  // Log delivery
  await prisma.communicationLog.create({
    data: {
      channel: 'SMS',
      recipient: recipientPhone,
      status: 'SENT',
    },
  });
}
```

---

### Scheduled Delivery

**Purpose:** Deliver gift card on future date

**Implementation:**
- Queue job with delay
- Scheduled delivery queue
- Delivery on specified date/time

**Code Example:**
```typescript
async scheduleDelivery(giftCardId: string, deliveryDate: Date, method: 'email' | 'sms') {
  const delay = deliveryDate.getTime() - Date.now();
  
  await scheduledDeliveryQueue.add(
    'deliver-gift-card',
    { giftCardId, method },
    { delay }
  );
}
```

---

## Analytics & Reporting

### Sales Analytics

**Metrics:**
- Total sales
- Sales by period (day, week, month)
- Sales by payment method
- Average transaction value
- Top products

**Code Example:**
```typescript
async getSalesAnalytics(merchantId: string, period: 'day' | 'week' | 'month') {
  const startDate = getStartDate(period);
  
  const sales = await prisma.payment.groupBy({
    by: ['paymentMethod', 'createdAt'],
    where: {
      giftCard: { merchantId },
      status: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    _sum: {
      amount: true,
    },
    _count: {
      id: true,
    },
  });
  
  return {
    totalSales: sales.reduce((sum, s) => sum + Number(s._sum.amount), 0),
    totalTransactions: sales.reduce((sum, s) => sum + s._count.id, 0),
    byPaymentMethod: groupBy(sales, 'paymentMethod'),
  };
}
```

---

### Redemption Analytics

**Metrics:**
- Total redemptions
- Redemption rate
- Average redemption amount
- Redemptions by method
- Breakage (unredeemed value)

**Code Example:**
```typescript
async getRedemptionAnalytics(merchantId: string) {
  const redemptions = await prisma.redemption.findMany({
    where: {
      merchant: { id: merchantId },
    },
    include: {
      giftCard: true,
    },
  });
  
  const totalRedemptions = redemptions.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalGiftCardValue = await prisma.giftCard.aggregate({
    where: { merchantId },
    _sum: { value: true },
  });
  
  const breakage = Number(totalGiftCardValue._sum.value) - totalRedemptions;
  
  return {
    totalRedemptions,
    redemptionRate: (totalRedemptions / Number(totalGiftCardValue._sum.value)) * 100,
    breakage,
    byMethod: groupBy(redemptions, 'redemptionMethod'),
  };
}
```

---

## Payout System

### Payout Flow

**Steps:**
1. Merchant requests payout
2. System validates minimum amount
3. System checks payout schedule
4. System creates payout record
5. System processes payout (Stripe Connect, PayPal, bank transfer)
6. System updates merchant balance
7. System sends notification

**Code Example:**
```typescript
async requestPayout(merchantId: string, amount: number) {
  const merchant = await prisma.user.findUnique({
    where: { id: merchantId },
    include: { payoutSettings: true },
  });
  
  // Validate minimum amount
  if (amount < Number(merchant.payoutSettings.minimumPayoutAmount)) {
    throw new ValidationError('Amount below minimum');
  }
  
  // Validate balance
  if (amount > Number(merchant.merchantBalance)) {
    throw new ValidationError('Insufficient balance');
  }
  
  // Create payout
  const payout = await prisma.payout.create({
    data: {
      merchantId,
      amount: new Decimal(amount),
      status: PayoutStatus.PENDING,
      payoutMethod: merchant.payoutSettings.payoutMethod,
    },
  });
  
  // Process payout based on schedule
  if (merchant.payoutSettings.payoutSchedule === PayoutSchedule.IMMEDIATE) {
    await this.processPayout(payout.id);
  } else {
    // Schedule payout
    await this.schedulePayout(payout.id, merchant.payoutSettings.payoutSchedule);
  }
  
  return payout;
}
```

---

## Breakage Tracking

### Purpose

**Breakage:** Value of unredeemed gift cards

**Tracking:**
- Expired gift cards
- Unredeemed gift cards
- Breakage percentage
- Breakage by period

**Code Example:**
```typescript
async getBreakage(merchantId: string) {
  const expiredCards = await prisma.giftCard.findMany({
    where: {
      merchantId,
      status: 'EXPIRED',
    },
  });
  
  const breakage = expiredCards.reduce(
    (sum, card) => sum + Number(card.balance),
    0
  );
  
  return {
    breakage,
    expiredCards: expiredCards.length,
    breakagePercentage: (breakage / totalValue) * 100,
  };
}
```

---

## Chargeback Handling

### Purpose

**Chargebacks:** Payment disputes from customers

**Features:**
- Track chargebacks
- Link to payments
- Status tracking
- Resolution workflow

**Code Example:**
```typescript
async createChargeback(paymentId: string, reason: string) {
  const chargeback = await prisma.chargeback.create({
    data: {
      paymentId,
      reason,
      status: ChargebackStatus.PENDING,
    },
  });
  
  // Freeze related gift card if needed
  await prisma.giftCard.update({
    where: { id: payment.giftCardId },
    data: { status: GiftCardStatus.CANCELLED },
  });
  
  return chargeback;
}
```

---

## Interview Questions & Answers

### Q: Explain gift card creation flow.

**A:** Gift card creation:
1. Generate unique code
2. Generate QR code
3. Create database record
4. Schedule delivery (if recipient provided)
5. Return gift card details

Supports single and bulk creation.

### Q: How does redemption work?

**A:** Redemption:
1. Validate gift card code
2. Check balance
3. Process redemption amount
4. Update balance
5. Create redemption and transaction records
6. Update status if balance reaches 0

Supports 4 methods: QR code, code entry, link, API.

### Q: Explain delivery system.

**A:** Delivery system:
- **3 Channels:** Email, SMS, Link
- **Templates:** Template-based delivery
- **Scheduled:** Can schedule future delivery
- **Queue-based:** Uses BullMQ for async delivery
- **Logging:** Tracks all deliveries

### Q: How do you track breakage?

**A:** Breakage tracking:
- Track expired gift cards
- Calculate unredeemed value
- Breakage percentage
- Period-based breakage reports

---

## Key Takeaways

1. **Gift Card Creation:** Single and bulk creation
2. **Templates:** Reusable designs
3. **Products:** Pre-configured products
4. **Redemption:** 4 methods, partial redemption support
5. **Delivery:** 3 channels, scheduled delivery
6. **Analytics:** Sales and redemption analytics
7. **Payouts:** Automated payout processing
8. **Breakage:** Track unredeemed value

---

*See other documents for payment integration, background jobs, and security details.*
