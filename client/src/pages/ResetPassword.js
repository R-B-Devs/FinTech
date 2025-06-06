import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";
import ResetImage from "../img/Reset.png"; // rename your image accordingly and put in /assets

const ResetPassword = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [idError, setIdError] = useState("");
  const navigate = useNavigate();

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

  const handleReset = (e) => {
    e.preventDefault();
    if (idError || strength !== "Strong") {
      alert("Please fix the issues before submitting.");
      return;
    }
    alert("Password reset successfully!");
    navigate("/login");
  };

  return (
    <div className="reset-wrapper">
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
      </div>
    </div>
  );
};

export default ResetPassword;
