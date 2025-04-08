// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css'; // Import the CSS file

function Home() {
  return (
    <div className="home-container">
      {/* Top Section: Logo + App Name */}
      <header className="home-header">
        {<img src="/" alt="Study App Logo" className="home-logo" />}
        <h1 className="home-title">Study App</h1>
      </header>

      {/* Main Content Centered */}
      <div className="home-content">
        <h2 className="home-heading">
          Learn with <span className="highlight">Collaboration</span>!
        </h2>
        <p className="home-text">
          Stay motivated, track progress, and achieve goals together with your friends!
        </p>

        {/* Buttons Section */}
        <div className="button-container">
          <Link to="/login" className="home-button login-button">Login</Link>
          <Link to="/register" className="home-button register-button">Register</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
