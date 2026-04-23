import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Main.css';

function Main() {
  const navigate = useNavigate();
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const facts = [
    "Roughly one-third of the food produced in the world for human consumption every year gets lost or wasted.",
    "Saving just 25% of the food currently wasted globally would be enough to feed 870 million hungry people.",
    "Food waste generates about 8% of global greenhouse gas emissions.",
    "Every meal saved is a step towards a sustainable future."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentFactIndex((prev) => (prev + 1) % facts.length);
        setFade(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <header>
        <h1>Welcome to Food Share</h1>
      </header>
      
      <main>
        <section className="card">
          <h2>Hey, Food Saviours!</h2>
          <p>This is an attempt to save food from being wasted and to feed the hungry. Join our mission today.</p>
          
          <div className="fact-box" style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease' }}>
            <span>{facts[currentFactIndex]}</span>
          </div>

          <div className="button-group">
            <button className="btn-secondary" onClick={() => navigate('/login')}>Log In</button>
            <button onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </section>
      </main>

      
    </div>
  );
}

export default Main;
