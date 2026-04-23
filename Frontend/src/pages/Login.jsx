import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Login successful! Redirecting to your dashboard...`);
    navigate('/dashboard');
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
            <Link to="/">&larr; Back to Home</Link>
          </div>
        </section>
      </main>

  
    </div>
  );
}

export default Login;
