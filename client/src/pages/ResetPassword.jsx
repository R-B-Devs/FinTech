import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ResetPassword.css";
import ResetImage from "../assets/Reset.png"; 

const ResetPassword = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [idError, setIdError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams(); 

  const validateId = (val) => {
    setUserId(val);
    if (val.length !== 13 || !/^\d+$/.test(val)) {
      setIdError("ID must be exactly 13 digits.");
    } else {
      setIdError("");
    }
  };

  const validatePassword = (pwd) => {
    setPassword(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[@!#&*_]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);

    if (pwd.length >= 8 && hasNumber && hasSymbol && hasUpper && hasLower) {
      setStrength("Strong");
    } else {
      setStrength("Weak");
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (idError || strength !== "Strong") {
      alert("Please fix the issues before submitting.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      alert(data.message);
      if (data.success) navigate("/login");
    } catch (err) {
      alert("Failed to reset password");
    }
  };

  return (
    <div className="reset-wrapper">
      <div className="reset-container">
        <div className="image-section">
          <img src={ResetImage} alt="Reset Illustration" />
        </div>
        <div className="reset-box">
          <h2>Reset Your Password</h2>
          <form onSubmit={handleReset}>
            <label>ID Number</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => validateId(e.target.value)}
              placeholder="Enter your 13-digit ID"
              required
            />
            {idError && <small style={{ color: "red" }}>{idError}</small>}

            <label>New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => validatePassword(e.target.value)}
              placeholder="New password"
              required
            />
            {strength && (
              <small style={{ color: strength === "Strong" ? "green" : "orange" }}>
                Password strength: {strength}
              </small>
            )}

            <button type="submit">Reset Password</button>
          </form>
          <div className="back-login" onClick={() => navigate("/login")}>
            &larr; Back to Login
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
