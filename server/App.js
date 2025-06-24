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
// Add this debugging middleware
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
      <p>If you didn’t request this, just ignore it.</p>
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

  // Optional: delete OTP from store after success
  delete otpStore[email];

  res.json({ success: true, message: 'OTP verified successfully!' });
});


// ======================================================================
//                            Password Reset
// ======================================================================

app.post('/send-reset-link', async (req, res) => {
  const { email } = req.body;

  let { data: user, error } = await supabaseClient.from('users').select('*').eq('email', email).single();

  if ( !error ) {

    const token = crypto.randomBytes(32).toString('hex');
    resetTokens[email] = { token, expires: Date.now() + 15 * 60 * 1000 }; // 15 min lifetime

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
            <p>If you didn’t request this, ignore it.</p>
          </div>
        `,
      });
      res.status(200).json( { success: true, message: 'Reset link sent successfully' });
    } catch (error) {
      console.error('Error sending reset link:', error.message);
      res.status(500).json({ success: false, message: 'Failed to send reset link' });
      
    }
  }
  else {
    console.error(`// ================
//              Password Reset link error
//              That email may not exist
//              ${error.message}
// =======================`)
      res.status(404).json( { success: false, message: 'That account does not exist. Please try again.' });
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
  console.log(`New password for ${email}: ${password}`);

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
// async function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const userResult = await getUserById(decoded.user_id);
//     if (!userResult.success) {
//       return res.status(401).json({ error: 'Invalid token - user not found' });
//     }
//     req.user = userResult.user;
//     next();
//   } catch (error) {
//     console.error('Token verification error:', error);
//     res.status(403).json({ error: 'Invalid or expired token' });
//   }
// }
// module.exports.authenticateToken = authenticateToken;


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
    // Fetch accounts and their balances
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');
    if (accountsError) throw accountsError;

    // Calculate total balance
    const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Investments (if you have an account_type for investments, change this filter if needed)
    const investments = accounts
      .filter(acc => acc.account_type && acc.account_type.toLowerCase() === 'investment')
      .reduce((sum, acc) => sum + Number(acc.balance), 0);

    // Recent transactions (latest 5, from user's accounts)
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

    // Latest credit score
    let creditScore = null;
    const { data: csData, error: csError } = await supabase
      .from('credit_scores')
      .select('*')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);
    if (csError) throw csError;
    creditScore = csData && csData.length > 0 ? csData[0].score : null;

    // Respond with summary
    res.json({
      totalBalance,
      investments,
      creditScore,
      savingsGoal: 75, // Use a placeholder or add logic if you track goals
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
    // Remove null or empty fields from update
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
    console.log(user_id)
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

// Cash Flow Analytics
app.get('/api/analytics/cash-flow', authenticateToken, async (req, res) => {
  const { timeRange = '6months' } = req.query;
  const user_id = req.user.user_id;
  const { startDate, endDate } = getDateRange(timeRange);

  try {
    // Get user's account IDs
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

    // Get transactions within date range
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .order('transaction_date', { ascending: true });

    if (txError) throw txError;

    // Process transactions by month
    const monthsArray = generateMonthsArray(timeRange);
    const cashFlowByMonth = {};

    // Initialize months
    monthsArray.forEach(month => {
      cashFlowByMonth[month] = { income: 0, expenses: 0, netFlow: 0 };
    });

    // Process transactions
    transactions.forEach(tx => {
      const txDate = new Date(tx.transaction_date);
      const monthKey = txDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (cashFlowByMonth[monthKey]) {
        const amount = Math.abs(parseFloat(tx.amount));
        
        if (tx.transaction_type === 'CREDIT' || amount < 0) {
          cashFlowByMonth[monthKey].income += amount;
        } else {
          cashFlowByMonth[monthKey].expenses += amount;
        }
      }
    });

    // Calculate net flow and format data
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

    // Get spending transactions by category
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('category, amount')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
      .eq('transaction_type', 'DEBIT');

    if (txError) throw txError;

    // Group by category
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

    // Format for pie chart
    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        color: categoryColors[name] || categoryColors.OTHER
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories

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
    // Get user's accounts and recent transactions
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const accountIds = accounts.map(acc => acc.account_id);

    // Get last 3 months of transactions for calculations
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: recentTransactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', threeMonthsAgo.toISOString());

    if (txError) throw txError;

    // Calculate monthly income and expenses
    const monthlyIncome = recentTransactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;

    const monthlyExpenses = recentTransactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;

    // Calculate metrics
    const emergencyFund = totalBalance / monthlyExpenses; // Months of expenses covered
    const debtToIncomeRatio = 0; // You might want to add debt tracking
    const savingsRate = ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100;
    const creditUtilization = 15; // Placeholder - you'd get this from credit card data

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

    // Group by merchant
    const merchantTotals = {};
    transactions.forEach(tx => {
      const merchant = tx.merchant_name;
      const amount = Math.abs(parseFloat(tx.amount));
      merchantTotals[merchant] = (merchantTotals[merchant] || 0) + amount;
    });

    // Format and sort
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

// Upcoming Bills (Mock data - you'd implement based on your bill tracking system)
app.get('/api/analytics/upcoming-bills', authenticateToken, async (req, res) => {
  try {
    // This is mock data - you'd implement based on your recurring transaction logic
    const mockBills = [
      {
        name: 'Electricity Bill',
        amount: 450,
        dueDate: '2025-07-15',
        daysLeft: 21,
        status: 'upcoming'
      },
      {
        name: 'Internet',
        amount: 899,
        dueDate: '2025-07-10',
        daysLeft: 16,
        status: 'upcoming'
      },
      {
        name: 'Insurance Premium',
        amount: 1200,
        dueDate: '2025-07-05',
        daysLeft: 11,
        status: 'urgent'
      }
    ];

    res.json({ bills: mockBills });
  } catch (error) {
    console.error('Upcoming bills error:', error);
    res.status(500).json({ error: 'Failed to fetch bills data' });
  }
});

// AI Insights (Mock data - you'd implement with actual AI/ML logic)
app.get('/api/analytics/ai-insights', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get some basic user data for insights
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);

    // Generate insights based on data (this would be more sophisticated with real AI)
    const insights = [
      {
        type: 'opportunity',
        title: 'Savings Opportunity Detected',
        message: `You're spending 15% more on dining than last month. Consider meal planning to save approximately R350 monthly.`,
        confidence: 85,
        action: 'View Tips'
      },
      {
        type: 'prediction',
        title: 'Cash Flow Prediction',
        message: `Based on your spending patterns, you'll likely have R${Math.round(totalBalance * 0.85)} available by month-end.`,
        confidence: 78,
        action: 'View Details'
      },
      {
        type: 'alert',
        title: 'Unusual Spending Pattern',
        message: 'Your entertainment spending increased by 40% this week. This might impact your monthly budget.',
        confidence: 92,
        action: 'Review Transactions'
      }
    ];

    res.json({ insights });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to fetch AI insights' });
  }
});

// Overview Statistics
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
      return res.json({ stats: {} });
    }

    const accountIds = accounts.map(acc => acc.account_id);

    // Get transactions for the period
    const { data: transactions, error: txError } = await supabaseClient
      .from('transactions')
      .select('*')
      .in('account_id', accountIds)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate);

    if (txError) throw txError;

    // Calculate metrics
    const totalIncome = transactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const totalExpenses = transactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0);

    const netCashFlow = totalIncome - totalExpenses;
    
    const daysInPeriod = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const avgDailySpending = totalExpenses / daysInPeriod;

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Simple financial health score (0-10)
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

    const stats = {
      netCashFlow: Math.round(netCashFlow),
      netCashFlowChange: '+5.2%', // Mock - you'd calculate this from previous period
      netCashFlowTrend: netCashFlow > 0 ? 'up' : 'down',
      
      avgDailySpending: Math.round(avgDailySpending),
      avgDailySpendingChange: '-2.1%', // Mock
      avgDailySpendingTrend: 'down',
      
      financialHealth: Math.min(Math.round(financialHealth), 10),
      financialHealthChange: '+0.5', // Mock
      financialHealthTrend: 'up',
      
      savingsRate: Math.round(savingsRate),
      savingsRateChange: '+3.2%', // Mock
      savingsRateTrend: savingsRate > 15 ? 'up' : 'down'
    };

    res.json({ stats });
  } catch (error) {
    console.error('Overview stats error:', error);
    res.status(500).json({ error: 'Failed to fetch overview stats' });
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
  });
})();

module.exports = app;