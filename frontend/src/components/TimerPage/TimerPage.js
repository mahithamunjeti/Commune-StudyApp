  import React from "react";
  import { useNavigate } from "react-router-dom";
  import "./TimerPage.css";
  import { useParams } from "react-router-dom";

  const TimerPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();

    return (
      <div className="timer-page-container">
        {/* Animated Background */}
        <div className="timer-animated-background">
          <div className="timer-blob timer-blob-1"></div>
          <div className="timer-blob timer-blob-2"></div>
        </div>
        
        {/* Header with Clickable Logo */}
        <header className="timer-header">
          <div className="logo-container" onClick={() => navigate(`/dashboard/${username}`)}>
            <div className="logo-circle"></div>
            <h1 className="app-title">commune</h1>
          </div>
        </header>

        <div className="timer-content">
          <h1 className="timer-heading">Choose a Clock Mode</h1>
          
          <div className="timer-options">
            <button 
              className="timer-button" 
              onClick={() => navigate(`/timer/countdown/${username}`)}
            >
              <span className="timer-icon">⏳</span>
              Countdown Timer
            </button>
            
            <button 
              className="timer-button" 
              onClick={() => navigate(`/timer/stopwatch/${username}`)}
            >
              <span className="timer-icon">⏱</span>
              Stopwatch
            </button>
            
            <button 
              className="timer-button" 
              onClick={() => navigate(`/timer/pomodoro/${username}`)}
            >
              <span className="timer-icon">🍅</span>
              Pomodoro Timer
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default TimerPage;