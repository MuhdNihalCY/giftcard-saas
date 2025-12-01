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

# Admin Accounts
echo "Creating Admin accounts..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@giftcard.com", "password": "admin123", "firstName": "Admin", "lastName": "User", "businessName": "Gift Card SaaS Admin", "role": "ADMIN"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin2@giftcard.com", "password": "admin123", "firstName": "Super", "lastName": "Admin", "businessName": "System Administrator", "role": "ADMIN"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin3@giftcard.com", "password": "admin123", "firstName": "Master", "lastName": "Admin", "businessName": "Platform Manager", "role": "ADMIN"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Merchant Accounts
echo "Creating Merchant accounts..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant@giftcard.com", "password": "merchant123", "firstName": "Merchant", "lastName": "Business", "businessName": "Test Merchant Store", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant2@giftcard.com", "password": "merchant123", "firstName": "Another", "lastName": "Merchant", "businessName": "Coffee Shop", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant3@giftcard.com", "password": "merchant123", "firstName": "Retail", "lastName": "Owner", "businessName": "Fashion Boutique", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant4@giftcard.com", "password": "merchant123", "firstName": "Restaurant", "lastName": "Manager", "businessName": "Fine Dining Restaurant", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant5@giftcard.com", "password": "merchant123", "firstName": "Spa", "lastName": "Director", "businessName": "Luxury Spa & Wellness", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "merchant6@giftcard.com", "password": "merchant123", "firstName": "Tech", "lastName": "Store", "businessName": "Electronics Hub", "role": "MERCHANT"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

# Customer Accounts
echo "Creating Customer accounts..."
curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer@giftcard.com", "password": "customer123", "firstName": "Customer", "lastName": "User", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer2@giftcard.com", "password": "customer123", "firstName": "John", "lastName": "Doe", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer3@giftcard.com", "password": "customer123", "firstName": "Jane", "lastName": "Smith", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer4@giftcard.com", "password": "customer123", "firstName": "Mike", "lastName": "Johnson", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer5@giftcard.com", "password": "customer123", "firstName": "Sarah", "lastName": "Williams", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

curl -s -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "customer6@giftcard.com", "password": "customer123", "firstName": "David", "lastName": "Brown", "role": "CUSTOMER"}' | python3 -m json.tool 2>/dev/null || echo "Response received"
echo ""

echo "✅ Test accounts creation completed!"
echo ""
echo "📋 Test Account Credentials:"
echo ""
echo "👑 ADMIN ACCOUNTS (3):"
echo "   admin@giftcard.com / admin123"
echo "   admin2@giftcard.com / admin123"
echo "   admin3@giftcard.com / admin123"
echo ""
echo "🏪 MERCHANT ACCOUNTS (6):"
echo "   merchant@giftcard.com / merchant123"
echo "   merchant2@giftcard.com / merchant123"
echo "   merchant3@giftcard.com / merchant123"
echo "   merchant4@giftcard.com / merchant123"
echo "   merchant5@giftcard.com / merchant123"
echo "   merchant6@giftcard.com / merchant123"
echo ""
echo "👤 CUSTOMER ACCOUNTS (6):"
echo "   customer@giftcard.com / customer123"
echo "   customer2@giftcard.com / customer123"
echo "   customer3@giftcard.com / customer123"
echo "   customer4@giftcard.com / customer123"
echo "   customer5@giftcard.com / customer123"
echo "   customer6@giftcard.com / customer123"
echo ""

