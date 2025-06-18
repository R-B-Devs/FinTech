import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import loginImg from "../assets/login-image.jpg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { validateLogin } from '../cyberFrontend/validation';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [idError, setIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const validateId = (value) => {
    if (!/^\d{13}$/.test(value)) {
      setIdError('13 digits required');
    } else {
      setIdError('');
    }
  };

  const validatePassword = (value) => {
    const minLength = /.{8,}/;
    const uppercase = /[A-Z]/;
    const lowercase = /[a-z]/;
    const number = /\d/;
    const symbol = /[!@#*_]/;

    const passedRules = [minLength, uppercase, lowercase, number, symbol].filter(rule => rule.test(value)).length;

    if (passedRules < 5) {
      setPasswordError('Password must be 8+ characters and include upper, lower, number & symbol');
    } else {
      setPasswordError('');
    }

    // Strength Color
    if (passedRules <= 2) {
      setPasswordStrength('weak');
    } else if (passedRules === 3 || passedRules === 4) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-section">
          <h1><span className="brand">Lynq</span><span className="highlight">AI</span></h1>
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
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    validateId(e.target.value);
                  }}
                />
              </div>
              {idError && <span className="error-text">{idError}</span>}
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
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    validatePassword(e.target.value);
                  }}
                />
              </div>
              {passwordError && <span className="error-text">{passwordError}</span>}
              {password && (
                <div className={`strength-bar ${passwordStrength}`}>
                  {passwordStrength === 'weak' && 'Weak'}
                  {passwordStrength === 'medium' && 'Medium'}
                  {passwordStrength === 'strong' && 'Strong'}
                </div>
              )}
            </div>

            {/* Forgot Password */}
            <div className="forgot-password" style={{ color: "white", cursor: "pointer" }} onClick={() => navigate("/forgot-password")}>
              Forgot password?
            </div>

            {/* Sign In Button */}
            <button className="login-button" disabled={!!idError || !!passwordError}>
              Login 
            </button>
          </div>
        </div>

        {/* Right: Register Section */}
        <div className="register-section">
          <img src={loginImg} alt="Login Illustration" className="login-image" />
          <h3 className="register-text">Don’t have an account?</h3>
          <button className="register-button" onClick={() => navigate('/register')}>
            Register
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
