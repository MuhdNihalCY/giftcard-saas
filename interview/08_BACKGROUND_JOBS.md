# Background Jobs & Queue System - Interview Preparation

## Overview

This document covers BullMQ queue system, background job implementation, job scheduling, worker configuration, and retry mechanisms.

---

## Queue System: BullMQ

### Why BullMQ?

**Benefits:**
- **Redis Backend:** Uses Redis (already using Redis)
- **TypeScript:** Built-in TypeScript support
- **Features:** Job prioritization, delays, retries, rate limiting
- **Monitoring:** Built-in job monitoring and events
- **Reliability:** Job persistence, retry mechanisms
- **Performance:** Efficient job processing

**Alternatives Considered:**
- **Bull (v3):** Older API, less TypeScript support
- **Agenda:** MongoDB backend, less features
- **Node-Cron:** No queue, single server, no retries

---

## Queue Architecture

### Queue Setup

**Configuration:**
```typescript
import { Queue, QueueEvents } from 'bullmq';
import Redis from 'ioredis';

const queueOptions = {
  connection: new Redis(process.env.REDIS_URL),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
};

export const giftCardExpiryQueue = new Queue('gift-card-expiry', queueOptions);
export const emailDeliveryQueue = new Queue('email-delivery', queueOptions);
export const smsDeliveryQueue = new Queue('sms-delivery', queueOptions);
export const scheduledDeliveryQueue = new Queue('scheduled-delivery', queueOptions);
export const cleanupTokensQueue = new Queue('cleanup-tokens', queueOptions);
```

---

## Implemented Jobs

### 1. Gift Card Expiry

**Purpose:** Process expired gift cards

**Queue:** `gift-card-expiry`

**Implementation:**
```typescript
// Add job
await giftCardExpiryQueue.add('expire-card', {
  giftCardId: card.id,
  expiryDate: card.expiryDate,
});

// Worker
export async function processGiftCardExpiry(job: Job) {
  const { giftCardId } = job.data;
  
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });
  
  if (!giftCard || giftCard.status !== 'ACTIVE') {
    return;
  }
  
  if (isExpired(giftCard.expiryDate)) {
    await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        status: GiftCardStatus.EXPIRED,
        balance: new Decimal(0),
      },
    });
    
    // Create transaction record
    await prisma.transaction.create({
      data: {
        giftCardId,
        type: TransactionType.EXPIRY,
        amount: giftCard.balance,
        balanceBefore: giftCard.balance,
        balanceAfter: new Decimal(0),
      },
    });
  }
}
```

---

### 2. Expiry Reminders

**Purpose:** Send reminder emails before expiry

**Queue:** `expiry-reminders`

**Implementation:**
```typescript
// Schedule reminder (7 days before expiry)
const reminderDate = new Date(expiryDate);
reminderDate.setDate(reminderDate.getDate() - 7);

await expiryRemindersQueue.add(
  'send-expiry-reminder',
  {
    giftCardId: card.id,
    recipientEmail: card.recipientEmail,
  },
  {
    delay: reminderDate.getTime() - Date.now(),
  }
);

// Worker
export async function processExpiryReminder(job: Job) {
  const { giftCardId, recipientEmail } = job.data;
  
  const giftCard = await prisma.giftCard.findUnique({
    where: { id: giftCardId },
  });
  
  if (giftCard && giftCard.status === 'ACTIVE') {
    await emailService.sendExpiryReminder(giftCard, recipientEmail);
  }
}
```

---

### 3. Email Delivery

**Purpose:** Send gift card delivery emails

**Queue:** `email-delivery`

**Implementation:**
```typescript
// Add job
await emailDeliveryQueue.add('send-gift-card-email', {
  giftCardId: card.id,
  recipientEmail: card.recipientEmail,
  templateId: card.templateId,
});

// Worker
export async function processEmailDelivery(job: Job) {
  const { giftCardId, recipientEmail, templateId } = job.data;
  
  try {
    await emailService.sendGiftCardEmail(giftCardId, recipientEmail, templateId);
    logger.info('Email sent successfully', { giftCardId });
  } catch (error) {
    logger.error('Email delivery failed', { giftCardId, error });
    throw error; // Will trigger retry
  }
}
```

