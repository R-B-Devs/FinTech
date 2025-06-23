import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Outlet, Link } from 'react-router-dom';
import '../styles/Timeout.css';

const Timeout = ({ timeout = 2 * 60 * 1000, gracePeriod = 30 * 1000 }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const graceTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(gracePeriod / 1000);

  const logout = () => {
    clearTimeout(timerRef.current);
    clearTimeout(graceTimerRef.current);
    clearInterval(countdownRef.current);
    removeActivityListeners();
    navigate('/login');
  };

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    clearTimeout(graceTimerRef.current);
    clearInterval(countdownRef.current);
    setShowModal(false);
    setCountdown(gracePeriod / 1000);
    startInactivityTimer();
  };

  const handleUserActivity = () => {
  if (!showModal) {
    clearTimeout(timerRef.current);
    startInactivityTimer();
  }
};


  const addActivityListeners = () => {
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
  };

  const removeActivityListeners = () => {
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('keydown', handleUserActivity);
    window.removeEventListener('scroll', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
  };

  const startInactivityTimer = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(gracePeriod / 1000);

      // Start countdown
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Final logout
      graceTimerRef.current = setTimeout(logout, gracePeriod);
    }, timeout);
  };

  useEffect(() => {
    addActivityListeners();
    startInactivityTimer();

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(graceTimerRef.current);
      clearInterval(countdownRef.current);
      removeActivityListeners();
    };
  }, []);

  return (
    <>
      <Outlet />
      {showModal && (
        <div className="timeout-modal">
          <div className="timeout-content">
            <h3>Session Timeout</h3>
            <p>
              You've been inactive. Please choose to stay signed in or log off.<br />
              You will be logged out automatically in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}.
            </p>
            <div className="timeout-buttons">
              <button onClick={resetTimer} className="stay-button">Stay Logged In</button>
              <button onClick={logout} className="logout-button">Log Off</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Timeout;
