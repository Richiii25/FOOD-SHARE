import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import '../styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [currentUsername, setCurrentUsername] = useState('johndoe'); // In production, get from session/auth
  const [step, setStep] = useState('settings'); // 'settings' or 'otp-verification'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');

  // Settings form states
  const [settingsData, setSettingsData] = useState({
    username: 'johndoe',
    phoneNumber: '+1-555-0100',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Track which fields are being changed
  const [changedFields, setChangedFields] = useState({
    username: false,
    phoneNumber: false,
    password: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettingsData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFieldToggle = (field) => {
    setChangedFields(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
    setError('');
    setSuccess('');
  };

  const validateSettings = () => {
    // Check if any field is being changed
    if (!changedFields.username && !changedFields.phoneNumber && !changedFields.password) {
      setError('Please select at least one field to change');
      return false;
    }

    if (changedFields.username && !settingsData.username.trim()) {
      setError('Username cannot be empty');
      return false;
    }

    if (changedFields.phoneNumber && !settingsData.phoneNumber.trim()) {
      setError('Phone number cannot be empty');
      return false;
    }

    if (changedFields.phoneNumber && settingsData.phoneNumber.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }

    if (changedFields.password) {
      if (!settingsData.currentPassword) {
        setError('Current password is required');
        return false;
      }

      if (!settingsData.newPassword) {
        setError('New password is required');
        return false;
      }

      if (settingsData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long');
        return false;
      }

      if (settingsData.newPassword !== settingsData.confirmPassword) {
        setError('New password and confirm password do not match');
        return false;
      }

      if (settingsData.newPassword === settingsData.currentPassword) {
        setError('New password must be different from current password');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateSettings()) {
      return;
    }

    try {
      setIsLoading(true);

      // Get user email (in production, this should come from session/auth)
      const userEmail = 'user@example.com'; // This should be fetched from user session

      // Send OTP via email
      const response = await fetch('http://localhost:5000/api/send-otp-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUsername,
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send OTP');
      }

      setStep('otp-verification');
      setError('');
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!enteredOtp.trim()) {
      setError('Please enter the OTP');
      return;
    }

    try {
      setIsLoading(true);

      // Get user email (in production, this should come from session/auth)
      const userEmail = 'user@example.com'; // This should be fetched from user session

      // Prepare update data
      const updateData = {
        username: currentUsername,
        email: userEmail,
        otp: enteredOtp,
        changedFields: changedFields,
      };

      // Add new values for fields being changed
      if (changedFields.username) {
        updateData.newUsername = settingsData.username;
      }

      if (changedFields.phoneNumber) {
        updateData.newPhone = settingsData.phoneNumber;
      }

      if (changedFields.password) {
        updateData.newPassword = settingsData.newPassword;
      }

      // Send update to backend
      const response = await fetch('http://localhost:5000/api/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update settings');
      }

      setSuccess('Settings updated successfully!');
      setIsLoading(false);

      // Reset form after 2 seconds
      setTimeout(() => {
        setStep('settings');
        setEnteredOtp('');
        setSettingsData({
          username: settingsData.username || 'johndoe',
          phoneNumber: settingsData.phoneNumber,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setChangedFields({
          username: false,
          phoneNumber: false,
          password: false,
        });
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update settings. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      navigate('/');
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      
      // Get user email (in production, this should come from session/auth)
      const userEmail = 'user@example.com'; // This should be fetched from user session

      const response = await fetch('http://localhost:5000/api/resend-otp-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUsername,
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP');
      }

      setSuccess('OTP resent successfully!');
      setEnteredOtp('');
      setTimeout(() => setSuccess(''), 3000);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
        <nav>
          <Link to="/profile">My Profile</Link>
          <Link to="/dashboard">Dashboard</Link>
          <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </header>

      <main>
        <div className="settings-container">
          <div className="settings-header">
            <h2>Account Settings</h2>
            <p>Manage your account information securely</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          {step === 'settings' ? (
            <form onSubmit={handleSubmit} className="settings-form">
              {/* Current Username Display */}
              <div className="info-box">
                <p><strong>Current Username:</strong> {currentUsername}</p>
              </div>

              {/* Change Username Section */}
              <fieldset className="settings-section">
                <legend>
                  <input
                    type="checkbox"
                    id="changeUsername"
                    checked={changedFields.username}
                    onChange={() => handleFieldToggle('username')}
                    disabled={isLoading}
                  />
                  <label htmlFor="changeUsername">Change Username</label>
                </legend>

                {changedFields.username && (
                  <div className="form-group">
                    <label htmlFor="username">New Username</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={settingsData.username}
                      onChange={handleInputChange}
                      placeholder="Enter new username"
                      disabled={isLoading}
                      required
                    />
                    <small>Username must be unique and contain only letters, numbers, and underscores</small>
                  </div>
                )}
              </fieldset>

              {/* Change Phone Number Section */}
              <fieldset className="settings-section">
                <legend>
                  <input
                    type="checkbox"
                    id="changePhone"
                    checked={changedFields.phoneNumber}
                    onChange={() => handleFieldToggle('phoneNumber')}
                    disabled={isLoading}
                  />
                  <label htmlFor="changePhone">Change Phone Number</label>
                </legend>

                {changedFields.phoneNumber && (
                  <div className="form-group">
                    <label htmlFor="phoneNumber">New Phone Number</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={settingsData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter new phone number"
                      disabled={isLoading}
                      required
                    />
                    <small>Please provide a valid phone number with country code</small>
                  </div>
                )}
              </fieldset>

              {/* Change Password Section */}
              <fieldset className="settings-section">
                <legend>
                  <input
                    type="checkbox"
                    id="changePassword"
                    checked={changedFields.password}
                    onChange={() => handleFieldToggle('password')}
                    disabled={isLoading}
                  />
                  <label htmlFor="changePassword">Change Password</label>
                </legend>

                {changedFields.password && (
                  <>
                    <div className="form-group">
                      <label htmlFor="currentPassword">Current Password</label>
                      <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={settingsData.currentPassword}
                        onChange={handleInputChange}
                        placeholder="Enter current password"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={settingsData.newPassword}
                        onChange={handleInputChange}
                        placeholder="Enter new password (minimum 8 characters)"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={settingsData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm new password"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </>
                )}
              </fieldset>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isLoading || (!changedFields.username && !changedFields.phoneNumber && !changedFields.password)}
                >
                  {isLoading ? 'Sending OTP...' : 'Continue to Verification'}
                </button>
                <Link to="/dashboard" className="btn-cancel">
                  Back to Dashboard
                </Link>
              </div>
            </form>
          ) : (
            <div className="otp-verification-form">
              <div className="otp-header">
                <h3>Verify Your Identity</h3>
                <p>We've sent a One-Time Password (OTP) to your registered email</p>
              </div>

              <form onSubmit={handleOtpSubmit}>
                <div className="form-group">
                  <label htmlFor="otp">Enter OTP</label>
                  <input
                    type="text"
                    id="otp"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    disabled={isLoading}
                    required
                    className="otp-input"
                  />
                  <small>Enter the 6-digit code sent to your email</small>
                </div>

                <div className="summary-box">
                  <h4>Changes to be applied:</h4>
                  <ul>
                    {changedFields.username && (
                      <li>Username: <strong>{currentUsername}</strong> → <strong>{settingsData.username}</strong></li>
                    )}
                    {changedFields.phoneNumber && (
                      <li>Phone Number: <strong>{settingsData.phoneNumber}</strong></li>
                    )}
                    {changedFields.password && (
                      <li>Password: <strong>Will be updated</strong></li>
                    )}
                  </ul>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-verify"
                    disabled={isLoading || enteredOtp.length !== 6}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button
                    type="button"
                    className="btn-back"
                    onClick={() => {
                      setStep('settings');
                      setEnteredOtp('');
                    }}
                    disabled={isLoading}
                  >
                    Back
                  </button>
                </div>

                <div className="resend-section">
                  <p>Didn't receive the OTP?</p>
                  <button
                    type="button"
                    className="btn-resend"
                    onClick={handleResendOtp}
                    disabled={isLoading}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Settings;
