// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
// Import your logo image
import logo from '../commune-logo.png'; // Update the path and filename to match your actual image

function Home() {
  return (
    <div className="home-container">
      <div className="animated-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      
      <header className="home-header">
        <div className="logo-container">
          <img src={logo} alt="Commune Logo" className="logo-image" />
          <h1 className="home-title">commune</h1>
        </div>
      </header>
      <div className="home-content">
        <div className="content-wrapper">
          <h2 className="home-heading">
            Achieve <span className="highlight">Together</span>
          </h2>
          
          <div className="tagline-container">
            <p className="home-text">
              Track goals, build streaks, and stay motivated with friends.
            </p>
          </div>
          
          <div className="button-container">
            <Link to="/login" className="home-button login-button">Sign In</Link>
            <Link to="/register" className="home-button register-button">Get Started</Link>
          </div>
        </div>
        
        <div className="illustration">
          <div className="illustration-element circle-1"></div>
          <div className="illustration-element circle-2"></div>
          <div className="illustration-element line-1"></div>
          <div className="illustration-element line-2"></div>
        </div>
      </div>
    </div>
  );
}

export default Home;