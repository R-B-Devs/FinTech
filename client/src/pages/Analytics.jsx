import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Analytics.css';



const Analytics = () => {
  return (
    <div>

      <Link to="/" className="nav-link">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
      </Link>
     
    <div className="analytics-page">
      <h1 className="page-title">Analytics Overview</h1>
      <p className="page-subtitle">
        Explore your financial insights with interactive charts and summaries.
      </p>

      <div className="analytics-grid">
        <section className="analytics-card">
          <h2>Spending Breakdown</h2>
          <div className="chart-placeholder">
            {/* Replace this with your chart component */}
            <p>Pie chart showing categories of your spending</p>
          </div>
        </section>

        <section className="analytics-card">
          <h2>Monthly Trends</h2>
          <div className="chart-placeholder">
            {/* Replace this with your chart component */}
            <p>Line graph displaying your income and expenses over months</p>
          </div>
        </section>

        <section className="analytics-card">
          <h2>Top Merchants</h2>
          <div className="chart-placeholder">
            {/* Replace this with your chart component */}
            <p>Bar chart showing your most frequented merchants</p>
          </div>
        </section>

        <section className="analytics-card">
          <h2>Budget vs Actual</h2>
          <div className="chart-placeholder">
            {/* Replace this with your chart component */}
            <p>Comparison of your planned budget and actual spending</p>
          </div>
        </section>
        
      </div>
    </div>
   </div>
  );
};

export default Analytics;
