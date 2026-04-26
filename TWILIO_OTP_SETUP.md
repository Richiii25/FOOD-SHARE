# Twilio OTP Integration Guide

## Overview
This document explains how to set up and use the Twilio OTP (One-Time Password) integration for user registration in the Food Share application.

## Setup Instructions

### 1. **Get Twilio Credentials**

1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up or log in to your Twilio account
3. Navigate to **Account Settings**
4. Copy your **Account SID** and **Auth Token**

### 2. **Set Up SendGrid Email Service with Twilio**

1. In Twilio Console, go to **Messaging** > **Send Grid Integration**
2. Connect your SendGrid account
3. Verify a sender email or use SendGrid's verified email

### 3. **Create `.env` File in Backend**

Create a `.env` file in the Backend directory with your Twilio credentials:

```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_EMAIL_FROM=noreply@foodshare.com
PORT=5000
```

### 4. **Install Dependencies**

```bash
# Backend
cd Backend
npm install twilio dotenv express cors

# Frontend
cd ../Frontend
npm install bcryptjs
```

## How It Works

### Frontend Flow (Signup.jsx)

1. **Step 1: Registration Form**
   - User enters username, email, password, and confirm password
   - Form validates inputs
   - Generates 6-digit OTP on frontend
   - Sends registration data to backend `/api/send-otp` endpoint

2. **Step 2: OTP Verification**
   - User receives OTP in their email
   - User enters OTP in the verification form
   - Frontend verifies OTP matches the generated one
   - On match, sends final registration to `/api/register` endpoint

### Backend Flow

#### `/api/send-otp` - POST
- Receives: `{ email, otp, username }`
- Sends OTP email via Twilio
- Stores OTP temporarily with 10-minute expiration
- Returns success/error status

#### `/api/register` - POST
- Receives: `{ username, email, hashedPassword }`
- Validates user doesn't already exist (implement with your DB)
- Saves user to database with encrypted password
- Returns success confirmation

## File Structure

```
Backend/
├── server.js              # Main server file
├── routes/
│   └── auth.js           # Authentication routes
├── utils/
│   └── twilio.js         # Twilio integration utilities
├── .env                  # Environment variables (create this)
└── .env.example          # Example environment variables

Frontend/
└── src/pages/
    └── Signup.jsx        # Updated signup component with OTP
```

## Frontend to Backend API Calls

### 1. Send OTP
```javascript
POST /api/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "username": "johndoe"
}

Response:
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 2. Register User
```javascript
POST /api/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "user@example.com",
  "hashedPassword": "$2a$10$..."
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "username": "johndoe",
    "email": "user@example.com"
  }
}
```

## Security Features

✅ **Password Encryption**: Using bcryptjs with 10 salt rounds
✅ **OTP Expiration**: OTP expires after 10 minutes
✅ **OTP Validation**: Frontend and backend validation
✅ **Email Verification**: Ensures valid email during registration
✅ **Input Validation**: All inputs validated on frontend and backend

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| TWILIO_ACCOUNT_SID | Your Twilio Account ID | ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx |
| TWILIO_AUTH_TOKEN | Your Twilio Auth Token | your_token_here |
| TWILIO_EMAIL_FROM | Sender email address | noreply@foodshare.com |
| PORT | Server port | 5000 |

## Testing the Integration

### 1. Start Backend Server
```bash
cd Backend
npm run dev
```

### 2. Start Frontend Server
```bash
cd Frontend
npm run dev
```

### 3. Test Registration
1. Navigate to signup page
2. Fill in registration form
3. Click "Continue" - OTP should be sent to email
4. Check email for OTP code
5. Enter OTP in verification form
6. Should redirect to login on success

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Failed to send OTP" | Check Twilio credentials in .env |
| Emails not arriving | Verify sender email is verified in SendGrid |
| CORS errors | Ensure backend CORS is configured correctly |
| OTP expires too quick | Adjust expiration time in auth.js |
| "Invalid OTP" message | Verify OTP matches exactly (case-sensitive for email) |

## Next Steps

1. **Database Integration**: Connect to MongoDB/PostgreSQL for persistent storage
2. **Rate Limiting**: Add rate limiting to prevent OTP brute force attacks
3. **Email Templates**: Customize email templates for branding
4. **User Profiles**: Extend user model with additional fields
5. **JWT Authentication**: Implement JWT tokens for secure session management
6. **Two-Factor Authentication**: Add SMS OTP as secondary factor

## Additional Resources

- [Twilio Documentation](https://www.twilio.com/docs)
- [SendGrid Email API](https://sendgrid.com/docs/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Express.js Guide](https://expressjs.com/en/starter/basic-routing.html)

## Support

For issues or questions, refer to:
- Twilio Support: https://www.twilio.com/help
- SendGrid Support: https://support.sendgrid.com/
- Project Issues: Create an issue in the repository
