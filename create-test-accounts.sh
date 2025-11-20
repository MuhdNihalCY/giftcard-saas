#!/bin/bash

echo "🎁 Creating Test Accounts"
echo "========================"
echo ""

# Check if backend is running
if ! curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "❌ Backend is not running!"
    echo "Please start the backend first: cd backend && npm run dev"
    exit 1
fi

echo "✅ Backend is running"
echo ""

# Create accounts via API
echo "Creating test accounts..."
echo ""

# Admin
echo "Creating Admin account..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@giftcard.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "User",
    "businessName": "Gift Card SaaS Admin",
    "role": "ADMIN"
  }' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Merchant 1
echo "Creating Merchant 1 account..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant@giftcard.com",
    "password": "merchant123",
    "firstName": "Merchant",
    "lastName": "Business",
    "businessName": "Test Merchant Store",
    "role": "MERCHANT"
  }' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Merchant 2
echo "Creating Merchant 2 account..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "merchant2@giftcard.com",
    "password": "merchant123",
    "firstName": "Another",
    "lastName": "Merchant",
    "businessName": "Coffee Shop",
    "role": "MERCHANT"
  }' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Customer
echo "Creating Customer account..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@giftcard.com",
    "password": "customer123",
    "firstName": "Customer",
    "lastName": "User",
    "role": "CUSTOMER"
  }' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

echo "✅ Test accounts creation completed!"
echo ""
echo "📋 Test Account Credentials:"
echo ""
echo "👑 ADMIN:"
echo "   Email: admin@giftcard.com"
echo "   Password: admin123"
echo ""
echo "🏪 MERCHANT 1:"
echo "   Email: merchant@giftcard.com"
echo "   Password: merchant123"
echo ""
echo "🏪 MERCHANT 2:"
echo "   Email: merchant2@giftcard.com"
echo "   Password: merchant123"
echo ""
echo "👤 CUSTOMER:"
echo "   Email: customer@giftcard.com"
echo "   Password: customer123"
echo ""

