# Phone Number Verification Guide

## Overview

The Food Share application now includes a comprehensive phone number verification system during user registration. This feature enhances security by requiring users to verify both their email and phone number during signup.

## Features

### 1. **Country Code Selection**
- **Dropdown Selector**: Users can select their country code from a list of 14 countries including:
  - USA (+1)
  - UK (+44)
  - India (+91)
  - China (+86)
  - Japan (+81)
  - France (+33)
  - Germany (+49)
  - Italy (+39)
  - Spain (+34)
  - Australia (+61)
  - Canada (+1-416)
  - Brazil (+55)
  - South Africa (+27)
  - Russia (+7)

### 2. **Phone Number Validation**
- **Minimum 10 Digits**: Phone numbers must contain at least 10 digits (excluding country code formatting)
- **Real-time Validation**: Input automatically strips non-numeric characters
- **Client-side Validation**: Instant feedback before submission

### 3. **Two-Step OTP Verification**
The registration process now follows this flow:

```
1. User fills registration form
   ├─ Username
   ├─ Email
   ├─ Phone (with country code)
   ├─ Password
   └─ Confirm Password

2. Email OTP Verification
   ├─ OTP sent to email
   ├─ User enters OTP
   └─ Proceeds to phone verification

3. Phone OTP Verification
   ├─ OTP sent via SMS
   ├─ User enters OTP
   └─ Account created on verification
```

## Implementation Details

### Frontend Changes

#### Signup.jsx Updates

**New State Variables:**
```javascript
const [contactNumber, setContactNumber] = useState('');
const [countryCode, setCountryCode] = useState('+1');
const [otpStep, setOtpStep] = useState('email');
```

**Validation Functions:**
- `validatePhoneNumber(phone)`: Checks if phone has at least 10 digits
- `validateEmail(email)`: Validates email format with regex

**Form Handlers:**
- `handleSubmit()`: Initial registration form submission with phone validation
- `handleOtpSubmit()`: Handles both email and phone OTP verification based on `otpStep`

**New Form Elements:**
- Country code dropdown selector
- Phone number input field with placeholder
- Helper text showing minimum digit requirement

#### Auth.css Styling

**New Classes:**
```css
.phone-input-group      /* Flex container for country code + phone */
.country-code-select    /* Dropdown styling with focus states */
.phone-input            /* Phone number input styling */
.form-group small       /* Helper text styling */
```

### Backend Changes

#### New API Endpoints

**1. POST `/api/send-phone-otp`**
- **Purpose**: Send OTP to user's phone via SMS
- **Request Body**:
  ```json
  {
    "phoneNumber": "+12025551234",
    "otp": "123456",
    "username": "john_doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully to phone"
  }
  ```
- **Validation**:
  - Phone number format: `+` followed by 1-3 country code digits, then 5-14 digits
  - OTP stored with 10-minute expiration

**2. POST `/api/verify-phone-otp`**
- **Purpose**: Verify the phone OTP entered by user
- **Request Body**:
  ```json
  {
    "phoneNumber": "+12025551234",
    "otp": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Phone OTP verified successfully"
  }
  ```

#### Updated Endpoints

**3. POST `/api/register` (Updated)**
- **New Field**: `contactNumber` (full phone number with country code)
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "contactNumber": "+12025551234",
    "hashedPassword": "$2a$10$..."
  }
  ```

#### Twilio Integration

**New Function in `utils/twilio.js`:**
```javascript
export const sendOTPSMS = async (phoneNumber, otp, username)
```

**Requirements:**
- `TWILIO_PHONE_NUMBER` environment variable must be set
- SMS sent with formatted message including OTP code
- 10-minute expiration time

**Environment Variables Needed:**
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_EMAIL_FROM=your_sendgrid_email
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number for SMS
```

## User Experience Flow

### Registration Form
1. User enters username
2. User enters email
3. User selects country code from dropdown
4. User enters phone number (auto-strips non-numeric characters)
5. User enters password
6. User confirms password
7. User clicks "Continue"

