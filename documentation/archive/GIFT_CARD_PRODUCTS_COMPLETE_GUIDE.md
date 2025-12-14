# Complete Guide: Gift Card Products System

## Overview

The Gift Card Products system allows merchants to create **pre-configured gift card products** that customers can purchase. Products act as templates that define:
- Gift card values (what the customer receives)
- Sale prices (what the customer pays)
- Templates and designs
- Expiry rules
- Customization options

## Key Concepts

### 1. **Gift Card Product** vs **Gift Card**

- **Gift Card Product**: A template/catalog item that defines how gift cards can be purchased
- **Gift Card**: The actual gift card created when a customer purchases from a product

### 2. **Two Ways to Create Gift Cards**

1. **Via Products** (Product-based):
   - Merchant creates products in catalog
   - Customers browse and purchase from products
   - Gift cards are automatically created from product configuration

2. **Direct Creation** (Without Products):
   - Merchant/admin creates gift cards directly
   - No product catalog needed
   - More flexible but requires manual setup

## Product Features & Functionality

### Product Configuration Options

#### 1. **Basic Information**
- **Name**: Product name (e.g., "Birthday Gift Card")
- **Description**: Product description
- **Image**: Product image/thumbnail
- **Category**: Product category for organization
- **Tags**: Tags for filtering/searching

#### 2. **Amount Configuration**

Products support two pricing models:

**A. Fixed Amounts**
```json
{
  "fixedAmounts": [25, 50, 100, 200],
  "fixedSalePrices": [20, 45, 90, 180]  // Optional discounts
}
```
- Customer selects from predefined amounts
- Each amount can have a different sale price (discount)
- Example: $100 gift card sold for $90 (10% discount)

**B. Custom Amount Range**
```json
{
  "allowCustomAmount": true,
  "minAmount": 10,
  "maxAmount": 1000,
  "minSalePrice": 9,    // Minimum customer pays
  "maxSalePrice": 900   // Maximum customer pays
}
```
- Customer enters any amount within range
- Linear interpolation calculates sale price
- Example: $50 gift card might cost $45 (10% discount)

#### 3. **Pricing Logic**

**Important Distinction:**
- **Gift Card Value** (`amount`): What the recipient receives
- **Sale Price** (`salePrice`): What the customer pays

**Example:**
- Gift Card Value: $100
- Sale Price: $90
- Customer pays $90, recipient gets $100 gift card

#### 4. **Template & Design**
- **Template ID**: Links to a gift card template
- Templates define visual design (colors, images, layout)
- If no template specified, uses merchant's default template

#### 5. **Expiry Rules**
- **Expiry Days**: Number of days until gift card expires
- If not set, gift cards don't expire (or use system default)

#### 6. **Visibility & Status**
- **isActive**: Whether product is active/available
- **isPublic**: Whether product is visible to all users (public catalog)

## Product Workflow

### Merchant Side (Creating Products)

1. **Create Product**
   ```
   POST /api/v1/gift-card-products
   ```
   - Define amounts, prices, template
   - Set visibility and expiry rules
   - Upload product image

2. **Manage Products**
   - View all products
   - Edit product details
   - Activate/deactivate products
   - Delete products (if not in use)

3. **Product Catalog**
   - Browse products
   - Filter by category, tags
   - Search products

### Customer Side (Purchasing from Products)

1. **Browse Products**
   ```
   GET /api/v1/gift-card-products/public
   ```
   - View public products
   - See product details, images, prices

2. **Select Product**
   - Choose product
   - Select amount (fixed or custom)
   - See calculated sale price

3. **Purchase Flow**
   ```
   POST /api/v1/payments/from-product
   ```
   - Provide recipient details (optional)
   - Choose payment method
   - Complete payment
   - Gift card is automatically created

4. **Gift Card Created**
   - Gift card created with product configuration
   - Recipient receives gift card via email (if provided)
   - Gift card can be redeemed immediately

## API Endpoints

### Product Management (Merchant/Admin)

```typescript
// Create product
POST /api/v1/gift-card-products
Body: {
  name: string;
  description?: string;
  image?: string;
  minAmount?: number;
  maxAmount?: number;
  minSalePrice?: number;
  maxSalePrice?: number;
  allowCustomAmount?: boolean;
  fixedAmounts?: number[];
  fixedSalePrices?: number[];
  currency?: string;
  expiryDays?: number;
  templateId?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isPublic?: boolean;
}

// List products
GET /api/v1/gift-card-products?merchantId=xxx&isActive=true

// Get product by ID
GET /api/v1/gift-card-products/:id

// Update product
PUT /api/v1/gift-card-products/:id

// Delete product
DELETE /api/v1/gift-card-products/:id
```

### Public Product Access

```typescript
// List public products
GET /api/v1/gift-card-products/public?category=xxx&tags=xxx

// Get public product by ID
GET /api/v1/gift-card-products/:id
```

### Purchase from Product

```typescript
// Create payment from product
POST /api/v1/payments/from-product
Body: {
  productId: string;
  amount: number;              // Gift card value
  currency: string;
  paymentMethod: 'STRIPE' | 'PAYPAL' | 'RAZORPAY' | 'UPI';
  recipientEmail?: string;
  recipientName?: string;
  customMessage?: string;
  returnUrl?: string;
  cancelUrl?: string;
}
```

