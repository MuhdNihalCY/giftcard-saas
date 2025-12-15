# Payment Integration - Interview Preparation

## Overview

This document covers payment gateway integration, payment flows, webhook handling, and commission calculation in the Gift Card SaaS Platform.

---

## Payment Gateway Architecture

### Supported Gateways

1. **Stripe** (Standard + Connect)
2. **PayPal** (Standard + Connect)
3. **Razorpay**
4. **UPI**

**Why Multiple Gateways?**
- **Geographic Coverage:** Different regions prefer different gateways
- **Merchant Choice:** Merchants can use their preferred gateway
- **Redundancy:** Fallback if one gateway fails
- **Competitive Rates:** Merchants can choose best rates

---

## Payment Flow Architecture

### Standard Payment Flow

```
Client → API → Payment Service → Gateway → Webhook → Update Payment
```

**Steps:**
1. Client creates payment intent
2. Payment Service creates payment record (PENDING)
3. Gateway returns payment intent/client secret
4. Client completes payment on gateway
5. Gateway sends webhook
6. Webhook handler updates payment status
7. Gift card activated/delivered

---

## Stripe Integration

### Standard Stripe

**Implementation:**
- Payment Intents API
- Client-side confirmation
- Webhook verification

**Code Example:**
```typescript
// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert to cents
  currency: currency.toLowerCase(),
  metadata: {
    giftCardId,
    merchantId,
  },
});

// Store payment record
await prisma.payment.create({
  data: {
    giftCardId,
    amount,
    paymentMethod: PaymentMethod.STRIPE,
    paymentIntentId: paymentIntent.id,
    status: PaymentStatus.PENDING,
  },
});
```

**Webhook Handling:**
```typescript
// Verify webhook signature
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);

// Handle event
switch (event.type) {
  case 'payment_intent.succeeded':
    await updatePaymentStatus(event.data.object.id, PaymentStatus.COMPLETED);
    break;
  case 'payment_intent.payment_failed':
    await updatePaymentStatus(event.data.object.id, PaymentStatus.FAILED);
    break;
}
```

---

### Stripe Connect

**Purpose:** Merchants use their own Stripe accounts

**Benefits:**
- **Direct Payouts:** Merchants receive funds directly
- **Application Fee:** Platform collects commission as fee
- **Compliance:** Merchants handle their own compliance

**Implementation:**
1. **Account Creation:** Create Connect account for merchant
2. **Onboarding:** Redirect merchant to Stripe onboarding
3. **Account Link:** Generate account link for onboarding
4. **Verification:** Verify account (charges_enabled, payouts_enabled)
5. **Payment:** Use Connect account for payments

**Code Example:**
```typescript
// Create Connect account
const account = await stripe.accounts.create({
  type: 'express', // or 'standard'
  country: 'US',
  email: merchantEmail,
});

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: refreshUrl,
  return_url: returnUrl,
  type: 'account_onboarding',
});

// Create payment with Connect
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100),
  currency: 'usd',
  application_fee_amount: Math.round(commissionAmount * 100), // Platform commission
  transfer_data: {
    destination: connectAccountId, // Merchant's Connect account
  },
});
```

---

## PayPal Integration

### Standard PayPal

**Implementation:**
- PayPal Orders API
- Server-side order creation
- Client-side approval

**Code Example:**
```typescript
// Create PayPal order
const order = await paypal.orders.create({
  intent: 'CAPTURE',
  purchase_units: [{
    amount: {
      currency_code: currency,
      value: amount.toString(),
    },
    custom_id: giftCardId,
  }],
});

// Store payment record
await prisma.payment.create({
  data: {
    giftCardId,
    amount,
    paymentMethod: PaymentMethod.PAYPAL,
    paymentIntentId: order.id,
    status: PaymentStatus.PENDING,
  },
});
```

**Webhook Handling:**
```typescript
// Verify webhook signature
const verified = await paypal.webhooks.verify(req.body, headers);

if (verified) {
  const event = req.body;
  
  switch (event.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED':
      await updatePaymentStatus(event.resource.id, PaymentStatus.COMPLETED);
      break;
    case 'PAYMENT.CAPTURE.DENIED':
      await updatePaymentStatus(event.resource.id, PaymentStatus.FAILED);
      break;
  }
}
```

---

### PayPal Connect

**Purpose:** Merchants use their own PayPal accounts

**Implementation:**
- OAuth-based connection
- API credentials stored (encrypted)
- Payments processed through merchant account

**Code Example:**
```typescript
// Connect PayPal account
const accessToken = await getPayPalAccessToken(credentials);
const merchantInfo = await getPayPalMerchantInfo(accessToken);

// Store encrypted credentials
const encryptedCredentials = encrypt(JSON.stringify(credentials));

await prisma.merchantPaymentGateway.create({
  data: {
    merchantId,
    gatewayType: GatewayType.PAYPAL,
    credentials: encryptedCredentials,
    connectAccountId: merchantInfo.merchant_id,
  },
});
```

