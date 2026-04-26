import express from 'express';
import { sendOTPEmail, sendOTPSMS } from '../utils/twilio.js';

const router = express.Router();

// Store OTP temporarily (In production, use Redis or database)
const otpStore = {};

/**
 * POST /api/send-otp
 * Sends OTP to user's email
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { email, otp, username } = req.body;

    // Validation
    if (!email || !otp || !username) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and username are required',
      });
    }

    // Send OTP via Twilio
    await sendOTPEmail(email, otp, username);

    // Store OTP temporarily (expires in 10 minutes)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    res.json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Error in send-otp route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send OTP',
    });
  }
});

/**
 * POST /api/verify-otp
 * Verifies the OTP entered by user
 */
router.post('/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
      });
    }

    const storedOtpData = otpStore[email];

    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found',
      });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // OTP verified successfully
    delete otpStore[email];
    res.json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP',
    });
  }
});

/**
 * POST /api/register
 * Registers a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, hashedPassword } = req.body;

    if (!username || !email || !hashedPassword) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required',
      });
    }

    // In a real application, you would:
    // 1. Check if user already exists
    // 2. Save user to database
    // 3. Return user data and JWT token

    console.log('User registered:', {
      username,
      email,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'User registered successfully',
      user: {
        username,
        email,
      },
    });
  } catch (error) {
    console.error('Error in register route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
    });
  }
});

/**
 * POST /api/send-phone-otp
 * Sends OTP to user's phone via SMS
 */
router.post('/send-phone-otp', async (req, res) => {
  try {
    const { phoneNumber, otp, username } = req.body;

    // Validation
    if (!phoneNumber || !otp || !username) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, OTP, and username are required',
      });
    }

    // Validate phone number format (should start with + and have digits)
    if (!/^\+\d{1,3}\d{5,14}$/.test(phoneNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format',
      });
    }

    // Send OTP via SMS
    await sendOTPSMS(phoneNumber, otp, username);

    // Store OTP temporarily (expires in 10 minutes)
    otpStore[phoneNumber] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    };

    res.json({
      success: true,
      message: 'OTP sent successfully to phone',
    });
  } catch (error) {
    console.error('Error in send-phone-otp route:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send phone OTP',
    });
  }
});

/**
 * POST /api/verify-phone-otp
 * Verifies the phone OTP entered by user
 */
router.post('/verify-phone-otp', (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
      });
    }

    const storedOtpData = otpStore[phoneNumber];

    if (!storedOtpData) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found',
      });
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[phoneNumber];
      return res.status(400).json({
        success: false,
        message: 'OTP expired',
      });
    }

    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // OTP verified successfully
    delete otpStore[phoneNumber];
    res.json({
      success: true,
      message: 'Phone OTP verified successfully',
    });
  } catch (error) {
    console.error('Error in verify-phone-otp route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify phone OTP',
    });
  }
});

export default router;
