# Brevo Integration Guide

## Overview

Brevo (formerly Sendinblue) is now integrated as an alternative email and SMS service provider. You can use Brevo for both email and SMS, or mix and match with other providers (SendGrid for email, Twilio for SMS, etc.).

## Features

- ✅ **Email Service** - Send transactional emails via Brevo API
- ✅ **SMS Service** - Send SMS messages via Brevo API
- ✅ **Admin Controls** - All Brevo communications respect admin communication settings
- ✅ **Audit Logging** - All Brevo emails and SMS are logged for audit purposes

## Setup Instructions

### 1. Create a Brevo Account

1. Sign up at [https://www.brevo.com](https://www.brevo.com)
2. Verify your email address
3. Complete your account setup

### 2. Get Your API Key

1. Log in to your Brevo dashboard
2. Go to **Settings** → **API Keys**
3. Click **Generate a new API key**
4. Give it a name (e.g., "Gift Card SaaS")
5. Copy the API key (you'll only see it once!)

### 3. Configure Email Service (Optional)

To use Brevo for emails:

1. Add to your `.env` file:
   ```env
   EMAIL_SERVICE=brevo
   BREVO_API_KEY=your_brevo_api_key_here
   EMAIL_FROM=your-verified-email@yourdomain.com
   EMAIL_FROM_NAME=Gift Card SaaS
   ```

2. **Important**: The `EMAIL_FROM` address must be verified in your Brevo account:
   - Go to **Senders & IP** → **Senders**
   - Add and verify your sender email address
   - Wait for verification (usually instant for domain emails)

### 4. Configure SMS Service (Optional)

To use Brevo for SMS:

1. Add to your `.env` file:
   ```env
   SMS_SERVICE=brevo
   BREVO_API_KEY=your_brevo_api_key_here
   BREVO_SMS_SENDER=YourSenderName
   ```

2. **Important**: Configure your SMS sender in Brevo:
   - Go to **SMS** → **Senders**
   - Add a sender name (must be approved by Brevo)
   - Use this exact sender name in `BREVO_SMS_SENDER`

### 5. Mixed Configuration Examples

You can use different providers for email and SMS:

**Example 1: Brevo for both**
```env
EMAIL_SERVICE=brevo
SMS_SERVICE=brevo
BREVO_API_KEY=your_brevo_api_key
BREVO_SMS_SENDER=YourSenderName
```

**Example 2: Brevo for email, Twilio for SMS**
```env
EMAIL_SERVICE=brevo
SMS_SERVICE=twilio
BREVO_API_KEY=your_brevo_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

**Example 3: SendGrid for email, Brevo for SMS**
```env
EMAIL_SERVICE=sendgrid
SMS_SERVICE=brevo
SENDGRID_API_KEY=your_sendgrid_key
BREVO_API_KEY=your_brevo_api_key
BREVO_SMS_SENDER=YourSenderName
```

## Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `EMAIL_SERVICE` | No | Email provider (`brevo`, `sendgrid`, `smtp`) | `brevo` |
| `SMS_SERVICE` | No | SMS provider (`brevo`, `twilio`) | `brevo` |
| `BREVO_API_KEY` | Yes (if using Brevo) | Your Brevo API key | `xkeysib-...` |
| `BREVO_SMS_SENDER` | Yes (if using Brevo SMS) | Approved SMS sender name | `GiftCardSaaS` |
| `EMAIL_FROM` | Yes | Verified sender email | `noreply@yourdomain.com` |
| `EMAIL_FROM_NAME` | No | Sender display name | `Gift Card SaaS` |

## Brevo Pricing & Limits

### Free Plan
- **Email**: 300 emails/day
- **SMS**: Limited (check Brevo pricing)

### Paid Plans
- Higher email limits
- More SMS credits
- Better deliverability

Check [Brevo Pricing](https://www.brevo.com/pricing/) for current rates.

## Testing

### Test Email Service

1. Set `EMAIL_SERVICE=brevo` in your `.env`
2. Add your `BREVO_API_KEY`
3. Start your backend server
4. Try sending a test email (e.g., user registration)

### Test SMS Service

1. Set `SMS_SERVICE=brevo` in your `.env`
2. Add your `BREVO_API_KEY` and `BREVO_SMS_SENDER`
3. Start your backend server
4. Try sending a test SMS (e.g., OTP code)

## Troubleshooting

### Email Issues

**Error: "Sender email not verified"**
- Solution: Verify your sender email in Brevo dashboard → Senders & IP → Senders

**Error: "Invalid API key"**
- Solution: Check that your `BREVO_API_KEY` is correct and active

**Error: "Email service disabled by administrator"**
- Solution: Go to Admin → Communications and enable email service

### SMS Issues

**Error: "SMS sender not configured"**
- Solution: Add and configure `BREVO_SMS_SENDER` in your `.env` file

**Error: "Sender name not approved"**
- Solution: Wait for Brevo to approve your sender name, or use a different approved sender

**Error: "Insufficient SMS credits"**
- Solution: Add credits to your Brevo account or upgrade your plan

## Admin Controls

All Brevo communications respect the admin communication settings:

- **Enable/Disable**: Admin can enable/disable Brevo email and SMS globally
- **Rate Limiting**: Admin can configure rate limits per channel
- **Audit Logs**: All Brevo emails and SMS are logged in the communication logs

To manage:
1. Login as admin
2. Go to **Communications** in the admin menu
3. Configure email and SMS settings

## Support

- **Brevo Documentation**: [https://developers.brevo.com](https://developers.brevo.com)
- **Brevo Support**: [https://help.brevo.com](https://help.brevo.com)
- **API Reference**: [https://developers.brevo.com/api](https://developers.brevo.com/api)

## Migration from Other Providers

### From SendGrid to Brevo (Email)

1. Set up Brevo account and get API key
2. Verify sender email in Brevo
3. Update `.env`:
   ```env
   EMAIL_SERVICE=brevo
   BREVO_API_KEY=your_brevo_key
   ```
4. Restart backend server
5. Test email sending

### From Twilio to Brevo (SMS)

1. Set up Brevo account and get API key
2. Configure SMS sender in Brevo
3. Update `.env`:
   ```env
   SMS_SERVICE=brevo
   BREVO_API_KEY=your_brevo_key
   BREVO_SMS_SENDER=YourSenderName
   ```
4. Restart backend server
5. Test SMS sending

---

**Note**: You can use Brevo for one service and keep your existing provider for the other. The services are independent and can be configured separately.

