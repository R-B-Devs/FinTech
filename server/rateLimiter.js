const rateLimit = require('express-rate-limit');

// Create a limiter for login requests
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

module.exports = loginLimiter;
