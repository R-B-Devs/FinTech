import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = new URLSearchParams(location.search).get('email') || '';
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(300);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://localhost:5000/verify-otp', { email, otp });
      if (res.data.success) {
        setMessage('✅ OTP verified! Redirecting...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage('❌ Invalid or expired OTP.');
      }
    } catch (err) {
      setMessage('❌ Error verifying OTP.');
    }
  };

  const handleResend = async () => {
    try {
      await axios.post('http://localhost:5000/send-otp', { email });
      setMessage('📨 OTP resent!');
      setSecondsLeft(300);
    } catch (err) {
      setMessage('❌ Failed to resend OTP.');
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-4">Enter OTP</h2>
        <p className="text-center mb-4">
          We sent a 6-digit code to <strong>{email}</strong>
        </p>

        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4 text-center"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300 mb-4"
        >
          Verify
        </button>

        <p className="text-center text-gray-600">
          Time left: <span className="font-semibold">{formatTime(secondsLeft)}</span>
        </p>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => navigate('/otp')}
            className="text-gray-600 hover:text-indigo-600 underline"
          >
            Change Email
          </button>

          <button
            onClick={handleResend}
            disabled={secondsLeft > 0}
            className={`font-medium ${
              secondsLeft > 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-indigo-600 hover:underline'
            }`}
          >
            Resend OTP
          </button>
        </div>

        <p className="text-center text-sm text-red-500 mt-3">{message}</p>
      </div>
    </div>
  );
};

export default VerifyOtp;