## Database Schema

### GiftCardProduct Model

```prisma
model GiftCardProduct {
  id               String   @id @default(uuid())
  merchantId       String
  name             String
  description      String?
  image            String?
  minAmount        Decimal?  // Gift card value range
  maxAmount        Decimal?
  minSalePrice     Decimal?  // Customer pays range
  maxSalePrice     Decimal?
  allowCustomAmount Boolean @default(false)
  fixedAmounts     Json?     // Array of gift card values
  fixedSalePrices  Json?     // Array of sale prices
  currency         String   @default("USD")
  expiryDays       Int?
  templateId       String?
  category         String?
  tags             Json?
  isActive         Boolean  @default(true)
  isPublic         Boolean  @default(false)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  merchant  User
  template  GiftCardTemplate?
  giftCards GiftCard[]  // Gift cards created from this product
}
```

### GiftCard Model (with product reference)

```prisma
model GiftCard {
  id         String   @id @default(uuid())
  merchantId String
  productId  String?  // Reference to product if created from product
  value      Decimal  // Gift card value
  balance    Decimal
  // ... other fields
}
```

## Frontend Pages

### Merchant Dashboard

1. **Products List** (`/dashboard/gift-card-products`)
   - View all products
   - Filter by status, category
   - Create/edit/delete products
   - Toggle active status

2. **Create/Edit Product** (`/dashboard/gift-card-products/create` or `/edit/:id`)
   - Form to configure product
   - Amount/pricing configuration
   - Template selection
   - Image upload

### Public Pages

1. **Product Catalog** (`/browse` or `/products`)
   - Browse public products
   - Filter by category, tags
   - Search products

2. **Product Detail** (`/products/:id`)
   - View product details
   - Select amount
   - See calculated price
   - Purchase gift card
   - Bulk purchase option

## Feature Flags

### `gift_card_products` (PAGE)
- **Purpose**: Controls access to product catalog management
- **Default**: Enabled
- **When Disabled**:
  - Products menu hidden from sidebar
  - Product creation/editing pages inaccessible
  - Product API endpoints still work (for backward compatibility)
  - Direct gift card creation still works

### `public_gift_card_creation` (FEATURE)
- **Purpose**: Allows direct gift card creation without products
- **Default**: Enabled
- **When Disabled**:
  - Direct gift card creation disabled
  - Only product-based purchases allowed

## Use Cases

### Use Case 1: E-commerce Store
- Merchant creates products for different occasions
- Products: "Birthday Gift Card", "Holiday Gift Card", "Thank You Card"
- Each product has fixed amounts ($25, $50, $100)
- Customers browse catalog and purchase

### Use Case 2: Restaurant Chain
- Merchant creates products for different locations
- Products: "Downtown Location", "Mall Location"
- Custom amounts ($10-$500)
- Customers select location and amount

### Use Case 3: Service Business
- Merchant creates products for different services
- Products: "Massage Package", "Haircut Package"
- Fixed amounts matching service prices
- Customers purchase as gift cards

### Use Case 4: Direct Creation (No Products)
- Merchant disables products feature
- Creates gift cards directly for specific customers
- More flexible but requires manual setup
- Useful for custom orders or corporate gifts

## Benefits of Products

1. **Standardization**: Consistent gift card configurations
2. **Efficiency**: Faster customer purchases
3. **Marketing**: Product catalog acts as marketing tool
4. **Discounts**: Easy to set up promotional pricing
5. **Analytics**: Track which products are popular
6. **Automation**: Gift cards created automatically on purchase

## Product vs Direct Creation

| Feature | Products | Direct Creation |
|---------|----------|-----------------|
| Setup Time | One-time product setup | Per gift card |
| Customer Experience | Browse & select | Manual entry |
| Discounts | Easy to configure | Manual calculation |
| Consistency | Standardized | Custom each time |
| Use Case | Public catalog | Custom orders |
| Automation | Automatic creation | Manual creation |

## Best Practices

1. **Product Naming**: Use descriptive names (e.g., "Holiday Gift Card 2024")
2. **Pricing**: Set competitive sale prices to encourage purchases
3. **Images**: Use high-quality product images
4. **Categories**: Organize products by category for easy browsing
5. **Tags**: Add relevant tags for searchability
6. **Expiry**: Set reasonable expiry days (30-365 days)
7. **Public Visibility**: Make popular products public for discovery
8. **Testing**: Test product purchase flow before making public

## Troubleshooting

### Product Not Showing in Public Catalog
- Check `isPublic` is set to `true`
- Check `isActive` is set to `true`
- Verify product is not deleted

### Gift Card Not Created After Purchase
- Check payment status (must be COMPLETED)
- Verify product configuration is valid
- Check server logs for errors

### Price Calculation Issues
- Verify `fixedSalePrices` matches `fixedAmounts` length
- Check `minSalePrice` <= `minAmount` and `maxSalePrice` <= `maxAmount`
- Ensure custom amount is within min/max range

## Summary

The Gift Card Products system provides a powerful way to:
- ✅ Create standardized gift card offerings
- ✅ Enable customer self-service purchases
- ✅ Set up promotional pricing easily
- ✅ Build a product catalog
- ✅ Automate gift card creation
- ✅ Track product performance

Products are optional - you can use them for public catalogs or disable them for direct gift card creation only.

