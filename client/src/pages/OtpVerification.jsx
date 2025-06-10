import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/OtpVerification.css";

const SendOtpForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Modal states
  const [otp, setOtp] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [verifying, setVerifying] = useState(false);

  // Timer effect for OTP expiration
  useEffect(() => {
    let timer;
    if (showModal && secondsLeft > 0) {
      timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showModal, secondsLeft]);

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
        // Show modal instead of redirecting
        setTimeout(() => {
          setShowModal(true);
          setSecondsLeft(300); // Reset timer
          setOtp('');
          setModalMessage('');
        }, 1000);
      } else {
        setMessage('❌ Failed to send OTP: ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Error sending OTP. Check backend.');
      console.error(error);
    }

    setLoading(false);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setModalMessage('');
    
    try {
      const res = await axios.post('http://localhost:5000/verify-otp', { email, otp });
      if (res.data.success) {
        setModalMessage('✅ OTP verified successfully!');
        setTimeout(() => {
          setShowModal(false);
          // Add your success logic here (e.g., redirect to dashboard, update auth state, etc.)
          console.log('OTP verification successful - implement your success logic here');
        }, 1500);
      } else {
        setModalMessage('❌ Invalid or expired OTP.');
      }
    } catch (err) {
      setModalMessage('❌ Error verifying OTP.');
    }
    
    setVerifying(false);
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/send-otp', { email });
      setModalMessage('📨 OTP resent!');
      setSecondsLeft(300);
      setOtp('');
    } catch (err) {
      setModalMessage('❌ Failed to resend OTP.');
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const closeModal = () => {
    setShowModal(false);
    setOtp('');
    setModalMessage('');
    setSecondsLeft(300);
  };

  return (
    <>
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

      {/* OTP Verification Modal */}
      {showModal && (
        <div 
          className="modal-overlay"
          onClick={closeModal}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="verify-otp-title">Enter OTP</h2>
              <button
                onClick={closeModal}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <p style={{ textAlign: 'center', marginBottom: '1rem' }}>
              We sent a 6-digit code to <span className="email-display">{email}</span>
            </p>

            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="otp-input"
              style={{ marginBottom: '1rem' }}
            />

            <button
              onClick={handleVerify}
              disabled={verifying || !otp}
              className="verify-btn"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>

            <p style={{ textAlign: 'center', color: '#6b7280' }}>
              Time left: <span className={`timer-display ${secondsLeft < 60 ? 'timer-warning' : ''} ${secondsLeft < 30 ? 'timer-critical' : ''}`}>{formatTime(secondsLeft)}</span>
            </p>

            <div className="modal-actions">
              <button
                onClick={closeModal}
                className="action-btn"
              >
                Change Email
              </button>

              <button
                onClick={handleResend}
                disabled={secondsLeft > 0}
                className="action-btn"
              >
                Resend OTP
              </button>
            </div>

            {modalMessage && (
              <p className={`text-center text-sm mt-3 ${
                modalMessage.includes('✅') ? 'message-success' : 
                modalMessage.includes('📨') ? 'message-info' : 
                'message-error'
              }`}>{modalMessage}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SendOtpForm;