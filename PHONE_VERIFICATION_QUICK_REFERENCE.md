# Phone Verification Implementation - Quick Reference

## What Was Added

### Frontend (Signup.jsx)
✅ **Phone Number Input Field**
- Country code dropdown (14 countries)
- Phone number input (auto-strips non-numeric)
- Validation: minimum 10 digits

✅ **Two-Step OTP Flow**
1. Email OTP verification
2. Phone OTP verification
3. Account creation

✅ **State Management**
- `contactNumber`: Phone number digits
- `countryCode`: Selected country (+1, +44, etc.)
- `otpStep`: Tracks which OTP step (email or phone)

✅ **Validation Functions**
- `validatePhoneNumber()`: Checks minimum 10 digits
- `validateEmail()`: Regex email validation

✅ **Styling (Auth.css)**
- Phone input group layout
- Country code dropdown styling
- Phone input styling
- Helper text styling

### Backend (auth.js)
✅ **New Endpoints**
- `POST /api/send-phone-otp` - Send SMS OTP
- `POST /api/verify-phone-otp` - Verify phone OTP

✅ **Updated Endpoints**
- `POST /api/register` - Now accepts contactNumber

### Twilio Integration (twilio.js)
✅ **New Function**
- `sendOTPSMS()` - Send SMS via Twilio

## API Endpoints

### Send Phone OTP
```
POST /api/send-phone-otp
Body: { phoneNumber, otp, username }
Returns: { success, message }
```

### Verify Phone OTP
```
POST /api/verify-phone-otp
Body: { phoneNumber, otp }
Returns: { success, message }
```

### Register User (Updated)
```
POST /api/register
Body: { username, email, contactNumber, hashedPassword }
Returns: { success, message, user }
```

## Environment Variables Required

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_EMAIL_FROM=your_sendgrid_email
TWILIO_PHONE_NUMBER=+1234567890
```

## Registration Flow

```
START
  ↓
[Fill Form] → username, email, phone, password
  ↓
[Validate] → Check phone ≥ 10 digits, email valid, passwords match
  ↓
[Send Email OTP]
  ↓
[Enter Email OTP]
  ↓
[Verify Email OTP]
  ↓
[Send Phone OTP] ← SMS to phone
  ↓
[Enter Phone OTP]
  ↓
[Verify Phone OTP]
  ↓
[Create Account]
  ↓
[Redirect to Login]
  ↓
END
```

## Key Features

| Feature | Details |
|---------|---------|
| **Countries Supported** | 14 (USA, UK, India, China, Japan, France, Germany, Italy, Spain, Australia, Canada, Brazil, South Africa, Russia) |
| **Phone Validation** | Minimum 10 digits required |
| **OTP Expiration** | 10 minutes |
| **OTP Length** | 6 digits |
| **Password Hashing** | bcryptjs (10 salt rounds) |
| **Email Service** | Twilio SendGrid |
| **SMS Service** | Twilio |

## Files Modified

| File | Changes |
|------|---------|
| `Frontend/src/pages/Signup.jsx` | Added phone fields, two-step OTP flow |
| `Frontend/src/styles/Auth.css` | Added phone input and country code styling |
| `Backend/routes/auth.js` | Added send-phone-otp and verify-phone-otp endpoints |
| `Backend/utils/twilio.js` | Added sendOTPSMS function |

## Files Created

| File | Purpose |
|------|---------|
| `PHONE_VERIFICATION_GUIDE.md` | Comprehensive documentation |
| `PHONE_VERIFICATION_QUICK_REFERENCE.md` | This file |

## Testing the Feature

### Manual Testing Steps

1. **Start Backend**
   ```bash
   cd Backend
   npm start
   ```

2. **Start Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Test Signup**
   - Navigate to signup page
   - Fill username, email, phone, password
   - Select country code
   - Enter phone number (10+ digits)
   - Click "Continue"
   - Enter email OTP (check console or email)
   - Enter phone OTP (check SMS or console)
   - See success message
   - Redirected to login

### Testing Phone Number Validation

| Input | Expected Result |
|-------|-----------------|
| Less than 10 digits | Error: "Phone number must be at least 10 digits" |
| 10+ digits with country code | ✅ Accepted |
| Non-numeric characters | Auto-stripped |
| Only digits | ✅ Accepted |

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| OTP not sent | Check Twilio credentials in .env |
| Phone input not accepting input | Check that input is type="tel" |
| Country code not showing | Verify countryCodes array is populated |
| SMS not received | Verify TWILIO_PHONE_NUMBER is set |
| Phone validation failing | Ensure input has 10+ digits |
| Two-step not working | Check otpStep state management |

## Security Considerations

✅ **Implemented**
- OTP expires after 10 minutes
- Passwords hashed with bcryptjs
- Phone format validated
- Email format validated
- Separate OTP storage for email and phone

⏳ **Future Improvements**
- Rate limiting on OTP requests
- Database persistence for verifications
- OTP attempt limiting
- IP-based tracking
- User session management

## Next Steps

1. **Configure Environment Variables**
   - Add Twilio credentials to `.env`

2. **Test the Flow**
   - Register a test account
   - Verify email and phone OTP work

3. **Integrate Database**
   - Update `/api/register` to save to database
   - Add phone number to user model

4. **Add Phone Update Feature**
   - Already available in Settings page
   - Uses similar OTP verification flow

5. **Deploy**
   - Update API endpoints for production
   - Configure Twilio for production environment

## Code Examples

### Frontend - Phone Validation
```javascript
const validatePhoneNumber = (phone) => {
  const cleanPhone = phone.replace(/[\s-]/g, '');
  const digitCount = cleanPhone.replace(/\D/g, '').length;
  return digitCount >= 10;
};
```

### Backend - Phone OTP Endpoint
```javascript
router.post('/send-phone-otp', async (req, res) => {
  const { phoneNumber, otp, username } = req.body;
  await sendOTPSMS(phoneNumber, otp, username);
  // Store OTP temporarily
  otpStore[phoneNumber] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  res.json({ success: true, message: 'OTP sent successfully to phone' });
});
```

### Twilio SMS Function
```javascript
export const sendOTPSMS = async (phoneNumber, otp, username) => {
  const message = await client.messages.create({
    body: `Food Share - Verification Code: ${otp}`,
    from: twilioPhoneNumber,
    to: phoneNumber,
  });
  return message;
};
```

## Support & Debugging

### View Console Logs
1. **Frontend**: Open browser DevTools (F12) → Console
2. **Backend**: Check terminal where `npm start` is running

### Check Network Requests
1. Open browser DevTools (F12) → Network tab
2. Look for API calls to `/api/send-phone-otp` and `/api/verify-phone-otp`
3. Check response status and body

### Verify Configuration
```bash
# Check .env file has all required variables
grep TWILIO .env

# Should output:
# TWILIO_ACCOUNT_SID=...
# TWILIO_AUTH_TOKEN=...
# TWILIO_PHONE_NUMBER=...
```

---

**Status**: ✅ Complete and Ready for Testing
**Last Updated**: 2024
**Version**: 1.0
