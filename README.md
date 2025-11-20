# 🎁 Gift Card SaaS Platform

A comprehensive digital gift card platform built with Node.js, Next.js, and PostgreSQL. Enable businesses to create, sell, and manage digital gift cards with multiple payment gateways, delivery options, and redemption methods.

## ✨ Features

### For Businesses
- ✅ Create and manage gift cards
- ✅ Bulk gift card creation
- ✅ Custom templates and branding
- ✅ Multiple payment gateways (Stripe, PayPal, Razorpay, UPI)
- ✅ Email/SMS delivery
- ✅ PDF generation
- ✅ Analytics and reporting
- ✅ QR code generation

### For Customers
- ✅ Browse gift cards
- ✅ Purchase gift cards
- ✅ Digital wallet
- ✅ Balance checking
- ✅ Multiple redemption methods (QR, Code, Link)
- ✅ Transaction history

### Technical Features
- ✅ RESTful API
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Payment webhooks
- ✅ Responsive design
- ✅ TypeScript throughout
- ✅ Docker support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### Installation

1. **Clone and setup:**
   ```bash
   cd giftcard-saas
   ./setup-env.sh  # Creates .env files
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Backend:**
   ```bash
   cd backend
   npm install
   npx prisma generate
   npx prisma migrate dev
   npm run dev
   ```

4. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

Visit http://localhost:3000

## 📁 Project Structure

```
giftcard-saas/
├── backend/          # Express.js API
│   ├── src/
│   │   ├── config/   # Configuration
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── prisma/       # Database schema
├── frontend/         # Next.js app
│   └── src/
│       ├── app/      # Pages
│       ├── components/
│       └── lib/
└── docker-compose.yml
```

## 📚 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete documentation (Setup, API, Redemption, Payment Flow)
- **[srs.md](./srs.md)** - Software Requirements Specification

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- PostgreSQL + Prisma
- Redis
- JWT Authentication

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Zustand

### Infrastructure
- Docker
- PostgreSQL
- Redis

## 🔐 Environment Variables

See `.env.example` files in `backend/` and `frontend/` directories.

**Required:**
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

**Optional:**
- Payment gateway keys
- Email/SMS service keys
- AWS S3 credentials

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Gift Cards
- `GET /api/v1/gift-cards` - List
- `POST /api/v1/gift-cards` - Create
- `GET /api/v1/gift-cards/:id` - Get
- `PUT /api/v1/gift-cards/:id` - Update
- `DELETE /api/v1/gift-cards/:id` - Delete

### Payments
- `POST /api/v1/payments/create-intent` - Create payment
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/:id/refund` - Refund

### Redemptions
- `POST /api/v1/redemptions/validate` - Validate code
- `POST /api/v1/redemptions/check-balance` - Check balance
- `POST /api/v1/redemptions/redeem` - Redeem

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete reference.

## 🧪 Development

```bash
# Backend
cd backend
npm run dev          # Development server
npm run build        # Build
npm run prisma:studio # Database GUI

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Build
npm run lint         # Lint
```

## 📝 License

ISC

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

---

**Built with ❤️ for digital gift card management**