---

### 4. SMS Delivery

**Purpose:** Send gift card delivery SMS

**Queue:** `sms-delivery`

**Implementation:**
```typescript
// Add job
await smsDeliveryQueue.add('send-gift-card-sms', {
  giftCardId: card.id,
  recipientPhone: card.recipientPhone,
});

// Worker
export async function processSMSDelivery(job: Job) {
  const { giftCardId, recipientPhone } = job.data;
  
  try {
    await smsService.sendGiftCardSMS(giftCardId, recipientPhone);
    logger.info('SMS sent successfully', { giftCardId });
  } catch (error) {
    logger.error('SMS delivery failed', { giftCardId, error });
    throw error;
  }
}
```

---

### 5. Scheduled Delivery

**Purpose:** Schedule gift card delivery for future date

**Queue:** `scheduled-delivery`

**Implementation:**
```typescript
// Schedule delivery
const deliveryDate = new Date('2024-12-25');

await scheduledDeliveryQueue.add(
  'deliver-gift-card',
  {
    giftCardId: card.id,
    deliveryMethod: 'email',
  },
  {
    delay: deliveryDate.getTime() - Date.now(),
  }
);

// Worker
export async function processScheduledDelivery(job: Job) {
  const { giftCardId, deliveryMethod } = job.data;
  
  if (deliveryMethod === 'email') {
    await emailDeliveryQueue.add('send-gift-card-email', { giftCardId });
  } else if (deliveryMethod === 'sms') {
    await smsDeliveryQueue.add('send-gift-card-sms', { giftCardId });
  }
}
```

---

### 6. Token Cleanup

**Purpose:** Clean up expired tokens

**Queue:** `cleanup-tokens`

**Implementation:**
```typescript
// Schedule cleanup (daily)
await cleanupTokensQueue.add(
  'cleanup-expired-tokens',
  {},
  {
    repeat: {
      pattern: '0 2 * * *', // Daily at 2 AM
    },
  }
);

// Worker
export async function processTokenCleanup(job: Job) {
  const deleted = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });
  
  logger.info('Cleaned up expired tokens', { count: deleted.count });
}
```

---

## Worker Configuration

### Worker Setup

**Configuration:**
```typescript
import { Worker } from 'bullmq';
import Redis from 'ioredis';

const workerOptions = {
  connection: new Redis(process.env.REDIS_URL),
  concurrency: 5, // Process 5 jobs concurrently
  limiter: {
    max: 10, // Max 10 jobs
    duration: 1000, // Per second
  },
};

export const giftCardExpiryWorker = new Worker(
  'gift-card-expiry',
  processGiftCardExpiry,
  workerOptions
);
```

### Worker Events

**Monitoring:**
```typescript
import { QueueEvents } from 'bullmq';

const queueEvents = new QueueEvents('gift-card-expiry', queueOptions);

queueEvents.on('completed', ({ jobId }) => {
  logger.info('Job completed', { jobId });
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error('Job failed', { jobId, failedReason });
});

queueEvents.on('stalled', ({ jobId }) => {
  logger.warn('Job stalled', { jobId });
});
```

---

## Retry Mechanisms

### Retry Strategy

**Configuration:**
```typescript
defaultJobOptions: {
  attempts: 3, // Retry 3 times
  backoff: {
    type: 'exponential', // Exponential backoff
    delay: 2000, // Start with 2 seconds
  },
}
```

**Retry Flow:**
1. Job fails
2. Wait 2 seconds (exponential backoff)
3. Retry job
4. If fails again, wait 4 seconds
5. Retry again
6. If fails again, wait 8 seconds
7. Final retry
8. If still fails, mark as failed

