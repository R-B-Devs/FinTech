import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DemoPage from "./pages/DemoPage";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword";
import RegistrationPage from "./pages/registration-page.jsx"; 
import OtpPage from "./pages/OtpVerification.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";

import Dashboard from './pages/Dashboard';
import CallContainer from './pages/CallContainer';  // Adjust path
import AgentContainer from "./pages/agentContainer.jsx";
import Analytics from './pages/Analytics';
import Goals from './pages/Goals';
import Offers from './pages/Offers';
import CreditHealth from './pages/CreditHealth';
import MoneyTracker from './pages/MoneyTracker';
import Chat from './pages/Chat';
import Transactions from './pages/Transactions';
import Cards from './pages/Cards';
import Investments from './pages/Investments';
import Profile from './pages/Profile';
import SettingsPage from './pages/Settings';
import InAppCall from './pages/InAppCall'; // 👈 Make sure this exists!
import AgentPage from "./pages/AgentPage.jsx";
import AgentReceiver from "./pages/AgentReceiver.jsx";


// NEW: Settings subpages
import PersonalInfo from './pages/PersonalInfo';
import LinkedAccounts from './pages/LinkedAccounts';
import HelpCenter from './pages/HelpCenter';
import ContactSupport from './pages/ContactSupport';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />
<Route path="/call" element={<CallContainer />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/receiver" element={<AgentReceiver />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/call" element={<CallContainer />} />
        <Route path="/agents" element={<AgentContainer />} />
        <Route path="/dashboard/analytics" element={<Analytics />} />
        <Route path="/dashboard/goals" element={<Goals />} />
        <Route path="/dashboard/offers" element={<Offers />} />
        <Route path="/dashboard/chat" element={<Chat />} />
        <Route path="/dashboard/credit-health" element={<CreditHealth />} />
        <Route path="/dashboard/money-tracker" element={<MoneyTracker />} />
        <Route path="/dashboard/transactions" element={<Transactions />} />
        <Route path="/dashboard/cards" element={<Cards />} />
        <Route path="/dashboard/investments" element={<Investments />} />
        <Route path="/dashboard/profile" element={<Profile />} />

        {/* Settings and its subpages */}
        <Route path="/dashboard/settings" element={<SettingsPage />} />

        {/* Call route for testing */}
        <Route path="/in-app-call" element={<InAppCall />} />

        <Route path="/dashboard/settings/personal-info" element={<PersonalInfo />} />
        <Route path="/dashboard/settings/linked-accounts" element={<LinkedAccounts />} />
        <Route path="/dashboard/settings/help-center" element={<HelpCenter />} />
        <Route path="/dashboard/settings/contact-support" element={<ContactSupport />} />
      </Routes>
    </Router>
  );
}

export default App;
