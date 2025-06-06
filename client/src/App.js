import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DemoPage from "./pages/DemoPage";
import ForgotPassword from "./pages/ForgotPassword";
 
function App() {
  return (
<Router>
<Routes>
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/demo" element={<DemoPage />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
</Routes>
</Router>
  );
}
 
export default App;