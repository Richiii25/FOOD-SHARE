import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Thanks for joining Food Share, ${username}! Your account has been created.`);
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
              />
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
              />
            </div>
            
            <button type="submit">Sign Up</button>
          </form>

          <div className="redirect-link">
            Already have an account? <Link to="/login">Log in here</Link><br />
            <br />
            <Link to="/">&larr; Back to Home</Link>
          </div>
        </section>
      </main>

    
    </div>
  );
}

export default Signup;
