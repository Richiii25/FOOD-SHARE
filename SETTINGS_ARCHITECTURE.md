# Settings OTP Feature - Visual Workflow & Architecture

## 🎨 User Experience Flow

### Visual Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Settings Page                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Current Username: johndoe                             │
│                                                         │
│  ☐ Change Username                                    │
│     ↓ (when checked)                                   │
│     New Username: [_________________]                 │
│                                                         │
│  ☐ Change Phone Number                                │
│     ↓ (when checked)                                   │
│     New Phone: [_________________]                    │
│                                                         │
│  ☐ Change Password                                    │
│     ↓ (when checked)                                   │
│     Current Password: [_________________]             │
│     New Password: [_________________]                 │
│     Confirm Password: [_________________]             │
│                                                         │
│  [Continue to Verification]  [Back to Dashboard]      │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ⬇️
         (User clicks "Continue to Verification")
                           ⬇️
┌─────────────────────────────────────────────────────────┐
│           Verify Your Identity (OTP Step)               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  "We've sent a One-Time Password to your email"       │
│                                                         │
│  Enter OTP: [______]  (6 digits)                      │
│                                                         │
│  Changes to be applied:                               │
│  ✓ Username: johndoe → newjohndoe                    │
│  ✓ Phone: +1-555-0101                                │
│  ✓ Password: Will be updated                         │
│                                                         │
│  [Verify OTP]  [Back]                                 │
│                                                         │
│  Didn't receive OTP?  [Resend OTP]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
                           ⬇️
        (After OTP verification succeeds)
                           ⬇️
              ✅ Success Message
         "Settings updated successfully!"
                           ⬇️
            (Auto-reset after 2 seconds)
                           ⬇️
          Return to Settings Selection
```

---

## 🔄 Technical Flow Diagram

### Frontend → Backend → Database

```
FRONTEND (React)                BACKEND (Express)           STORAGE
───────────────                 ─────────────────           ───────

User checks boxes                   
    ⬇️
Validates form                  
    ⬇️
Clicks "Continue"                   
    ⬇️
POST /api/send-otp-settings  ──→  Generate OTP
                                   Store in otpStore[email]
                                   Send via Twilio SendGrid
                                   ⬇️
                                   Return testOTP (dev only)
    ⬅──────────────────────────────
Receives response
Display OTP input step
    ⬇️
User enters OTP                 
    ⬇️
User clicks "Verify"            
    ⬇️
POST /api/update-settings
with OTP + new values  ──────→  Verify OTP matches stored
                                   Check expiration
                                   Check attempt count
                                   Hash new password
                                   Update user in database
                                   Return success
                                   ⬇️
                                   otpStore is cleared
    ⬅──────────────────────────────
Receive success response
Display success message
Reset form after 2 seconds
```

---

## 🔐 Security & Validation Flow

### OTP Generation & Verification

```
SEND OTP
├── Generate random 6-digit OTP
├── Set expiration to Current Time + 10 minutes
├── Store in otpStore with:
│   ├── otp: "123456"
│   ├── expiresAt: timestamp
│   ├── attempts: 0
│   └── username: "johndoe"
└── Send via Twilio SendGrid email

VERIFY OTP
├── Check if OTP exists for email
│   └── If not: Error "No OTP found"
├── Check OTP value matches
│   ├── If wrong:
│   │   ├── Increment attempts
│   │   ├── If >= 3: Delete OTP, show error
│   │   └── Else: Show "X attempts remaining"
│   └── If correct: Continue
├── Check if expired (Now > expiresAt)
│   └── If expired: Delete OTP, show error
└── If all checks pass:
    ├── Update user settings
    ├── Hash password if changed
    ├── Delete OTP from storage
    └── Return success

FORM VALIDATION
├── At least 1 field selected ✓
├── If username: Not empty, valid format ✓
├── If phone: Min 10 digits ✓
├── If password:
│   ├── Current password provided ✓
│   ├── New password: 8+ chars ✓
│   ├── New password matches confirmation ✓
│   └── New ≠ Current ✓
```

---

## 📱 Component State Management

### Settings.jsx State Variables

```javascript
// User Context
currentUsername = 'johndoe'           // Current logged-in user

// Flow Control
step = 'settings'                      // 'settings' or 'otp-verification'
isLoading = false                      // Loading state during API calls

// Messages
error = ''                             // Error message display
success = ''                           // Success message display

// OTP Management
generatedOtp = ''                      // OTP from backend (dev reference)
enteredOtp = ''                        // User-entered OTP

// Form Data
settingsData = {
  username: 'johndoe',                // New username
  phoneNumber: '+1-555-0100',         // New phone
  currentPassword: '',                // Current password (for verification)
  newPassword: '',                    // New password
  confirmPassword: '',                // Confirm new password
}

