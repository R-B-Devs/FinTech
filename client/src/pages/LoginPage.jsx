import React from "react";
import "../styles/LoginPage.css";
import loginImg from "../img/login-image.jpg";

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left: Login Form Section */}
        <div className="login-form-section">
          <h1 className="brand-title">FinTech</h1>
          <h2 className="form-title">Login</h2>

          <div className="form-fields">

            {/* User ID Input */}
            <div className="input-group">
              <label htmlFor="userId" className="input-label">User ID</label>
              <input
                id="userId"
                type="text"
                placeholder="Enter your ID Number"
                className="input-field"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="input-field"
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="forgot-password">
              Forgot password?
            </div>

            {/* Sign In Button */}
            <button className="sign-in-button">
              Sign in
            </button>
          </div>
        </div>

        {/* Right: Register Section */}
        <div className="register-section">
          <img
            src={loginImg}
            alt="Login Illustration"
            className="login-image"
          />
          <h3 className="register-text">Don’t have an account?</h3>
          <button className="register-button">Register</button>
        </div>

      </div>
    </div>  
  );
};

export default LoginPage;