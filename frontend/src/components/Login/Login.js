import React, { useState } from "react";
import { loginUser } from "../../api";
import { useNavigate } from "react-router-dom";
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser({ username, password, userType: "user" });
  
      if (response.data.message !== "login success") {
        setError(response.data.message); // show message from backend
        return;
      }
  
      // Save token and username
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", JSON.stringify(username));
  
      alert("Login Successful!");
      navigate(`/dashboard/${username}`);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };
  
  

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Welcome Back!</h2>
        <p className="login-subtitle">Login to continue your study journey</p>

        {error && <p className="error-message">{error}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <div>
            <label className="login-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div>
            <label className="login-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div>
            <button type="submit" className="login-button">
              Login
            </button>
          </div>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <a href="/register" className="login-link">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;