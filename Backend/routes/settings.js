import express from 'express';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '../utils/twilio.js';

const router = express.Router();

// Store OTPs in memory (use Redis or database in production)
const otpStore = {};

// Generate random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * POST /api/send-otp-settings
 * Send OTP to user's email for settings changes
 * Body: { username, email }
 */
router.post('/send-otp-settings', async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        success: false,
        message: 'Username and email are required',
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store OTP temporarily
    otpStore[email] = {
      otp,
      expiresAt: expirationTime,
      attempts: 0,
      username,
    };

    // Send OTP via email
    await sendOTPEmail(email, otp, `Security Verification for ${username}'s Account`);

    res.json({
      success: true,
      message: 'OTP sent to your email',
      // Remove in production - for testing only
      testOTP: otp,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP',
      error: error.message,
    });
  }
});

/**
 * POST /api/update-settings
 * Update user settings after OTP verification
 * Body: {
 *   username,
 *   email,
 *   otp,
 *   newUsername,
 *   newPhone,
 *   newPassword,
 *   changedFields: { username: bool, phone: bool, password: bool }
 * }
 */
router.post('/update-settings', async (req, res) => {
  try {
    const {
      username,
      email,
      otp,
      newUsername,
      newPhone,
      newPassword,
      changedFields,
    } = req.body;

    if (!username || !email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and OTP are required',
      });
    }

    // Verify OTP
    const storedOTP = otpStore[email];

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email. Please request a new one.',
      });
    }

    if (storedOTP.otp !== otp) {
      storedOTP.attempts = (storedOTP.attempts || 0) + 1;

      if (storedOTP.attempts >= 3) {
        delete otpStore[email];
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`,
      });
    }

    // Check if OTP is expired
    if (Date.now() > storedOTP.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Verify username matches stored OTP
    if (storedOTP.username !== username) {
      return res.status(400).json({
        success: false,
        message: 'Username does not match OTP request',
      });
    }

    // Prepare updates
    const updates = {
      username,
      email,
      phone: newPhone || '',
      password: '',
    };

    // Apply changes based on changedFields
    if (changedFields.username && newUsername) {
      updates.username = newUsername;
    }

    if (changedFields.phone && newPhone) {
      updates.phone = newPhone;
    }

    if (changedFields.password && newPassword) {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updates.password = hashedPassword;
    }

    // Mock database update - replace with actual database call
    // In production, query your database and update the user record
    console.log('Updating user with changes:', updates);

    // For now, simulate a successful update
    const updateResult = {
      username: updates.username,
      email: updates.email,
      phone: updates.phone,
      passwordUpdated: changedFields.password,
      usernameUpdated: changedFields.username,
      phoneUpdated: changedFields.phone,
    };

    // Clear the OTP after successful verification
    delete otpStore[email];

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: updateResult,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
});

/**
 * POST /api/verify-otp-settings
 * Verify OTP without updating settings (for pre-verification)
 * Body: { email, otp }
 */
router.post('/verify-otp-settings', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const storedOTP = otpStore[email];

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found for this email',
      });
    }

    if (storedOTP.otp !== otp) {
      storedOTP.attempts = (storedOTP.attempts || 0) + 1;

      if (storedOTP.attempts >= 3) {
        delete otpStore[email];
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
        });
      }

      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${3 - storedOTP.attempts} attempts remaining.`,
      });
    }

    if (Date.now() > storedOTP.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired',
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
      error: error.message,
    });
  }
});

/**
 * POST /api/resend-otp-settings
 * Resend OTP to email
 * Body: { email, username }
 */
router.post('/resend-otp-settings', async (req, res) => {
  try {
    const { email, username } = req.body;

    if (!email || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email and username are required',
      });
    }

    // Check if previous OTP still exists and hasn't expired
    const existingOTP = otpStore[email];
    if (existingOTP && Date.now() < existingOTP.expiresAt) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another OTP',
        retryAfter: Math.ceil((existingOTP.expiresAt - Date.now()) / 1000),
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expirationTime = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[email] = {
      otp,
      expiresAt: expirationTime,
      attempts: 0,
      username,
    };

    // Send OTP via email
    await sendOTPEmail(email, otp, `Security Verification - New OTP for ${username}'s Account`);

    res.json({
      success: true,
      message: 'OTP resent to your email',
      // Remove in production - for testing only
      testOTP: otp,
    });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP',
      error: error.message,
    });
  }
});

export default router;
