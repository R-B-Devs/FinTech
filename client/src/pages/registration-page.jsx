import React from 'react';
import '../styles/registration-page.css';


function RegistrationForm() {
  return (
    <div className="registration-container">
      <h1><span className="brand">Lyng</span><span className="highlight">AI</span></h1>
      <h2>Register</h2>
      <form className="form-box">
        <input type="text" placeholder="ID Number" />
        <div className="name-fields">
          <input type="text" placeholder="First Name" />
          <input type="text" placeholder="Last Name" />
        </div>
        <input type="email" placeholder="Email" />
        <button type="submit" className="signup-btn">Sign Up</button>
      </form>
    </div>
  );
}

export default RegistrationForm;
