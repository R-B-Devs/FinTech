import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordImg from "../assets/forgot.png"; // Make sure the image exists in /assets

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Password reset link sent to: ${email}`);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.left}>
        <h1 style={styles.logo}>ByteBank</h1>
        <h2 style={styles.heading}>Forgot<br />Password</h2>
        <p style={styles.text}>
          Enter your email address below to receive a password reset link.
        </p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. user@bytebank.com"
            required
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Send Reset Link</button>
        </form>
      </div>
      <div style={styles.right}>
        <img src={ForgotPasswordImg} alt="Forgot Password Illustration" style={styles.image} />
      </div>
    </div>
  );
};

// Styled for ByteBank theme: black, white, dark red
const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Lora, sans-serif',
    backgroundColor: '#000000',
  },
  left: {
    flex: 1,
    padding: '60px',
    backgroundColor: '#1c1c1c',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#FF0000', // Red accent
    marginBottom: '20px',
  },
  heading: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '10px',
  },
  text: {
    fontSize: '16px',
    color: '#c4c4c4',
    marginBottom: '30px',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  label: {
    fontSize: '14px',
    color: '#c4c4c4',
  },
  input: {
    padding: '12px',
    backgroundColor: '#2a2a2a',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    backgroundColor: '#FF0000',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: 'white',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  right: {
    flex: 1,
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    maxHeight: '80%',
    objectFit: 'contain',
  },
};

export default ForgotPassword;
