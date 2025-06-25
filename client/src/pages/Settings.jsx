import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, Smartphone, Mail, Lock, HelpCircle, LogOut, Save
} from 'lucide-react';
import '../styles/Settings.css';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [security, setSecurity] = useState({
    twoFactor: true,
    biometric: false,
    autoLock: '5min'
  });

  const handleSecurityChange = (key, value) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = () => {
    alert('Settings saved successfully!');
  };

  const handleSignOut = () => {
    alert('Signing out...');
    navigate('/login');
  };

  const SettingItem = ({ icon: Icon, title, subtitle, children, onClick }) => (
    <div className={`setting-item ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className="setting-item-left">
        <Icon style={{ color: '#dc143c' }} />
        <div>
          <h3 className="setting-item-title">{title}</h3>
          {subtitle && <p className="setting-item-subtitle">{subtitle}</p>}
        </div>
      </div>
      <div className="setting-item-right">
        {children}
      </div>
    </div>
  );

  const Toggle = ({ checked, onChange }) => (
    <button onClick={onChange} className={`toggle-switch ${checked ? 'checked' : ''}`}>
      <span className="toggle-thumb" />
    </button>
  );

  const Section = ({ title, children }) => (
    <div className="settings-section">
      <h2 className="section-title">{title}</h2>
      <div className="section-content">{children}</div>
    </div>
  );

  return (
    <div className="settings-container">
      <div className="settings-topbar">
        <div className="user-info">
          <div className="avatar-circle">L</div>
          <div>
            <h2 className="user-name">LynqAI</h2>
            <p className="user-role">Local Account</p>
          </div>
        </div>
        <button className="save-button" onClick={handleSaveChanges}>
          <Save className="icon" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-grid">
        <Section title="Profile">
          <SettingItem
            icon={User}
            title="Personal Information"
            subtitle="Update your profile details"
            onClick={() => navigate('/dashboard/settings/personal-info')}
          />
          <SettingItem
            icon={CreditCard}
            title="Linked Accounts"
            subtitle="Manage your bank accounts and cards"
            onClick={() => navigate('/dashboard/settings/linked-accounts')}
          />
        </Section>

        <Section title="Security">
          <SettingItem icon={Shield} title="Two-Factor Authentication" subtitle="Extra security for your account">
            <Toggle checked={security.twoFactor} onChange={() => handleSecurityChange('twoFactor', !security.twoFactor)} />
          </SettingItem>
          <SettingItem icon={Smartphone} title="Biometric Login" subtitle="Use fingerprint or face recognition">
            <Toggle checked={security.biometric} onChange={() => handleSecurityChange('biometric', !security.biometric)} />
          </SettingItem>
          <SettingItem icon={Lock} title="Auto-Lock" subtitle="Automatically lock app after inactivity">
            <select
              className="select-input"
              value={security.autoLock}
              onChange={(e) => handleSecurityChange('autoLock', e.target.value)}
            >
              <option value="1min">1 minute</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="never">Never</option>
            </select>
          </SettingItem>
        </Section>

        <Section title="Support">
          <SettingItem
            icon={HelpCircle}
            title="Help Center"
            subtitle="Get help and support"
            onClick={() => navigate('/dashboard/settings/help-center')}
          />
          <SettingItem
            icon={Mail}
            title="Contact Support"
            subtitle="Reach out to our support team"
            onClick={() => navigate('/dashboard/settings/contact-support')}
          />
        </Section>

        <Section title="Account">
          <SettingItem
            icon={LogOut}
            title="Sign Out"
            subtitle="Sign out of your account"
            onClick={handleSignOut}
          />
        </Section>
      </div>
    </div>
  );
}
