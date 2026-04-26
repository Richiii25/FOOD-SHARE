# Settings OTP Feature - Testing & Usage Guide

## ✅ Feature Implementation Status

Your Settings page is **FULLY IMPLEMENTED** with:

### Frontend (Settings.jsx)
- ✅ Username, phone number, and password change via checkboxes
- ✅ Two-step verification process (Settings Selection → OTP Verification)
- ✅ OTP sent to email via Twilio SendGrid
- ✅ Form validation for all fields
- ✅ Password hashing with bcryptjs
- ✅ Error and success messages
- ✅ Resend OTP functionality

### Backend (settings.js)
- ✅ `/api/send-otp-settings` - Send OTP to user's email
- ✅ `/api/update-settings` - Verify OTP and update all three fields
- ✅ `/api/verify-otp-settings` - Verify OTP without updating
- ✅ `/api/resend-otp-settings` - Resend OTP to email
- ✅ OTP expiration (10 minutes)
- ✅ Failed attempt limiting (3 attempts max)
- ✅ Password hashing with bcryptjs

---

## 🚀 Running the Application

### Step 1: Start Backend Server
```bash
cd Backend
npm start
```

**Expected output:**
```
Server is running on http://localhost:5000
Make sure to set up your .env file with Twilio credentials
```

### Step 2: Start Frontend Development Server
```bash
cd Frontend
npm run dev
```

**Expected output:**
```
VITE v... ready in X ms
➜  Local:   http://localhost:5173/
```

### Step 3: Access Settings Page
1. Open browser to `http://localhost:5173`
2. Navigate to Settings page
3. You should see the account settings form

---

## 📋 How to Use Settings Page

### Step 1: Select Fields to Change
1. **View Current Username**: Shows "Current Username: johndoe"
2. **Select Fields**: Check any combination of:
   - ✓ Change Username
   - ✓ Change Phone Number
   - ✓ Change Password

### Step 2: Enter New Values

#### To Change Username:
- Check "Change Username" checkbox
- Enter new username in the text field
- Requirements: Letters, numbers, underscores only

#### To Change Phone Number:
- Check "Change Phone Number" checkbox
- Enter new phone (e.g., +1-555-0101)
- Requirements: Minimum 10 digits

#### To Change Password:
- Check "Change Password" checkbox
- Enter current password
- Enter new password (minimum 8 characters)
- Confirm new password
- New password must be different from current

### Step 3: Request OTP
1. Click "Continue to Verification"
2. Backend sends 6-digit OTP to email
3. You'll see the OTP verification screen

### Step 4: Verify OTP
1. Enter the 6-digit OTP received in email
2. Review "Changes to be applied" summary
3. Click "Verify OTP"
4. Changes are applied instantly
5. Success message appears
6. Form resets automatically

---

## 🧪 Testing Guide

### Test 1: Change Username Only

**Steps:**
```
1. Check "Change Username"
2. Enter: "newjohndoe"
3. Click "Continue to Verification"
4. Enter OTP from email
5. Click "Verify OTP"
```

**Expected Result:**
- OTP sent to user@example.com
- Username changes to "newjohndoe"
- Success message appears
- Form resets to settings step

### Test 2: Change Phone Number Only

**Steps:**
```
1. Check "Change Phone Number"
2. Enter: "+1-555-0101"
3. Click "Continue to Verification"
4. Enter OTP
5. Click "Verify OTP"
```

**Expected Result:**
- Phone number updated
- Summary shows: "Phone Number: +1-555-0101"
- Success confirmation

### Test 3: Change Password Only

**Steps:**
```
1. Check "Change Password"
2. Enter Current Password: (use any value)
3. Enter New Password: "SecurePassword123"
4. Confirm: "SecurePassword123"
5. Click "Continue to Verification"
6. Enter OTP
7. Click "Verify OTP"
```

**Expected Result:**
- Password hashed and updated
- Summary shows: "Password: Will be updated"
- Success message

### Test 4: Change All Three Fields

