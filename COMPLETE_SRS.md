# Software Requirements Specification (SRS)
## Digital Gift Card SaaS Platform

**Version:** 1.0.0  
**Date:** 2024  
**Status:** Complete Specification  
**Document Type:** Software Requirements Specification

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features and Requirements](#3-system-features-and-requirements)
4. [Database Schema and Data Models](#4-database-schema-and-data-models)
5. [API Specifications](#5-api-specifications)
6. [Security Requirements](#6-security-requirements)
7. [Technical Architecture](#7-technical-architecture)
8. [Deployment and Infrastructure](#8-deployment-and-infrastructure)
9. [Testing Requirements](#9-testing-requirements)
10. [Compliance and Legal Requirements](#10-compliance-and-legal-requirements)
11. [Appendices](#11-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive specification for the Digital Gift Card SaaS Platform. The platform enables businesses of all sizes to create, sell, distribute, and manage digital gift cards with multiple redemption methods, seamless integrations, and powerful analytics capabilities.

The purpose of this document is to:
- Define the complete functional and non-functional requirements
- Specify system architecture and technical implementation details
- Document all features, APIs, and data models
- Provide a reference for developers, testers, and stakeholders
- Ensure comprehensive coverage of all system components

### 1.2 Scope

The Digital Gift Card SaaS Platform provides a complete gift card ecosystem including:

**Core Functionality:**
- Online gift card creation (single and bulk)
- Gift card purchase and payment processing
- Multi-channel delivery (Email, SMS, PDF, Links)
- Multiple redemption methods (QR codes, manual codes, links, API)
- Gift card templates and branding
- Product catalog management
- Analytics and reporting
- Merchant payout system

**User Management:**
- Role-based access control (Admin, Merchant, Customer)
- Authentication and authorization
- Profile management
- Security features (2FA, session management, audit logging)

**Integration Capabilities:**
- RESTful API for third-party integrations
- Webhook support for real-time notifications
- Payment gateway integrations (Stripe, PayPal, Razorpay, UPI)
- POS system compatibility

**Administrative Features:**
- Platform-wide analytics
- Communication management
- Audit logging
- System configuration

**Out of Scope:**
- Native mobile applications (iOS/Android) - PWA support provided
- Cryptocurrency payments (future enhancement)
- Blockchain-based verification (future enhancement)
- White-label solutions (future enhancement)

### 1.3 Definitions, Acronyms, and Abbreviations

**Terms:**
- **Gift Card:** A digital voucher with monetary value used to purchase products/services
- **Merchant:** A business owner who creates and sells gift cards
- **Customer:** An end-user who purchases and uses gift cards
- **Admin:** Platform administrator with full system access
- **Redemption:** The process of using a gift card to make a purchase
- **Partial Redemption:** Using only a portion of the gift card balance
- **Template:** A reusable design for gift cards
- **Product:** A sellable gift card offering with pricing and configuration
- **Payout:** Transfer of merchant earnings from redemptions

**Acronyms:**
- **SRS:** Software Requirements Specification
- **API:** Application Programming Interface
- **REST:** Representational State Transfer
- **JWT:** JSON Web Token
- **QR Code:** Quick Response code for scanning
- **NFC:** Near Field Communication
- **POS:** Point of Sale system
- **2FA:** Two-Factor Authentication
- **OTP:** One-Time Password
- **CSRF:** Cross-Site Request Forgery
- **XSS:** Cross-Site Scripting
- **CORS:** Cross-Origin Resource Sharing
- **RBAC:** Role-Based Access Control
- **PCI DSS:** Payment Card Industry Data Security Standard
- **GDPR:** General Data Protection Regulation
- **SLA:** Service Level Agreement
- **PWA:** Progressive Web Application
- **UPI:** Unified Payments Interface
- **SMS:** Short Message Service
- **PDF:** Portable Document Format
- **CSV:** Comma-Separated Values
- **JSON:** JavaScript Object Notation
- **UUID:** Universally Unique Identifier
- **TOTP:** Time-based One-Time Password
- **HSTS:** HTTP Strict Transport Security
- **CSP:** Content Security Policy

### 1.4 References

- IEEE 830-1998: Recommended Practice for Software Requirements Specifications
- PCI DSS v3.2.1: Payment Card Industry Data Security Standard
- GDPR: General Data Protection Regulation
- WCAG 2.1: Web Content Accessibility Guidelines
- ISO 27001: Information Security Management

### 1.5 Overview

This document is organized into 11 major sections:
1. Introduction - Purpose, scope, definitions
2. Overall Description - User needs, assumptions, dependencies
3. System Features - Detailed functional requirements
4. Database Schema - Complete data model specification
5. API Specifications - RESTful API documentation
6. Security Requirements - Security features and compliance
7. Technical Architecture - System design and technology stack
8. Deployment - Infrastructure and deployment procedures
9. Testing Requirements - Testing strategy and requirements
10. Compliance - Legal and regulatory requirements
11. Appendices - Use cases, glossary, technical details

---

## 2. Overall Description

### 2.1 Product Perspective

The Digital Gift Card SaaS Platform is a standalone, cloud-based Software-as-a-Service (SaaS) application that operates independently but integrates with external services:

**External Integrations:**
- Payment gateways (Stripe, PayPal, Razorpay, UPI)
- Email service providers (SendGrid, Brevo, SMTP)
- SMS service providers (Twilio, Brevo)
- Cloud storage (AWS S3 - optional)
- Redis for caching and session management
- PostgreSQL database

**System Interfaces:**
- RESTful API for client applications
- Webhook endpoints for external systems
- Admin dashboard (web-based)
- Merchant dashboard (web-based)
- Customer portal (web-based)
- Public-facing pages (product browsing, redemption)

### 2.2 Product Functions

The platform provides the following major functions:

1. **User Management**
   - Registration, authentication, and authorization
   - Role-based access control
   - Profile management
   - Security features (2FA, session management)

2. **Gift Card Management**
   - Creation (single and bulk)
   - Templates and branding
   - Product catalog
   - Status tracking
   - Expiry management

3. **Payment Processing**
   - Multiple payment gateway support
   - Payment intent creation
   - Payment confirmation
   - Refund processing
   - Webhook handling

4. **Delivery System**
   - Email delivery
   - SMS delivery
   - PDF generation
   - Shareable links
   - Scheduled delivery

5. **Redemption System**
   - QR code redemption
   - Manual code entry
   - Link-based redemption
   - API-based redemption
   - Partial redemption support

6. **Analytics and Reporting**
   - Sales analytics
   - Redemption analytics
   - Customer analytics
   - Gift card statistics
   - Custom date ranges
   - Export capabilities

7. **Administrative Functions**
   - Platform-wide management
   - Communication settings
   - Audit logging
   - System configuration

8. **Merchant Features**
   - Balance tracking
   - Payout management
   - Own analytics
   - Gift card management

### 2.3 User Classes and Characteristics

#### 2.3.1 Administrators
- **Characteristics:** Technical expertise, system management responsibilities
- **Needs:** Full platform access, analytics, system configuration, user management
- **Access Level:** Complete platform access, all merchant and customer data
- **Primary Functions:** System administration, monitoring, configuration

#### 2.3.2 Merchants
- **Characteristics:** Business owners, varying technical expertise
- **Needs:** Easy gift card creation, sales tracking, redemption management, analytics
- **Access Level:** Own data only, gift card management, analytics for own business
- **Primary Functions:** Create/manage gift cards, process redemptions, view analytics

#### 2.3.3 Customers
- **Characteristics:** End-users, minimal technical expertise
- **Needs:** Easy purchase, gift card management, redemption, balance checking
- **Access Level:** Own purchases and gift cards only
- **Primary Functions:** Browse products, purchase gift cards, redeem gift cards

#### 2.3.4 Public Users
- **Characteristics:** Unauthenticated users
- **Needs:** Browse products, validate gift cards, redeem via links
- **Access Level:** Public information only
- **Primary Functions:** Product discovery, gift card validation, link-based redemption

### 2.4 Operating Environment

**Server Environment:**
- Node.js 18+ runtime
- PostgreSQL 15+ database
- Redis 7+ for caching
- Linux-based operating system (Ubuntu, Debian, or similar)
- Docker containerization support

**Client Environment:**
- Modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design for desktop, tablet, and mobile
- Progressive Web App (PWA) support

**Network Environment:**
- HTTPS/TLS 1.2+ for all communications
- Internet connectivity required
- CDN support for static assets (optional)

### 2.5 Design and Implementation Constraints

**Technology Constraints:**
- Backend: Node.js with Express.js framework
- Frontend: Next.js 14 with React 18
- Database: PostgreSQL (Prisma ORM)
- Language: TypeScript throughout
- Authentication: JWT-based

**Regulatory Constraints:**
- PCI DSS compliance for payment processing
- GDPR compliance for EU users
- Data protection regulations
- Gift card regulations (varies by region)

**Performance Constraints:**
- API response time: < 500ms for 99% of requests
- Page load time: < 2 seconds
- Support for 10,000+ concurrent users
- Database query optimization required

**Security Constraints:**
- All sensitive data encrypted in transit and at rest
- Secure password storage (bcrypt hashing)
- Rate limiting on all endpoints
- CSRF protection for state-changing operations
- XSS protection for all user inputs

### 2.6 Assumptions and Dependencies

**Assumptions:**
1. Users have reliable internet connectivity
2. Users have modern web browsers
3. Payment gateway services are available and operational
4. Email/SMS services are available and operational
5. Database and Redis services are available and operational
6. Users understand basic web application usage
7. Merchants have valid business information

**Dependencies:**
1. **External Services:**
   - Payment gateways (Stripe, PayPal, Razorpay, UPI)
   - Email service (SendGrid, Brevo, or SMTP)
   - SMS service (Twilio, Brevo)
   - Cloud storage (AWS S3 - optional)

2. **Infrastructure:**
   - PostgreSQL database server
   - Redis server
   - Web server (Node.js runtime)
   - SSL/TLS certificates

3. **Libraries and Frameworks:**
   - Express.js for backend API
   - Next.js for frontend
   - Prisma for database ORM
   - JWT libraries for authentication
   - Payment gateway SDKs

---

## 3. System Features and Requirements

### 3.1 Functional Requirements

#### 3.1.1 User Management and Authentication

**FR-1.1: User Registration**
- **Description:** Users can register for new accounts
- **Priority:** High
- **Input:** Email, password, first name, last name, role (optional), business name (for merchants)
- **Processing:**
  - Validate email format and uniqueness
  - Validate password complexity (min 8 chars, uppercase, lowercase, number, special char)
  - Hash password using bcrypt
  - Create user record with default role (CUSTOMER)
  - Generate email verification token
  - Send verification email
- **Output:** User account created, verification email sent
- **Error Handling:** Invalid email format, duplicate email, weak password

**FR-1.2: User Login**
- **Description:** Authenticated users can log in to the system
- **Priority:** High
- **Input:** Email, password
- **Processing:**
  - Validate credentials
  - Check account lockout status
  - Verify email (if required)
  - Check failed login attempts
  - Generate JWT access token and refresh token
  - Store refresh token in database
  - Log authentication attempt (audit log)
  - Reset failed login attempts on success
- **Output:** Access token, refresh token, user information
- **Error Handling:** Invalid credentials, account locked, email not verified

**FR-1.3: Token Refresh**
- **Description:** Users can refresh expired access tokens
- **Priority:** High
- **Input:** Refresh token
- **Processing:**
  - Validate refresh token
  - Check token expiry
  - Verify token not revoked
  - Generate new access token
  - Update token last used timestamp
- **Output:** New access token
- **Error Handling:** Invalid token, expired token, revoked token

**FR-1.4: Email Verification**
- **Description:** Users verify their email addresses
- **Priority:** Medium
- **Input:** Verification token
- **Processing:**
  - Validate token
  - Check token expiry
  - Mark email as verified
  - Delete verification token
- **Output:** Email verified status
- **Error Handling:** Invalid token, expired token

**FR-1.5: Password Reset**
- **Description:** Users can reset forgotten passwords
- **Priority:** High
- **Input:** Email (request), token and new password (reset)
- **Processing:**
  - Generate password reset token
  - Send reset email with token
  - Validate token on reset
  - Validate new password complexity
  - Update password hash
  - Invalidate all refresh tokens
  - Mark token as used
- **Output:** Reset email sent, password updated
- **Error Handling:** Invalid email, expired token, weak password

**FR-1.6: Account Lockout**
- **Description:** System locks accounts after failed login attempts
- **Priority:** Medium
- **Input:** Failed login attempt
- **Processing:**
  - Increment failed login attempts
  - Lock account after 5 failed attempts
  - Set lockout duration (30 minutes)
  - Prevent login during lockout
- **Output:** Account locked status
- **Error Handling:** Account already locked

**FR-1.7: Two-Factor Authentication (2FA)**
- **Description:** Users can enable 2FA for enhanced security
- **Priority:** Medium
- **Input:** TOTP code, backup codes
- **Processing:**
  - Generate TOTP secret
  - Generate backup codes
  - Verify TOTP code
  - Enable 2FA on account
  - Store secret and backup codes (hashed)
- **Output:** 2FA enabled, QR code for authenticator app, backup codes
- **Error Handling:** Invalid TOTP code, expired setup

**FR-1.8: Session Management**
- **Description:** System manages user sessions and devices
- **Priority:** Medium
- **Input:** Device information, user agent, IP address
- **Processing:**
  - Track active sessions per user
  - Store device information
  - Track last used timestamp
  - Allow logout from all devices
  - Revoke refresh tokens
- **Output:** Active sessions list, logout confirmation
- **Error Handling:** Invalid session

**FR-1.9: Profile Management**
- **Description:** Users can view and update their profiles
- **Priority:** Medium
- **Input:** Profile data (name, business name, logo, etc.)
- **Processing:**
  - Validate input data
  - Update user record
  - Handle file uploads (logo)
  - Update timestamps
- **Output:** Updated profile information
- **Error Handling:** Invalid data, file upload errors

#### 3.1.2 Gift Card Management

**FR-2.1: Single Gift Card Creation**
- **Description:** Merchants/Admins can create individual gift cards
- **Priority:** High
- **Input:** Value, currency, expiry date, recipient details, template, custom message, partial redemption setting
- **Processing:**
  - Generate unique gift card code
  - Generate QR code
  - Create gift card record
  - Set initial balance equal to value
  - Set status to ACTIVE
  - Associate with merchant
  - Apply template if provided
- **Output:** Created gift card with code and QR code
- **Error Handling:** Invalid value, invalid expiry date, template not found

**FR-2.2: Bulk Gift Card Creation**
- **Description:** Merchants/Admins can create multiple gift cards at once
- **Priority:** Medium
- **Input:** Count, default values, CSV/Excel file (optional)
- **Processing:**
  - Validate input data
  - Generate unique codes for each card
  - Generate QR codes
  - Create multiple gift card records
  - Process in batches for performance
  - Return creation summary
- **Output:** List of created gift cards, summary statistics
- **Error Handling:** Invalid count, file format errors, duplicate codes

**FR-2.3: Gift Card Update**
- **Description:** Merchants/Admins can update gift card details
- **Priority:** Medium
- **Input:** Gift card ID, updated fields
- **Processing:**
  - Verify ownership/authorization
  - Validate updated data
  - Update gift card record
  - Invalidate cache
  - Update timestamps
- **Output:** Updated gift card information
- **Error Handling:** Unauthorized access, invalid data, gift card not found

**FR-2.4: Gift Card Deletion**
- **Description:** Merchants/Admins can delete/cancel gift cards
- **Priority:** Medium
- **Input:** Gift card ID
- **Processing:**
  - Verify ownership/authorization
  - Check if gift card can be deleted (not redeemed)
  - Update status to CANCELLED or delete record
  - Invalidate cache
- **Output:** Deletion confirmation
- **Error Handling:** Unauthorized access, gift card already redeemed

**FR-2.5: Gift Card Listing**
- **Description:** Users can list gift cards with filtering and pagination
- **Priority:** High
- **Input:** Filters (status, merchant, date range), pagination (page, limit)
- **Processing:**
  - Apply role-based filtering (merchants see own, admins see all)
  - Apply additional filters
  - Paginate results
  - Cache results
  - Return paginated list
- **Output:** Paginated list of gift cards, pagination metadata
- **Error Handling:** Invalid filters, pagination errors

**FR-2.6: Gift Card Lookup**
- **Description:** Users can search for gift cards by code or ID
- **Priority:** High
- **Input:** Gift card code or ID
- **Processing:**
  - Search by code or ID
  - Verify access permissions
  - Return gift card details
  - Cache result
- **Output:** Gift card details
- **Error Handling:** Gift card not found, unauthorized access

**FR-2.7: QR Code Generation**
- **Description:** System generates QR codes for gift cards
- **Priority:** High
- **Input:** Gift card ID or code
- **Processing:**
  - Generate QR code image
  - Store QR code URL
  - Return QR code image or URL
- **Output:** QR code image or URL
- **Error Handling:** Gift card not found, generation error

**FR-2.8: Gift Card Expiry Management**
- **Description:** System automatically manages gift card expiry
- **Priority:** High
- **Input:** Scheduled job trigger
- **Processing:**
  - Check gift cards for expiry
  - Update expired cards to EXPIRED status
  - Send expiry notifications (if configured)
  - Log expiry events
- **Output:** Expired gift cards updated
- **Error Handling:** Job execution errors

#### 3.1.3 Gift Card Templates

**FR-3.1: Template Creation**
- **Description:** Merchants/Admins can create gift card templates
- **Priority:** Medium
- **Input:** Template name, description, design data (colors, images, layout), public/private setting
- **Processing:**
  - Validate design data
  - Create template record
  - Associate with merchant
  - Store design configuration
- **Output:** Created template
- **Error Handling:** Invalid design data, duplicate name

**FR-3.2: Template Update**
- **Description:** Merchants/Admins can update templates
- **Priority:** Medium
- **Input:** Template ID, updated fields
- **Processing:**
  - Verify ownership/authorization
  - Validate updated data
  - Update template record
  - Update timestamps
- **Output:** Updated template
- **Error Handling:** Unauthorized access, template not found

**FR-3.3: Template Deletion**
- **Description:** Merchants/Admins can delete templates
- **Priority:** Low
- **Input:** Template ID
- **Processing:**
  - Verify ownership/authorization
  - Check if template is in use
  - Delete template (or set null on gift cards)
  - Update timestamps
- **Output:** Deletion confirmation
- **Error Handling:** Template in use, unauthorized access

**FR-3.4: Template Listing**
- **Description:** Users can list available templates
- **Priority:** Medium
- **Input:** Filters (merchant, public/private), pagination
- **Processing:**
  - Apply filters
  - Return public templates and own templates
  - Paginate results
- **Output:** Paginated list of templates
- **Error Handling:** Invalid filters

#### 3.1.4 Gift Card Products

**FR-4.1: Product Creation**
- **Description:** Merchants/Admins can create sellable gift card products
- **Priority:** High
- **Input:** Name, description, image, pricing configuration, expiry days, category, tags, template
- **Processing:**
  - Validate pricing configuration
  - Create product record
  - Associate with merchant
  - Set active status
  - Configure public/private setting
- **Output:** Created product
- **Error Handling:** Invalid pricing, missing required fields

**FR-4.2: Product Update**
- **Description:** Merchants/Admins can update products
- **Priority:** Medium
- **Input:** Product ID, updated fields
- **Processing:**
  - Verify ownership/authorization
  - Validate updated data
  - Update product record
  - Invalidate cache
- **Output:** Updated product
- **Error Handling:** Unauthorized access, invalid data

**FR-4.3: Product Deletion**
- **Description:** Merchants/Admins can delete products
- **Priority:** Low
- **Input:** Product ID
- **Processing:**
  - Verify ownership/authorization
  - Check if product has associated gift cards
  - Delete or deactivate product
  - Invalidate cache
- **Output:** Deletion confirmation
- **Error Handling:** Product in use, unauthorized access

**FR-4.4: Public Product Listing**
- **Description:** Public users can browse public products
- **Priority:** High
- **Input:** Filters (category, search, merchant), pagination
- **Processing:**
  - Filter by public and active products
  - Apply search and category filters
  - Paginate results
  - Cache results
- **Output:** Paginated list of public products
- **Error Handling:** Invalid filters

**FR-4.5: Product Details**
- **Description:** Users can view product details
- **Priority:** High
- **Input:** Product ID
- **Processing:**
  - Retrieve product
  - Check access permissions (public or owner)
  - Return product details
  - Cache result
- **Output:** Product details
- **Error Handling:** Product not found, unauthorized access

#### 3.1.5 Payment Processing

**FR-5.1: Payment Intent Creation**
- **Description:** System creates payment intents for gift card purchases
- **Priority:** High
- **Input:** Gift card details, amount, currency, payment method, customer ID
- **Processing:**
  - Create gift card
  - Create payment record (PENDING status)
  - Initialize payment gateway (Stripe/PayPal/Razorpay/UPI)
  - Generate payment intent/order
  - Return payment details
- **Output:** Payment intent ID, client secret (if applicable), payment details
- **Error Handling:** Invalid amount, payment gateway error, gift card creation error

**FR-5.2: Payment from Product**
- **Description:** Customers can purchase gift cards from products
- **Priority:** High
- **Input:** Product ID, amount (if variable), recipient details, payment method, customer ID
- **Processing:**
  - Retrieve product
  - Validate amount (if variable)
  - Create gift card with product configuration
  - Create payment intent
  - Initialize payment gateway
  - Return payment details
- **Output:** Payment intent, gift card details
- **Error Handling:** Product not found, invalid amount, payment gateway error

**FR-5.3: Bulk Purchase**
- **Description:** Customers can purchase multiple gift cards in one transaction
- **Priority:** Medium
- **Input:** Product ID or merchant ID, recipients array, payment method, customer ID
- **Processing:**
  - Validate recipients data
  - Create multiple gift cards
  - Calculate total amount
  - Create single payment for total
  - Initialize payment gateway
  - Return payment and gift cards
- **Output:** Payment intent, list of created gift cards
- **Error Handling:** Invalid recipients, payment gateway error

**FR-5.4: Payment Confirmation**
- **Description:** System confirms completed payments
- **Priority:** High
- **Input:** Payment intent ID, payment gateway response
- **Processing:**
  - Verify payment with gateway
  - Update payment status to COMPLETED
  - Activate gift card (if not already active)
  - Trigger delivery (if configured)
  - Update merchant balance (if applicable)
  - Send confirmation notifications
- **Output:** Confirmed payment, activated gift card
- **Error Handling:** Payment verification failed, gateway error

**FR-5.5: Payment Webhook Handling**
- **Description:** System processes webhooks from payment gateways
- **Priority:** High
- **Input:** Webhook payload, signature
- **Processing:**
  - Verify webhook signature
  - Parse webhook event
  - Update payment status
  - Update gift card status
  - Trigger appropriate actions
  - Log webhook event
- **Output:** Webhook processed confirmation
- **Error Handling:** Invalid signature, unknown event type

**FR-5.6: Payment Refund**
- **Description:** Merchants/Admins can process refunds
- **Priority:** Medium
- **Input:** Payment ID, refund amount, reason
- **Processing:**
  - Verify authorization
  - Retrieve payment
  - Validate refund amount
  - Process refund with payment gateway
  - Update payment status to REFUNDED
  - Update gift card status (cancel or reduce balance)
  - Create refund transaction
  - Send refund notification
- **Output:** Refund confirmation
- **Error Handling:** Unauthorized access, refund amount exceeds payment, gateway error

**FR-5.7: Payment Listing**
- **Description:** Users can view payment history
- **Priority:** Medium
- **Input:** Filters (status, method, date range), pagination
- **Processing:**
  - Apply role-based filtering
  - Apply additional filters
  - Paginate results
  - Return payment list
- **Output:** Paginated list of payments
- **Error Handling:** Invalid filters

#### 3.1.6 Delivery System

**FR-6.1: Email Delivery**
- **Description:** System sends gift cards via email
- **Priority:** High
- **Input:** Gift card ID, recipient email, custom message
- **Processing:**
  - Check communication settings (admin controls)
  - Retrieve gift card details
  - Generate email template
  - Include gift card code, QR code, redemption link
  - Send email via email service
  - Log communication
  - Update delivery status
- **Output:** Email sent confirmation
- **Error Handling:** Email service disabled, invalid email, service error

**FR-6.2: SMS Delivery**
- **Description:** System sends gift cards via SMS
- **Priority:** Medium
- **Input:** Gift card ID, recipient phone, custom message
- **Processing:**
  - Check communication settings (admin controls)
  - Retrieve gift card details
  - Generate SMS message
  - Include gift card code and redemption link
  - Send SMS via SMS service
  - Log communication
  - Update delivery status
- **Output:** SMS sent confirmation
- **Error Handling:** SMS service disabled, invalid phone, service error

**FR-6.3: PDF Generation**
- **Description:** System generates PDF gift cards
- **Priority:** Medium
- **Input:** Gift card ID
- **Processing:**
  - Retrieve gift card details
  - Generate PDF with gift card information
  - Include QR code, code, merchant branding
  - Save PDF file
  - Return PDF URL or stream
- **Output:** PDF file or URL
- **Error Handling:** Gift card not found, PDF generation error

**FR-6.4: Scheduled Delivery**
- **Description:** System can schedule gift card delivery for future dates
- **Priority:** Low
- **Input:** Gift card ID, delivery date/time, delivery method
- **Processing:**
  - Validate delivery date
  - Schedule delivery job
  - Store delivery configuration
  - Execute at scheduled time
- **Output:** Delivery scheduled confirmation
- **Error Handling:** Invalid date, past date

**FR-6.5: Expiry Reminders**
- **Description:** System sends reminders before gift card expiry
- **Priority:** Medium
- **Input:** Scheduled job trigger
- **Processing:**
  - Find gift cards expiring soon (configurable days)
  - Check if reminder already sent
  - Send reminder email/SMS
  - Log reminder sent
  - Mark reminder as sent
- **Output:** Reminders sent
- **Error Handling:** Communication service errors

#### 3.1.7 Redemption System

**FR-7.1: QR Code Redemption**
- **Description:** Merchants can redeem gift cards by scanning QR codes
- **Priority:** High
- **Input:** QR code data, redemption amount, merchant ID
- **Processing:**
  - Decode QR code
  - Retrieve gift card by code
  - Validate gift card (status, balance, expiry)
  - Process redemption
  - Update gift card balance
  - Create redemption record
  - Create transaction record
  - Update merchant balance
  - Send confirmation notifications
- **Output:** Redemption confirmation, updated balance
- **Error Handling:** Invalid QR code, expired card, insufficient balance

**FR-7.2: Manual Code Redemption**
- **Description:** Merchants can redeem gift cards by entering codes manually
- **Priority:** High
- **Input:** Gift card code, redemption amount, merchant ID
- **Processing:**
  - Retrieve gift card by code
  - Validate gift card (status, balance, expiry)
  - Process redemption
  - Update gift card balance
  - Create redemption record
  - Create transaction record
  - Update merchant balance
  - Send confirmation notifications
- **Output:** Redemption confirmation, updated balance
- **Error Handling:** Invalid code, expired card, insufficient balance

**FR-7.3: Link-Based Redemption**
- **Description:** Public users can redeem gift cards via redemption links
- **Priority:** High
- **Input:** Gift card code, redemption amount, merchant ID
- **Processing:**
  - Retrieve gift card by code
  - Validate gift card (status, balance, expiry)
  - Process redemption
  - Update gift card balance
  - Create redemption record
  - Create transaction record
  - Update merchant balance
  - Send confirmation notifications
- **Output:** Redemption confirmation, updated balance
- **Error Handling:** Invalid code, expired card, insufficient balance

**FR-7.4: API-Based Redemption**
- **Description:** POS systems can redeem gift cards via API
- **Priority:** Medium
- **Input:** Gift card code, redemption amount, API key
- **Processing:**
  - Authenticate API key
  - Retrieve gift card by code
  - Validate gift card (status, balance, expiry)
  - Process redemption
  - Update gift card balance
  - Create redemption record
  - Create transaction record
  - Update merchant balance
  - Return redemption confirmation
- **Output:** Redemption confirmation (JSON)
- **Error Handling:** Invalid API key, invalid code, expired card, insufficient balance

**FR-7.5: Partial Redemption**
- **Description:** System supports partial redemption of gift cards
- **Priority:** High
- **Input:** Gift card ID/code, redemption amount
- **Processing:**
  - Check if partial redemption allowed
  - Validate amount (must be less than balance)
  - Deduct amount from balance
  - Keep gift card ACTIVE if balance > 0
  - Create redemption record
  - Create transaction record
- **Output:** Redemption confirmation, remaining balance
- **Error Handling:** Partial redemption not allowed, amount exceeds balance

**FR-7.6: Gift Card Validation**
- **Description:** System validates gift card codes (public endpoint)
- **Priority:** High
- **Input:** Gift card code
- **Processing:**
  - Retrieve gift card by code
  - Check status (must be ACTIVE)
  - Check expiry date
  - Return validation result
- **Output:** Validation result (valid/invalid, balance, status, expiry)
- **Error Handling:** Code not found

**FR-7.7: Balance Checking**
- **Description:** Users can check gift card balance (public endpoint)
- **Priority:** High
- **Input:** Gift card code
- **Processing:**
  - Retrieve gift card by code
  - Return balance and status
- **Output:** Balance, status, expiry date
- **Error Handling:** Code not found

**FR-7.8: Redemption History**
- **Description:** Users can view redemption history
- **Priority:** Medium
- **Input:** Filters (gift card, merchant, date range), pagination
- **Processing:**
  - Apply role-based filtering
  - Apply additional filters
  - Paginate results
  - Return redemption list
- **Output:** Paginated list of redemptions
- **Error Handling:** Invalid filters

#### 3.1.8 Analytics and Reporting

**FR-8.1: Sales Analytics**
- **Description:** Merchants/Admins can view sales analytics
- **Priority:** High
- **Input:** Filters (merchant ID, date range)
- **Processing:**
  - Query completed payments
  - Calculate total revenue
  - Calculate total transactions
  - Calculate average transaction value
  - Group by payment method
  - Group by currency
  - Return analytics data
- **Output:** Sales analytics (revenue, transactions, averages, breakdowns)
- **Error Handling:** Invalid filters, data access errors

**FR-8.2: Redemption Analytics**
- **Description:** Merchants/Admins can view redemption analytics
- **Priority:** High
- **Input:** Filters (merchant ID, date range)
- **Processing:**
  - Query redemptions
  - Calculate total redemptions
  - Calculate total redemption value
  - Calculate average redemption amount
  - Group by redemption method
  - Return analytics data
- **Output:** Redemption analytics (count, value, averages, method breakdown)
- **Error Handling:** Invalid filters, data access errors

**FR-8.3: Customer Analytics**
- **Description:** Merchants/Admins can view customer analytics
- **Priority:** Medium
- **Input:** Filters (merchant ID, date range)
- **Processing:**
  - Query customers and purchases
  - Calculate unique customers
  - Calculate customer purchase frequency
  - Calculate average customer value
  - Identify top customers
  - Return analytics data
- **Output:** Customer analytics (count, frequency, value, top customers)
- **Error Handling:** Invalid filters, data access errors

**FR-8.4: Gift Card Statistics**
- **Description:** Merchants/Admins can view gift card statistics
- **Priority:** Medium
- **Input:** Filters (merchant ID)
- **Processing:**
  - Query gift cards
  - Count by status (ACTIVE, REDEEMED, EXPIRED, CANCELLED)
  - Calculate total value
  - Calculate average value
  - Return statistics
- **Output:** Gift card statistics (counts, values, averages, status distribution)
- **Error Handling:** Invalid filters, data access errors

#### 3.1.9 Gift Card Sharing

**FR-9.1: Share Token Generation**
- **Description:** Users can generate share tokens for gift cards
- **Priority:** Medium
- **Input:** Gift card ID, expiry hours
- **Processing:**
  - Verify ownership/access
  - Generate unique share token
  - Set token expiry
  - Update gift card with share token
  - Return share token and URL
- **Output:** Share token, share URL, expiry date
- **Error Handling:** Unauthorized access, gift card not found

**FR-9.2: View via Share Token**
- **Description:** Public users can view gift cards via share tokens
- **Priority:** Medium
- **Input:** Share token
- **Processing:**
  - Retrieve gift card by share token
  - Validate token expiry
  - Return gift card details (limited information)
- **Output:** Gift card details (public view)
- **Error Handling:** Invalid token, expired token

**FR-9.3: Share Token Revocation**
- **Description:** Users can revoke share tokens
- **Priority:** Low
- **Input:** Gift card ID
- **Processing:**
  - Verify ownership
  - Remove share token from gift card
  - Invalidate token
- **Output:** Revocation confirmation
- **Error Handling:** Unauthorized access, gift card not found

**FR-9.4: NFC Data Generation**
- **Description:** System generates NFC data for gift cards
- **Priority:** Low
- **Input:** Gift card ID
- **Processing:**
  - Verify ownership/access
  - Generate NFC-compatible data
  - Return NFC data
- **Output:** NFC data payload
- **Error Handling:** Unauthorized access, gift card not found

#### 3.1.10 File Management

**FR-10.1: Image Upload**
- **Description:** Merchants/Admins can upload images
- **Priority:** Medium
- **Input:** Image file(s), upload type
- **Processing:**
  - Validate file type (images only)
  - Validate file size (max 10MB)
  - Generate unique filename
  - Save file to storage
  - Return file URL
- **Output:** Uploaded file URL
- **Error Handling:** Invalid file type, file too large, upload error

**FR-10.2: Multiple Image Upload**
- **Description:** Merchants/Admins can upload multiple images
- **Priority:** Low
- **Input:** Multiple image files (max 10)
- **Processing:**
  - Validate each file
  - Process uploads
  - Return list of file URLs
- **Output:** List of uploaded file URLs
- **Error Handling:** Too many files, invalid files, upload errors

**FR-10.3: File Deletion**
- **Description:** Merchants/Admins can delete uploaded files
- **Priority:** Low
- **Input:** Filename
- **Processing:**
  - Verify ownership/authorization
  - Delete file from storage
  - Return deletion confirmation
- **Output:** Deletion confirmation
- **Error Handling:** File not found, unauthorized access

#### 3.1.11 Administrative Features

**FR-11.1: Communication Settings Management**
- **Description:** Admins can manage communication channel settings
- **Priority:** High
- **Input:** Communication settings (enable/disable channels, rate limits, etc.)
- **Processing:**
  - Update communication settings
  - Validate rate limits
  - Store settings in database
  - Log admin action
- **Output:** Updated settings
- **Error Handling:** Invalid settings, unauthorized access

**FR-11.2: Communication Logs Viewing**
- **Description:** Admins can view communication logs
- **Priority:** Medium
- **Input:** Filters (channel, recipient, status, date range), pagination
- **Processing:**
  - Query communication logs
  - Apply filters
  - Paginate results
  - Return log list
- **Output:** Paginated list of communication logs
- **Error Handling:** Invalid filters

**FR-11.3: Communication Statistics**
- **Description:** Admins can view communication statistics
- **Priority:** Medium
- **Input:** Filters (channel, date range)
- **Processing:**
  - Query communication logs
  - Calculate statistics by channel
  - Calculate success/failure rates
  - Return statistics
- **Output:** Communication statistics
- **Error Handling:** Invalid filters

**FR-11.4: Audit Log Management**
- **Description:** Admins can view and export audit logs
- **Priority:** High
- **Input:** Filters (user, action, resource type, date range), pagination
- **Processing:**
  - Query audit logs
  - Apply filters
  - Paginate results
  - Return log list
- **Output:** Paginated list of audit logs
- **Error Handling:** Invalid filters

**FR-11.5: Audit Log Export**
- **Description:** Admins can export audit logs
- **Priority:** Medium
- **Input:** Filters, export format (CSV, JSON)
- **Processing:**
  - Query audit logs with filters
  - Format data for export
  - Generate export file
  - Return download link
- **Output:** Export file
- **Error Handling:** Export error, invalid format

**FR-11.6: Audit Log Statistics**
- **Description:** Admins can view audit log statistics
- **Priority:** Low
- **Input:** Filters (date range)
- **Processing:**
  - Query audit logs
  - Calculate statistics (actions by type, users, resources)
  - Return statistics
- **Output:** Audit log statistics
- **Error Handling:** Invalid filters

#### 3.1.12 Background Jobs and Scheduling

**FR-12.1: Gift Card Expiry Check**
- **Description:** System automatically checks and updates expired gift cards
- **Priority:** High
- **Input:** Scheduled job trigger (daily at 2 AM)
- **Processing:**
  - Query gift cards with expiry dates
  - Check if expired
  - Update status to EXPIRED
  - Log expiry events
- **Output:** Expired gift cards updated
- **Error Handling:** Job execution errors

**FR-12.2: Expiry Reminder Job**
- **Description:** System sends expiry reminders
- **Priority:** Medium
- **Input:** Scheduled job trigger (daily at 9 AM)
- **Processing:**
  - Find gift cards expiring soon
  - Check if reminder already sent
  - Send reminder emails/SMS
  - Log reminders
- **Output:** Reminders sent
- **Error Handling:** Communication service errors

**FR-12.3: Token Cleanup Job**
- **Description:** System cleans up expired tokens
- **Priority:** Medium
- **Input:** Scheduled job trigger (daily at 3 AM)
- **Processing:**
  - Find expired tokens (email verification, password reset, OTP)
  - Delete expired tokens
  - Log cleanup statistics
- **Output:** Tokens cleaned up
- **Error Handling:** Job execution errors

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements

**NFR-1.1: Response Time**
- **Requirement:** 95% of API requests must be served within 2 seconds
- **Priority:** High
- **Measurement:** P95 response time
- **Target:** < 2 seconds

**NFR-1.2: API Response Time**
- **Requirement:** 99% of API requests must respond within 500ms
- **Priority:** High
- **Measurement:** P99 response time
- **Target:** < 500ms

**NFR-1.3: Page Load Time**
- **Requirement:** Frontend pages must load within 2 seconds
- **Priority:** High
- **Measurement:** Time to First Contentful Paint (FCP)
- **Target:** < 2 seconds

**NFR-1.4: Concurrent Users**
- **Requirement:** System must support 10,000+ concurrent users
- **Priority:** High
- **Measurement:** Concurrent active sessions
- **Target:** 10,000+ users

**NFR-1.5: Database Query Performance**
- **Requirement:** Database queries must complete within 100ms for 95% of queries
- **Priority:** High
- **Measurement:** Query execution time
- **Target:** P95 < 100ms

**NFR-1.6: Caching Effectiveness**
- **Requirement:** Cache hit rate should be > 80% for frequently accessed data
- **Priority:** Medium
- **Measurement:** Cache hit ratio
- **Target:** > 80%

#### 3.2.2 Security Requirements

**NFR-2.1: Data Encryption**
- **Requirement:** All sensitive data must be encrypted in transit (TLS 1.2+) and at rest
- **Priority:** Critical
- **Implementation:** TLS for transport, database encryption for storage

**NFR-2.2: Password Security**
- **Requirement:** Passwords must be hashed using bcrypt with minimum 10 rounds
- **Priority:** Critical
- **Implementation:** bcrypt hashing, password complexity validation

**NFR-2.3: Authentication Security**
- **Requirement:** JWT tokens must have secure configuration (short expiry, secure secrets)
- **Priority:** Critical
- **Implementation:** Access tokens (7 days), refresh tokens (30 days), secure secrets (32+ chars)

**NFR-2.4: Rate Limiting**
- **Requirement:** All endpoints must have rate limiting to prevent abuse
- **Priority:** High
- **Implementation:** Express rate limiting middleware, Redis-based rate limiting

**NFR-2.5: CSRF Protection**
- **Requirement:** All state-changing operations must be protected against CSRF attacks
- **Priority:** High
- **Implementation:** Double-submit cookie pattern, CSRF token validation

**NFR-2.6: XSS Protection**
- **Requirement:** All user inputs must be sanitized to prevent XSS attacks
- **Priority:** High
- **Implementation:** Input sanitization, output encoding, Content Security Policy

**NFR-2.7: SQL Injection Prevention**
- **Requirement:** All database queries must use parameterized queries
- **Priority:** Critical
- **Implementation:** Prisma ORM with parameterized queries

**NFR-2.8: Security Headers**
- **Requirement:** All responses must include security headers (CSP, HSTS, etc.)
- **Priority:** High
- **Implementation:** Helmet.js middleware

**NFR-2.9: Audit Logging**
- **Requirement:** All sensitive operations must be logged for audit purposes
- **Priority:** High
- **Implementation:** Comprehensive audit logging system

**NFR-2.10: Account Security**
- **Requirement:** Accounts must be locked after 5 failed login attempts for 30 minutes
- **Priority:** Medium
- **Implementation:** Failed login attempt tracking, account lockout

#### 3.2.3 Reliability Requirements

**NFR-3.1: Uptime**
- **Requirement:** System must maintain 99.9% uptime
- **Priority:** High
- **Measurement:** Monthly uptime percentage
- **Target:** 99.9% (maximum 43.2 minutes downtime per month)

**NFR-3.2: Error Handling**
- **Requirement:** All errors must be handled gracefully with user-friendly messages
- **Priority:** High
- **Implementation:** Comprehensive error handling middleware

**NFR-3.3: Data Backup**
- **Requirement:** Database must be backed up daily with point-in-time recovery
- **Priority:** High
- **Implementation:** Automated daily backups, backup retention

**NFR-3.4: Disaster Recovery**
- **Requirement:** System must have disaster recovery plan with RTO < 4 hours
- **Priority:** Medium
- **Implementation:** Backup and restore procedures, multi-region deployment (future)

**NFR-3.5: Transaction Integrity**
- **Requirement:** All financial transactions must maintain ACID properties
- **Priority:** Critical
- **Implementation:** Database transactions, rollback on errors

#### 3.2.4 Usability Requirements

**NFR-4.1: Responsive Design**
- **Requirement:** Interface must be responsive for desktop, tablet, and mobile devices
- **Priority:** High
- **Implementation:** Responsive CSS, mobile-first design

**NFR-4.2: Accessibility**
- **Requirement:** Interface must comply with WCAG 2.1 AA standards
- **Priority:** Medium
- **Implementation:** ARIA labels, keyboard navigation, screen reader support

**NFR-4.3: User Interface**
- **Requirement:** Interface must be intuitive and easy to use
- **Priority:** High
- **Implementation:** Clear navigation, helpful error messages, loading states

**NFR-4.4: Browser Compatibility**
- **Requirement:** Interface must work on latest 2 versions of major browsers
- **Priority:** High
- **Supported Browsers:** Chrome, Firefox, Safari, Edge

**NFR-4.5: Multi-language Support**
- **Requirement:** System should support multiple languages (i18n)
- **Priority:** Low
- **Implementation:** Internationalization framework (future)

#### 3.2.5 Scalability Requirements

**NFR-5.1: Horizontal Scaling**
- **Requirement:** System architecture must support horizontal scaling
- **Priority:** High
- **Implementation:** Stateless API design, load balancing, distributed caching
- **Target:** Support multiple server instances

**NFR-5.2: Database Scalability**
- **Requirement:** Database must handle increasing data volume efficiently
- **Priority:** High
- **Implementation:** Database indexing, query optimization, connection pooling
- **Target:** Support millions of records

**NFR-5.3: Caching Strategy**
- **Requirement:** System must implement effective caching to reduce database load
- **Priority:** Medium
- **Implementation:** Redis caching, cache invalidation strategies
- **Target:** 80%+ cache hit rate

**NFR-5.4: Queue System**
- **Requirement:** Background jobs must use queue system for scalability
- **Priority:** Medium
- **Implementation:** BullMQ with Redis, job workers
- **Target:** Handle thousands of background jobs

#### 3.2.6 Maintainability Requirements

**NFR-6.1: Code Quality**
- **Requirement:** Code must follow TypeScript best practices with strict type checking
- **Priority:** High
- **Implementation:** TypeScript strict mode, ESLint, Prettier
- **Target:** Zero type errors, consistent code style

**NFR-6.2: Documentation**
- **Requirement:** Code must be well-documented with comments and API documentation
- **Priority:** Medium
- **Implementation:** JSDoc comments, API documentation, README files
- **Target:** Complete API documentation

**NFR-6.3: Modularity**
- **Requirement:** Code must be modular and maintainable
- **Priority:** High
- **Implementation:** Service layer pattern, separation of concerns
- **Target:** Easy to modify and extend

**NFR-6.4: Logging**
- **Requirement:** System must have comprehensive logging for debugging and monitoring
- **Priority:** High
- **Implementation:** Winston logger, structured logging, log levels
- **Target:** Complete request/response logging

#### 3.2.7 Portability Requirements

**NFR-7.1: Containerization**
- **Requirement:** System must be containerized for easy deployment
- **Priority:** High
- **Implementation:** Docker containers, Docker Compose
- **Target:** Deployable on any Docker-compatible platform

**NFR-7.2: Environment Configuration**
- **Requirement:** System must support environment-based configuration
- **Priority:** High
- **Implementation:** Environment variables, configuration files
- **Target:** Easy configuration for different environments

#### 3.2.8 Interoperability Requirements

**NFR-8.1: API Standards**
- **Requirement:** API must follow RESTful standards
- **Priority:** High
- **Implementation:** REST API design, JSON responses, HTTP status codes
- **Target:** Standard REST API

**NFR-8.2: Payment Gateway Integration**
- **Requirement:** System must integrate with multiple payment gateways
- **Priority:** High
- **Implementation:** Payment gateway SDKs, unified payment interface
- **Target:** Support Stripe, PayPal, Razorpay, UPI

**NFR-8.3: Webhook Support**
- **Requirement:** System must support webhooks for external integrations
- **Priority:** Medium
- **Implementation:** Webhook endpoints, signature verification
- **Target:** Secure webhook delivery

---

## 4. Database Schema and Data Models

### 4.1 Database Overview

**Database System:** PostgreSQL 15+  
**ORM:** Prisma  
**Connection:** Connection pooling with Prisma  
**Migrations:** Prisma Migrate

### 4.2 Entity Relationship Diagram (Conceptual)

```
User (1) ──< (N) GiftCard
User (1) ──< (N) GiftCardTemplate
User (1) ──< (N) GiftCardProduct
User (1) ──< (N) Payment
User (1) ──< (N) Redemption
User (1) ──< (N) Transaction
User (1) ──< (N) ApiKey
User (1) ──< (N) Webhook
User (1) ──< (N) Payout
User (1) ──< (N) RefreshToken

GiftCard (1) ──< (N) Payment
GiftCard (1) ──< (N) Redemption
GiftCard (1) ──< (N) Transaction
GiftCard (N) ──> (1) GiftCardTemplate
GiftCard (N) ──> (1) GiftCardProduct
GiftCard (N) ──> (1) User (Merchant)
```

### 4.3 Data Models

#### 4.3.1 User Model

**Table Name:** `users`

**Fields:**
- `id` (UUID, Primary Key)
- `email` (String, Unique, Required)
- `passwordHash` (String, Required)
- `firstName` (String, Optional)
- `lastName` (String, Optional)
- `role` (Enum: ADMIN, MERCHANT, CUSTOMER, Default: CUSTOMER)
- `businessName` (String, Optional)
- `businessLogo` (String, Optional)
- `isEmailVerified` (Boolean, Default: false)
- `isActive` (Boolean, Default: true)
- `merchantBalance` (Decimal(10,2), Default: 0)
- `failedLoginAttempts` (Integer, Default: 0)
- `lockedUntil` (DateTime, Optional)
- `twoFactorEnabled` (Boolean, Default: false)
- `twoFactorSecret` (String, Optional)
- `twoFactorBackupCodes` (JSON, Optional)
- `createdAt` (DateTime, Auto)
- `updatedAt` (DateTime, Auto)

**Indexes:**
- `email` (Unique)
- `role`
- `isActive`

**Relationships:**
- One-to-Many: GiftCards, Templates, Products, Payments, Redemptions, Transactions, ApiKeys, Webhooks, Payouts, RefreshTokens

#### 4.3.2 GiftCard Model

**Table Name:** `gift_cards`

**Fields:**
- `id` (UUID, Primary Key)
- `merchantId` (UUID, Foreign Key → users.id)
- `code` (String, Unique, Required)
- `qrCodeUrl` (String, Optional)
- `value` (Decimal(10,2), Required)
- `currency` (String, Default: "USD")
- `balance` (Decimal(10,2), Required)
- `status` (Enum: ACTIVE, REDEEMED, EXPIRED, CANCELLED, Default: ACTIVE)
- `expiryDate` (DateTime, Optional)
- `templateId` (UUID, Foreign Key → gift_card_templates.id, Optional)
- `productId` (UUID, Foreign Key → gift_card_products.id, Optional)
- `customMessage` (Text, Optional)
- `recipientEmail` (String, Optional)
- `recipientName` (String, Optional)
- `allowPartialRedemption` (Boolean, Default: true)
- `shareToken` (String, Unique, Optional)
- `shareTokenExpiry` (DateTime, Optional)
- `shareEnabled` (Boolean, Default: true)
- `createdAt` (DateTime, Auto)
- `updatedAt` (DateTime, Auto)

**Indexes:**
- `merchantId`
- `code` (Unique)
- `status`
- `productId`
- `shareToken` (Unique)

**Relationships:**
- Many-to-One: User (Merchant), GiftCardTemplate, GiftCardProduct
- One-to-Many: Payments, Redemptions, Transactions

#### 4.3.3 GiftCardTemplate Model

**Table Name:** `gift_card_templates`

**Fields:**
- `id` (UUID, Primary Key)
- `merchantId` (UUID, Foreign Key → users.id)
- `name` (String, Required)
- `description` (String, Optional)
- `designData` (JSON, Required) - Colors, images, layout
- `isPublic` (Boolean, Default: false)
- `createdAt` (DateTime, Auto)
- `updatedAt` (DateTime, Auto)

**Indexes:**
- `merchantId`
- `isPublic`

**Relationships:**
- Many-to-One: User (Merchant)
- One-to-Many: GiftCards, GiftCardProducts

#### 4.3.4 GiftCardProduct Model

**Table Name:** `gift_card_products`

**Fields:**
- `id` (UUID, Primary Key)
- `merchantId` (UUID, Foreign Key → users.id)
- `name` (String, Required)
- `description` (Text, Optional)
- `image` (String, Optional)
- `minAmount` (Decimal(10,2), Optional)
- `maxAmount` (Decimal(10,2), Optional)
- `minSalePrice` (Decimal(10,2), Optional)
- `maxSalePrice` (Decimal(10,2), Optional)
- `allowCustomAmount` (Boolean, Default: false)
- `fixedAmounts` (JSON, Optional) - Array of amounts
- `fixedSalePrices` (JSON, Optional) - Array of sale prices
- `currency` (String, Default: "USD")
- `expiryDays` (Integer, Optional)
- `templateId` (UUID, Foreign Key → gift_card_templates.id, Optional)
- `category` (String, Optional)
- `tags` (JSON, Optional) - Array of strings
- `isActive` (Boolean, Default: true)
- `isPublic` (Boolean, Default: false)
- `createdAt` (DateTime, Auto)
- `updatedAt` (DateTime, Auto)

**Indexes:**
- `merchantId`
- `isActive`
- `isPublic`
- `category`

**Relationships:**
- Many-to-One: User (Merchant), GiftCardTemplate
- One-to-Many: GiftCards

#### 4.3.5 Payment Model

**Table Name:** `payments`

**Fields:**
- `id` (UUID, Primary Key)
- `giftCardId` (UUID, Foreign Key → gift_cards.id)
- `customerId` (UUID, Foreign Key → users.id, Optional)
- `amount` (Decimal(10,2), Required)
- `currency` (String, Default: "USD")
- `paymentMethod` (Enum: STRIPE, PAYPAL, RAZORPAY, UPI)
- `paymentIntentId` (String, Required)
- `status` (Enum: PENDING, COMPLETED, FAILED, REFUNDED, Default: PENDING)
- `transactionId` (String, Optional)
- `metadata` (JSON, Optional)
- `createdAt` (DateTime, Auto)
- `updatedAt` (DateTime, Auto)

**Indexes:**
- `giftCardId`
- `customerId`
- `paymentIntentId`
- `status`

**Relationships:**
- Many-to-One: GiftCard, User (Customer)

#### 4.3.6 Redemption Model

**Table Name:** `redemptions`

**Fields:**
- `id` (UUID, Primary Key)
- `giftCardId` (UUID, Foreign Key → gift_cards.id)
- `merchantId` (UUID, Foreign Key → users.id)
- `amount` (Decimal(10,2), Required)
- `balanceBefore` (Decimal(10,2), Required)
- `balanceAfter` (Decimal(10,2), Required)
- `redemptionMethod` (Enum: QR_CODE, CODE_ENTRY, LINK, API)
- `location` (String, Optional)
- `notes` (Text, Optional)
- `createdAt` (DateTime, Auto)

**Indexes:**
- `giftCardId`
- `merchantId`
- `createdAt`

**Relationships:**
- Many-to-One: GiftCard, User (Merchant)

#### 4.3.7 Transaction Model

**Table Name:** `transactions`

**Fields:**
- `id` (UUID, Primary Key)
- `giftCardId` (UUID, Foreign Key → gift_cards.id)
- `type` (Enum: PURCHASE, REDEMPTION, REFUND, EXPIRY)
- `amount` (Decimal(10,2), Required)
- `balanceBefore` (Decimal(10,2), Required)
- `balanceAfter` (Decimal(10,2), Required)
- `userId` (UUID, Foreign Key → users.id, Optional)
- `metadata` (JSON, Optional)
- `createdAt` (DateTime, Auto)

**Indexes:**
- `giftCardId`
- `userId`
- `type`
- `createdAt`

**Relationships:**
- Many-to-One: GiftCard, User

#### 4.3.8 Additional Models

**ApiKey Model:**
- Stores API keys for third-party integrations
- Fields: id, userId, keyHash, name, permissions, lastUsedAt, expiresAt, isActive

**Webhook Model:**
- Stores webhook configurations
- Fields: id, userId, url, events, secret, isActive, lastTriggeredAt

**Payout Model:**
- Stores merchant payout records
- Fields: id, merchantId, amount, currency, status, payoutMethod, payoutAccountId, transactionId, processedAt, failureReason

**EmailVerificationToken Model:**
- Stores email verification tokens
- Fields: id, userId, token, expiresAt

**PasswordResetToken Model:**
- Stores password reset tokens
- Fields: id, userId, token, expiresAt, used

**RefreshToken Model:**
- Stores refresh tokens for session management
- Fields: id, userId, token, deviceName, deviceType, userAgent, ipAddress, lastUsedAt, expiresAt, revokedAt

**CommunicationSettings Model:**
- Stores global communication settings (Admin only)
- Fields: id, emailEnabled, smsEnabled, otpEnabled, pushEnabled, emailRateLimit, smsRateLimit, otpRateLimit, otpExpiryMinutes, otpLength

**AuditLog Model:**
- Stores audit logs for security and compliance
- Fields: id, userId, userEmail, action, resourceType, resourceId, ipAddress, userAgent, metadata, createdAt

**CommunicationLog Model:**
- Stores communication logs (email, SMS, OTP)
- Fields: id, channel, recipient, subject, message, status, errorMessage, metadata, userId, createdAt

**CommunicationTemplate Model:**
- Stores communication templates
- Fields: id, name, type, subject, body, variables, isActive, version, createdBy, updatedBy

**OTP Model:**
- Stores OTP codes
- Fields: id, userId, identifier, code, type, expiresAt, used, attempts, metadata

### 4.4 Database Constraints

**Primary Keys:**
- All tables have UUID primary keys

**Foreign Keys:**
- All foreign key relationships have CASCADE delete where appropriate
- Foreign keys are indexed for performance

**Unique Constraints:**
- User.email (unique)
- GiftCard.code (unique)
- GiftCard.shareToken (unique)
- ApiKey.keyHash (unique)
- RefreshToken.token (unique)
- EmailVerificationToken.token (unique)
- PasswordResetToken.token (unique)

**Check Constraints:**
- Payment.amount > 0
- GiftCard.value > 0
- GiftCard.balance >= 0
- Redemption.amount > 0

### 4.5 Database Indexes

**Performance Indexes:**
- All foreign keys are indexed
- Frequently queried fields are indexed (status, createdAt, etc.)
- Composite indexes for common query patterns

**Full-Text Search:**
- Future enhancement: Full-text search on product names and descriptions

---

## 5. API Specifications

### 5.1 API Overview

**Base URL:** `/api/v1`  
**Protocol:** HTTPS  
**Content Type:** `application/json`  
**Authentication:** Bearer Token (JWT)  
**Rate Limiting:** 100 requests per 15 minutes per IP

### 5.2 Authentication Endpoints

#### POST /auth/register
**Description:** Register a new user account  
**Authentication:** None  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER",
  "businessName": "My Business" // Optional, for merchants
}
```
**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER"
    }
  },
  "message": "Registration successful. Please verify your email."
}
```

#### POST /auth/login
**Description:** Authenticate user and get tokens  
**Authentication:** None  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER"
    }
  }
}
```

#### POST /auth/refresh
**Description:** Refresh access token  
**Authentication:** None (refresh token in body)  
**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

#### GET /auth/profile
**Description:** Get current user profile  
**Authentication:** Required  
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "CUSTOMER",
    "businessName": null,
    "isEmailVerified": true,
    "isActive": true
  }
}
```

### 5.3 Gift Card Endpoints

#### POST /gift-cards
**Description:** Create a new gift card  
**Authentication:** Required (MERCHANT or ADMIN)  
**Request Body:**
```json
{
  "value": 100.00,
  "currency": "USD",
  "expiryDate": "2024-12-31T23:59:59Z",
  "recipientEmail": "recipient@example.com",
  "recipientName": "Jane Doe",
  "customMessage": "Happy Birthday!",
  "templateId": "uuid",
  "allowPartialRedemption": true
}
```
**Response:** 201 Created
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "GIFT-ABC123-XYZ789",
    "qrCodeUrl": "https://...",
    "value": 100.00,
    "balance": 100.00,
    "status": "ACTIVE"
  }
}
```

#### GET /gift-cards
**Description:** List gift cards with filtering and pagination  
**Authentication:** Required  
**Query Parameters:**
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `status` (enum: ACTIVE, REDEEMED, EXPIRED, CANCELLED)
- `merchantId` (uuid, admin only)

**Response:** 200 OK
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "GIFT-ABC123-XYZ789",
      "value": 100.00,
      "balance": 100.00,
      "status": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

#### GET /gift-cards/:id
**Description:** Get gift card details  
**Authentication:** Required (owner or admin)  
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "GIFT-ABC123-XYZ789",
    "value": 100.00,
    "balance": 100.00,
    "status": "ACTIVE",
    "expiryDate": "2024-12-31T23:59:59Z",
    "merchant": {
      "id": "uuid",
      "businessName": "My Business"
    }
  }
}
```

#### PUT /gift-cards/:id
**Description:** Update gift card  
**Authentication:** Required (MERCHANT or ADMIN, owner)  
**Request Body:** (partial update allowed)
```json
{
  "expiryDate": "2025-12-31T23:59:59Z",
  "customMessage": "Updated message"
}
```

#### DELETE /gift-cards/:id
**Description:** Delete/cancel gift card  
**Authentication:** Required (MERCHANT or ADMIN, owner)

#### POST /gift-cards/bulk
**Description:** Create multiple gift cards  
**Authentication:** Required (MERCHANT or ADMIN)  
**Request Body:**
```json
{
  "count": 10,
  "value": 50.00,
  "currency": "USD",
  "expiryDate": "2024-12-31T23:59:59Z"
}
```

#### GET /gift-cards/:id/qr
**Description:** Get QR code for gift card  
**Authentication:** Required (owner or admin)  
**Response:** 200 OK (image/png or JSON with URL)

### 5.4 Payment Endpoints

#### POST /payments/create-intent
**Description:** Create payment intent  
**Authentication:** Required  
**Request Body:**
```json
{
  "giftCardId": "uuid",
  "amount": 100.00,
  "currency": "USD",
  "paymentMethod": "STRIPE"
}
```

#### POST /payments/confirm
**Description:** Confirm payment  
**Authentication:** None (public, but validated)  
**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "paymentMethod": "STRIPE"
}
```

#### POST /payments/from-product
**Description:** Create payment from product  
**Authentication:** Required  
**Request Body:**
```json
{
  "productId": "uuid",
  "amount": 100.00,
  "recipientEmail": "recipient@example.com",
  "recipientName": "Jane Doe",
  "paymentMethod": "STRIPE"
}
```

#### POST /payments/bulk-purchase
**Description:** Bulk purchase gift cards  
**Authentication:** Required  
**Request Body:**
```json
{
  "productId": "uuid",
  "recipients": [
    {
      "email": "recipient1@example.com",
      "name": "Recipient 1",
      "amount": 50.00
    },
    {
      "email": "recipient2@example.com",
      "name": "Recipient 2",
      "amount": 75.00
    }
  ],
  "paymentMethod": "STRIPE"
}
```

#### POST /payments/:id/refund
**Description:** Process refund  
**Authentication:** Required (MERCHANT or ADMIN)  
**Request Body:**
```json
{
  "amount": 50.00,
  "reason": "Customer request"
}
```

### 5.5 Redemption Endpoints

#### POST /redemptions/validate
**Description:** Validate gift card code (public)  
**Authentication:** None  
**Request Body:**
```json
{
  "code": "GIFT-ABC123-XYZ789"
}
```
**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "valid": true,
    "balance": 100.00,
    "status": "ACTIVE",
    "expiryDate": "2024-12-31T23:59:59Z"
  }
}
```

#### POST /redemptions/check-balance
**Description:** Check gift card balance (public)  
**Authentication:** None  
**Request Body:**
```json
{
  "code": "GIFT-ABC123-XYZ789"
}
```

#### POST /redemptions/redeem
**Description:** Redeem gift card (authenticated)  
**Authentication:** Required (MERCHANT or ADMIN)  
**Request Body:**
```json
{
  "code": "GIFT-ABC123-XYZ789",
  "amount": 50.00,
  "location": "Store Location",
  "notes": "Redemption notes"
}
```

#### POST /redemptions/redeem/qr
**Description:** Redeem via QR code  
**Authentication:** Required (MERCHANT or ADMIN)  
**Request Body:**
```json
{
  "qrData": "GIFT-ABC123-XYZ789",
  "amount": 50.00
}
```

#### POST /redemptions/redeem/:code
**Description:** Redeem via link (public)  
**Authentication:** None  
**Request Body:**
```json
{
  "amount": 50.00,
  "merchantId": "uuid"
}
```

### 5.6 Analytics Endpoints

#### GET /analytics/sales
**Description:** Get sales analytics  
**Authentication:** Required (MERCHANT or ADMIN)  
**Query Parameters:**
- `merchantId` (uuid, optional, admin only)
- `startDate` (ISO date)
- `endDate` (ISO date)

**Response:** 200 OK
```json
{
  "success": true,
  "data": {
    "totalRevenue": 10000.00,
    "totalTransactions": 150,
    "averageTransactionValue": 66.67,
    "revenueByMethod": {
      "STRIPE": 6000.00,
      "PAYPAL": 4000.00
    },
    "revenueByCurrency": {
      "USD": 10000.00
    }
  }
}
```

#### GET /analytics/redemptions
**Description:** Get redemption analytics  
**Authentication:** Required (MERCHANT or ADMIN)

#### GET /analytics/customers
**Description:** Get customer analytics  
**Authentication:** Required (MERCHANT or ADMIN)

#### GET /analytics/gift-cards
**Description:** Get gift card statistics  
**Authentication:** Required (MERCHANT or ADMIN)

### 5.7 Admin Endpoints

#### GET /admin/communication-settings
**Description:** Get communication settings  
**Authentication:** Required (ADMIN only)

#### PUT /admin/communication-settings
**Description:** Update communication settings  
**Authentication:** Required (ADMIN only)  
**Request Body:**
```json
{
  "emailEnabled": true,
  "smsEnabled": true,
  "emailRateLimit": 100,
  "smsRateLimit": 50
}
```

#### GET /admin/communication-logs/logs
**Description:** Get communication logs  
**Authentication:** Required (ADMIN only)

#### GET /admin/audit-logs
**Description:** Get audit logs  
**Authentication:** Required (ADMIN only)

#### GET /admin/audit-logs/export
**Description:** Export audit logs  
**Authentication:** Required (ADMIN only)

### 5.8 Error Responses

All endpoints return errors in the following format:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format"
    }
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

### 5.9 Webhook Endpoints

#### POST /payments/webhook/stripe
**Description:** Stripe webhook handler  
**Authentication:** Signature verification

#### POST /payments/webhook/razorpay
**Description:** Razorpay webhook handler  
**Authentication:** Signature verification

---

## 6. Security Requirements

### 6.1 Authentication and Authorization

**6.1.1 Password Security**
- Passwords must be hashed using bcrypt with minimum 10 rounds
- Password complexity requirements: minimum 8 characters, uppercase, lowercase, number, special character
- Password reset tokens expire after 1 hour
- Passwords cannot be retrieved, only reset

**6.1.2 JWT Token Security**
- Access tokens expire after 7 days
- Refresh tokens expire after 30 days
- Tokens use secure secrets (minimum 32 characters)
- Tokens are signed with HS256 algorithm
- Refresh tokens are stored in database with device tracking

**6.1.3 Account Security**
- Accounts lock after 5 failed login attempts for 30 minutes
- Email verification required for account activation
- Two-factor authentication available (TOTP-based)
- Session management with device tracking

**6.1.4 Role-Based Access Control**
- Three roles: ADMIN, MERCHANT, CUSTOMER
- Admins have full platform access
- Merchants can only access their own data
- Customers can only access their own purchases
- Middleware enforces role-based authorization

### 6.2 Data Protection

**6.2.1 Encryption**
- All data in transit encrypted with TLS 1.2+
- Sensitive data at rest encrypted (database encryption)
- Payment data never stored (PCI DSS compliance)
- Passwords hashed with bcrypt

**6.2.2 Input Validation**
- All user inputs validated using Zod schemas
- SQL injection prevention via Prisma ORM
- XSS protection via input sanitization
- File upload validation (type, size)

**6.2.3 CSRF Protection**
- Double-submit cookie pattern
- CSRF tokens required for state-changing operations
- Webhook endpoints excluded (use signature verification)

### 6.3 Security Headers

**6.3.1 HTTP Security Headers**
- Content-Security-Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

**6.3.2 CORS Configuration**
- Configurable allowed origins
- Credentials support enabled
- Preflight request handling

### 6.4 Rate Limiting

**6.4.1 API Rate Limiting**
- 100 requests per 15 minutes per IP (general)
- 5 requests per 15 minutes for authentication endpoints
- Rate limiting based on Redis
- Rate limit headers in responses

**6.4.2 Communication Rate Limiting**
- Email: 100 per hour (configurable by admin)
- SMS: 50 per hour (configurable by admin)
- OTP: 10 per hour per user (configurable by admin)

### 6.5 Audit Logging

**6.5.1 Logged Events**
- All authentication attempts (success and failure)
- All payment transactions
- All redemption transactions
- All admin actions
- All sensitive data modifications
- All communication events

**6.5.2 Log Data**
- User ID and email
- Action type
- Resource type and ID
- IP address
- User agent
- Timestamp
- Metadata (JSON)

### 6.6 Compliance

**6.6.1 PCI DSS Compliance**
- Payment data not stored
- Secure payment gateway integration
- Secure transmission of payment data

**6.6.2 GDPR Compliance**
- User data access rights
- Data deletion rights
- Privacy policy
- Cookie consent (future)

**6.6.3 Data Retention**
- Audit logs retained for 7 years
- Communication logs retained for 1 year
- Expired tokens cleaned up daily

---

## 7. Technical Architecture

### 7.1 System Architecture

**Architecture Pattern:** Monolithic with service layer separation  
**Deployment:** Containerized (Docker)  
**Scaling:** Horizontal scaling support

### 7.2 Technology Stack

#### 7.2.1 Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Language:** TypeScript 5.3+
- **ORM:** Prisma 5.7+
- **Database:** PostgreSQL 15+
- **Cache:** Redis 7+
- **Queue:** BullMQ 5.1+
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod 3.22+
- **Logging:** Winston 3.11+
- **PDF Generation:** PDFKit 0.14+
- **QR Code:** qrcode 1.5+

#### 7.2.2 Frontend
- **Framework:** Next.js 14+
- **UI Library:** React 18+
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **State Management:** Zustand 4.4+
- **Forms:** React Hook Form 7.49+
- **Validation:** Zod 3.22+
- **HTTP Client:** Axios 1.6+

#### 7.2.3 Payment Gateways
- **Stripe:** stripe 14.7+
- **PayPal:** PayPal SDK
- **Razorpay:** razorpay 2.9+
- **UPI:** Custom integration

#### 7.2.4 Communication Services
- **Email:** SendGrid, Brevo, SMTP (nodemailer)
- **SMS:** Twilio 4.20+, Brevo

### 7.3 System Components

#### 7.3.1 API Layer
- **Controllers:** Handle HTTP requests/responses
- **Routes:** Define API endpoints
- **Middleware:** Authentication, validation, error handling, logging
- **Validators:** Request validation schemas

#### 7.3.2 Service Layer
- **Business Logic:** Core application logic
- **Payment Services:** Payment gateway integrations
- **Delivery Services:** Email, SMS, PDF services
- **Analytics Services:** Data aggregation and analysis
- **Cache Services:** Redis caching layer

#### 7.3.3 Data Layer
- **Prisma ORM:** Database abstraction
- **Database:** PostgreSQL
- **Migrations:** Prisma Migrate

#### 7.3.4 Background Jobs
- **Queue System:** BullMQ with Redis
- **Scheduler:** node-cron
- **Workers:** Background job processors

### 7.4 Data Flow

**Request Flow:**
1. Client sends HTTP request
2. Middleware stack processes (CORS, security headers, rate limiting, CSRF)
3. Authentication middleware validates token
4. Authorization middleware checks permissions
5. Validation middleware validates input
6. Controller handles request
7. Service layer processes business logic
8. Data layer queries/updates database
9. Response returned to client

**Payment Flow:**
1. Customer initiates payment
2. Payment intent created
3. Payment gateway initialized
4. Customer completes payment
5. Webhook received from gateway
6. Payment confirmed
7. Gift card activated
8. Delivery triggered

**Redemption Flow:**
1. Merchant scans/enters code
2. Gift card validated
3. Balance checked
4. Redemption processed
5. Balance updated
6. Transaction recorded
7. Merchant balance updated
8. Confirmation sent

### 7.5 Caching Strategy

**Cache Keys:**
- Gift cards: `giftcards:{id}`, `giftcards:merchant:{merchantId}:page:{page}`
- Products: `products:{id}`, `products:merchant:{merchantId}:page:{page}`
- Templates: `templates:{id}`, `templates:merchant:{merchantId}`

**Cache TTL:**
- Individual records: 5 minutes
- List queries: 2 minutes
- Analytics: 10 minutes

**Cache Invalidation:**
- Automatic on create/update/delete
- Pattern-based invalidation for related data

### 7.6 Error Handling

**Error Types:**
- ValidationError: Input validation failures
- AuthenticationError: Authentication failures
- AuthorizationError: Permission failures
- NotFoundError: Resource not found
- BusinessLogicError: Business rule violations
- ExternalServiceError: Third-party service errors
- InternalError: Unexpected errors

**Error Response Format:**
- Consistent JSON error format
- Error codes for client handling
- User-friendly error messages
- Detailed error logs for debugging

---

## 8. Deployment and Infrastructure

### 8.1 Deployment Architecture

**Production Environment:**
- Containerized with Docker
- Docker Compose for local development
- Kubernetes-ready (future)
- Load balancer for multiple instances
- CDN for static assets (optional)

### 8.2 Infrastructure Requirements

**8.2.1 Server Requirements**
- **CPU:** 2+ cores
- **RAM:** 4GB+ (8GB recommended)
- **Storage:** 20GB+ (SSD recommended)
- **Network:** High-speed internet connection

**8.2.2 Database Requirements**
- **PostgreSQL 15+**
- **Storage:** 50GB+ (scales with data)
- **Backup:** Daily automated backups
- **Replication:** Master-slave (future)

**8.2.3 Redis Requirements**
- **Redis 7+**
- **Memory:** 2GB+ (scales with cache usage)
- **Persistence:** Optional (for session data)

### 8.3 Environment Configuration

**8.3.1 Required Environment Variables**
```env
# Server
NODE_ENV=production
PORT=8000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=min_32_characters_secret
JWT_REFRESH_SECRET=min_32_characters_secret
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Frontend
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

**8.3.2 Optional Environment Variables**
```env
# Payment Gateways
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

PAYPAL_CLIENT_ID=...
PAYPAL_SECRET=...
PAYPAL_MODE=live

RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...

# Email
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=...
BREVO_API_KEY=...
EMAIL_FROM=noreply@yourdomain.com

# SMS
SMS_SERVICE=twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# AWS (optional)
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=...
```

### 8.4 Deployment Process

**8.4.1 Build Process**
```bash
# Backend
cd backend
npm install
npm run build
npx prisma generate
npx prisma migrate deploy

# Frontend
cd frontend
npm install
npm run build
```

**8.4.2 Docker Deployment**
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

**8.4.3 Health Checks**
- Health check endpoint: `GET /health`
- Database connectivity check
- Redis connectivity check
- External service checks (optional)

### 8.5 Monitoring and Logging

**8.5.1 Application Logging**
- Winston logger with structured JSON logs
- Log levels: error, warn, info, debug
- Log rotation (5MB files, 5 files retained)
- Request/response logging
- Error stack traces

**8.5.2 Monitoring (Future)**
- Application Performance Monitoring (APM)
- Error tracking (Sentry)
- Uptime monitoring
- Database performance monitoring
- Redis performance monitoring

### 8.6 Backup and Recovery

**8.6.1 Database Backups**
- Daily automated backups
- Point-in-time recovery capability
- Backup retention: 30 days
- Backup storage: Secure cloud storage

**8.6.2 Disaster Recovery**
- Recovery Time Objective (RTO): < 4 hours
- Recovery Point Objective (RPO): < 1 hour
- Backup restoration procedures
- Multi-region deployment (future)

---

## 9. Testing Requirements

### 9.1 Testing Strategy

**Testing Levels:**
1. Unit Tests
2. Integration Tests
3. End-to-End Tests
4. Performance Tests
5. Security Tests

### 9.2 Unit Testing

**9.2.1 Backend Unit Tests**
- Service layer tests
- Utility function tests
- Validator tests
- **Target Coverage:** 80%+

**9.2.2 Frontend Unit Tests**
- Component tests (React Testing Library)
- Hook tests
- Utility function tests
- **Target Coverage:** 70%+

### 9.3 Integration Testing

**9.3.1 API Integration Tests**
- Endpoint testing (Supertest)
- Authentication flow tests
- Payment flow tests
- Redemption flow tests
- Error handling tests

**9.3.2 Database Integration Tests**
- CRUD operations
- Transaction tests
- Constraint tests
- Migration tests

**9.3.3 External Service Integration Tests**
- Payment gateway mocks
- Email service mocks
- SMS service mocks

### 9.4 End-to-End Testing

**9.4.1 User Flows**
- User registration and login
- Gift card creation
- Gift card purchase
- Gift card redemption
- Payment processing
- Admin workflows

**9.4.2 Tools**
- Playwright or Cypress (future)
- Test data management
- Test environment setup

### 9.5 Performance Testing

**9.5.1 Load Testing**
- API endpoint load tests
- Concurrent user simulation
- Database query performance
- **Target:** 10,000+ concurrent users

**9.5.2 Stress Testing**
- System limits identification
- Resource usage under load
- Failure point identification

**9.5.3 Tools**
- Artillery or k6 (future)
- Database query profiling

### 9.6 Security Testing

**9.6.1 Security Test Areas**
- Authentication bypass attempts
- Authorization bypass attempts
- SQL injection attempts
- XSS attempts
- CSRF attempts
- Rate limiting effectiveness

**9.6.2 Penetration Testing**
- Regular security audits
- Vulnerability scanning
- Code security reviews

### 9.7 Test Data Management

**9.7.1 Test Data**
- Seed data for development
- Isolated test database
- Test user accounts
- Mock payment data

**9.7.2 Test Environment**
- Separate test environment
- Test database
- Test payment gateway (sandbox)
- Test email/SMS services

---

## 10. Compliance and Legal Requirements

### 10.1 Data Protection

**10.1.1 GDPR Compliance**
- User data access rights
- Data deletion rights (right to be forgotten)
- Data portability
- Privacy policy
- Cookie consent (future)

**10.1.2 Data Retention**
- Audit logs: 7 years
- Communication logs: 1 year
- User data: Until account deletion
- Payment data: Not stored (PCI DSS)

### 10.2 Payment Compliance

**10.2.1 PCI DSS Compliance**
- Payment data not stored
- Secure transmission (TLS 1.2+)
- Secure payment gateway integration
- No card data in logs

**10.2.2 Payment Regulations**
- Refund policies
- Chargeback handling
- Payment dispute resolution

### 10.3 Gift Card Regulations

**10.3.1 Regional Compliance**
- Gift card expiry regulations (varies by region)
- Unused balance regulations
- Fee regulations
- Terms and conditions requirements

### 10.4 Legal Documents

**10.4.1 Required Documents**
- Terms of Service
- Privacy Policy
- Cookie Policy (future)
- Refund Policy
- Gift Card Terms and Conditions

### 10.5 Audit and Reporting

**10.5.1 Financial Reporting**
- Transaction reporting
- Revenue reporting
- Tax reporting (future)
- Merchant payout reporting

**10.5.2 Compliance Reporting**
- Security audit reports
- Data access reports
- Incident reports

---

## 11. Appendices

### 11.1 Use Cases

#### Use Case 1: Merchant Creates Gift Card
**Actor:** Merchant  
**Preconditions:** Merchant is logged in  
**Main Flow:**
1. Merchant navigates to gift card creation page
2. Merchant enters gift card details (value, expiry, recipient)
3. Merchant selects template (optional)
4. System validates input
5. System generates unique code and QR code
6. System creates gift card record
7. System returns gift card details
8. Merchant can view, edit, or deliver gift card

**Alternate Flows:**
- Invalid input: System shows validation errors
- Template not found: System uses default design

#### Use Case 2: Customer Purchases Gift Card
**Actor:** Customer  
**Preconditions:** Customer is logged in, product exists  
**Main Flow:**
1. Customer browses products
2. Customer selects product
3. Customer enters amount (if variable)
4. Customer enters recipient details
5. Customer proceeds to checkout
6. Customer selects payment method
7. System creates payment intent
8. Customer completes payment
9. System confirms payment
10. System activates gift card
11. System sends gift card to recipient
12. Customer receives confirmation

**Alternate Flows:**
- Payment fails: System shows error, allows retry
- Invalid amount: System shows validation error

#### Use Case 3: Merchant Redeems Gift Card
**Actor:** Merchant  
**Preconditions:** Merchant is logged in, gift card is active  
**Main Flow:**
1. Merchant navigates to redemption page
2. Merchant scans QR code or enters code
3. System validates gift card
4. System displays balance
5. Merchant enters redemption amount
6. System validates amount
7. System processes redemption
8. System updates balance
9. System creates redemption record
10. System updates merchant balance
11. Merchant receives confirmation

**Alternate Flows:**
- Invalid code: System shows error
- Insufficient balance: System shows error
- Expired card: System shows error

#### Use Case 4: Admin Manages Communication Settings
**Actor:** Admin  
**Preconditions:** Admin is logged in  
**Main Flow:**
1. Admin navigates to communication settings
2. Admin views current settings
3. Admin updates settings (enable/disable channels, rate limits)
4. System validates settings
5. System updates settings
6. System logs admin action
7. Admin receives confirmation

**Alternate Flows:**
- Invalid settings: System shows validation errors

### 11.2 Glossary

**Terms:**
- **Gift Card:** Digital voucher with monetary value
- **Merchant:** Business owner who creates/sells gift cards
- **Customer:** End-user who purchases gift cards
- **Admin:** Platform administrator
- **Redemption:** Using a gift card to make a purchase
- **Partial Redemption:** Using only part of gift card balance
- **Template:** Reusable gift card design
- **Product:** Sellable gift card offering
- **Payout:** Transfer of merchant earnings
- **QR Code:** Quick Response code for scanning
- **NFC:** Near Field Communication
- **POS:** Point of Sale system
- **2FA:** Two-Factor Authentication
- **OTP:** One-Time Password
- **JWT:** JSON Web Token
- **API:** Application Programming Interface
- **Webhook:** HTTP callback for events
- **PCI DSS:** Payment Card Industry Data Security Standard
- **GDPR:** General Data Protection Regulation

### 11.3 API Response Codes

**Success Codes:**
- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST (resource created)
- `204 No Content` - Successful DELETE

**Client Error Codes:**
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict
- `422 Unprocessable Entity` - Validation error
- `429 Too Many Requests` - Rate limit exceeded

**Server Error Codes:**
- `500 Internal Server Error` - Unexpected error
- `502 Bad Gateway` - External service error
- `503 Service Unavailable` - Service temporarily unavailable

### 11.4 Database Enums

**UserRole:**
- ADMIN
- MERCHANT
- CUSTOMER

**GiftCardStatus:**
- ACTIVE
- REDEEMED
- EXPIRED
- CANCELLED

**PaymentMethod:**
- STRIPE
- PAYPAL
- RAZORPAY
- UPI

**PaymentStatus:**
- PENDING
- COMPLETED
- FAILED
- REFUNDED

**RedemptionMethod:**
- QR_CODE
- CODE_ENTRY
- LINK
- API

**TransactionType:**
- PURCHASE
- REDEMPTION
- REFUND
- EXPIRY

**PayoutStatus:**
- PENDING
- PROCESSING
- COMPLETED
- FAILED
- CANCELLED

### 11.5 File Structure

```
giftcard-saas/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app setup
│   │   ├── config/                # Configuration
│   │   │   ├── database.ts
│   │   │   ├── env.ts
│   │   │   ├── redis.ts
│   │   │   ├── queue.ts
│   │   │   └── session.ts
│   │   ├── controllers/           # Request handlers
│   │   ├── services/              # Business logic
│   │   ├── routes/                # API routes
│   │   ├── middleware/            # Express middleware
│   │   ├── validators/            # Validation schemas
│   │   ├── utils/                 # Utilities
│   │   ├── types/                 # TypeScript types
│   │   ├── jobs/                  # Background jobs
│   │   └── workers/               # Job workers
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── migrations/            # Database migrations
│   ├── tests/                     # Test files
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/                   # Next.js app router
│   │   ├── components/            # React components
│   │   ├── lib/                   # Utilities
│   │   ├── hooks/                 # React hooks
│   │   ├── services/              # API services
│   │   ├── store/                 # State management
│   │   └── types/                 # TypeScript types
│   └── package.json
├── docker-compose.yml             # Docker Compose config
├── docker-compose.prod.yml        # Production Docker Compose
└── README.md
```

### 11.6 Development Workflow

**11.6.1 Local Development**
1. Clone repository
2. Install dependencies (`npm install`)
3. Set up environment variables (`.env` files)
4. Start Docker services (`docker-compose up -d`)
5. Run database migrations (`npx prisma migrate dev`)
6. Start backend (`npm run dev`)
7. Start frontend (`npm run dev`)

**11.6.2 Code Quality**
- ESLint for code linting
- Prettier for code formatting
- TypeScript strict mode
- Pre-commit hooks (Husky)
- Commit message linting (Commitlint)

**11.6.3 Git Workflow**
- Feature branches
- Pull request reviews
- Automated testing on PR
- Main branch protection

### 11.7 Future Enhancements

**11.7.1 Planned Features**
- Native mobile applications (iOS/Android)
- Multi-language support (i18n)
- Advanced analytics and reporting
- White-label solutions
- Subscription management
- Advanced fraud detection
- Machine learning recommendations

**11.7.2 Technical Improvements**
- GraphQL API (optional)
- Real-time updates (WebSockets)
- Advanced caching strategies
- Database sharding
- Microservices architecture (future)
- Kubernetes deployment
- Advanced monitoring and observability

---

## Document Information

**Document Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Complete  
**Author:** Development Team  
**Review Status:** Pending Review  
**Approval Status:** Pending Approval

---

**End of Document**