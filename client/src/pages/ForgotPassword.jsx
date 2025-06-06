import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';
import './ForgotPassword.css';

<Route path="/forgot-password" element={<ForgotPassword />} />


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement backend integration
    alert(`Password reset link sent to: ${email}`);
    navigate('/login'); // Navigate back to login
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h1 style={styles.logo}>ByteBank</h1>
        <h2 style={styles.heading}>Forgot<br />Password</h2>
        <p style={styles.text}>Enter your email address below to receive a password reset link.</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email address</label>
          <input
            type="email"
            value={email}L
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
      </div>
      <div style={styles.right}>
        <img src="forgot.png" alt="Illustration" style={styles.image} />
      </div>
    </div>
  );
};




export default ForgotPassword;