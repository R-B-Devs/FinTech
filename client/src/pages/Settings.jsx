import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Shield, Bell, CreditCard, Eye, EyeOff, ChevronRight,
  Moon, Sun, Smartphone, Mail, Lock, Globe, HelpCircle, LogOut, Save
} from 'lucide-react';
import '../styles/Settings.css';

export default function SettingsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState({
    pushNotifications: true,
    emailAlerts: true,
    transactionAlerts: true,
    budgetAlerts: false,
    marketUpdates: true
  });

  const [security, setSecurity] = useState({
    twoFactor: true,
    biometric: false,
    autoLock: '5min'
  });

  const [privacy, setPrivacy] = useState({
    hideBalances: false,
    analyticsSharing: true
  });

  const [darkMode, setDarkMode] = useState(true);

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityChange = (key, value) => {
    setSecurity(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = () => {
    alert('Settings saved successfully!');
    // TODO: Add save logic here (API or context)
  };

  const handleSignOut = () => {
    alert('Signing out...');
    // TODO: Add actual sign out logic
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
        {onClick && <ChevronRight className="chevron-icon" />}
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
      <div className="settings-header">
        <h1>Settings</h1>
        <button className="save-button" onClick={handleSaveChanges}>
          <Save className="icon" />
          <span>Save Changes</span>
        </button>
      </div>

      <div className="settings-inner">
        {/* Profile */}
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

        {/* Security */}
        <Section title="Security">
          <SettingItem icon={Shield} title="Two-Factor Authentication" subtitle="Extra security for your account">
            <Toggle checked={security.twoFactor} onChange={() => handleSecurityChange('twoFactor', !security.twoFactor)} />
          </SettingItem>
          <SettingItem icon={Smartphone} title="Biometric Login" subtitle="Use fingerprint or face recognition">
            <Toggle checked={security.biometric} onChange={() => handleSecurityChange('biometric', !security.biometric)} />
          </SettingItem>
          <SettingItem icon={Lock} title="Auto-Lock" subtitle="Automatically lock app after inactivity">
            <select className="select-input" value={security.autoLock} onChange={(e) => handleSecurityChange('autoLock', e.target.value)}>
              <option value="1min">1 minute</option>
              <option value="5min">5 minutes</option>
              <option value="15min">15 minutes</option>
              <option value="never">Never</option>
            </select>
          </SettingItem>
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <SettingItem icon={privacy.hideBalances ? EyeOff : Eye} title="Hide Balances" subtitle="Hide account balances on main screen">
            <Toggle checked={privacy.hideBalances} onChange={() => handlePrivacyChange('hideBalances')} />
          </SettingItem>
          <SettingItem icon={Globe} title="Analytics Sharing" subtitle="Help improve our services">
            <Toggle checked={privacy.analyticsSharing} onChange={() => handlePrivacyChange('analyticsSharing')} />
          </SettingItem>
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingItem icon={Bell} title="Push Notifications" subtitle="Receive notifications on your device">
            <Toggle checked={notifications.pushNotifications} onChange={() => handleNotificationChange('pushNotifications')} />
          </SettingItem>
          <SettingItem icon={Mail} title="Email Alerts" subtitle="Receive important updates via email">
            <Toggle checked={notifications.emailAlerts} onChange={() => handleNotificationChange('emailAlerts')} />
          </SettingItem>
          <SettingItem icon={CreditCard} title="Transaction Alerts" subtitle="Get notified of all transactions">
            <Toggle checked={notifications.transactionAlerts} onChange={() => handleNotificationChange('transactionAlerts')} />
          </SettingItem>
          <SettingItem icon={Bell} title="Budget Alerts" subtitle="Notifications when you exceed budgets">
            <Toggle checked={notifications.budgetAlerts} onChange={() => handleNotificationChange('budgetAlerts')} />
          </SettingItem>
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <SettingItem icon={darkMode ? Moon : Sun} title="Dark Mode" subtitle="Use dark theme throughout the app">
            <Toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
          </SettingItem>
        </Section>

        {/* Support */}
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

        {/* Account */}
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