### Email Verification
1. OTP sent to email
2. User sees message: "We've sent an OTP to [email]"
3. User enters 6-digit code
4. System verifies OTP

### Phone Verification
1. OTP sent to phone via SMS
2. User sees message: "We've sent an OTP to [country code] [phone number]"
3. User enters 6-digit code
4. System verifies OTP
5. Account created and user redirected to login

### Success
- User redirected to login after 2 seconds
- Success message displayed with username and phone number

## Error Handling

### Validation Errors
- "Username is required!"
- "Please enter a valid email address!"
- "Phone number must be at least 10 digits!"
- "Passwords do not match!"
- "Password must be at least 8 characters long!"

### OTP Errors
- "Failed to send OTP to email/phone"
- "Invalid OTP. Please try again."
- "OTP expired. Please request a new one."

### Network Errors
- "Failed to send OTP. Please try again."
- "An error occurred. Please try again."

## Security Features

1. **OTP Expiration**: All OTPs expire after 10 minutes
2. **Separate Storage**: Email and phone OTPs stored separately
3. **Password Hashing**: Passwords hashed with bcryptjs (10 salt rounds)
4. **Client-side Validation**: Early validation before server requests
5. **Phone Number Validation**: Regex pattern ensures valid format

## Testing Checklist

### Frontend Testing
- [ ] Country code dropdown displays all countries
- [ ] Phone input accepts only digits
- [ ] Phone number validation triggers error for <10 digits
- [ ] Email validation works for invalid formats
- [ ] Password confirmation validation works
- [ ] Form submission disabled while loading
- [ ] OTP input limited to 6 digits
- [ ] Back button returns to registration form
- [ ] Success message displays after verification

### Backend Testing
- [ ] Email OTP endpoint sends OTP successfully
- [ ] Phone OTP endpoint validates phone format
- [ ] Phone OTP endpoint sends SMS via Twilio
- [ ] OTP verification checks expiration
- [ ] OTP verification validates OTP value
- [ ] Registration endpoint receives all fields
- [ ] Phone number stored in database

### Integration Testing
- [ ] Complete registration flow: email → phone → success
- [ ] OTP resend functionality
- [ ] Error messages display properly
- [ ] Back button navigation works
- [ ] Redirect to login after success

## Future Enhancements

1. **OTP Resend**: Add "Resend OTP" button with rate limiting
2. **Phone Number Update**: Allow users to change phone in Settings
3. **Alternative Verification**: Option to verify email OR phone (not both)
4. **Multi-factor Authentication**: Use phone verification for 2FA
5. **Rate Limiting**: Prevent OTP spam with per-IP/per-email limits
6. **Database Integration**: Save verification status to database
7. **Verification History**: Track successful verifications
8. **Fallback Methods**: SMS alternative (call, email backup)

## Configuration

### Add to `.env`
```
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_EMAIL_FROM=your_sendgrid_email@example.com
TWILIO_PHONE_NUMBER=+1234567890
```

### API Endpoint Base URL
Update in `Signup.jsx` to match your backend:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // or your production URL
```

## Dependencies

### Frontend
- React 18.3.1
- react-router-dom 7.14.2
- bcryptjs (for password hashing)

### Backend
- Express.js 5.2.1
- twilio (for SMS and SendGrid email)
- dotenv (for environment variables)

## Troubleshooting

### OTP Not Received
1. Check Twilio credentials in `.env`
2. Verify `TWILIO_PHONE_NUMBER` is configured
3. Check phone number format includes country code
4. Check email/SMS not in spam folder

### Validation Errors
1. Ensure minimum 10 digits in phone number
2. Check country code is selected
3. Verify email format is valid
4. Ensure password is 8+ characters

### Database Issues
1. Verify backend is running on port 5000
2. Check network requests in browser DevTools
3. Check server logs for errors
4. Verify API endpoints are registered

## Support

For issues or questions:
1. Check server console logs
2. Open browser DevTools (F12)
3. Check Network tab for failed requests
4. Review error messages in UI
5. Check `.env` file configuration

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Ready for Testing
