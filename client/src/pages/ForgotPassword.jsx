import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordImg from "../assets/forgot.png";
import Logo from "../assets/logo.png";

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
      <div style={styles.contentWrapper}>
        <div style={styles.left}>
          <img src={Logo} alt="Logo" style={styles.logo} />
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
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Lora, sans-serif',
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    display: 'flex',
    width: '80%',
    maxWidth: '1000px',
    backgroundColor: '#000000',
    borderRadius: '12px',
    // Removed boxShadow here to eliminate glow effect
  },
  left: {
    flex: 1,
    padding: '60px',
    backgroundColor: '#000000',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  logo: {
    width: '250px',
    marginBottom: '10px',
    alignSelf: 'center',
  },
  heading: {
    fontSize: '40px',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '10px',
    textAlign: 'center',
  },
  text: {
    fontSize: '16px',
    color: '#c4c4c4',
    marginBottom: '30px',
    lineHeight: '1.5',
    textAlign: 'center',
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
    backgroundColor: '#1a1a1a',
    color: 'white',
    border: '1px solid #444',
    borderRadius: '6px',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    backgroundColor: '#8A1F2C',
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
    backgroundColor: '#000000',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
  },
  image: {
    width: '100%',
    maxHeight: '80vh',
    objectFit: 'contain',
    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.1))',
  },
};

export default ForgotPassword;
