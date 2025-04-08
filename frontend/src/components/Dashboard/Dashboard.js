import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaClock } from "react-icons/fa";
import "./Dashboard.css";

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
      <header className="dashboard-header">
        <div className="logo-container">
          <img src="logo.png" alt="App Logo" className="logo-image" />
          <h1 className="app-title">StudyApp</h1>
        </div>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>

      <div className="username-display">
        Welcome, {username || "Guest"}!
      </div>

      <div className="dashboard-actions">
        <div className="welcome-message">
          Woohoo! Your study journey begins now! Let’s ace it together!
        </div>

        <button className="action-button" onClick={() => navigate(`/collab-rooms/${username}`)}>
          Join Collab Rooms
        </button>
        <button className="action-button" onClick={() => navigate(`/set-my-goals/${username}`)}>
          Set My Goals
        </button>
        <button className="timer-button" onClick={() => navigate(`/timer/${username}`)}>
          <FaClock size={24} style={{ marginRight: "8px" }} />
          Timer
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
