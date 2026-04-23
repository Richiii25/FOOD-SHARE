import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate('/');
    }
  };

  const handleDonate = () => {
    alert("This would open a form to list your extra food, including photos, portion size, and pickup location.");
  };

  const handleFind = () => {
    alert("This would open a map or list showing available food in your area.");
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
        <nav>
          <Link to="/profile">My Profile</Link>
          <Link to="/settings">Settings</Link>
          <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </header>
      
      <main>
        <div className="dashboard-container">
          
          <div className="welcome-section">
            <h2>Welcome back, Food Saviour!</h2>
            <p>Here is the impact you've made so far.</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>12</h3>
              <p>Meals Donated</p>
            </div>
            <div className="stat-card">
              <h3>5</h3>
              <p>Meals Claimed</p>
            </div>
            <div className="stat-card">
              <h3>4.5 kg</h3>
              <p>Food Waste Prevented</p>
            </div>
          </div>

          <div className="action-panel">
            <h2>What would you like to do today?</h2>
            <div className="action-buttons">
              <button className="btn-green" onClick={handleDonate}>
                + Donate Extra Food
              </button>
              <button className="btn-orange" onClick={handleFind}>
                🔍 Find Available Food
              </button>
            </div>
          </div>

          <div className="activity-feed">
            <h2>Recent Activity</h2>
            <div className="activity-item">
              <div>
                <strong>Donated:</strong> 2 Portions of Pasta
              </div>
              <div className="activity-date">Today, 2:30 PM</div>
            </div>
            <div className="activity-item">
              <div>
                <strong>Claimed:</strong> Fresh Loaf of Bread
              </div>
              <div className="activity-date">Yesterday, 6:15 PM</div>
            </div>
            <div className="activity-item">
              <div>
                <strong>Donated:</strong> Assorted Vegetables
              </div>
              <div className="activity-date">Mar 25, 10:00 AM</div>
            </div>
          </div>

        </div>
      </main>

    
    </div>
  );
}

export default Dashboard;
