import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Stopwatch.css";

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const handleStartStop = () => {
    setIsRunning(!isRunning);
  };

  const handleLap = () => {
    setLaps([...laps, time]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  return (
    <div className="stopwatch-container">
      <h1>⏱ Stopwatch</h1>

      {/* Stopwatch Clock */}
      <div className="clock">
        <div className="clock-face">
          <div
            className="hand second-hand"
            style={{ transform: `rotate(${(time % 60) * 6}deg)` }}
          ></div>
        </div>
      </div>

      {/* Timer Display */}
      <h2 className="timer-display">{formatTime(time)}</h2>

      {/* Buttons */}
      <div className="buttons">
        <button className="start-button" onClick={handleStartStop}>
          {isRunning ? "Pause" : "Start"}
        </button>
        <button className="lap-button" onClick={handleLap} disabled={!isRunning}>
          Lap
        </button>
        <button className="reset-button" onClick={handleReset}>
          Reset
        </button>
        <button className="back-button" onClick={() => navigate(-1)}>
          ⬅ Back
        </button>
      </div>

      {/* Laps */}
      {laps.length > 0 && (
        <div className="laps-container">
          <h3>Lap Times</h3>
          <ul>
            {laps.map((lap, index) => (
              <li key={index}>Lap {index + 1}: {formatTime(lap)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
