{/*import { Link } from 'react-router-dom';
import '../styles/BackToDashboardButton.css';



const BackToDashboardButton = () => (
    <Link to="/dashboard" className="nav-link">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
        </Link>
);
export default BackToDashboardButton; 

import React from 'react';*/}
import { Link } from 'react-router-dom';
import '../styles/BackToDashboardButton.css'; // ✅ Corrected path

const BackToDashboardButton = () => (
  <Link to="/Dashboard" className="nav-link">
    <span className="material-symbols-outlined">arrow_back</span>
    <span>Back</span>
  </Link>
);

{/*export default BackToDashboardButton;

import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackToDashboardButton = () => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate('/dashboard')}>
      <span className="material-symbols-outlined">arrow_back</span>
      Back to Dashboard
    </button>
  );
};*/}

export default BackToDashboardButton;

