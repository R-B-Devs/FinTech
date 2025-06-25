import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordImg from "../assets/forgot.png";
import Logo from "../assets/logo.png";
import "../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:3001/send-reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      alert(data.message);
    } catch (err) {
      alert("Error sending reset link");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-content">
        <div className="forgot-password-left">
          <img src={Logo} alt="Logo" className="forgot-password-logo" />
          
          {/* ✅ Add this wrapper div */}
          <div className="forgot-password-body">
            <h2 className="forgot-password-heading">Forgot<br />Password</h2>
            <p className="forgot-password-text">
              Enter your email address below to receive a password reset link.
            </p>
            <form onSubmit={handleSubmit} className="forgot-password-form">
              <label className="forgot-password-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@lynqAI.com"
                required
                className="forgot-password-input"
              />
              <button type="submit" className="forgot-password-button">
                Send Reset Link
              </button>
            </form>
          </div>
          {/* ✅ End wrapper */}
        </div>

        <div className="forgot-password-right">
          <img 
            src={ForgotPasswordImg} 
            alt="Forgot Password Illustration" 
            className="forgot-password-image" 
          />
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
