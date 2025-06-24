import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/notification.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Notification() {
  return (
    <div className="notification-container">
      <Link to="/Dashboard" className="nav-link">
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back</span>
      </Link>

      <h2 className="notification-title">
        <i className="fa-regular fa-bell"></i> Notifications
      </h2>

      <div className="notification grey">
        Payment of <strong>R500.00</strong> to <strong>Pick n Pay</strong> was successful.
      </div>

      <div className="notification grey">
        Your balance is below <strong>R100.00</strong>.
      </div>

      <div className="notification grey">
        Transaction failed. Insufficient funds for payment to <strong>Uber Eats</strong>.
      </div>

      <div className="notification grey">
        Money received from <strong>Ramaphosa</strong>: <strong>R10,000.00</strong>.
      </div>

      <div className="notification grey">
        Your transaction of <strong>R103.00</strong> at <strong>GautrainCTLS</strong> exceeded your limit.
      </div>

      <div className="notification grey">
        Purchase: <strong>R56.00</strong> at <strong>Nandos BraamfonteinZA</strong>.
      </div>

      <div className="notification grey">
        Purchase: <strong>R250.80</strong> at <strong>SPUR Hatfield</strong>.
      </div>

      <div className="notification grey">
        Your card ending in <strong>9981</strong> was activated successfully.
      </div>

      <div className="notification grey">
        New login detected from <strong>Chrome on Windows 10</strong>.
      </div>

      <div className="notification grey">
        Reminder: Scheduled debit order of <strong>R2,300.00</strong> to <strong>RentDue</strong> tomorrow.
      </div>
    </div>
  );
}
