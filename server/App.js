require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require("crypto");

async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('user_id')
    .limit(1);

  if (error) {
    console.error('❌ Supabase connection test failed:', error.message || error);
  } else {
    console.log('✅ Supabase database connection OK!');
  }
}

const app = express();
const PORT = process.env.PORT || 3001;
const resetTokens = {};

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET;



function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let otpStore = {};

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'absacobol@gmail.com', 
    pass: 'zbbo urcg hdge doeb',   
  },
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: '" LynqAI " <absacobol@gmail.com>', 
      to: email,
      subject: '🔐 Your OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      <h1 style="color: #8A1F2C; text-align: center;">🔐 LynqAI Verification</h1>
      <p>Hey there! 👋</p>
      <p>Your OTP code is:</p>
      <h2 style="text-align:center; background-color:#8A1F2C; color:#fff; padding:10px; border-radius:5px;">${otp}</h2>
      <p>This code will expire in <strong>5 minutes</strong>.</p>
      <p>If you didn’t request this, just ignore it.</p>
      <p>Stay awesome,<br/>— The LynqAI Team 💚</p>
    </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore[email];

  if (!entry || Date.now() > entry.expires) {
    return res.json({ success: false, message: 'OTP expired or invalid.' });
  }

  if (entry.otp !== otp) {
    return res.json({ success: false, message: 'Incorrect OTP.' });
  }

  // Optional: delete OTP from store after success
  delete otpStore[email];

  res.json({ success: true, message: 'OTP verified successfully!' });
});

//reset password 

app.post('/send-reset-link', async (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[email] = { token, expires: Date.now() + 15 * 60 * 1000 }; // 15 min expiry

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: '"LynqAI" <absacobol@gmail.com>',
      to: email,
      subject: '🔑 Reset Your Password',
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#8A1F2C;">Reset Your LynqAI Password</h2>
          <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <a href="${resetLink}" style="display:inline-block;background:#8A1F2C;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">Reset Password</a>
          <p>If you didn’t request this, ignore it.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (err) {
    console.error('Error sending reset link:', err);
    res.status(500).json({ success: false, message: 'Failed to send reset link' });
  }
});

//reset password code

app.post('/send-reset-link', async (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens[email] = { token, expires: Date.now() + 15 * 60 * 1000 }; // 15 min expiry

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: '"LynqAI" <absacobol@gmail.com>',
      to: email,
      subject: '🔑 Reset Your Password',
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
          <h2 style="color:#8A1F2C;">Reset Your LynqAI Password</h2>
          <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
          <a href="${resetLink}" style="display:inline-block;background:#8A1F2C;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">Reset Password</a>
          <p>If you didn’t request this, ignore it.</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (err) {
    console.error('Error sending reset link:', err);
    res.status(500).json({ success: false, message: 'Failed to send reset link' });
  }
});
//reset password token
app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const email = Object.keys(resetTokens).find(
    key => resetTokens[key].token === token && resetTokens[key].expires > Date.now()
  );

  if (!email) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  // Now update the password (you can later hook this to a DB update)
  console.log(`✅ New password for ${email}: ${password}`);

  // Clean up token after use
  delete resetTokens[email];

  res.json({ success: true, message: 'Password reset successful!' });
});





// ==========================
// AUTH LOGIC AND FUNCTIONS
// ==========================

async function registerUser(account_number, id_number, first_name, last_name, password) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('account_number', account_number)
    .eq('id_number', id_number);

  if (error) {
    console.error('Registration DB error:', error);
    return { success: false, code: -999, message: 'Registration failed due to server error' };
  }

  if (!users || users.length === 0) {
    return { success: false, code: -1, message: 'User not found with these details' };
  }

  const user = users[0];

  if (
    user.first_name.toLowerCase() !== first_name.toLowerCase() ||
    user.last_name.toLowerCase() !== last_name.toLowerCase()
  ) {
    return { success: false, code: -2, message: 'User details do not match our records' };
  }

  if (user.is_active && user.password_hash) {
    return { success: false, code: -3, message: 'User is already registered' };
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password_hash,
      salt,
      is_active: true,
      updated_at: new Date().toISOString(),
    })
    .eq('account_number', account_number)
    .eq('id_number', id_number);

  if (updateError) {
    console.error('Registration update error:', updateError);
    return { success: false, code: -999, message: 'Registration failed due to server error' };
  }

  return {
    success: true,
    code: 0,
    message: 'Registration successful',
    user: {
      user_id: user.user_id,
      account_number: user.account_number,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
  };
}

async function loginUser(id_number, password) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('id_number', id_number);

  if (error || !users || users.length === 0) {
    return { success: false, code: -1, message: 'User does not exist' };
  }

  const user = users[0];

  if (!user.is_active) {
    return { success: false, code: 1, message: 'Account not activated. Please register first.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    await supabase
      .from('users')
      .update({ failed_login_attempts: (user.failed_login_attempts || 0) + 1 })
      .eq('id_number', id_number);

    return { success: false, code: 2, message: 'Invalid password' };
  }

  await supabase
    .from('users')
    .update({
      last_login: new Date().toISOString(),
      failed_login_attempts: 0,
    })
    .eq('id_number', id_number);

  const token = jwt.sign(
    { user_id: user.user_id, id_number: user.id_number },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    success: true,
    code: 0,
    message: 'Login successful',
    token,
    user: {
      user_id: user.user_id,
      account_number: user.account_number,
      id_number: user.id_number,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      last_login: user.last_login,
    },
  };
}

