import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPassword from './pages/ForgotPassword';

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
        <img src="/images/reset-illustration.png" alt="Illustration" style={styles.image} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a)',
    color: '#eee',
    fontFamily: 'sans-serif',
  },
  left: {
    flex: 1,
    padding: '60px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    color: '#e14c3c',
    fontSize: '32px',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '42px',
    fontWeight: 'bold',
    lineHeight: '1.2',
    marginBottom: '10px',
  },
  text: {
    fontSize: '16px',
    marginBottom: '30px',
    color: '#ccc',
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
    fontSize: '16px',
    backgroundColor: '#1f1f1f',
    border: '1px solid #333',
    borderRadius: '6px',
    marginBottom: '20px',
    color: '#fff',
  },
  button: {
    padding: '14px',
    backgroundColor: '#e14c3c',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    maxWidth: '60%',
    height: 'auto',
  },
};

export default ForgotPassword;