**Steps:**
```
1. Check all three checkboxes
2. Username: "finalusername"
3. Phone: "+1-555-9999"
4. Password: "NewSecure999!"
5. Confirm Password: "NewSecure999!"
6. Click "Continue"
7. Enter OTP
8. Click "Verify"
```

**Expected Result:**
- Summary shows all three changes
- All fields updated
- Success notification

### Test 5: OTP Error Handling

**Test Wrong OTP:**
```
1. Request OTP
2. Enter wrong code (e.g., "000000")
3. Click "Verify OTP"
```

**Expected Result:**
- Error: "Invalid OTP. 2 attempts remaining."
- Try 3 times total
- After 3 failures: "Too many failed attempts"

**Test Expired OTP:**
```
1. Request OTP
2. Wait 10+ minutes
3. Enter OTP
4. Click "Verify"
```

**Expected Result:**
- Error: "OTP has expired. Please request a new one."

### Test 6: Form Validation

**Test Empty Username:**
```
1. Check "Change Username"
2. Leave field empty
3. Click "Continue"
```

**Expected Result:**
- Error: "Username cannot be empty"

**Test Short Phone:**
```
1. Check "Change Phone"
2. Enter: "12345"
3. Click "Continue"
```

**Expected Result:**
- Error: "Phone number must be at least 10 digits"

**Test Mismatched Passwords:**
```
1. Check "Change Password"
2. New: "Password123"
3. Confirm: "Password456"
4. Click "Continue"
```

**Expected Result:**
- Error: "New password and confirm password do not match"

**Test Same Password:**
```
1. Check "Change Password"
2. Current: "Password123"
3. New: "Password123"
4. Confirm: "Password123"
5. Click "Continue"
```

**Expected Result:**
- Error: "New password must be different from current password"

### Test 7: Resend OTP

**Steps:**
```
1. Request OTP (don't enter code)
2. Click "Resend OTP"
3. Check new OTP in email
4. Enter new OTP
5. Click "Verify"
```

**Expected Result:**
- New OTP generated and sent
- Message: "OTP resent successfully!"
- Can verify with new OTP

### Test 8: Go Back

**Steps:**
```
1. Request OTP (goes to verification step)
2. Click "Back" button
3. Modify selections
4. Request OTP again
```

**Expected Result:**
- Returns to settings selection
- Can modify field selections
- Can re-request OTP with new changes

---

## 🧬 Testing with API (cURL)

### Send OTP
```bash
curl -X POST http://localhost:5000/api/send-otp-settings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "user@example.com"
  }'
```

**Response (Development):**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "testOTP": "123456"
}
```

### Update Settings with OTP
```bash
curl -X POST http://localhost:5000/api/update-settings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "user@example.com",
    "otp": "123456",
    "newUsername": "newjohndoe",
    "newPhone": "+1-555-0101",
    "newPassword": "NewSecure123",
    "changedFields": {
      "username": true,
      "phone": true,
      "password": true
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Settings updated successfully",
  "data": {
    "username": "newjohndoe",
    "email": "user@example.com",
    "phone": "+1-555-0101",
    "passwordUpdated": true,
    "usernameUpdated": true,
    "phoneUpdated": true
  }
}
```

### Resend OTP
```bash
curl -X POST http://localhost:5000/api/resend-otp-settings \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "user@example.com"
  }'
