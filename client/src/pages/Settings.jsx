import React, { useState } from 'react';
import '../styles/Settings.css';

const Settings = () => {
  const [user, setUser] = useState({
    fullName: 'Rolivhuwa Muzila',
    email: 'shawty@example.com',
    phone: '+27 71 234 5678',
    language: 'English',
    darkMode: false,
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser({ ...user, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSave = () => {
    alert('Settings saved successfully.');
  };

  return (
    <div className="settings-page">
      <h2>Account Settings</h2>

      <div className="settings-section">
        <h3>👤 Account Information</h3>
        <label>
          Full Name:
          <input type="text" name="fullName" value={user.fullName} onChange={handleChange} />
        </label>
        <label>
          Email Address:
          <input type="email" name="email" value={user.email} onChange={handleChange} />
        </label>
        <label>
          Phone Number:
          <input type="text" name="phone" value={user.phone} onChange={handleChange} />
        </label>
        <label>
          Preferred Language:
          <select name="language" value={user.language} onChange={handleChange}>
            <option value="English">English</option>
            <option value="Zulu">Zulu</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Xhosa">Xhosa</option>
          </select>
        </label>
      </div>

      <div className="settings-section">
        <h3>🎨 Preferences</h3>
        <label className="switch-label">
          <input type="checkbox" name="darkMode" checked={user.darkMode} onChange={handleChange} />
          Enable Dark Mode
        </label>
        <label className="switch-label">
          <input type="checkbox" name="notifications" checked={user.notifications} onChange={handleChange} />
          Receive Notifications
        </label>
      </div>

      <div className="settings-section">
        <h3>🔒 Security & Login</h3>
        <button className="action-btn orange">Change Password</button>
        <button className="action-btn red">Log Out</button>
      </div>

      <div className="settings-section">
        <h3>📬 Notifications</h3>
        <p>You will receive updates about transactions, savings goals, and AI insights to this email: <strong>{user.email}</strong></p>
      </div>

      <div className="settings-section">
        <h3>❓ Help & Support</h3>
        <p>If you experience any issues, feel free to <a href="mailto:support@lynqai.co.za">contact support</a> or visit our <a href="#">Help Center</a>.</p>
      </div>

      <button className="save-btn" onClick={handleSave}>💾 Save Settings</button>
    </div>
  );
};

export default Settings;
