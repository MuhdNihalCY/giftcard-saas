# 🔐 Test Accounts - Gift Card SaaS Platform

## Quick Access

All test accounts are ready to use. Simply login at **http://localhost:3000/login**

---

## 👑 Admin Accounts

**Full system access - All features enabled**

### Admin Account 1
- **Email:** `admin@giftcard.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Business:** Gift Card SaaS Admin

### Admin Account 2
- **Email:** `admin2@giftcard.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Business:** System Administrator

### Admin Account 3
- **Email:** `admin3@giftcard.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Business:** Platform Manager

### What Admin accounts can do:
- ✅ Manage all users
- ✅ View all analytics across all merchants
- ✅ Access all gift cards
- ✅ System-wide settings
- ✅ Create/manage gift cards
- ✅ Process payments and redemptions
- ✅ Full administrative control
- ✅ Audit logs and system monitoring

---

## 🏪 Merchant Accounts

**Business owners - Create and sell gift cards**

### Merchant Account 1
- **Email:** `merchant@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Test Merchant Store

### Merchant Account 2
- **Email:** `merchant2@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Coffee Shop

### Merchant Account 3
- **Email:** `merchant3@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Fashion Boutique

### Merchant Account 4
- **Email:** `merchant4@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Fine Dining Restaurant

### Merchant Account 5
- **Email:** `merchant5@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Luxury Spa & Wellness

### Merchant Account 6
- **Email:** `merchant6@giftcard.com`
- **Password:** `merchant123`
- **Role:** MERCHANT
- **Business:** Electronics Hub

### What Merchant accounts can do:
- ✅ Create gift cards
- ✅ Manage your gift cards
- ✅ View sales analytics
- ✅ Process redemptions
- ✅ Upload business logo
- ✅ Create templates
- ✅ Bulk create gift cards
- ✅ View customer data
- ✅ Manage gift card products
- ✅ Set pricing and visibility
- ✅ Schedule gift card deliveries

---

## 👤 Customer Accounts

**End users - Purchase and redeem gift cards**

### Customer Account 1
- **Email:** `customer@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** Customer User

### Customer Account 2
- **Email:** `customer2@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** John Doe

### Customer Account 3
- **Email:** `customer3@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** Jane Smith

### Customer Account 4
- **Email:** `customer4@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** Mike Johnson

### Customer Account 5
- **Email:** `customer5@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** Sarah Williams

### Customer Account 6
- **Email:** `customer6@giftcard.com`
- **Password:** `customer123`
- **Role:** CUSTOMER
- **Name:** David Brown

### What Customer accounts can do:
- ✅ Browse gift cards
- ✅ Purchase gift cards
- ✅ View gift card wallet
- ✅ Check balance
- ✅ Redeem gift cards
- ✅ View transaction history
- ✅ Download gift card PDFs
- ✅ Share gift cards
- ✅ View shared gift cards

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

### Admin Accounts (3)
| Email | Password | Business |
|-------|----------|----------|
| admin@giftcard.com | admin123 | Gift Card SaaS Admin |
| admin2@giftcard.com | admin123 | System Administrator |
| admin3@giftcard.com | admin123 | Platform Manager |

### Merchant Accounts (6)
| Email | Password | Business |
|-------|----------|----------|
| merchant@giftcard.com | merchant123 | Test Merchant Store |
| merchant2@giftcard.com | merchant123 | Coffee Shop |
| merchant3@giftcard.com | merchant123 | Fashion Boutique |
| merchant4@giftcard.com | merchant123 | Fine Dining Restaurant |
| merchant5@giftcard.com | merchant123 | Luxury Spa & Wellness |
| merchant6@giftcard.com | merchant123 | Electronics Hub |

### Customer Accounts (6)
| Email | Password | Name |
|-------|----------|------|
| customer@giftcard.com | customer123 | Customer User |
| customer2@giftcard.com | customer123 | John Doe |
| customer3@giftcard.com | customer123 | Jane Smith |
| customer4@giftcard.com | customer123 | Mike Johnson |
| customer5@giftcard.com | customer123 | Sarah Williams |
| customer6@giftcard.com | customer123 | David Brown |

**Total: 15 test accounts** (3 Admin + 6 Merchant + 6 Customer)

---

## 🧪 Testing Scenarios

### Scenario 1: Merchant Creates Gift Card
1. Login as `merchant@giftcard.com`
2. Go to Dashboard → Gift Cards → Create
3. Create a $50 gift card
4. View QR code and code

### Scenario 2: Multiple Merchants Create Gift Cards
1. Login as different merchants (merchant2, merchant3, etc.)
2. Each creates gift cards with different amounts
3. Test multi-merchant gift card management
4. Compare analytics between merchants

### Scenario 3: Customer Purchases Gift Card
1. Login as `customer@giftcard.com` or any customer account
2. Browse gift cards from different merchants
3. Purchase gift cards
4. View in wallet

### Scenario 4: Multiple Customers Purchase Gift Cards
1. Use different customer accounts (customer2, customer3, etc.)
2. Each purchases gift cards from various merchants
3. Test concurrent purchases
4. Verify wallet isolation between customers

### Scenario 5: Merchant Redeems Gift Card
1. Login as `merchant@giftcard.com`
2. Go to Redemptions
3. Enter gift card code or scan QR
4. Process redemption

### Scenario 6: Admin Views Analytics
1. Login as `admin@giftcard.com` or any admin account
2. Go to Analytics
3. View system-wide statistics
4. Compare data across all merchants
5. Export reports

### Scenario 7: Admin Manages Users
1. Login as `admin@giftcard.com`
2. Go to Users section
3. View all users (admins, merchants, customers)
4. Test user management features

### Scenario 8: Gift Card Sharing
1. Login as a customer account
2. Purchase a gift card
3. Share the gift card with another customer
4. Login as the other customer and view shared gift card

### Scenario 9: Multi-Admin Testing
1. Login as different admin accounts (admin2, admin3)
2. Test concurrent admin operations
3. Verify admin permissions and access

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