// Field Selection
changedFields = {
  username: false,                    // Is user changing username?
  phoneNumber: false,                 // Is user changing phone?
  password: false,                    // Is user changing password?
}
```

---

## 🔄 API Request/Response Cycles

### Cycle 1: Send OTP

**Request:**
```json
{
  "username": "johndoe",
  "email": "user@example.com"
}
```

**Backend Processing:**
```javascript
1. Generate OTP: "123456"
2. Calculate expiration: now + 10 minutes
3. Store in otpStore:
   otpStore['user@example.com'] = {
     otp: "123456",
     expiresAt: 1234567890,
     attempts: 0,
     username: "johndoe"
   }
4. Send email via Twilio SendGrid
5. Return testOTP (development only)
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "testOTP": "123456"  // Only in development
}
```

### Cycle 2: Update Settings

**Request:**
```json
{
  "username": "johndoe",
  "email": "user@example.com",
  "otp": "123456",
  "newUsername": "newjohndoe",
  "newPhone": "+1-555-0101",
  "newPassword": "NewPassword123",
  "changedFields": {
    "username": true,
    "phone": true,
    "password": false
  }
}
```

**Backend Processing:**
```javascript
1. Retrieve stored OTP for email
2. Verify OTP matches entered OTP
3. Check if OTP expired
4. Check attempt count
5. If password field:
   - Hash with bcryptjs (10 rounds)
   - newPassword = bcrypt.hash(newPassword)
6. Update user in database/storage
7. Delete OTP from otpStore
8. Return success with updated fields
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
    "passwordUpdated": false,
    "usernameUpdated": true,
    "phoneUpdated": true
  }
}
```

### Cycle 3: Resend OTP

**Request:**
```json
{
  "username": "johndoe",
  "email": "user@example.com"
}
```

**Backend Processing:**
```javascript
1. Check if OTP already exists and not expired
2. If exists and fresh:
   - Return error: "Please wait before requesting"
   - Include retryAfter time
3. If expired or doesn't exist:
   - Generate new OTP
   - Store with fresh 10-minute expiration
   - Send via email
   - Return new testOTP (dev only)
```

**Response:**
```json
{
  "success": true,
  "message": "OTP resent to your email",
  "testOTP": "654321"
}
```

---

## 📊 Database Schema (When Implemented)

### Users Collection/Table

```javascript
{
  _id: ObjectId,
  username: String,           // Unique identifier
  email: String,              // Unique, for OTP delivery
  phone: String,              // Updated via Settings
  password: String,           // Hashed with bcryptjs
  createdAt: Date,
  updatedAt: Date,
  lastPasswordChange: Date,
  loginAttempts: Number,
  isLocked: Boolean,
  twoFactorEnabled: Boolean,
  // ... other fields
}

// Indexes for fast lookup:
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
```

### OTP Storage (Recommended: Redis)

```
Key: otp:{email}
Value: {
  otp: "123456",
  username: "johndoe",
  attempts: 0,
  createdAt: 1234567890
}
TTL: 600 seconds (10 minutes)  // Auto-expire

Example:
otp:user@example.com → {"otp":"123456","username":"johndoe","attempts":0}
```

---

## 🎯 Error Handling Flow

### Frontend Error Scenarios

```
User Input Validation
    ├── No field selected
    │   └── Error: "Please select at least one field to change"
    ├── Empty username
    │   └── Error: "Username cannot be empty"
    ├── Short phone number
    │   └── Error: "Phone number must be at least 10 digits"
    ├── Password mismatch
    │   └── Error: "New password and confirm password do not match"
    ├── Same password
    │   └── Error: "New password must be different from current password"
    └── Short password
        └── Error: "New password must be at least 8 characters long"