async function getUserById(user_id) {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user_id)
    .eq('is_active', true);

  if (error || !users || users.length === 0) {
    return { success: false, message: 'User not found' };
  }
  return { success: true, user: users[0] };
}

async function getUserAccounts(user_id) {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user_id)
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Get accounts error:', error);
    return { success: false, message: 'Failed to get user accounts' };
  }
  return { success: true, accounts: data };
}

async function getUserTransactions(user_id, limit = 50, offset = 0) {
  const { data: accountData, error: accountError } = await supabase
    .from('accounts')
    .select('account_id')
    .eq('user_id', user_id)
    .eq('status', 'ACTIVE');

  if (accountError) {
    console.error('Account lookup error:', accountError);
    return { success: false, message: 'Could not get user accounts for transaction lookup' };
  }

  const accountIds = accountData.map((acc) => acc.account_id);

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      transaction_id,
      account_id,
      transaction_type,
      amount,
      description,
      category,
      merchant_name,
      transaction_date,
      balance_after,
      location,
      accounts (account_type)
    `)
    .in('account_id', accountIds)
    .range(offset, offset + limit - 1)
    .order('transaction_date', { ascending: false });

  if (error) {
    console.error('Get transactions error:', error);
    return { success: false, message: 'Failed to get user transactions' };
  }
  return { success: true, transactions: data };
}

async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return { success: false, message: 'Failed to get users' };
  }
  return {
    success: true,
    users: data,
    count: data.length,
  };
}

// ==========================
// AUTH MIDDLEWARE
// ==========================
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userResult = await getUserById(decoded.user_id);
    if (!userResult.success) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }
    req.user = userResult.user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ==========================
// ROUTES
// ==========================

app.get('/api/users/all', async (req, res) => {
  const result = await getAllUsers();
  if (result.success) {
    res.json({
      message: 'All users retrieved successfully',
      count: result.count,
      users: result.users,
    });
  } else {
    res.status(500).json({ error: result.message });
  }
});

app.get('/api/users/:user_id', async (req, res) => {
  const { user_id } = req.params;

  if (!/^[0-9a-fA-F-]{36}$/.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  const result = await getUserById(user_id);
  if (result.success) {
    res.json({ message: 'User retrieved successfully', user: result.user });
  } else {
    res.status(404).json({ error: result.message });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase.rpc('now');
    if (error) throw error;
    res.json({
      status: 'OK',
      message: 'API is running',
      database: 'Connected',
      timestamp: data,
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { account_number, id_number, first_name, last_name, password } = req.body;

  if (!account_number || !id_number || !first_name || !last_name || !password) {
    return res.status(400).json({
      error: 'All fields are required',
      required: ['account_number', 'id_number', 'first_name', 'last_name', 'password'],
    });
  }

  if (!/^\d{13}$/.test(id_number)) {
    return res.status(400).json({ error: 'Invalid ID number format. Must be 13 digits.' });
  }

  const result = await registerUser(account_number, id_number, first_name, last_name, password);
  if (result.success) {
    res.status(201).json({
      message: result.message,
      user: result.user,
    });
  } else {
    const statusCode = result.code === -1 ? 404 : 400;
    res.status(statusCode).json({
      error: result.message,
      code: result.code,
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { id_number, password } = req.body;

  if (!id_number || !password) {
    return res.status(400).json({
      error: 'ID number and password are required',
      required: ['id_number', 'password'],
    });
  }

  const result = await loginUser(id_number, password);
  if (result.success) {
    res.json({
      message: result.message,
      token: result.token,
      user: result.user,
    });
  } else {
    const statusCode = result.code === -999 ? 500 : 401;
    res.status(statusCode).json({
      error: result.message,
      code: result.code,
    });
  }
});

app.get('/api/users/profile', authenticateToken, async (req, res) => {
  res.json({
    message: 'User profile retrieved successfully',
    user: req.user,
  });
});

app.get('/api/users/accounts', authenticateToken, async (req, res) => {
  const result = await getUserAccounts(req.user.user_id);

  if (result.success) {
    res.json({
      message: 'Accounts retrieved successfully',
      accounts: result.accounts,
    });
  } else {
    res.status(500).json({ error: result.message });
  }
});

app.get('/api/users/transactions', authenticateToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const result = await getUserTransactions(req.user.user_id, limit, offset);

  if (result.success) {
    res.json({
      message: 'Transactions retrieved successfully',
      transactions: result.transactions,
      pagination: {
        limit,
        offset,
        count: result.transactions.length,
      },
    });
  } else {
    res.status(500).json({ error: result.message });
  }
});

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ABSA Financial Assistant API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
      },
      users: {
        profile: 'GET /api/users/profile',
        accounts: 'GET /api/users/accounts',
        transactions: 'GET /api/users/transactions',
      },
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

(async () => {
  await testSupabaseConnection();
  app.listen(PORT, () => {
    console.log(`Server running at: http://localhost:${PORT}`);
  });
})();

module.exports = app;