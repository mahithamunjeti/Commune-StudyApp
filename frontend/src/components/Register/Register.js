// src/components/Register.js
import React, { useState } from "react";
import { registerUser } from "../../api";
// import { useNavigate } from "react-router-dom";
import "./Register.css"; // Import CSS file

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");


  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
  
    try {
      const response = await registerUser({ username, email, password, userType: "user" });
      
      const message = response?.data?.message;
      
      if (message === "Username already taken" || message === "Email already registered") {
        setError(message);
      } else {
        setSuccessMessage("✅ Registration initiated. Please check your email and verify your account.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };
  

  return (
    <div className="register-container">
      <div className="register-box">
        <h2 className="register-title">Join Us!</h2>
        <p className="register-subtitle">Create an account to get started</p>

        {error && <p className="error-message">{error}</p>}
        {successMessage && <p className="success-message">{successMessage}</p>}


        <form className="register-form" onSubmit={handleRegister}>
          <div>
            <label className="register-label">Username</label>
            <input
              type="text"
              //placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="register-input"
              required
            />
          </div>
          <div>
          <label className="register-label">Email</label>
            <input
              type="email"
              //placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="register-input"
              required
            />
          </div>
          <div>
          <label className="register-label">Password</label>
            <input
              type="password"
              //placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="register-input"
              required
            />
          </div>
          <div>
          <button type="submit" className="register-button">
            Register
          </button>
          </div>
        </form>

        <p className="register-footer">
          Already have an account?{" "}
          <a href="/login" className="login-link">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;