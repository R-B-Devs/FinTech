import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordImg from "../img/forgot.png"; // ✅ use the actual image you imported

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to: ${email}`);
    navigate('/reset-password'); // ✅ redirect to reset page
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
      </div>
      <div style={styles.right}>
        <img src={ForgotPasswordImg} alt="Illustration" style={styles.image} /> {/* ✅ Correct image */}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'sans-serif',
  },
  left: {
    flex: 1,
    padding: '60px',
    backgroundColor: '#1e293b',
    color: 'white',
  },
  logo: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  text: {
    fontSize: '16px',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '8px',
  },
  input: {
    padding: '12px',
    marginBottom: '20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#38bdf8',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    color: 'white',
    cursor: 'pointer',
  },
  right: {
    flex: 1,
    backgroundColor: '#f8fafc',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    maxWidth: '80%',
    height: 'auto',
  },
};

export default ForgotPassword;
