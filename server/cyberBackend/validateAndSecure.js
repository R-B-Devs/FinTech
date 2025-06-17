const express = require('express');
const router = express.Router();
const loginLimiter = require('./rateLimiter'); // ✅ Rate limiter

// ✅ Dummy user credentials (for now)
const validUser = {
  userId: 'Maneo',
  password: '0123456789101',
};

// ✅ Login route with rate limiter
router.post('/api/auth/login', loginLimiter, async (req, res) => {
  const { userId, password } = req.body;

  if (userId === validUser.userId && password === validUser.password) {
    res.json({ token: 'hardcoded-access-token-1234' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// ✅ Registration route
router.post('/api/auth/register', (req, res) => {
  // For now, just respond with success
  res.json({ message: 'User registered successfully (fake backend)' });
});

// ✅ Forgot password route
router.post('/api/auth/forgot-password', (req, res) => {
  // Respond as if an email was sent
  res.json({ message: 'Password reset instructions sent (fake)' });
});

module.exports = router;
