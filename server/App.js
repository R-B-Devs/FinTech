require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require("crypto");

// Supabase client initialization
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabaseClient = createClient(supabaseUrl, supabaseKey);
const authenticateToken = require('./middleware/auth');

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

//cors
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//debug middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Body:`, req.body);
  next();
});

//openai 
const aiRoutes = require('./api/ai');
app.use('/api/ai', aiRoutes);
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
      subject: ' Your OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      <h1 style="color: #8A1F2C; text-align: center;">🔐 LynqAI Verification</h1>
      <p>Hey there! </p>
      <p>Your OTP code is:</p>
      <h2 style="text-align:center; background-color:#8A1F2C; color:#fff; padding:10px; border-radius:5px;">${otp}</h2>
      <p>This code will expire in <strong>5 minutes</strong>.</p>
      <p>If you didn't request this, just ignore it.</p>
      <p>Stay awesome,<br/>— The LynqAI Team </p>
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

  delete otpStore[email];
  res.json({ success: true, message: 'OTP verified successfully!' });
});

// ======================================================================
//                            Password Reset
// ======================================================================

app.post('/send-reset-link', async (req, res) => {
  const { email } = req.body;

  let { data: user, error } = await supabaseClient.from('users').select('*').eq('email', email).single();

  if (!error) {
    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[email] = { token, expires: Date.now() + 15 * 60 * 1000 };

    const resetLink = `http://localhost:3000/reset-password/${token}`;

    try {
      await transporter.sendMail({
        from: '"LynqAI" <absacobol@gmail.com>',
        to: email,
        subject: ' Reset Your Password',
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #eee;border-radius:10px;">
            <h2 style="color:#8A1F2C;">Reset Your LynqAI Password</h2>
            <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
            <a href="${resetLink}" style="display:inline-block;background:#8A1F2C;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">Reset Password</a>
            <p>If you didn't request this, ignore it.</p>
          </div>
        `,
      });
      res.status(200).json({ success: true, message: 'Reset link sent successfully' });
    } catch (error) {
      console.error('Error sending reset link:', error.message);
      res.status(500).json({ success: false, message: 'Failed to send reset link' });
    }
  } else {
    console.error(`Password Reset link error - That email may not exist: ${error.message}`);
    res.status(404).json({ success: false, message: 'That account does not exist. Please try again.' });
  }
});

app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const email = Object.keys(resetTokens).find(
    key => resetTokens[key].token === token && resetTokens[key].expires > Date.now()
  );

  if (!email) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  } else {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const { error } = await supabaseClient.from('users').update({ password_hash: passwordHash, salt: salt })
      .eq('id_number', req.body.id_number);

    if (!error) {
      res.json({ success: true, message: 'Password reset successful!' });
    } else {
      res.status(406).json({ success: false, message: 'Unable to reset password. Please try again.' });
      console.error(`Password Reset error: ${error.message}`);
    }
  }

  delete resetTokens[email];
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
// ROUTES
// ==========================

app.get('/api/users/profile-full', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const [
      { data: accounts },
      { data: transactions },
      { data: income },
      { data: credit_scores },
      { data: loan_suggestions },
      { data: ai_conversations },
      { data: call_logs },
      { data: suspicious_activities }
    ] = await Promise.all([
      supabaseClient.from('accounts').select('*').eq('user_id', user_id),
      supabaseClient.from('transactions').select('*').in('account_id', (await supabaseClient.from('accounts').select('account_id').eq('user_id', user_id)).data.map(a => a.account_id)),
      supabaseClient.from('income').select('*').eq('user_id', user_id),
      supabaseClient.from('credit_scores').select('*').eq('user_id', user_id).order('score_date', { ascending: false }).limit(1),
      supabaseClient.from('loan_suggestions').select('*').eq('user_id', user_id),
      supabaseClient.from('ai_conversations').select('*').eq('user_id', user_id),
      supabaseClient.from('call_logs').select('*').eq('user_id', user_id),
      supabaseClient.from('suspicious_activities').select('*').eq('user_id', user_id),
    ]);

    res.json({
      user: req.user,
      accounts,
      transactions,
      income,
      credit_scores: credit_scores[0] || null,
      loan_suggestions,
      ai_conversations,
      call_logs,
      suspicious_activities
    });
  } catch (err) {
    console.error('Error loading full profile:', err);
    res.status(500).json({ error: 'Failed to load full profile' });
  }
});

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

app.get('/api/users/dashboard', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  try {
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');
    if (accountsError) throw accountsError;

    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    const investments = accounts
      .filter(acc => acc.account_type && acc.account_type.toLowerCase() === 'investment')
      .reduce((sum, acc) => sum + Number(acc.balance), 0);

    const accountIds = accounts.map(acc => acc.account_id);
    let recentTransactions = [];
    if (accountIds.length > 0) {
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: false })
        .limit(5);

      if (txError) throw txError;
      recentTransactions = transactions;
    }

    let creditScore = null;
    const { data: csData, error: csError } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);
    if (csError) throw csError;
    creditScore = csData && csData.length > 0 ? csData[0].score : null;

    res.json({
      totalBalance,
      investments,
      creditScore,
      savingsGoal: 75,
      recentTransactions,
      accounts
    });
  } catch (err) {
    console.error('Dashboard summary fetch error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data.' });
  }
});

app.put('/api/users/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const fields = req.body;

  if (!/^[0-9a-fA-F-]{36}$/.test(user_id)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  try {
    const validFields = Object.fromEntries(
      Object.entries(fields).filter(([_, value]) => value !== null && value !== '')
    );

    if (Object.keys(validFields).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    validFields.updated_at = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('users')
      .update(validFields)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) {
      console.error('Update user error:', error);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }

    res.json({ message: 'Profile updated successfully', user: data });
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users/:user_id', async (req, res) => {
  const { user_id } = req.params;
  console.log(user_id);

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
      analytics: {
        cashFlow: 'GET /api/analytics/cash-flow',
        categories: 'GET /api/analytics/spending-categories',
        health: 'GET /api/analytics/financial-health',
        merchants: 'GET /api/analytics/top-merchants',
        bills: 'GET /api/analytics/upcoming-bills',
        insights: 'GET /api/analytics/ai-insights',
        overview: 'GET /api/analytics/overview'
      }
    },
  });
});

// Helper function to get date range based on timeRange parameter
function getDateRange(timeRange) {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
      break;
    case '1year':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  }
  
  return { startDate: startDate.toISOString(), endDate: now.toISOString() };
}

// Helper function to generate months array for cash flow
function generateMonthsArray(timeRange) {
  const months = [];
  const now = new Date();
  const monthCount = timeRange === '3months' ? 3 : timeRange === '1year' ? 12 : 6;
  
  for (let i = monthCount - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
  }
  
  return months;
}

// Helper function to calculate previous period for trend comparison
function getPreviousPeriodStats(timeRange, transactions) {
  const { startDate: currentStart } = getDateRange(timeRange);
  const currentStartDate = new Date(currentStart);
  
  let previousStartDate, previousEndDate;
  
  switch (timeRange) {
    case '3months':
      previousStartDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() - 3, currentStartDate.getDate());
      previousEndDate = new Date(currentStartDate);
      break;
    case '6months':
      previousStartDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() - 6, currentStartDate.getDate());
      previousEndDate = new Date(currentStartDate);
      break;
    case '1year':
      previousStartDate = new Date(currentStartDate.getFullYear() - 1, currentStartDate.getMonth(), currentStartDate.getDate());
      previousEndDate = new Date(currentStartDate);
      break;
    default:
      previousStartDate = new Date(currentStartDate.getFullYear(), currentStartDate.getMonth() - 6, currentStartDate.getDate());
      previousEndDate = new Date(currentStartDate);
  }

  const previousTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.transaction_date);
    return txDate >= previousStartDate && txDate < previousEndDate;
  });

  const previousIncome = previousTransactions
    .filter(tx => tx.transaction_type === 'CREDIT')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

  const previousExpenses = previousTransactions
    .filter(tx => tx.transaction_type === 'DEBIT')
    .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

  return {
    income: previousIncome,
    expenses: previousExpenses,
    netFlow: previousIncome - previousExpenses
  };
}

// Helper function to calculate percentage change
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? '+100%' : '0%';
  const change = ((current - previous) / previous) * 100;
  return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
}

// Cash Flow Analytics
app.get('/api/analytics/cash-flow', authenticateToken, async (req, res) => {
  const { timeRange = '6months' } = req.query;
  const user_id = req.user.user_id;
  const { startDate, endDate } = getDateRange(timeRange);

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;
    if (!accounts || accounts.length === 0) {
      return res.json({ cashFlow: [] });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: true });

    if (txError) throw txError;

    const monthsArray = generateMonthsArray(timeRange);
    const cashFlowByMonth = {};

    monthsArray.forEach(month => {
      cashFlowByMonth[month] = { income: 0, expenses: 0, netFlow: 0 };
    });

    transactions.forEach(tx => {
      const txDate = new Date(tx.transaction_date);
      const monthKey = txDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (cashFlowByMonth[monthKey]) {
        const amount = Math.abs(parseFloat(tx.amount));
        
        if (tx.transaction_type === 'CREDIT') {
          cashFlowByMonth[monthKey].income += amount;
        } else {
          cashFlowByMonth[monthKey].expenses += amount;
        }
      }
    });

    const cashFlowData = monthsArray.map(month => ({
      month,
      income: Math.round(cashFlowByMonth[month].income),
      expenses: Math.round(cashFlowByMonth[month].expenses),
      netFlow: Math.round(cashFlowByMonth[month].income - cashFlowByMonth[month].expenses)
    }));

    res.json({ cashFlow: cashFlowData });
  } catch (error) {
    console.error('Cash flow analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch cash flow data' });
  }
});

// Spending Categories Analytics
app.get('/api/analytics/spending-categories', authenticateToken, async (req, res) => {
  const { timeRange = '6months' } = req.query;
  const user_id = req.user.user_id;
  const { startDate, endDate } = getDateRange(timeRange);

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;
    if (!accounts || accounts.length === 0) {
      return res.json({ categories: [] });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('category, amount')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .eq('transaction_type', 'DEBIT');

    if (txError) throw txError;

    const categoryTotals = {};
    const categoryColors = {
      'GROCERIES': '#10B981',
      'ENTERTAINMENT': '#3B82F6',
      'TRANSPORT': '#F59E0B',
      'UTILITIES': '#EF4444',
      'HEALTHCARE': '#8B5CF6',
      'SHOPPING': '#F97316',
      'DINING': '#EC4899',
      'OTHER': '#6B7280'
    };

    transactions.forEach(tx => {
      const category = tx.category || 'OTHER';
      const amount = Math.abs(parseFloat(tx.amount));
      categoryTotals[category] = (categoryTotals[category] || 0) + amount;
    });

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: categoryColors[name] || categoryColors.OTHER
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    res.json({ categories: categoryData });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Financial Health Metrics
app.get('/api/analytics/financial-health', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const accountIds = accounts.map(acc => acc.account_id);

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: recentTransactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', threeMonthsAgo.toISOString());

    if (txError) throw txError;

    const monthlyIncome = recentTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;

    const monthlyExpenses = recentTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;

    
    const emergencyFund = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
    const debtToIncomeRatio = 0; // Placeholder - add debt tracking later
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const creditUtilization = 15; // Placeholder - get from credit card data

    const getStatus = (value, targets) => {
      if (value >= targets.excellent) return 'excellent';
      if (value >= targets.good) return 'good';
      if (value >= targets.warning) return 'warning';
      return 'danger';
    };

    const metrics = [
      {
        metric: 'Emergency Fund',
        value: Math.round(emergencyFund * 10) / 10,
        target: 6,
        status: getStatus(emergencyFund, { excellent: 6, good: 3, warning: 1 }),
        description: 'Months of expenses you can cover with current savings'
      },
      {
        metric: 'Debt-to-Income Ratio',
        value: Math.round(debtToIncomeRatio),
        target: 36,
        status: getStatus(36 - debtToIncomeRatio, { excellent: 26, good: 16, warning: 6 }),
        description: 'Percentage of income going to debt payments'
      },
      {
        metric: 'Savings Rate',
        value: Math.round(savingsRate),
        target: 20,
        status: getStatus(savingsRate, { excellent: 20, good: 15, warning: 10 }),
        description: 'Percentage of income being saved'
      },
      {
        metric: 'Credit Utilization',
        value: creditUtilization,
        target: 30,
        status: getStatus(30 - creditUtilization, { excellent: 20, good: 15, warning: 5 }),
        description: 'Percentage of available credit being used'
      }
    ];

    res.json({ metrics });
  } catch (error) {
    console.error('Financial health error:', error);
    res.status(500).json({ error: 'Failed to fetch financial health data' });
  }
});

// Top Merchants Analytics
app.get('/api/analytics/top-merchants', authenticateToken, async (req, res) => {
  const { timeRange = '6months' } = req.query;
  const user_id = req.user.user_id;
  const { startDate, endDate } = getDateRange(timeRange);

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;
    if (!accounts || accounts.length === 0) {
      return res.json({ merchants: [] });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('merchant_name, amount')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .eq('transaction_type', 'DEBIT')
      .not('merchant_name', 'is', null);

    if (txError) throw txError;

    const merchantTotals = {};
    transactions.forEach(tx => {
      const merchant = tx.merchant_name;
      const amount = Math.abs(parseFloat(tx.amount));
      merchantTotals[merchant] = (merchantTotals[merchant] || 0) + amount;
    });

    const topMerchants = Object.entries(merchantTotals)
      .map(([name, totalSpent]) => ({
        name,
        totalSpent: Math.round(totalSpent),
        transactionCount: transactions.filter(tx => tx.merchant_name === name).length
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    res.json({ merchants: topMerchants });
  } catch (error) {
    console.error('Top merchants error:', error);
    res.status(500).json({ error: 'Failed to fetch merchant data' });
  }
});

// Enhanced Upcoming Bills with real data analysis
app.get('/api/analytics/upcoming-bills', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    if (!accounts || accounts.length === 0) {
      return res.json({ bills: [] });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    // Look for recurring transactions (same merchant, similar amounts)
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('merchant_name, amount, transaction_date, description')
      .in('account_id', accountIds)
      .eq('transaction_type', 'DEBIT')
      .gte('transaction_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()) // Last 3 months
      .not('merchant_name', 'is', null)
      .order('transaction_date', { ascending: false });

    if (txError) throw txError;

    // Analyze for recurring patterns
    const merchantPatterns = {};
    transactions.forEach(tx => {
      const merchant = tx.merchant_name;
      if (!merchantPatterns[merchant]) {
        merchantPatterns[merchant] = [];
      }
      merchantPatterns[merchant].push({
        amount: Math.abs(parseFloat(tx.amount)),
        date: new Date(tx.transaction_date),
        description: tx.description
      });
    });

    const predictedBills = [];
    
    Object.entries(merchantPatterns).forEach(([merchant, txs]) => {
      if (txs.length >= 2) { // At least 2 transactions to identify pattern
        const avgAmount = txs.reduce((sum, tx) => sum + tx.amount, 0) / txs.length;
        const sortedDates = txs.map(tx => tx.date).sort();
        
        // Calculate average days between transactions
        let totalDays = 0;
        for (let i = 1; i < sortedDates.length; i++) {
          totalDays += (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24);
        }
        const avgDaysBetween = totalDays / (sortedDates.length - 1);
        
        // Predict next bill date
        const lastDate = sortedDates[sortedDates.length - 1];
        const nextDueDate = new Date(lastDate.getTime() + avgDaysBetween * 24 * 60 * 60 * 1000);
        const daysLeft = Math.ceil((nextDueDate - new Date()) / (1000 * 60 * 60 * 24));
        
        // Only include if it's a likely recurring bill (monthly or similar pattern)
        if (avgDaysBetween >= 25 && avgDaysBetween <= 35 && daysLeft > 0 && daysLeft <= 45) {
          predictedBills.push({
            name: merchant,
            amount: Math.round(avgAmount),
            dueDate: nextDueDate.toISOString().split('T')[0],
            daysLeft: daysLeft,
            status: daysLeft <= 7 ? 'urgent' : daysLeft <= 14 ? 'upcoming' : 'future'
          });
        }
      }
    });

    // Sort by days left and limit to top 10
    const sortedBills = predictedBills
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 10);

    // If no recurring bills found, return some mock data for demo
    if (sortedBills.length === 0) {
      const mockBills = [
        {
          name: 'Electricity Bill',
          amount: 450,
          dueDate: '2025-01-15',
          daysLeft: 21,
          status: 'upcoming'
        },
        {
          name: 'Internet',
          amount: 899,
          dueDate: '2025-01-10',
          daysLeft: 16,
          status: 'upcoming'
        },
        {
          name: 'Insurance Premium',
          amount: 1200,
          dueDate: '2025-01-05',
          daysLeft: 11,
          status: 'urgent'
        }
      ];
      return res.json({ bills: mockBills });
    }

    res.json({ bills: sortedBills });
  } catch (error) {
    console.error('Upcoming bills error:', error);
    res.status(500).json({ error: 'Failed to fetch bills data' });
  }
});

// Enhanced AI Insights with real data analysis
app.get('/api/analytics/ai-insights', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const accountIds = accounts.map(acc => acc.account_id);

    // Get last 60 days of transactions for analysis
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const { data: recentTransactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', sixtyDaysAgo.toISOString())
      .order('transaction_date', { ascending: false });

    if (txError) throw txError;

    const insights = [];

    // Analyze spending patterns
    const lastMonthTxs = recentTransactions.filter(tx => 
      new Date(tx.transaction_date) >= thirtyDaysAgo && tx.transaction_type === 'DEBIT'
    );
    const previousMonthTxs = recentTransactions.filter(tx => 
      new Date(tx.transaction_date) < thirtyDaysAgo && tx.transaction_type === 'DEBIT'
    );

    // Category spending analysis
    const categoriesThisMonth = {};
    const categoriesLastMonth = {};

    lastMonthTxs.forEach(tx => {
      const category = tx.category || 'OTHER';
      categoriesThisMonth[category] = (categoriesThisMonth[category] || 0) + Math.abs(parseFloat(tx.amount));
    });

    previousMonthTxs.forEach(tx => {
      const category = tx.category || 'OTHER';
      categoriesLastMonth[category] = (categoriesLastMonth[category] || 0) + Math.abs(parseFloat(tx.amount));
    });

    // Find categories with significant increases
    Object.keys(categoriesThisMonth).forEach(category => {
      const thisMonth = categoriesThisMonth[category];
      const lastMonth = categoriesLastMonth[category] || 0;
      
      if (lastMonth > 0) {
        const increase = ((thisMonth - lastMonth) / lastMonth) * 100;
        if (increase > 20) {
          insights.push({
            type: 'alert',
            title: `Increased ${category.toLowerCase()} Spending`,
            message: `Your ${category.toLowerCase()} spending increased by ${increase.toFixed(0)}% this month. Consider reviewing these expenses.`,
            confidence: 85,
            action: 'Review Transactions'
          });
        }
      }
    });

    // Cash flow prediction
    const totalIncome = recentTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);
    
    const totalExpenses = recentTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const monthlyIncome = totalIncome / 2; // Last 2 months
    const monthlyExpenses = totalExpenses / 2;
    const projectedBalance = totalBalance + monthlyIncome - monthlyExpenses;

    if (projectedBalance > totalBalance) {
      insights.push({
        type: 'prediction',
        title: 'Positive Cash Flow Projection',
        message: `Based on your spending patterns, you're likely to have R${projectedBalance.toFixed(0)} by month-end.`,
        confidence: 78,
        action: 'View Details'
      });
    }

    // Savings opportunity
    if (monthlyIncome > monthlyExpenses) {
      const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
      if (savingsRate < 20) {
        insights.push({
          type: 'opportunity',
          title: 'Savings Opportunity',
          message: `Your current savings rate is ${savingsRate.toFixed(1)}%. Consider increasing it to 20% for better financial health.`,
          confidence: 90,
          action: 'View Tips'
        });
      }
    }

    // Large transaction alert
    const avgTransaction = totalExpenses / recentTransactions.filter(tx => tx.transaction_type === 'DEBIT').length;
    const largeTxs = lastMonthTxs.filter(tx => Math.abs(parseFloat(tx.amount)) > avgTransaction * 3);
    
    if (largeTxs.length > 0) {
      const largestTx = largeTxs.reduce((max, tx) => 
        Math.abs(parseFloat(tx.amount)) > Math.abs(parseFloat(max.amount)) ? tx : max
      );
      
      insights.push({
        type: 'alert',
        title: 'Large Transaction Detected',
        message: `You had a large transaction of R${Math.abs(parseFloat(largestTx.amount)).toFixed(0)} at ${largestTx.merchant_name || 'Unknown merchant'}.`,
        confidence: 95,
        action: 'Review Transaction'
      });
    }

    // Default insights if no patterns found
    if (insights.length === 0) {
      insights.push(
        {
          type: 'opportunity',
          title: 'Track Your Spending',
          message: 'Start categorizing your transactions to get better insights into your spending patterns.',
          confidence: 80,
          action: 'Get Started'
        },
        {
          type: 'prediction',
          title: 'Build Your Emergency Fund',
          message: 'Consider setting aside 3-6 months of expenses for financial security.',
          confidence: 85,
          action: 'Learn More'
        }
      );
    }

    res.json({ insights: insights.slice(0, 5) }); // Limit to 5 insights
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// Enhanced Overview Statistics with trend calculations
app.get('/api/analytics/overview', authenticateToken, async (req, res) => {
  const { timeRange = '6months' } = req.query;
  const user_id = req.user.user_id;
  const { startDate, endDate } = getDateRange(timeRange);

  try {
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;
    if (!accounts || accounts.length === 0) {
      return res.json({ 
        stats: {
          netCashFlow: 0,
          netCashFlowChange: '0%',
          netCashFlowTrend: 'neutral',
          avgDailySpending: 0,
          avgDailySpendingChange: '0%',
          avgDailySpendingTrend: 'neutral',
          financialHealth: 0,
          financialHealthChange: '0%',
          financialHealthTrend: 'neutral',
          savingsRate: 0,
          savingsRateChange: '0%',
          savingsRateTrend: 'neutral'
        }
      });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    // Get all transactions for comparison (current + previous period)
    const extendedStartDate = new Date(startDate);
    switch (timeRange) {
      case '3months':
        extendedStartDate.setMonth(extendedStartDate.getMonth() - 3);
        break;
      case '6months':
        extendedStartDate.setMonth(extendedStartDate.getMonth() - 6);
        break;
      case '1year':
        extendedStartDate.setFullYear(extendedStartDate.getFullYear() - 1);
        break;
    }

    const { data: allTransactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', extendedStartDate.toISOString())
      .lte('transaction_date', endDate);

    if (txError) throw txError;

    // Split transactions into current and previous periods
    const currentTransactions = allTransactions.filter(tx => 
      new Date(tx.transaction_date) >= new Date(startDate)
    );
    const previousTransactions = allTransactions.filter(tx => 
      new Date(tx.transaction_date) < new Date(startDate)
    );

    // Calculate current period metrics
    const totalIncome = currentTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const totalExpenses = currentTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const netCashFlow = totalIncome - totalExpenses;
    
    const daysInPeriod = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const avgDailySpending = totalExpenses / daysInPeriod;

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Calculate financial health score
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const monthlyExpenses = totalExpenses / (daysInPeriod / 30);
    const emergencyFundMonths = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
    
    let financialHealth = 0;
    if (emergencyFundMonths >= 6) financialHealth += 3;
    else if (emergencyFundMonths >= 3) financialHealth += 2;
    else if (emergencyFundMonths >= 1) financialHealth += 1;
    
    if (savingsRate >= 20) financialHealth += 3;
    else if (savingsRate >= 15) financialHealth += 2;
    else if (savingsRate >= 10) financialHealth += 1;
    
    if (netCashFlow > 0) financialHealth += 2;
    else if (netCashFlow >= -1000) financialHealth += 1;
    
    financialHealth += 2; // Base score
    financialHealth = Math.min(Math.round(financialHealth), 10);

    // Calculate previous period metrics for comparison
    const prevTotalIncome = previousTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const prevTotalExpenses = previousTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const prevNetCashFlow = prevTotalIncome - prevTotalExpenses;
    const prevAvgDailySpending = prevTotalExpenses / daysInPeriod;
    const prevSavingsRate = prevTotalIncome > 0 ? ((prevTotalIncome - prevTotalExpenses) / prevTotalIncome) * 100 : 0;

    // Calculate previous financial health
    let prevFinancialHealth = 2; // Base score
    if (prevSavingsRate >= 20) prevFinancialHealth += 3;
    else if (prevSavingsRate >= 15) prevFinancialHealth += 2;
    else if (prevSavingsRate >= 10) prevFinancialHealth += 1;
    
    if (prevNetCashFlow > 0) prevFinancialHealth += 2;
    else if (prevNetCashFlow >= -1000) prevFinancialHealth += 1;
    
    prevFinancialHealth = Math.min(Math.round(prevFinancialHealth), 10);

    // Calculate percentage changes and trends
    const netCashFlowChange = calculatePercentageChange(netCashFlow, prevNetCashFlow);
    const avgDailySpendingChange = calculatePercentageChange(avgDailySpending, prevAvgDailySpending);
    const financialHealthChange = calculatePercentageChange(financialHealth, prevFinancialHealth);
    const savingsRateChange = calculatePercentageChange(savingsRate, prevSavingsRate);

    const stats = {
      netCashFlow: Math.round(netCashFlow),
      netCashFlowChange,
      netCashFlowTrend: netCashFlow >= prevNetCashFlow ? 'up' : 'down',
      
      avgDailySpending: Math.round(avgDailySpending),
      avgDailySpendingChange,
      avgDailySpendingTrend: avgDailySpending <= prevAvgDailySpending ? 'down' : 'up', // Lower is better
      
      financialHealth,
      financialHealthChange,
      financialHealthTrend: financialHealth >= prevFinancialHealth ? 'up' : 'down',
      
      savingsRate: Math.round(savingsRate),
      savingsRateChange,
      savingsRateTrend: savingsRate >= prevSavingsRate ? 'up' : 'down'
    };

    res.json({ stats });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
  }
});

// Additional endpoint for goals tracking (to support the Analytics component)
app.get('/api/analytics/goals', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Check if you have a goals table, otherwise use mock data
    const { data: goals, error: goalsError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (goalsError && goalsError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      console.error('Goals fetch error:', goalsError);
    }

    let goalData = [];

    if (goals && goals.length > 0) {
      // Use real goals data
      goalData = goals.map(goal => ({
        goal: goal.goal_name,
        target: goal.target_amount,
        current: goal.current_amount,
        percentage: Math.round((goal.current_amount / goal.target_amount) * 100)
      }));
    } else {
      // Use mock data based on user's account balance
      const { data: accounts, error: accountError } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('user_id', user_id)
        .eq('status', 'ACTIVE');

      if (accountError) throw accountError;

      const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
      
      // Generate realistic mock goals based on user's balance
      goalData = [
        { 
          goal: 'Emergency Fund', 
          target: Math.max(50000, totalBalance * 0.6), 
          current: Math.min(totalBalance * 0.4, 32000), 
          percentage: Math.min(Math.round((totalBalance * 0.4) / Math.max(50000, totalBalance * 0.6) * 100), 100)
        },
        { 
          goal: 'Vacation Fund', 
          target: 15000, 
          current: Math.min(totalBalance * 0.1, 8500), 
          percentage: Math.min(Math.round((totalBalance * 0.1) / 15000 * 100), 100)
        },
        { 
          goal: 'Car Down Payment', 
          target: 25000, 
          current: Math.min(totalBalance * 0.2, 18000), 
          percentage: Math.min(Math.round((totalBalance * 0.2) / 25000 * 100), 100)
        },
        { 
          goal: 'Investment Portfolio', 
          target: 100000, 
          current: Math.min(totalBalance * 0.3, 45000), 
          percentage: Math.min(Math.round((totalBalance * 0.3) / 100000 * 100), 100)
        },
      ];
    }

    res.json({ goals: goalData });
  } catch (error) {
    console.error('Goals analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch goals data' });
  }
});

// Enhanced endpoint for budget tracking
app.get('/api/analytics/budget', authenticateToken, async (req, res) => {
  const { timeRange = '1month' } = req.query;
  const user_id = req.user.user_id;

  try {
    // Calculate current month spending by category
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;
    if (!accounts || accounts.length === 0) {
      return res.json({ budget: [] });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('category, amount')
      .in('account_id', accountIds)
      .gte('transaction_date', startOfMonth.toISOString())
      .lte('transaction_date', endOfMonth.toISOString())
      .eq('transaction_type', 'DEBIT');

    if (txError) throw txError;

    // Default budget limits (you could store these in a budgets table)
    const defaultBudgets = {
      'GROCERIES': 3000,
      'TRANSPORT': 2000,
      'ENTERTAINMENT': 1500,
      'UTILITIES': 2500,
      'DINING': 1000,
      'SHOPPING': 2000,
      'HEALTHCARE': 1000,
      'OTHER': 1500
    };

    // Calculate actual spending by category
    const actualSpending = {};
    transactions.forEach(tx => {
      const category = tx.category || 'OTHER';
      actualSpending[category] = (actualSpending[category] || 0) + Math.abs(parseFloat(tx.amount));
    });

    // Combine with budgets
    const budgetData = Object.keys(defaultBudgets).map(category => ({
      category,
      budget: defaultBudgets[category],
      spent: Math.round(actualSpending[category] || 0),
      remaining: Math.round(defaultBudgets[category] - (actualSpending[category] || 0)),
      percentage: Math.round(((actualSpending[category] || 0) / defaultBudgets[category]) * 100)
    }));

    res.json({ budget: budgetData });
  } catch (error) {
    console.error('Budget analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch budget data' });
  }
});

//error handling middleware
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
    console.log(`📊 Analytics endpoints available:`);
    console.log(`   - GET /api/analytics/cash-flow`);
    console.log(`   - GET /api/analytics/spending-categories`);
    console.log(`   - GET /api/analytics/financial-health`);
    console.log(`   - GET /api/analytics/top-merchants`);
    console.log(`   - GET /api/analytics/upcoming-bills`);
    console.log(`   - GET /api/analytics/ai-insights`);
    console.log(`   - GET /api/analytics/overview`);
    console.log(`   - GET /api/analytics/goals`);
    console.log(`   - GET /api/analytics/budget`);
  });
})();

module.exports = app;