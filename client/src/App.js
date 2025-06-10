// App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DemoPage from "./pages/DemoPage";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword";
import RegistrationPage from "./pages/registration-page.jsx"; // ✅ Correct import
import OtpPage from "./pages/OtpVerification.jsx"
import VerifyOtp from "./pages/VerifyOtp.jsx";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<RegistrationPage />} /> {/* ✅ Correct usage */}
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />
    
      </Routes>
    </Router>
  );
}

export default App;
