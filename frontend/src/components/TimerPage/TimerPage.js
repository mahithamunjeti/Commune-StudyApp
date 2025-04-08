import React from "react";
import { useNavigate } from "react-router-dom";
import "./TimerPage.css";
import { useParams } from "react-router-dom";

const TimerPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  return (
    <div className="timer-page-container">
      {/* Header with Clickable Logo */}
      <header className="timer-header">
        <div className="logo-container" onClick={() => navigate(`/dashboard/${username}`)}>
          <img src="logo.png" alt="App Logo" className="logo-image" />
          <h1 className="app-title">StudyApp</h1>
        </div>
      </header>

      <h1 class="timer-heading">Choose a Timer Mode</h1>
      <div className="timer-options">
        <button className="timer-button" onClick={() => navigate(`/timer/countdown/${username}`)}>⏳ Countdown Timer</button>
        <button className="timer-button" onClick={() => navigate(`/timer/stopwatch/${username}`)}>⏱ Stopwatch</button>
        <button className="timer-button" onClick={() => navigate(`/timer/pomodoro/${username}`)}>🍅 Pomodoro Timer</button>
        {/* <button className="back-button" onClick={() => navigate("/dashboard")}>⬅ Back to Dashboard</button> */}
      </div>
    </div>
  );
};

export default TimerPage;
