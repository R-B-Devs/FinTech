import React from 'react';
import { Activity, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/CreditHealth.css';

const CreditHealth = () => {
  return (
    <div className="credit-health-page">
      <Link to="/Dashboard" className="nav-link">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
      </Link>
      <h2><Activity className="icon" /> Credit Health Overview</h2>

      <div className="credit-score-section">
        <h3>Your Credit Score</h3>
        <div className="credit-score-box">
          <span className="score">742</span>
          <p className="score-rating">Excellent</p>
        </div>
        <p className="score-description">
          A credit score of 742 is considered excellent. Maintaining this can give you access to the best financial offers.
        </p>
      </div>

      <div className="credit-metrics">
        <div className="metric-card">
          <TrendingUp className="icon" />
          <h4>Credit Utilization</h4>
          <p>27% used of your total limit</p>
        </div>
        <div className="metric-card">
          <ShieldCheck className="icon" />
          <h4>Payment History</h4>
          <p>100% on-time payments</p>
        </div>
        <div className="metric-card">
          <Info className="icon" />
          <h4>Credit Tips</h4>
          <ul>
            <li><i class="fa-regular fa-lightbulb"></i> Keep utilization under 30%</li>
            <li><i class="fa-regular fa-lightbulb"></i> Always pay on time</li>
            <li><i class="fa-regular fa-lightbulb"></i> Avoid too many new credit applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreditHealth;