**Code Example:**
```typescript
export async function processEmailDelivery(job: Job) {
  try {
    await emailService.sendGiftCardEmail(job.data.giftCardId);
  } catch (error) {
    // Log attempt
    logger.warn('Email delivery attempt failed', {
      attempt: job.attemptsMade,
      maxAttempts: job.opts.attempts,
    });
    
    // Throw to trigger retry
    throw error;
  }
}
```

---

## Job Prioritization

### Priority Levels

**Implementation:**
```typescript
// High priority job
await emailDeliveryQueue.add(
  'send-urgent-email',
  { giftCardId },
  {
    priority: 10, // Higher priority
  }
);

// Normal priority job
await emailDeliveryQueue.add(
  'send-normal-email',
  { giftCardId },
  {
    priority: 5, // Normal priority
  }
);
```

**Worker processes higher priority jobs first.**

---

## Cron Jobs vs Queue Jobs

### When to Use Each

**Cron Jobs:**
- Scheduled tasks (daily, weekly)
- Simple, one-time tasks
- No retry needed
- Example: Token cleanup

**Queue Jobs:**
- Async operations
- Need retry mechanism
- Multiple workers
- Example: Email delivery, payment processing

**Hybrid Approach:**
- Cron job adds jobs to queue
- Queue workers process jobs
- Best of both worlds

**Code Example:**
```typescript
// Cron job adds jobs to queue
cron.schedule('0 0 * * *', async () => {
  // Find expired gift cards
  const expiredCards = await prisma.giftCard.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: { lt: new Date() },
    },
  });
  
  // Add jobs to queue
  for (const card of expiredCards) {
    await giftCardExpiryQueue.add('expire-card', { giftCardId: card.id });
  }
});
```

---

## Job Monitoring

### Queue Monitoring

**Metrics:**
- Jobs completed
- Jobs failed
- Jobs waiting
- Jobs active
- Jobs delayed

**Code Example:**
```typescript
const waiting = await giftCardExpiryQueue.getWaiting();
const active = await giftCardExpiryQueue.getActive();
const completed = await giftCardExpiryQueue.getCompleted();
const failed = await giftCardExpiryQueue.getFailed();

logger.info('Queue status', {
  waiting: waiting.length,
  active: active.length,
  completed: completed.length,
  failed: failed.length,
});
```

---

## Interview Questions & Answers

### Q: Why BullMQ over Bull?

**A:** BullMQ chosen because:
1. **TypeScript:** Better TypeScript support
2. **Modern API:** Cleaner, more modern API
3. **Features:** More features (prioritization, rate limiting)
4. **Performance:** Better performance
5. **Active Development:** More actively maintained

### Q: Explain your retry strategy.

**A:** Retry strategy:
1. **Attempts:** 3 retries by default
2. **Backoff:** Exponential backoff (2s, 4s, 8s)
3. **Configuration:** Per-queue configuration
4. **Logging:** Logs each attempt

Benefits:
- Handles transient failures
- Prevents overwhelming services
- Configurable per job type

### Q: How do you handle job failures?

**A:** Job failure handling:
1. **Retry:** Automatic retry with backoff
2. **Logging:** Log failures with details
3. **Monitoring:** Track failed jobs
4. **Manual Retry:** Can manually retry failed jobs
5. **Cleanup:** Remove old failed jobs (24 hours)

### Q: Cron jobs vs Queue jobs?

**A:** 
- **Cron Jobs:** Scheduled tasks, simple, no retry
- **Queue Jobs:** Async operations, retry, multiple workers

Hybrid approach: Cron adds jobs to queue, queue workers process.

---

## Key Takeaways

1. **BullMQ:** Queue system with Redis backend
2. **6 Job Types:** Expiry, reminders, delivery, cleanup
3. **Retry Mechanism:** Exponential backoff, 3 attempts
4. **Worker Configuration:** Concurrency, rate limiting
5. **Monitoring:** Job events, queue metrics
6. **Reliability:** Job persistence, retry, error handling

---

*See other documents for delivery system and email/SMS implementation.*
