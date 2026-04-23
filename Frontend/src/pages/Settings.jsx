import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Settings.css';

function Settings() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Settings saved successfully!');
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
          <h2>Account Settings</h2>
          <form id="settings-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>
            <button type="submit">Save Changes</button>
          </form>
        </div>
      </main>

     
    </div>
  );
}

export default Settings;
