import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import loginImg from "../assets/login-image.jpg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userIdError, setUserIdError] = useState("");

  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [formError, setFormError] = useState("");

  const handleUserIdChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,13}$/.test(value)) {
      setUserId(value);
      if (value.length === 13) {
        setUserIdError("Valid ID Number ✅");
      } else {
        setUserIdError("ID must be exactly 13 digits.");
      }
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSymbol = /[*&!@_]/.test(value);
    const isLongEnough = value.length >= 8;

    const passedChecks = [hasUpper, hasLower, hasNumber, hasSymbol, isLongEnough].filter(Boolean).length;

    if (!value) {
      setPasswordStrength("");
    } else if (passedChecks <= 2) {
      setPasswordStrength("Weak ❌");
    } else if (passedChecks === 3 || passedChecks === 4) {
      setPasswordStrength("Moderate ⚠️");
    } else {
      setPasswordStrength("Strong ✅");
    }
  };

  const isPasswordValid = () => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[*&!@_]/.test(password)
    );
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (userId.length !== 13) {
      setFormError("User ID must be exactly 13 digits.");
      return;
    }

    if (!isPasswordValid()) {
      setFormError("Password is too weak or missing required characters.");
      return;
    }

    // Simulate login success
    setFormError("");
    alert("Login successful! 🎉");
    navigate("/dashboard"); // Redirect to dashboard(when is built)
  };

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left: Login Form Section */}
        <div className="login-form-section">
          <h1 className="brand-title">FinTech</h1>
          <h2 className="form-title">Login</h2>

          <form className="form-fields" onSubmit={handleLogin}>

            {/* User ID Input */}
            <div className="input-group">
              <label htmlFor="userId" className="input-label">User ID</label>
              <input
                id="userId"
                type="text"
                value={userId}
                onChange={handleUserIdChange}
                placeholder="Enter your ID Number"
                className="input-field"
              />
              {userIdError && (
                <p style={{ color: userId.length === 13 ? "lightgreen" : "red", fontSize: "14px" }}>
                  {userIdError}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter your password"
                className="input-field"
              />
              {password && (
                <p style={{
                  color: passwordStrength.includes("Strong") ? "lightgreen" :
                        passwordStrength.includes("Moderate") ? "orange" : "red",
                  fontSize: "14px"
                }}>
                  Password Strength: {passwordStrength}
                </p>
              )}
            </div>

            {/* Error Feedback */}
            {formError && (
              <p style={{ color: "red", fontSize: "14px", marginBottom: "10px" }}>
                {formError}
              </p>
            )}

            {/* Forgot Password */}
            <div
              className="forgot-password"
              style={{ color: "white", cursor: "pointer" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </div>

            {/* Sign In Button */}
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
        </div>

        {/* Right: Register Section */}
        <div className="register-section">
          <img
            src={loginImg}
            alt="Login Illustration"
            className="login-image"
          />
          <h3 className="register-text">Don’t have an account?</h3>
          <button
            className="register-button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;

