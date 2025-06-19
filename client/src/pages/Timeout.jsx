import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Link } from 'react-router-dom';
import '../styles/Timeout.css';

const Timeout = ({ timeout = 30000, gracePeriod = 15000 }) => {
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const graceTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(gracePeriod / 1000); // in seconds

  const logout = () => {
    clearTimeout(timerRef.current);
    clearTimeout(graceTimerRef.current);
    clearInterval(countdownRef.current);
    navigate('/login');
  };

  const resetTimer = () => {
    clearTimeout(timerRef.current);
    clearTimeout(graceTimerRef.current);
    clearInterval(countdownRef.current);
    setShowModal(false);
    setCountdown(gracePeriod / 1000);
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setTimeout(() => {
      setShowModal(true);
      setCountdown(gracePeriod / 1000);

      // Start countdown interval
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Auto logout
      graceTimerRef.current = setTimeout(() => {
        logout();
      }, gracePeriod);
    }, timeout);
  };

  useEffect(() => {
    startTimer();

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(graceTimerRef.current);
      clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <>
      <Outlet />
      {showModal && (
        <div className="timeout-modal">
          <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
        </Link>
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
