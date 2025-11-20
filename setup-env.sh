#!/bin/bash

# Setup script for environment files

echo "🎁 Gift Card SaaS - Environment Setup"
echo "======================================"
echo ""

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    
    # Generate JWT secrets
    echo "Generating JWT secrets..."
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    # Replace secrets in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/g" backend/.env
        sed -i '' "s/your-super-secret-refresh-key-change-in-production-min-32-chars/$JWT_REFRESH_SECRET/g" backend/.env
    else
        # Linux
        sed -i "s/your-super-secret-jwt-key-change-in-production-min-32-chars/$JWT_SECRET/g" backend/.env
        sed -i "s/your-super-secret-refresh-key-change-in-production-min-32-chars/$JWT_REFRESH_SECRET/g" backend/.env
    fi
    
    echo "✅ Backend .env created with generated JWT secrets"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local from .env.example..."
    cp frontend/.env.example frontend/.env.local
    echo "✅ Frontend .env.local created"
else
    echo "⚠️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "✅ Environment files setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env and add your:"
echo "   - Payment gateway keys (Stripe, PayPal, Razorpay)"
echo "   - Email service keys (SendGrid)"
echo "   - SMS service keys (Twilio)"
echo "   - AWS S3 credentials (optional)"
echo ""
echo "2. Edit frontend/.env.local and add your:"
echo "   - Payment gateway public keys"
echo ""
echo "3. Run: cd backend && npm install && npx prisma migrate dev"
echo "4. Run: cd frontend && npm install"
echo ""

