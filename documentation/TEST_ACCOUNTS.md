# 🔐 Test Accounts - Gift Card SaaS Platform

## Quick Access

All test accounts are ready to use. Simply login at **http://localhost:3000/login**

---

## 👑 Admin Account

**Full system access - All features enabled**

- **Email:** `admin@giftcard.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Business:** Gift Card SaaS Admin

### What you can do:
- ✅ Manage all users
- ✅ View all analytics across all merchants
- ✅ Access all gift cards
- ✅ System-wide settings
- ✅ Create/manage gift cards
- ✅ Process payments and redemptions
- ✅ Full administrative control

---

## 🏪 Merchant Account 1

**Business owner - Create and sell gift cards**

- **Email:** `merchant@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Test Merchant Store

### What you can do:
- ✅ Create gift cards
- ✅ Manage your gift cards
- ✅ View sales analytics
- ✅ Process redemptions
- ✅ Upload business logo
- ✅ Create templates
- ✅ Bulk create gift cards
- ✅ View customer data

---

## 🏪 Merchant Account 2

**Another business - For testing multiple merchants**

- **Email:** `merchant2@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Coffee Shop

### What you can do:
- ✅ Same as Merchant Account 1
- ✅ Test multi-merchant scenarios
- ✅ Compare analytics between merchants

---

## 👤 Customer Account

**End user - Purchase and redeem gift cards**

- **Email:** `customer@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER

### What you can do:
- ✅ Browse gift cards
- ✅ Purchase gift cards
- ✅ View gift card wallet
- ✅ Check balance
- ✅ Redeem gift cards
- ✅ View transaction history
- ✅ Download gift card PDFs

---

## 🚀 Creating/Updating Test Accounts

### Method 1: Using the Script (Recommended)

```bash
./create-test-accounts.sh
```

This will create all test accounts via the API.

### Method 2: Using Prisma Seed (Requires Database)

```bash
cd backend
npm run prisma:seed
```

### Method 3: Manual Registration

1. Go to http://localhost:3000/register
2. Use any of the emails above
3. Use the corresponding password
4. The system will create the account

---

## 📋 All Credentials Summary

| Role | Email | Password | Business |
|------|-------|----------|----------|
| Admin | admin@giftcard.com | admin123 | Gift Card SaaS Admin |
| Merchant | merchant@giftcard.com | merchant123 | Test Merchant Store |
| Merchant | merchant2@giftcard.com | merchant123 | Coffee Shop |
| Customer | customer@giftcard.com | customer123 | - |

---

## 🧪 Testing Scenarios

### Scenario 1: Merchant Creates Gift Card
1. Login as `merchant@giftcard.com`
2. Go to Dashboard → Gift Cards → Create
3. Create a $50 gift card
4. View QR code and code

### Scenario 2: Customer Purchases Gift Card
1. Login as `customer@giftcard.com`
2. Browse gift cards
3. Purchase a gift card
4. View in wallet

### Scenario 3: Merchant Redeems Gift Card
1. Login as `merchant@giftcard.com`
2. Go to Redemptions
3. Enter gift card code or scan QR
4. Process redemption

### Scenario 4: Admin Views Analytics
1. Login as `admin@giftcard.com`
2. Go to Analytics
3. View system-wide statistics
4. Export reports

---

## ⚠️ Important Notes

- These are **TEST ACCOUNTS** for development only
- **DO NOT** use these credentials in production
- All accounts have simple passwords for easy testing
- Accounts are created with email verification already set to true
- All accounts are active by default

---

## 🔄 Reset Accounts

To recreate test accounts:

```bash
./create-test-accounts.sh
```

Or manually delete and recreate via the admin panel.

---

**Happy Testing! 🎁**
