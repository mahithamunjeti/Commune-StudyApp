import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock, FaUsers, FaBullseye, FaSignOutAlt } from "react-icons/fa";
import "./Dashboard.css";
import logo from '../commune-logo.png'; // Update the path and filename to match your actual image

const Dashboard = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/home");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-background">
        <div className="dashboard-blob blob-1"></div>
        <div className="dashboard-blob blob-2"></div>
      </div>
      
      <header className="dashboard-header">
        <div className="logo-container">
          <img src={logo} alt="Commune Logo" className="logo-image" />
          <h1 className="app-title">commune</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> <span>Logout</span>
        </button>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2 className="welcome-heading">Welcome back, <span className="username-highlight">{username || "User"}</span></h2>
          <p className="welcome-message">Ready to build some great habits today?</p>
        </div>
        
        <div className="dashboard-actions">
          <div className="action-card" onClick={() => navigate(`/collab-rooms/${username}`)}>
            <div className="action-icon-container">
              <FaUsers className="action-icon" />
            </div>
            <div className="action-content">
              <h3>Team Space</h3>
              <p>Collaborate with friends on shared goals</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => navigate(`/set-my-goals/${username}`)}>
            <div className="action-icon-container goal-icon">
              <FaBullseye className="action-icon" />
            </div>
            <div className="action-content">
              <h3>My Space</h3>
              <p>Create and track your personal objectives</p>
            </div>
          </div>
          
          <div className="action-card" onClick={() => navigate(`/timer/${username}`)}>
            <div className="action-icon-container timer-icon">
              <FaClock className="action-icon" />
            </div>
            <div className="action-content">
              <h3>Focus Mode</h3>
              <p>Stay focused with session timers</p>
            </div>
          </div>
        </div>
        
        <div className="quick-stats">
          {/* <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Active Streaks</div>
          </div> */}
          
          {/* <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Goals Set</div>
          </div> */}
          
          {/* <div className="stat-card">
            <div className="stat-value">0</div>
            <div className="stat-label">Room Joins</div>
          </div> */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;