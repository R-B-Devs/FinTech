import React from 'react';
import { Link } from 'react-router-dom';

export default function Notification() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial, sans-serif' }}>
        <Link to="/Dashboard" className="nav-link">
                  <span className="material-symbols-outlined">arrow_back</span>
                  <span>Back</span>
        </Link>
      <h2>🔔 Notifications</h2>

      <div style={{ backgroundColor: '#e6ffed', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
        ✅ Payment of R500.00 to <strong>Pick n Pay</strong> was successful.
      </div>

      <div style={{ backgroundColor: '#fff4e5', padding: '1rem', marginBottom: '1rem', borderRadius: '8px' }}>
        ⚠️ Your balance is below R100.00.
      </div>

      <div style={{ backgroundColor: '#ffe5e5', padding: '1rem', borderRadius: '8px' }}>
        ❌ Transaction failed. Insufficient funds for payment to <strong>Uber Eats</strong>.
      </div>
    </div>
  );
}



