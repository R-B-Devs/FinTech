import React, { useState } from 'react';
/* import '../styles/registration-page.css'; */

function RegistrationForm() {
  const [idNumber, setIdNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [acceptedAt, setAcceptedAt] = useState(null);

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const isValidSouthAfricanID = (id) => {
    if (!/^\d{13}$/.test(id)) return false;

    const birth = id.substring(0, 6);
    const year = parseInt(birth.substring(0, 2), 10);
    const month = parseInt(birth.substring(2, 4), 10);
    const day = parseInt(birth.substring(4, 6), 10);
    const fullYear = year >= 0 && year <= 29 ? 2000 + year : 1900 + year;
    const date = new Date(fullYear, month - 1, day);
    if (
      date.getFullYear() !== fullYear ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    )
      return false;

    const citizenship = parseInt(id.charAt(10));
    if (![0, 1].includes(citizenship)) return false;

    // Luhn algorithm
    const digits = id.split('').map(Number);
    let evenDigits = '';
    for (let i = 1; i < 12; i += 2) evenDigits += digits[i];
    evenDigits = (parseInt(evenDigits) * 2).toString();
    let evenSum = evenDigits.split('').reduce((sum, digit) => sum + parseInt(digit), 0);

    let oddSum = 0;
    for (let i = 0; i < 12; i += 2) oddSum += digits[i];

    const total = evenSum + oddSum;
    const checkDigit = (10 - (total % 10)) % 10;

    return checkDigit === digits[12];
  };

  const validatePassword = (pw) => {
    return (
      pw.length >= 8 &&
      /[!@#$%^&*(),.?":{}|<>]/.test(pw) &&
      (pw.match(/\d/g) || []).length >= 2
    );
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!isValidSouthAfricanID(idNumber)) {
      newErrors.idNumber = 'Invalid SA ID Number.';
    }
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!validateEmail(email)) newErrors.email = 'Invalid email format.';
    if (!validatePassword(password)) {
      newErrors.password = 'Password must be 8+ chars, 1 symbol & 2 numbers.';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!termsAccepted) {
      newErrors.termsAccepted = 'You must accept the terms and conditions.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      setTimeout(() => {
        alert('Registration successful!');
        setIdNumber('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTermsAccepted(false);
        setAcceptedAt(null);
        setErrors({});
        setLoading(false);
      }, 2000);
    }
  };

  return (
    <div className="registration-container">
      <h1>
        <span className="brand">Lyng</span><span className="highlight">AI</span>
      </h1>
      <h2>Register</h2>
      <form className="form-box" onSubmit={handleSubmit} noValidate>
        <input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
        />
        {errors.idNumber && <p className="error">{errors.idNumber}</p>}

        <div className="name-fields">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          {errors.lastName && <p className="error">{errors.lastName}</p>}
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="error">{errors.email}</p>}

        <div className="password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password-span"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>
        {errors.password && <p className="error">{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}

        <label className="terms-label">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              setAcceptedAt(e.target.checked ? new Date().toISOString() : null);
            }}
          />
          I accept the{' '}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowTermsModal(true);
            }}
            className="terms-link"
          >
            terms and conditions
          </a>.
        </label>
        {errors.termsAccepted && <p className="error">{errors.termsAccepted}</p>}

        <input
          type="submit"
          className="signup-btn"
          value={loading ? 'Registering...' : 'Sign Up'}
          disabled={loading}
        />
      </form>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span
              className="modal-close"
              onClick={() => setShowTermsModal(false)}
              title="Close"
            >
              &times;
            </span>
            <h3>Terms and Conditions</h3>
            <p>
              These terms and conditions govern your use of our platform. By registering,
              you agree to comply with our privacy policy, code of conduct, and all applicable laws.
              You may not misuse the service or distribute harmful content. Violation may result in account suspension.
              <br /><br />
              If you do not agree with these terms, please do not register.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationForm;
