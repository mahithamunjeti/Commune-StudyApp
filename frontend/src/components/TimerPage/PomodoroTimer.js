import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PomodoroTimer.css";

const PomodoroTimer = () => {
  const navigate = useNavigate();

  // Load values from localStorage (if available)
  const getStoredValue = (key, defaultValue) => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
  };

  const [timeLeft, setTimeLeft] = useState(getStoredValue("timeLeft", 25 * 60));
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(getStoredValue("isWorkSession", true));
  const [sessions, setSessions] = useState(getStoredValue("sessions", 0));

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsWorkSession((prev) => !prev);
      const nextTime = isWorkSession ? 5 * 60 : 25 * 60;
      setTimeLeft(nextTime);
      if (isWorkSession) {
        setSessions((prev) => prev + 1);
      }
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, isWorkSession]);

  // Save values in localStorage when they change
  useEffect(() => {
    localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
    localStorage.setItem("isWorkSession", JSON.stringify(isWorkSession));
    localStorage.setItem("sessions", JSON.stringify(sessions));
  }, [timeLeft, isWorkSession, sessions]);

  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStartPause = () => setIsRunning(!isRunning);

  const handleReset = () => {
    setIsRunning(false);
    setIsWorkSession(true);
    setTimeLeft(25 * 60);
    setSessions(0);
    localStorage.removeItem("timeLeft");
    localStorage.removeItem("isWorkSession");
    localStorage.removeItem("sessions");
  };

  return (
    <div className="pomodoro-container">
      <h1>🍅 Pomodoro Timer</h1>

      {/* Pomodoro Clock */}
      <div className="clock">
        <div className="clock-face">
          <div
            className="hand second-hand"
            style={{ transform: `rotate(${(timeLeft % 60) * 6}deg)` }}
          ></div>
        </div>
      </div>

      {/* Timer Display */}
      <h2 className="timer-display">{formatTime(timeLeft)}</h2>

      {/* Work / Break Indicator */}
      <p className="session-status">
        {isWorkSession ? "Work Session 🏋️" : "Break Time ☕"}
      </p>

      {/* Buttons */}
      <div className="buttons">
        <button className="start-button" onClick={handleStartPause}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
        <button className="back-button" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>

      {/* Session Tracker */}
      <div className="sessions-container">
        <h3>Completed Sessions: {sessions}</h3>
      </div>
    </div>
  );
};

export default PomodoroTimer;