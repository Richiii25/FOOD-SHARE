import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Simulate login - in real app, you'd verify against backend
    alert(`Login successful! Redirecting to your dashboard...`);
    navigate('/dashboard');
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess(false);

    // Validation
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match!');
      return;
    }

    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters long!');
      return;
    }

    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Here you would typically send this to your backend
      console.log('Password Reset:', {
        email: forgotEmail,
        hashedPassword,
      });

      setForgotSuccess(true);
      
      // Reset form and redirect after 2 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotSuccess(false);
      }, 2000);
    } catch (err) {
      setForgotError('An error occurred while resetting password. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
      </header>
      
      <main>
        <section className="card">
          <h2>Welcome Back</h2>
          <p>Log in to continue saving food.</p>
          
          {!showForgotPassword ? (
            <>
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                
                <button type="submit">Log In</button>
              </form>

              <div className="redirect-link">
                Don't have an account? <Link to="/signup">Sign up here</Link><br />
                <br />
                <button 
                  type="button" 
                  className="forgot-password-btn"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot Password?
                </button>
                <br />
                <br />
                <Link to="/">&larr; Back to Home</Link>
              </div>
            </>
          ) : (
            <>
              <h3>Reset Your Password</h3>
              
              {forgotError && <div className="error-message">{forgotError}</div>}
              {forgotSuccess && <div className="success-message">✓ Password reset successful! Returning to login...</div>}
              
              {!forgotSuccess && (
                <form onSubmit={handleForgotPasswordSubmit}>
                  <div className="form-group">
                    <label htmlFor="forgotEmail">Email Address</label>
                    <input
                      type="email"
                      id="forgotEmail"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a new password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmNewPassword">Confirm New Password</label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                    />
                  </div>

                  <button type="submit">Reset Password</button>
                </form>
              )}

              <div className="redirect-link">
                <button 
                  type="button" 
                  className="back-to-login-btn"
                  onClick={() => setShowForgotPassword(false)}
                >
                  ← Back to Login
                </button>
              </div>
            </>
          )}
        </section>
      </main>

  
    </div>
  );
}

export default Login;
