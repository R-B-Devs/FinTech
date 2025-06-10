const express = require('express');
const router = express.Router();
const { loginUser, registerUser, forgotPassword } = require('../cyberBackend/validateAndSecure');

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

module.exports = router;
