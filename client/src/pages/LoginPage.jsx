import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import loginImg from "../assets/login-image.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';




const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="login-container">

        {/* Left: Login Form Section */}
        <div className="login-form-section">
          <h1 className="brand-title">LynqAI</h1>
          <h2 className="form-title">Login</h2>

          <div className="form-fields">

            {/* User ID Input */}
            <div className="input-group">
              <label htmlFor="userId" className="input-label">User ID</label>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faUser} className="input-icon" />
                <input
                  id="userId"
                  type="text"
                  placeholder="Enter your ID Number"
                  className="input-field with-icon"
                />
              </div>
            </div>


            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">Password</label>
              <div className="input-wrapper">
                <FontAwesomeIcon icon={faLock} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="input-field with-icon"
                />
              </div>
            </div>


            {/* Forgot Password */}
            <div
              className="forgot-password"
              style={{ color: "white", cursor: "pointer" }}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </div>

            {/* Sign In Button */}
            <button className="login-button">
              Login 
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
        <button
          className="register-button"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </div>

      </div>
    </div>
  );
};

export default LoginPage;
