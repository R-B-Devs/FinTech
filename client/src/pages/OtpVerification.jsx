import React, { useState } from 'react';

const SendOtpForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ OTP sent to your email!');
      } else {
        setMessage('❌ Failed to send OTP: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Error sending OTP. Check backend.');
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div className="otp-form-container" style={{ padding: '2rem' }}>
      <h2>Send OTP</h2>
      <form onSubmit={sendOtp}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '0.5rem', width: '250px' }}
        />
        <br /><br />
        <button type="submit" disabled={loading} style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default SendOtpForm;
