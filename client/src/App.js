import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landing-page';
import LoginPage from './pages/login-page';
import RegistrationPage from './pages/registration-page'
import OtpVerification from './pages/OtpVerification'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage/>} />
                     <Route path="/otp" element={<OtpVerification/>} />
      </Routes>
    </Router>
  );
};

export default App;