---

## Razorpay Integration

**Implementation:**
- Orders API
- Payment capture
- Webhook verification

**Code Example:**
```typescript
// Create Razorpay order
const order = await razorpay.orders.create({
  amount: Math.round(amount * 100), // Convert to paise
  currency: currency.toUpperCase(),
  receipt: giftCardId,
});

// Store payment record
await prisma.payment.create({
  data: {
    giftCardId,
    amount,
    paymentMethod: PaymentMethod.RAZORPAY,
    paymentIntentId: order.id,
    status: PaymentStatus.PENDING,
  },
});
```

**Webhook Handling:**
```typescript
// Verify webhook signature
const signature = req.headers['x-razorpay-signature'];
const isValid = razorpay.webhooks.verify(req.body, signature);

if (isValid) {
  const event = req.body;
  
  switch (event.event) {
    case 'payment.captured':
      await updatePaymentStatus(event.payload.payment.entity.id, PaymentStatus.COMPLETED);
      break;
    case 'payment.failed':
      await updatePaymentStatus(event.payload.payment.entity.id, PaymentStatus.FAILED);
      break;
  }
}
```

---

## UPI Integration

**Implementation:**
- UPI payment gateway API
- Payment links
- Webhook callbacks

**Code Example:**
```typescript
// Create UPI payment
const payment = await upiGateway.createPayment({
  amount,
  currency: 'INR',
  merchantTransactionId: giftCardId,
  callbackUrl: webhookUrl,
});

// Store payment record
await prisma.payment.create({
  data: {
    giftCardId,
    amount,
    paymentMethod: PaymentMethod.UPI,
    paymentIntentId: payment.transactionId,
    status: PaymentStatus.PENDING,
  },
});
```

---

## Payment State Machine

### Payment Status Flow

```
PENDING → COMPLETED
PENDING → FAILED
COMPLETED → REFUNDED
```

**Statuses:**
- **PENDING:** Payment created, awaiting completion
- **COMPLETED:** Payment successful, gift card activated
- **FAILED:** Payment failed
- **REFUNDED:** Payment refunded

**Code Example:**
```typescript
async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus) {
  const payment = await prisma.payment.update({
    where: { paymentIntentId },
    data: { status },
  });
  
  if (status === PaymentStatus.COMPLETED) {
    // Activate gift card
    await giftCardService.activateGiftCard(payment.giftCardId);
    
    // Schedule delivery
    await deliveryService.scheduleDelivery(payment.giftCardId);
  }
  
  return payment;
}
```

---

## Webhook Security

### Signature Verification

**Why Important:** Prevents fake webhooks

**Implementation:**

**Stripe:**
```typescript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  webhookSecret
);
```

**PayPal:**
```typescript
const verified = await paypal.webhooks.verify(
  req.body,
  req.headers
);
```

**Razorpay:**
```typescript
const signature = req.headers['x-razorpay-signature'];
const isValid = razorpay.webhooks.verify(
  req.body,
  signature
);
```

---

### Idempotency

**Purpose:** Prevent duplicate processing

**Implementation:**
- Check if payment already processed
- Use payment intent ID as idempotency key
- Return existing result if already processed

**Code Example:**
```typescript
async handleWebhook(paymentIntentId: string, status: PaymentStatus) {
  // Check if already processed
  const existing = await prisma.payment.findUnique({
    where: { paymentIntentId },
  });
  
  if (existing && existing.status !== PaymentStatus.PENDING) {
    // Already processed
    return existing;
  }
  
  // Process webhook
  return await updatePaymentStatus(paymentIntentId, status);
}
```

---

## Commission Calculation

### Commission Types

1. **Percentage:** e.g., 5% of payment amount
2. **Fixed:** e.g., $1 per payment

### Implementation

**Code Example:**
```typescript
async calculateCommission(
  amount: number,
  merchantId: string,
  paymentMethod: PaymentMethod
): Promise<{ commissionAmount: number; netAmount: number }> {
  // Get merchant-specific commission or global default
  const settings = await prisma.commissionSettings.findFirst({
    where: {
      OR: [
        { merchantId },
        { merchantId: null }, // Global default
      ],
      isActive: true,
      appliesTo: { has: paymentMethod },
    },
    orderBy: { merchantId: 'desc' }, // Prefer merchant-specific
  });
  
  if (!settings) {
    // Default: 5% commission
    const commissionAmount = amount * 0.05;
    return {
      commissionAmount,
      netAmount: amount - commissionAmount,
    };
  }
  
  let commissionAmount: number;
  
  if (settings.commissionType === CommissionType.PERCENTAGE) {
    commissionAmount = amount * (Number(settings.commissionRate) / 100);
  } else {
    commissionAmount = Number(settings.commissionRate);
  }
  
  return {
    commissionAmount,
    netAmount: amount - commissionAmount,
  };
}
```