OTP Input Validation
    ├── Empty OTP
    │   └── Error: "Please enter the OTP"
    ├── OTP not 6 digits
    │   └── Disable button (can't submit)
    └── OTP too long
        └── Automatically trim to 6 digits

Network/API Errors
    ├── Cannot send OTP
    │   └── Error: "Failed to send OTP. Please try again."
    ├── Cannot verify OTP
    │   └── Error: "Failed to update settings. Please try again."
    └── Network timeout
        └── Error: "Network error. Please check your connection."
```

### Backend Error Scenarios

```
OTP Sending
    ├── Missing username/email
    │   └── 400: "Username and email are required"
    ├── Twilio API error
    │   └── 500: "Failed to send OTP"
    └── Database error
        └── 500: "Internal server error"

OTP Verification
    ├── OTP not found
    │   └── 400: "No OTP found for this email. Please request a new one."
    ├── Wrong OTP
    │   ├── attempts < 3:
    │   │   └── 400: "Invalid OTP. X attempts remaining."
    │   └── attempts >= 3:
    │       └── 400: "Too many failed attempts. Please request a new OTP."
    ├── OTP expired
    │   └── 400: "OTP has expired. Please request a new one."
    ├── Username mismatch
    │   └── 400: "Username does not match OTP request"
    └── Database error
        └── 500: "Failed to update settings"
```

---

## 📈 Performance Considerations

### Current Implementation (Development)
```
✓ OTP Storage: In-memory (fast for development)
✓ Database: None (using mock data)
✓ Email: Twilio SendGrid API (instant delivery)
⚠️ Scalability: Limited (single server)
```

### Production Optimizations
```
1. OTP Storage: Redis
   ├── Benefits: Fast lookups, automatic expiration
   ├── TTL: 10 minutes (auto-delete)
   └── Throughput: 100k+ ops/second

2. Database: MongoDB or PostgreSQL
   ├── Benefits: Persistent storage, complex queries
   ├── Indexing: username, email (unique indexes)
   └── Throughput: 1k+ ops/second

3. Caching: Redis for user sessions
   ├── Benefits: Avoid repeated database queries
   ├── TTL: Session duration
   └── Throughput: 100k+ ops/second

4. Rate Limiting: express-rate-limit
   ├── OTP sends: 3 per hour per email
   ├── OTP verification: 10 per hour per email
   └── Prevents abuse and brute force attacks

5. Load Balancing: Multiple servers
   ├── Benefits: Distribute traffic
   ├── Session store: Shared Redis
   └── OTP store: Shared Redis
```

---

## 🔐 Security Considerations

### Password Security
```
Frontend:
├── Never send plaintext password
├── Hash with bcryptjs (10 rounds) before sending
└── Never log password to console

Backend:
├── Hash password again with bcryptjs (10 rounds)
├── Use constant-time comparison for verification
└── Never log or display plaintext
```

### OTP Security
```
Frontend:
├── Only accept 6 digits
├── Don't autofill OTP from email
└── Clear OTP after verification

Backend:
├── Generate cryptographically secure random
├── Use 10-minute expiration
├── Limit to 3 failed attempts
├── Log all verification attempts
└── Clear OTP after successful use
```

### Email Security
```
Frontend:
├── Only send to user's registered email
└── Confirm email matches session/auth

Backend:
├── Verify email belongs to username
├── Send via HTTPS (Twilio handles)
└── Log email delivery (audit trail)

Twilio:
├── Uses HTTPS for transmission
├── Professional email template
└── No sensitive data in email body
```

### Session Security
```
├── Use HTTPS only (production)
├── Secure session cookies
├── CSRF token protection
├── Prevent double submissions
└── Logout clears session
```

---

## 📊 Testing Coverage

### Unit Tests (Recommended)
```javascript
// OTP Generation
✓ Generates 6-digit random numbers
✓ All digits within 0-9 range
✓ Different OTP each time

// OTP Validation
✓ Correct OTP verifies successfully
✓ Wrong OTP fails
✓ Expired OTP fails
✓ Attempt counter increments
✓ Blocks after 3 attempts

// Password Hashing
✓ Plaintext password hashed
✓ Hash is repeatable
✓ Different password = different hash
✓ Can verify with bcrypt.compare

// Form Validation
✓ Validates minimum password length
✓ Validates phone format
✓ Validates username not empty
✓ Validates passwords match
```

### Integration Tests (Recommended)
```javascript
// Full flow tests
✓ Send OTP → Verify → Update Settings
✓ Change single field
✓ Change multiple fields
✓ Resend OTP after expiration
✓ Back button works correctly
✓ Form resets properly

// Error flow tests
✓ Wrong OTP shows error
✓ Expired OTP shows error
✓ Too many attempts locks out
✓ Invalid input rejected
✓ Network errors handled
```

### E2E Tests (Recommended)
```javascript
// User journey tests
✓ User can change username
✓ User can change phone
✓ User can change password
✓ User can change all three
✓ User sees success confirmation
✓ User data persists after refresh
```

---

## 🎓 Summary

| Aspect | Details |
|--------|---------|
| **User Flow** | Select fields → Enter values → Request OTP → Verify OTP → Update complete |
| **Security** | Passwords hashed, OTP time-limited, attempt limiting, email verification |
| **Performance** | In-memory OTP (dev), database-ready (prod), instant verification |
| **Validation** | Client-side (quick feedback) + Server-side (security) |
| **Error Handling** | Comprehensive frontend and backend error messages |
| **Scalability** | Redis for OTP, database for users, load balancing ready |
| **Testing** | Manual testing, API testing with cURL, unit/integration/E2E ready |

---

## 🚀 Next Steps

1. **Test Locally**: Follow SETTINGS_TESTING_GUIDE.md
2. **Database Integration**: Connect to MongoDB or PostgreSQL
3. **Production Setup**: Enable HTTPS, configure .env, deploy
4. **Monitoring**: Add logging, analytics, error tracking
5. **Enhancements**: Add 2FA, email verification, activity log

