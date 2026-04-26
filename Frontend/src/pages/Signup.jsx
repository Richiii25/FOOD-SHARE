import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import '../styles/Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1'); // Default to US
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState('registration'); // 'registration' or 'phone-verification' or 'otp-verification'
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpStep, setOtpStep] = useState('email'); // 'email' or 'phone'

  // Country codes list
  const countryCodes = [
    { code: '+1', country: 'USA' },
    { code: '+44', country: 'UK' },
    { code: '+91', country: 'India' },
    { code: '+86', country: 'China' },
    { code: '+81', country: 'Japan' },
    { code: '+33', country: 'France' },
    { code: '+49', country: 'Germany' },
    { code: '+39', country: 'Italy' },
    { code: '+34', country: 'Spain' },
    { code: '+61', country: 'Australia' },
    { code: '+1-416', country: 'Canada (Ontario)' },
    { code: '+55', country: 'Brazil' },
    { code: '+27', country: 'South Africa' },
    { code: '+7', country: 'Russia' },
  ];

  // Validate phone number format
  const validatePhoneNumber = (phone) => {
    // Remove any spaces or dashes
    const cleanPhone = phone.replace(/[\s-]/g, '');
    // Check if it's at least 10 digits
    const digitCount = cleanPhone.replace(/\D/g, '').length;
    return digitCount >= 10;
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!username.trim()) {
      setError('Username is required!');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address!');
      return;
    }

    if (!validatePhoneNumber(contactNumber)) {
      setError('Phone number must be at least 10 digits (including country code)!');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long!');
      return;
    }

    try {
      setIsLoading(true);
      
      // Generate OTP (6 digits)
      const generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(generatedOtpCode);

      // Send OTP via email first
      const response = await fetch('http://localhost:5000/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp: generatedOtpCode,
          username: username,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      setStep('otp-verification');
      setOtpStep('email');
      setIsLoading(false);
    } catch (err) {
      setError('Failed to send OTP. Please check your email and try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    try {
      setIsLoading(true);

      if (otpStep === 'email') {
        // Email OTP verified, now send phone OTP
        const generatedPhoneOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(generatedPhoneOtpCode);
        setOtp(''); // Clear OTP input

        const fullPhoneNumber = countryCode + contactNumber;

        const response = await fetch('http://localhost:5000/api/send-phone-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: fullPhoneNumber,
            otp: generatedPhoneOtpCode,
            username: username,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send phone OTP');
        }

        setOtpStep('phone');
        setIsLoading(false);
      } else if (otpStep === 'phone') {
        // Phone OTP verified, complete registration
        const hashedPassword = await bcrypt.hash(password, 10);
        const fullPhoneNumber = countryCode + contactNumber;
        
        const response = await fetch('http://localhost:5000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username,
            email,
            contactNumber: fullPhoneNumber,
            hashedPassword,
          }),
        });

        if (!response.ok) {
          throw new Error('Registration failed');
        }

        setSuccess(true);
        setIsLoading(false);
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
      </header>
      
      <main>
        <section className="card">
          <h2>Join the Mission</h2>
          <p>Create an account to start sharing and saving food.</p>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">✓ Registration successful! Redirecting to login...</div>}
          
          {!success ? (
            <>
              {step === 'registration' ? (
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Choose a username"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Contact Number</label>
                    <div className="phone-input-group">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        disabled={isLoading}
                        className="country-code-select"
                      >
                        {countryCodes.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code} {item.country}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="10-digit phone number"
                        required
                        disabled={isLoading}
                        className="phone-input"
                      />
                    </div>
                    <small>Enter a phone number with at least 10 digits</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <button type="submit" disabled={isLoading}>
                    {isLoading ? 'Sending OTP...' : 'Continue'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit}>
                  <div className="otp-info">
                    {otpStep === 'email' ? (
                      <>
                        <p>We've sent a One-Time Password (OTP) to <strong>{email}</strong></p>
                        <p>Please check your email and enter the code below.</p>
                      </>
                    ) : (
                      <>
                        <p>We've sent a One-Time Password (OTP) to <strong>{countryCode} {contactNumber}</strong></p>
                        <p>Please check your phone and enter the code below.</p>
                      </>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="otp">Enter OTP</label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength="6"
                      required
                      disabled={isLoading}
                      className="otp-input"
                    />
                  </div>
                  
                  <button type="submit" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>

                  <button 
                    type="button" 
                    className="resend-otp-btn"
                    onClick={() => setStep('registration')}
                    disabled={isLoading}
                  >
                    Back to Registration
                  </button>
                </form>
              )}

              <div className="redirect-link">
                Already have an account? <Link to="/login">Log in here</Link><br />
                <br />
                <Link to="/">&larr; Back to Home</Link>
              </div>
            </>
          ) : (
            <div className="success-content">
              <p>Welcome to Food Share, <strong>{username}</strong>!</p>
              <p>Your account has been successfully created.</p>
            </div>
          )}
        </section>
      </main>

    
    </div>
  );
}

export default Signup;