---

## Refund Processing

### Refund Flow

1. User requests refund
2. Validate refund eligibility
3. Process refund with gateway
4. Update payment status
5. Update gift card balance

**Code Example:**
```typescript
async processRefund(paymentId: string, amount?: number) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { giftCard: true },
  });
  
  if (payment.status !== PaymentStatus.COMPLETED) {
    throw new ValidationError('Payment not eligible for refund');
  }
  
  const refundAmount = amount || payment.amount;
  
  // Process refund with gateway
  let refundId: string;
  
  switch (payment.paymentMethod) {
    case PaymentMethod.STRIPE:
      const refund = await stripe.refunds.create({
        payment_intent: payment.paymentIntentId,
        amount: Math.round(refundAmount * 100),
      });
      refundId = refund.id;
      break;
    // ... other gateways
  }
  
  // Update payment status
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: PaymentStatus.REFUNDED },
  });
  
  // Update gift card balance
  await prisma.giftCard.update({
    where: { id: payment.giftCardId },
    data: {
      balance: {
        decrement: refundAmount,
      },
    },
  });
  
  return { refundId, refundAmount };
}
```

---

## Multi-Currency Support

### Implementation

**Storage:**
- Currency stored with gift card and payment
- Default: USD

**Conversion:**
- Gateway handles currency conversion
- Platform stores original currency

**Code Example:**
```typescript
const giftCard = await prisma.giftCard.create({
  data: {
    value: new Decimal(100),
    currency: 'USD', // or 'EUR', 'GBP', 'INR', etc.
  },
});
```

---

## Error Handling

### Payment Failures

**Handling:**
- Log error details
- Update payment status to FAILED
- Notify user
- Retry mechanism (optional)

**Code Example:**
```typescript
try {
  const paymentIntent = await stripe.paymentIntents.create({...});
} catch (error) {
  logger.error('Payment creation failed', { error, giftCardId });
  
  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: PaymentStatus.FAILED,
      metadata: { error: error.message },
    },
  });
  
  throw new ValidationError('Payment creation failed');
}
```

---

## Interview Questions & Answers

### Q: Why multiple payment gateways?

**A:** Multiple gateways because:
1. **Geographic Coverage:** Different regions prefer different gateways
2. **Merchant Choice:** Merchants can use preferred gateway
3. **Redundancy:** Fallback if one fails
4. **Competitive Rates:** Merchants choose best rates

### Q: Explain Stripe Connect implementation.

**A:** Stripe Connect:
1. **Account Creation:** Create Connect account for merchant
2. **Onboarding:** Redirect to Stripe onboarding
3. **Verification:** Verify account (charges_enabled, payouts_enabled)
4. **Payments:** Use Connect account with application fee
5. **Direct Payouts:** Merchants receive funds directly

Benefits:
- Merchants handle compliance
- Platform collects commission as fee
- Direct payouts to merchants

### Q: How do you handle webhook security?

**A:** Webhook security:
1. **Signature Verification:** Verify webhook signature
2. **Idempotency:** Prevent duplicate processing
3. **HTTPS:** Only accept HTTPS webhooks
4. **Secret Storage:** Store webhook secrets securely

Each gateway has specific verification:
- Stripe: `stripe-signature` header
- PayPal: `PayPal-Auth-Algo` header
- Razorpay: `x-razorpay-signature` header

### Q: Explain commission calculation.

**A:** Commission calculation:
1. **Lookup:** Get merchant-specific or global settings
2. **Type:** Percentage or fixed amount
3. **Calculation:** Apply commission rate
4. **Storage:** Store commission and net amount

Supports:
- Merchant-specific rates
- Global default rates
- Different rates per payment method

### Q: How do you handle payment failures?

**A:** Payment failure handling:
1. **Status Update:** Mark payment as FAILED
2. **Error Logging:** Log error details
3. **User Notification:** Notify user of failure
4. **Retry:** Allow user to retry payment
5. **Refund:** Process refunds if needed

---

## Key Takeaways

1. **Multiple Gateways:** Stripe, PayPal, Razorpay, UPI
2. **Connect Support:** Merchants can use own accounts
3. **Webhook Security:** Signature verification, idempotency
4. **Commission:** Percentage or fixed, merchant-specific or global
5. **State Machine:** PENDING → COMPLETED/FAILED → REFUNDED
6. **Multi-Currency:** Support for multiple currencies
7. **Error Handling:** Comprehensive error handling and logging

---

*See other documents for fraud prevention and security details.*
