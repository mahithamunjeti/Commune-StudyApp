import './App.css';
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home/Home";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import TimerPage from "./components/TimerPage/TimerPage";
import CountdownTimer from "./components/TimerPage/CountdownTimer";
import Stopwatch from "./components/TimerPage/Stopwatch";
import PomodoroTimer from "./components/TimerPage/PomodoroTimer";
import SetMyGoals from "./components/SetMyGoals/SetMyGoals";
import CollabRooms from "./components/CollabRooms/CollabRooms";
import RoomPage from "./components/CollabRooms/RoomPage"; 
import PlaygroundPage from "./components/CollabRooms/PlaygroundPage";




const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes with :username */}
        <Route path="/dashboard/:username" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/set-my-goals/:username" element={<PrivateRoute><SetMyGoals /></PrivateRoute>} />
        <Route path="/timer/:username" element={<PrivateRoute><TimerPage /></PrivateRoute>} />
        <Route path="/timer/countdown/:username" element={<PrivateRoute><CountdownTimer /></PrivateRoute>} />
        <Route path="/timer/stopwatch/:username" element={<PrivateRoute><Stopwatch /></PrivateRoute>} />
        <Route path="/timer/pomodoro/:username" element={<PrivateRoute><PomodoroTimer /></PrivateRoute>} />
        <Route path="/collab-rooms/:username" element={<PrivateRoute><CollabRooms /></PrivateRoute>} />
        <Route path="/room/:roomId/:username" element={<PrivateRoute><RoomPage /></PrivateRoute>} /> 
        <Route path="/room/:roomId/playground" element={<PrivateRoute><PlaygroundPage /></PrivateRoute>} />


      </Routes>
    </Router>
  );
}

export default App;