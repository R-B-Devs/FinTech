const express = require('express');
const router = express.Router();
const loginLimiter = require('../rateLimiter'); // security feature

// Dummy user for demo
const validUser = {
  userId: 'Maneo',
  password: '0123456789101',
};

// Login endpoint (rate limited)
router.post('/login', loginLimiter, (req, res) => {
  const { userId, password } = req.body;

  if (userId === validUser.userId && password === validUser.password) {
    res.json({ token: 'hardcoded-access-token-1234' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// Registration endpoint
router.post('/register', (req, res) => {
  res.json({ message: 'User registered successfully (fake backend)' });
});

// Forgot password endpoint
router.post('/forgot-password', (req, res) => {
  res.json({ message: 'Password reset instructions sent (fake)' });
});

module.exports = router;
