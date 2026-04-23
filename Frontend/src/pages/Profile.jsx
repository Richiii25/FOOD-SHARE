import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('Richy Lima');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');
  const [goal, setGoal] = useState('To help reduce food waste in my community and ensure extra meals go to those who need them.');
  const [profileImg, setProfileImg] = useState('https://via.placeholder.com/120?text=Avatar');

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      navigate('/');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Profile saved successfully! Looking good, ${fullName}.`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImg(imageUrl);
    }
  };

  const handleUploadClick = () => {
    document.getElementById('image-upload').click();
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile" className="active">My Profile</Link>
          <button id="logout-btn" className="logout-btn" onClick={handleLogout}>
            Log Out
          </button>
        </nav>
      </header>
      
      <main>
        <section className="profile-card">
          <div className="profile-header">
            <div className="avatar-container">
              <img src={profileImg} alt="Profile Picture" className="avatar" />
              <button type="button" className="upload-btn" title="Upload new picture" onClick={handleUploadClick}>
                +
              </button>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </div>
            <h2>Edit Profile</h2>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min="13"
                  max="120"
                  placeholder="e.g. 25"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="sex">Sex</label>
                <select
                  id="sex"
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="goal">Your Food Share Goal</label>
              <textarea
                id="goal"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="What do you hope to achieve here?"
              />
            </div>
            
            <button type="submit" className="save-btn">Save Changes</button>
          </form>
        </section>
      </main>

      
    </div>
  );
}

export default Profile;
