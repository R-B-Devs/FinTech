import React from 'react';
import '../styles/Goals.css'; // Optional CSS for goals styling

const Goals = () => {
  return (
    <div className="goals-page">
      <h2>Your Financial Goals</h2>
      <p>Track your progress and set new goals to stay on top of your finances.</p>

      {/* Placeholder for now */}
      <div className="goals-section">
        <h3>Savings Goal</h3>
        <p>💰 Target: R50,000</p>
        <p>📈 Progress: R37,200</p>
      </div>

      <div className="goals-section">
        <h3>Investment Goal</h3>
        <p>💼 Target: R100,000</p>
        <p>📉 Progress: R61,750</p>
      </div>
    </div>
  );
};

export default Goals;
