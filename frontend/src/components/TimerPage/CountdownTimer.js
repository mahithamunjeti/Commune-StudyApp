import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CountdownTimer.css";

const CountdownTimer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
      setIsRunning(false);
      setShowMessage(true); // Show message instead of alert
      setTimeout(() => setShowMessage(false), 3000); // Hide message after 3 seconds
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds > 0) {
      setTimeLeft(totalSeconds);
      setIsRunning(true);
    } else {
      alert("Please select a valid time!");
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(null);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setShowMessage(false);
  };

  const hourDeg = (timeLeft !== null ? ((timeLeft / 3600) % 12) * 30 : 0);
  const minuteDeg = (timeLeft !== null ? ((timeLeft / 60) % 60) * 6 : 0);
  const secondDeg = (timeLeft !== null ? (timeLeft % 60) * 6 : 0);

  return (
    <div className="countdown-container">
      <h1>⏳ Countdown Timer</h1>

      {/* Clock Display */}
      <div className="clock">
        <div className="clock-face">
          <div className="hand hour-hand" style={{ transform: `rotate(${hourDeg}deg)` }}></div>
          <div className="hand minute-hand" style={{ transform:`rotate(${minuteDeg}deg)` }}></div>
          <div className="hand second-hand" style={{ transform:`rotate(${secondDeg}deg)` }}></div>
        </div>
      </div>

      {!isRunning && (
        <div className="time-inputs">
          <label>
            Hours:
            <input type="number" min="0" value={hours} onChange={(e) => setHours(parseInt(e.target.value) || 0)} />
          </label>
          <label>
            Minutes:
            <input type="number" min="0" value={minutes} onChange={(e) => setMinutes(parseInt(e.target.value) || 0)} />
          </label>
          <label>
            Seconds:
            <input type="number" min="0" value={seconds} onChange={(e) => setSeconds(parseInt(e.target.value) || 0)} />
          </label>
        </div>
      )}

      {timeLeft !== null && (
        <h2 className="timer-display">
          {String(Math.floor(timeLeft / 3600)).padStart(2, "0")}:
          {String(Math.floor((timeLeft % 3600) / 60)).padStart(2, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </h2>
      )}

      <div className="buttons">
        {!isRunning ? (
          <button className="start-button" onClick={startTimer}>Start</button>
        ) : (
          <button className="reset-button" onClick={resetTimer}>Reset</button>
        )}
        <button className="back-button" onClick={() => navigate(-1)}>⬅ Back</button>
      </div>

      {showMessage && <div className="message-container">⏳ Time's up! Stay focused and keep going! 🚀</div>}
    </div>
  );
};

export default CountdownTimer;