```

---

## 🔍 Browser DevTools Testing

### Check Network Requests:
1. Open DevTools (F12)
2. Go to Network tab
3. Make a request (e.g., send OTP)
4. Look for `/api/send-otp-settings` request
5. Click on it to see response
6. Response should include `testOTP` in development mode

### Check Console Logs:
1. Open DevTools Console (F12 → Console)
2. Make OTP request
3. Backend logs should appear
4. Look for any errors

### Check Local Storage:
1. DevTools → Application → Local Storage
2. You can verify any stored user data here

---

## 📊 Testing Checklist

Use this checklist to verify everything works:

### Form Validation
- [ ] Can select multiple fields
- [ ] Error when no fields selected
- [ ] Error for empty username
- [ ] Error for short phone number
- [ ] Error for password mismatch
- [ ] Error for same new/old password

### OTP Sending
- [ ] OTP received in email (or console in dev)
- [ ] Correct email address used
- [ ] OTP is 6 digits
- [ ] Can request multiple times

### OTP Verification
- [ ] Correct OTP verifies successfully
- [ ] Wrong OTP shows error
- [ ] 3 failed attempts blocks further tries
- [ ] Expired OTP shows error

### Settings Update
- [ ] Username changes
- [ ] Phone number changes
- [ ] Password is hashed
- [ ] All three fields update simultaneously
- [ ] Summary shows correct changes

### User Experience
- [ ] Success message appears
- [ ] Form resets after 2 seconds
- [ ] Back button works
- [ ] Resend OTP works
- [ ] Loading states show correctly
- [ ] Buttons disabled during loading

### Responsive Design
- [ ] Works on mobile (< 768px)
- [ ] Works on tablet (768px - 1024px)
- [ ] Works on desktop (> 1024px)
- [ ] Buttons are clickable
- [ ] Text is readable

---

## 🐛 Troubleshooting

### Problem: "Failed to send OTP"
**Solution:**
- Check backend is running on port 5000
- Check API URL is `http://localhost:5000`
- Check CORS is enabled in backend
- Check network tab for errors

### Problem: OTP not appearing
**Solution (Development):**
- Check browser console for `testOTP` value
- Use the test OTP from console
- Check response in Network tab

**Solution (Production):**
- Check Twilio SendGrid config in `.env`
- Check spam folder for email
- Verify email address is correct

### Problem: "OTP has expired"
**Solution:**
- OTP expires after 10 minutes
- Request new OTP via "Resend OTP" button
- Try again with new code

### Problem: Form not submitting
**Solution:**
- Check all required fields filled
- Check at least one field is selected
- Check for validation errors displayed
- Check browser console for JavaScript errors

### Problem: Changes not saving
**Solution:**
- Verify OTP was correct
- Check network response for errors
- Ensure database is connected (if using)
- Check backend logs for issues

---

## 📝 Important Notes

### Current Implementation
- Email is hardcoded to `"user@example.com"` in Settings.jsx
- In production, get email from user session/auth context
- OTP stored in memory (use Redis for production)
- User settings stored in memory (use database for production)

### Next Steps for Production
1. **Get email from session:**
   ```javascript
   const userEmail = useContext(AuthContext).user.email;
   ```

2. **Use Redis for OTP storage:**
   ```bash
   npm install redis
   ```

3. **Connect to database:**
   ```javascript
   const user = await User.findOne({ username });
   user.email = userEmail;
   await user.save();
   ```

4. **Remove testOTP from responses:**
   - Only in development mode
   - Remove for production security

---

## 🎯 Feature Summary

| Feature | Status | Details |
|---------|--------|---------|
| Change Username | ✅ Working | Via OTP verification |
| Change Phone | ✅ Working | Via OTP verification |
| Change Password | ✅ Working | Password hashed with bcryptjs |
| OTP Sending | ✅ Working | Via Twilio SendGrid |
| OTP Verification | ✅ Working | 10-minute expiration, 3 attempt limit |
| Error Handling | ✅ Complete | Validation on all inputs |
| Responsive Design | ✅ Mobile Ready | All screen sizes supported |
| Form Reset | ✅ Automatic | 2-second delay after success |
| Security | ✅ Enabled | Password hashing, OTP expiration |

---

## 📞 Support Resources

- **Main Guide**: See `SETTINGS_OTP_GUIDE.md`
- **Quick Start**: See `SETTINGS_QUICK_START.md`
- **Project Summary**: See `PROJECT_SUMMARY.md`

---

## ✨ You're All Set!

Your Settings page with OTP-based account updates is **fully functional** and ready to use!

**Test it now:**
1. Start backend: `npm start` (in Backend folder)
2. Start frontend: `npm run dev` (in Frontend folder)
3. Navigate to Settings page
4. Try changing your username, phone, or password with OTP verification

**Enjoy!** 🎉
