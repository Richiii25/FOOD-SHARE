import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioEmail = process.env.TWILIO_EMAIL_FROM;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const client = twilio(accountSid, authToken);

/**
 * Send OTP to user's email using Twilio SendGrid
 * @param {string} email - Recipient email address
 * @param {string} otp - One-Time Password to send
 * @param {string} username - User's username
 * @returns {Promise} - Promise that resolves when email is sent
 */
export const sendOTPEmail = async (email, otp, username) => {
  try {
    const message = await client.messages.create({
      from: twilioEmail,
      to: email,
      subject: 'Food Share - Verify Your Email',
      html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2c3e50;">Welcome to Food Share, ${username}!</h2>
              
              <p>Thank you for signing up. To complete your registration, please verify your email address using the code below:</p>
              
              <div style="background-color: #f4f4f9; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <p style="font-size: 14px; color: #666; margin: 0;">Your verification code:</p>
                <p style="font-size: 32px; font-weight: bold; color: #3498db; margin: 10px 0; letter-spacing: 5px;">${otp}</p>
                <p style="font-size: 12px; color: #999; margin: 0;">This code expires in 10 minutes</p>
              </div>
              
              <p style="color: #666;">If you didn't sign up for Food Share, you can safely ignore this email.</p>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 12px; color: #999; text-align: center;">
                Food Share - Reducing Food Waste, One Meal at a Time<br>
                © 2024 Food Share. All rights reserved.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('OTP email sent successfully:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send OTP to user's phone via SMS using Twilio
 * @param {string} phoneNumber - Recipient phone number (with country code)
 * @param {string} otp - One-Time Password to send
 * @param {string} username - User's username
 * @returns {Promise} - Promise that resolves when SMS is sent
 */
export const sendOTPSMS = async (phoneNumber, otp, username) => {
  try {
    if (!twilioPhoneNumber) {
      throw new Error('Twilio phone number not configured in environment variables');
    }

    const message = await client.messages.create({
      body: `Food Share - Verification Code: ${otp}\n\nVerify your phone number to complete registration. Code expires in 10 minutes.\n\nIf you didn't request this, please ignore.`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log('OTP SMS sent successfully:', message.sid);
    return message;
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    throw new Error('Failed to send verification SMS');
  }
};

export default { sendOTPEmail, sendOTPSMS };
