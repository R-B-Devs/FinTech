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
const PORT = 3001;
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
app.post('/api/ai/ask-context', authenticateToken, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Your AI processing logic here
    const answer = await processAIQuestion(question);
    
    res.json({ answer });
  } catch (error) {
    console.error('AI endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
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
      },
      goals: {
        list: 'GET /api/goals',
        create: 'POST /api/goals',
        update: 'PUT /api/goals/:id',
        delete: 'DELETE /api/goals/:id',
        progress: 'PATCH /api/goals/:id/progress',
        insights: 'GET /api/goals/insights'
      },
      offers: {
        list: 'GET /api/offers',
        saved: 'GET /api/offers/saved',
        save: 'POST /api/offers/:id/save',
        apply: 'POST /api/offers/:id/apply',
        applications: 'GET /api/offers/applications'
      },
      creditHealth: {
        overview: 'GET /api/credit-health',
        trends: 'GET /api/credit-health/trends',
        alerts: 'GET /api/credit-health/alerts',
        refresh: 'POST /api/credit-health/refresh',
        history: 'GET /api/credit-health/history',
        factors: 'GET /api/credit-health/factors',
        improvementPlan: 'GET /api/credit-health/improvement-plan',
        simulate: 'POST /api/credit-health/simulate',
        education: 'GET /api/credit-health/education',
        dispute: 'POST /api/credit-health/dispute',
        monitoring: {
          get: 'GET /api/credit-health/monitoring',
          update: 'PUT /api/credit-health/monitoring'
        }
      }
    },
  });
});

// ==========================
// CREDIT HEALTH ENDPOINTS
// ==========================

// Helper function to generate credit score (simulated for demo)
function generateCreditScore(user_id, existingScore = null) {
  // In a real app, this would integrate with credit bureaus
  // For demo purposes, we'll simulate realistic credit data
  const baseScore = existingScore || (600 + Math.floor(Math.random() * 200));
  const variation = Math.floor(Math.random() * 21) - 10; // -10 to +10 variation
  return Math.max(300, Math.min(850, baseScore + variation));
}

// Helper function to calculate credit factors
function calculateCreditFactors(accounts, transactions, creditScore) {
  // Calculate credit utilization
  const creditAccounts = accounts.filter(acc => acc.account_type === 'CREDIT');
  const totalLimit = creditAccounts.reduce((sum, acc) => sum + (acc.credit_limit || 0), 0);
  const totalUsed = creditAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0);
  const creditUtilization = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;

  // Calculate payment history (simulate based on transaction patterns)
  const paymentTransactions = transactions.filter(tx => 
    tx.description && tx.description.toLowerCase().includes('payment')
  );
  const onTimePaymentRate = Math.max(85, 95 + Math.floor(Math.random() * 10));

  // Calculate average account age (simulate)
  const avgAccountAge = 12 + Math.floor(Math.random() * 60); // 1-5 years

  // Calculate recent inquiries (simulate)
  const recentInquiries = Math.floor(Math.random() * 5);

  // Calculate credit mix score
  const accountTypes = [...new Set(accounts.map(acc => acc.account_type))];
  const creditMixScore = Math.min(100, accountTypes.length * 25);

  return {
    creditUtilization: Math.round(creditUtilization),
    onTimePaymentRate,
    avgAccountAge,
    recentInquiries,
    creditMixScore
  };
}

// Helper function to generate credit recommendations
function generateCreditRecommendations(creditScore, factors) {
  const recommendations = [];

  // Utilization recommendations
  if (factors.creditUtilization > 30) {
    recommendations.push({
      type: 'urgent',
      title: 'Reduce Credit Utilization',
      description: `Your credit utilization is ${factors.creditUtilization}%, which is above the recommended 30%.`,
      action: 'Pay down existing balances or request credit limit increases to lower your utilization ratio.',
      impact: 'High',
      icon: '💳'
    });
  } else if (factors.creditUtilization > 10) {
    recommendations.push({
      type: 'warning',
      title: 'Optimize Credit Utilization',  
      description: `Your credit utilization is ${factors.creditUtilization}%. Keeping it under 10% could boost your score.`,
      action: 'Consider paying balances before statement dates or spreading balances across multiple cards.',
      impact: 'Medium',
      icon: '📊'
    });
  }

  // Payment history recommendations
  if (factors.onTimePaymentRate < 95) {
    recommendations.push({
      type: 'urgent',
      title: 'Improve Payment History',
      description: `Your on-time payment rate is ${factors.onTimePaymentRate}%. Payment history is 35% of your credit score.`,
      action: 'Set up automatic payments for at least the minimum amount due on all accounts.',
      impact: 'High',
      icon: '⏰'
    });
  }

  // Credit mix recommendations
  if (factors.creditMixScore < 50) {
    recommendations.push({
      type: 'info',
      title: 'Diversify Credit Types',
      description: 'Having different types of credit accounts can improve your credit mix.',
      action: 'Consider adding different types of credit (installment loans, credit cards) responsibly.',
      impact: 'Low',
      icon: '🏦'
    });
  }

  // Recent inquiries recommendations
  if (factors.recentInquiries > 3) {
    recommendations.push({
      type: 'warning',
      title: 'Limit Credit Applications',
      description: `You have ${factors.recentInquiries} recent credit inquiries, which can temporarily lower your score.`,
      action: 'Avoid applying for new credit for the next 6-12 months unless absolutely necessary.',
      impact: 'Medium',
      icon: '🔍'
    });
  }

  // Score-based recommendations
  if (creditScore < 650) {
    recommendations.push({
      type: 'urgent',
      title: 'Focus on Credit Rebuilding',
      description: 'Your credit score needs improvement to access better rates and terms.',
      action: 'Focus on paying bills on time, reducing debt, and avoiding new credit applications.',
      impact: 'High',
      icon: '🔧'
    });
  } else if (creditScore < 700) {
    recommendations.push({
      type: 'info',
      title: 'Build Towards Excellent Credit',
      description: 'You\'re making good progress. A few improvements could get you to excellent credit.',
      action: 'Continue current good habits and consider optimizing credit utilization further.',
      impact: 'Medium',
      icon: '📈'
    });
  }

  return recommendations;
}

// Helper function to generate credit alerts
function generateCreditAlerts(creditScore, previousScore, factors) {
  const alerts = [];
  const currentDate = new Date().toISOString();

  if (previousScore && creditScore > previousScore) {
    alerts.push({
      type: 'positive',
      title: 'Credit Score Improved',
      message: `Your credit score increased by ${creditScore - previousScore} points!`,
      date: currentDate
    });
  } else if (previousScore && creditScore < previousScore) {
    alerts.push({
      type: 'negative', 
      title: 'Credit Score Decreased',
      message: `Your credit score dropped by ${previousScore - creditScore} points.`,
      date: currentDate
    });
  }

  if (factors.creditUtilization > 50) {
    alerts.push({
      type: 'warning',
      title: 'High Credit Utilization',
      message: `Your credit utilization is ${factors.creditUtilization}%, which may negatively impact your score.`,
      date: currentDate
    });
  }

  if (factors.recentInquiries > 5) {
    alerts.push({
      type: 'warning',
      title: 'Multiple Credit Inquiries',
      message: `You have ${factors.recentInquiries} recent credit inquiries.`,
      date: currentDate
    });
  }

  return alerts;
}

// Get credit health overview
app.get('/api/credit-health', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get user's accounts
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id);

    if (accountError) throw accountError;

    // Get recent transactions (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const accountIds = accounts.map(acc => acc.account_id);
    let transactions = [];
    
    if (accountIds.length > 0) {
      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', sixMonthsAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

    // Get or create credit score
    let { data: existingScore, error: scoreError } = await supabaseClient
      .from('credit_scores')
      .select('*')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (scoreError && scoreError.code !== 'PGRST116') throw scoreError;

    let creditScore;
    let isNewScore = false;

    if (!existingScore || existingScore.length === 0) {
      // Generate initial credit score
      creditScore = generateCreditScore(user_id);
      isNewScore = true;
      
      // Save to database
      const { error: insertError } = await supabaseClient
        .from('credit_scores')
        .insert({
          user_id,
          score: creditScore,
          score_date: new Date().toISOString(),
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
    } else {
      creditScore = existingScore[0].score;
    }

    // Calculate credit factors
    const factors = calculateCreditFactors(accounts, transactions, creditScore);

    // Calculate health score and grade
    let healthScore = 0;
    healthScore += factors.onTimePaymentRate * 0.35; // 35% weight
    healthScore += Math.max(0, (100 - factors.creditUtilization) * 0.30); // 30% weight  
    healthScore += Math.min(100, factors.avgAccountAge * 2) * 0.15; // 15% weight
    healthScore += factors.creditMixScore * 0.10; // 10% weight
    healthScore += Math.max(0, (10 - factors.recentInquiries) * 10) * 0.10; // 10% weight

    const healthGrade = healthScore >= 90 ? 'A+' : 
                       healthScore >= 80 ? 'A' :
                       healthScore >= 70 ? 'B' :
                       healthScore >= 60 ? 'C' :
                       healthScore >= 50 ? 'D' : 'F';

    // Calculate credit utilization details
    const creditAccounts = accounts.filter(acc => acc.account_type === 'CREDIT');
    const totalLimit = creditAccounts.reduce((sum, acc) => sum + (acc.credit_limit || 0), 0);
    const totalUsed = creditAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0);

    // Generate recommendations
    const recommendations = generateCreditRecommendations(creditScore, factors);

    // Determine credit trend (simplified)
    const trend = isNewScore ? 'stable' : 
                 creditScore >= 700 ? 'improving' : 
                 creditScore <= 600 ? 'declining' : 'stable';

    res.json({
      creditScore,
      healthScore: Math.round(healthScore),
      healthGrade,
      creditTrend: trend,
      factors,
      utilization: {
        used: totalUsed,
        limit: totalLimit,
        percentage: factors.creditUtilization
      },
      accounts: {
        total: accounts.length,
        credit: creditAccounts.length
      },
      recommendations,
      lastUpdated: existingScore && existingScore.length > 0 ? existingScore[0].score_date : new Date().toISOString()
    });

  } catch (error) {
    console.error('Credit health fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credit health data' });
  }
});

// Get credit score trends
app.get('/api/credit-health/trends', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { period = '12months' } = req.query;

  try {
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '6months':
        startDate.setMonth(now.getMonth() - 6);
        break;
      case '24months':
        startDate.setMonth(now.getMonth() - 24);
        break;
      default: // 12months
        startDate.setMonth(now.getMonth() - 12);
    }

    // Get credit score history
    const { data: scores, error } = await supabaseClient
      .from('credit_scores')
      .select('score, score_date')
      .eq('user_id', user_id)
      .gte('score_date', startDate.toISOString())
      .order('score_date', { ascending: true });

    if (error) throw error;

    // If no historical data, generate some sample points
    let trends = [];
    if (scores && scores.length > 0) {
      trends = scores.map(score => ({
        date: score.score_date,
        score: score.score
      }));
    } else {
      // Generate sample historical data for demo
      const currentScore = 650 + Math.floor(Math.random() * 150);
      const monthsBack = period === '6months' ? 6 : period === '24months' ? 24 : 12;
      
      for (let i = monthsBack; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const variation = Math.floor(Math.random() * 20) - 10;
        const score = Math.max(300, Math.min(850, currentScore + variation));
        
        trends.push({
          date: date.toISOString(),
          score: score
        });
      }
    }

    res.json({ trends });

  } catch (error) {
    console.error('Credit trends fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credit trends' });
  }
});

// Get credit alerts
app.get('/api/credit-health/alerts', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get recent credit scores for comparison
    const { data: recentScores, error: scoresError } = await supabaseClient
      .from('credit_scores')
      .select('score, score_date')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(2);

    if (scoresError) throw scoresError;

    // Get user's accounts for factor calculation
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id);

    if (accountError) throw accountError;

    // Get recent transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const accountIds = accounts.map(acc => acc.account_id);
    let transactions = [];
    
    if (accountIds.length > 0) {
      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', thirtyDaysAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

        let alerts = [];

    if (recentScores && recentScores.length > 0) {
      const currentScore = recentScores[0].score;
      const previousScore = recentScores.length > 1 ? recentScores[1].score : null;
      
      // Calculate factors for alerts
      const factors = calculateCreditFactors(accounts, transactions, currentScore);
      
      // Generate alerts
      alerts = generateCreditAlerts(currentScore, previousScore, factors);
    }

    // Add account-specific alerts
    const creditAccounts = accounts.filter(acc => acc.account_type === 'CREDIT');
    creditAccounts.forEach(account => {
      if (account.credit_limit && account.balance) {
        const utilization = (Math.abs(account.balance) / account.credit_limit) * 100;
        if (utilization > 80) {
          alerts.push({
            type: 'warning',
            title: 'High Account Utilization',
            message: `Your ${account.account_name} is ${utilization.toFixed(1)}% utilized.`,
            date: new Date().toISOString()
          });
        }
      }
    });

    res.json({ alerts });

  } catch (error) {
    console.error('Credit alerts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credit alerts' });
  }
});

// Refresh credit score (simulate getting updated score)
app.post('/api/credit-health/refresh', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get current credit score
    const { data: currentScore, error: currentError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (currentError) throw currentError;

    const oldScore = currentScore && currentScore.length > 0 ? currentScore[0].score : 650;
    
    // Generate new credit score with realistic change
    const newScore = generateCreditScore(user_id, oldScore);
    const change = newScore - oldScore;

    // Save new score
    const { error: insertError } = await supabaseClient
      .from('credit_scores')
      .insert({
        user_id,
        score: newScore,
        score_date: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    res.json({
      message: 'Credit score updated successfully',
      newScore,
      oldScore,
      change
    });

  } catch (error) {
    console.error('Credit score refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh credit score' });
  }
});

// Get credit score history
app.get('/api/credit-health/history', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const { data: history, error } = await supabaseClient
      .from('credit_scores')
      .select('score, score_date, created_at')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({ history: history || [] });

  } catch (error) {
    console.error('Credit history fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch credit history' });
  }
});

// Get credit factor analysis
app.get('/api/credit-health/factors', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get user's accounts
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id);

    if (accountError) throw accountError;

    // Get recent transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const accountIds = accounts.map(acc => acc.account_id);
    let transactions = [];
    
    if (accountIds.length > 0) {
      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', threeMonthsAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

    // Get current credit score
    const { data: creditScore, error: scoreError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (scoreError) throw scoreError;

    const currentScore = creditScore && creditScore.length > 0 ? creditScore[0].score : 650;
    
    // Calculate detailed factors
    const factors = calculateCreditFactors(accounts, transactions, currentScore);
    
    // Add detailed analysis
    const creditAccounts = accounts.filter(acc => acc.account_type === 'CREDIT');
    const accountDetails = creditAccounts.map(acc => ({
      name: acc.account_name,
      balance: acc.balance,
      limit: acc.credit_limit,
      utilization: acc.credit_limit ? (Math.abs(acc.balance) / acc.credit_limit) * 100 : 0
    }));

    // Calculate payment history details
    const paymentHistory = {
      onTimePayments: Math.round(factors.onTimePaymentRate),
      latePayments: Math.round(100 - factors.onTimePaymentRate),
      missedPayments: Math.max(0, Math.round((100 - factors.onTimePaymentRate) * 0.3))
    };

    res.json({
      factors,
      accountDetails,
      paymentHistory,
      analysis: {
        primaryFactors: [
          {
            name: 'Payment History',
            weight: 35,
            score: factors.onTimePaymentRate,
            status: factors.onTimePaymentRate >= 95 ? 'excellent' : factors.onTimePaymentRate >= 90 ? 'good' : 'needs_improvement'
          },
          {
            name: 'Credit Utilization',
            weight: 30,
            score: Math.max(0, 100 - factors.creditUtilization),
            status: factors.creditUtilization <= 10 ? 'excellent' : factors.creditUtilization <= 30 ? 'good' : 'needs_improvement'
          },
          {
            name: 'Credit History Length',
            weight: 15,
            score: Math.min(100, factors.avgAccountAge * 2),
            status: factors.avgAccountAge >= 24 ? 'excellent' : factors.avgAccountAge >= 12 ? 'good' : 'needs_improvement'
          },
          {
            name: 'Credit Mix',
            weight: 10,
            score: factors.creditMixScore,
            status: factors.creditMixScore >= 75 ? 'excellent' : factors.creditMixScore >= 50 ? 'good' : 'needs_improvement'
          },
          {
            name: 'New Credit',
            weight: 10,
            score: Math.max(0, (6 - factors.recentInquiries) * 16.67),
            status: factors.recentInquiries <= 2 ? 'excellent' : factors.recentInquiries <= 4 ? 'good' : 'needs_improvement'
          }
        ]
      }
    });

  } catch (error) {
    console.error('Credit factors analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze credit factors' });
  }
});

// Get personalized credit improvement plan
app.get('/api/credit-health/improvement-plan', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get current credit data
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id);

    if (accountError) throw accountError;

    // Get current credit score
    const { data: creditScore, error: scoreError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (scoreError) throw scoreError;

    const currentScore = creditScore && creditScore.length > 0 ? creditScore[0].score : 650;
    
    // Get recent transactions for analysis
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const accountIds = accounts.map(acc => acc.account_id);
    let transactions = [];
    
    if (accountIds.length > 0) {
      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', threeMonthsAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

    const factors = calculateCreditFactors(accounts, transactions, currentScore);
    
    // Generate improvement plan
    const improvementPlan = {
      currentScore,
      targetScore: Math.min(850, currentScore + 50),
      timeframe: '6-12 months',
      steps: []
    };

    // Priority 1: Payment History
    if (factors.onTimePaymentRate < 95) {
      improvementPlan.steps.push({
        priority: 1,
        title: 'Perfect Your Payment History',
        description: 'Set up automatic payments for all accounts',
        impact: 'High',
        timeframe: 'Immediate',
        pointsImpact: '+30-50 points',
        actions: [
          'Set up autopay for minimum payments on all accounts',
          'Create calendar reminders for payment due dates',
          'Pay bills twice monthly to stay ahead',
          'Consider paying before statement closing dates'
        ]
      });
    }

    // Priority 2: Credit Utilization
    if (factors.creditUtilization > 30) {
      improvementPlan.steps.push({
        priority: 2,
        title: 'Optimize Credit Utilization',
        description: 'Reduce credit card balances below 30%',
        impact: 'High',
        timeframe: '3-6 months',
        pointsImpact: '+20-40 points',
        actions: [
          `Pay down balances to below 30% utilization`,
          'Consider making multiple payments per month',
          'Request credit limit increases on existing cards',
          'Avoid closing old credit cards'
        ]
      });
    } else if (factors.creditUtilization > 10) {
      improvementPlan.steps.push({
        priority: 2,
        title: 'Optimize Credit Utilization Further',
        description: 'Target utilization below 10% for maximum benefit',
        impact: 'Medium',
        timeframe: '2-4 months',
        pointsImpact: '+10-20 points',
        actions: [
          'Pay balances before statement closing dates',
          'Spread balances across multiple cards if needed',
          'Consider increasing credit limits'
        ]
      });
    }

    // Priority 3: Credit Mix (if needed)
    if (factors.creditMixScore < 50) {
      improvementPlan.steps.push({
        priority: 3,
        title: 'Diversify Credit Types',
        description: 'Add different types of credit accounts responsibly',
        impact: 'Low',
        timeframe: '6-12 months',
        pointsImpact: '+5-15 points',
        actions: [
          'Consider a small installment loan if needed',
          'Keep different types of accounts in good standing',
          'Avoid opening too many accounts at once'
        ]
      });
    }

    // Priority 4: Limit New Credit
    if (factors.recentInquiries > 3) {
      improvementPlan.steps.push({
        priority: 4,
        title: 'Limit New Credit Applications',
        description: 'Allow recent inquiries to age off your report',
        impact: 'Medium',
        timeframe: '12-24 months',
        pointsImpact: '+5-15 points',
        actions: [
          'Avoid applying for new credit unless absolutely necessary',
          'Wait at least 6 months between credit applications',
          'Shop for rates within 14-45 day windows when needed'
        ]
      });
    }

    // Add monitoring step
    improvementPlan.steps.push({
      priority: 5,
      title: 'Monitor Progress Regularly',
      description: 'Track your credit score and report changes',
      impact: 'Ongoing',
      timeframe: 'Monthly',
      pointsImpact: 'Maintenance',
      actions: [
        'Check your credit report monthly for errors',
        'Monitor your credit score regularly',
        'Dispute any inaccuracies immediately',
        'Keep records of your credit improvement efforts'
      ]
    });

    res.json({
      improvementPlan,
      estimatedTimeline: '6-12 months for significant improvement',
      keyMetrics: {
        currentUtilization: factors.creditUtilization,
        targetUtilization: Math.min(factors.creditUtilization, 10),
        currentPaymentRate: factors.onTimePaymentRate,
        targetPaymentRate: 100
      }
    });

  } catch (error) {
    console.error('Credit improvement plan error:', error);
    res.status(500).json({ error: 'Failed to generate improvement plan' });
  }
});

// Simulate credit score impact of different actions
app.post('/api/credit-health/simulate', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { action, amount } = req.body;

  try {
    // Get current credit data
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id);

    if (accountError) throw accountError;

    // Get current credit score
    const { data: creditScore, error: scoreError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (scoreError) throw scoreError;

    const currentScore = creditScore && creditScore.length > 0 ? creditScore[0].score : 650;
    
    // Calculate current factors
    const factors = calculateCreditFactors(accounts, [], currentScore);
    
        let simulation = {
      action,
      currentScore,
      projectedScore: currentScore,
      impact: 0,
      timeframe: '1-3 months',
      explanation: ''
    };

    const creditAccounts = accounts.filter(acc => acc.account_type === 'CREDIT');
    const totalLimit = creditAccounts.reduce((sum, acc) => sum + (acc.credit_limit || 0), 0);
    const totalUsed = creditAccounts.reduce((sum, acc) => sum + Math.abs(acc.balance || 0), 0);

    switch (action) {
      case 'pay_down_debt':
        if (amount && totalUsed > 0) {
          const newUtilization = Math.max(0, ((totalUsed - amount) / totalLimit) * 100);
          const utilizationImprovement = factors.creditUtilization - newUtilization;
          
          // Calculate score impact (utilization is 30% of score)
          let scoreImpact = 0;
          if (utilizationImprovement > 20) scoreImpact = 40;
          else if (utilizationImprovement > 10) scoreImpact = 25;
          else if (utilizationImprovement > 5) scoreImpact = 15;
          else scoreImpact = Math.round(utilizationImprovement * 2);
          
          simulation.projectedScore = Math.min(850, currentScore + scoreImpact);
          simulation.impact = scoreImpact;
          simulation.explanation = `Paying down R${amount.toLocaleString()} would reduce your utilization from ${factors.creditUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%.`;
        }
        break;

      case 'increase_credit_limit':
        if (amount && totalLimit > 0) {
          const newLimit = totalLimit + amount;
          const newUtilization = (totalUsed / newLimit) * 100;
          const utilizationImprovement = factors.creditUtilization - newUtilization;
          
          let scoreImpact = Math.round(utilizationImprovement * 1.5);
          simulation.projectedScore = Math.min(850, currentScore + scoreImpact);
          simulation.impact = scoreImpact;
          simulation.explanation = `Increasing your credit limit by R${amount.toLocaleString()} would reduce your utilization from ${factors.creditUtilization.toFixed(1)}% to ${newUtilization.toFixed(1)}%.`;
        }
        break;

      case 'open_new_account':
        // New account temporarily lowers score due to inquiry and reduced average age
        simulation.projectedScore = Math.max(300, currentScore - 10);
        simulation.impact = -10;
        simulation.timeframe = '3-6 months recovery';
        simulation.explanation = 'Opening a new account will temporarily lower your score due to the credit inquiry and reduced average account age. However, it may help long-term by increasing available credit.';
        break;

      case 'close_account':
        if (totalLimit > 0) {
          // Assume closing account with average limit
          const avgLimit = totalLimit / creditAccounts.length;
          const newLimit = totalLimit - avgLimit;
          const newUtilization = newLimit > 0 ? (totalUsed / newLimit) * 100 : 0;
          
          let scoreImpact = newUtilization > factors.creditUtilization ? 
            -Math.round((newUtilization - factors.creditUtilization) * 1.5) : 0;
          
          simulation.projectedScore = Math.max(300, currentScore + scoreImpact);
          simulation.impact = scoreImpact;
          simulation.explanation = `Closing an account would increase your utilization ratio and potentially hurt your credit history length.`;
        }
        break;

      case 'perfect_payments':
        if (factors.onTimePaymentRate < 100) {
          const improvementNeeded = 100 - factors.onTimePaymentRate;
          const scoreImpact = Math.round(improvementNeeded * 0.5); // Payment history is 35% of score
          
          simulation.projectedScore = Math.min(850, currentScore + scoreImpact);
          simulation.impact = scoreImpact;
          simulation.timeframe = '6-12 months';
          simulation.explanation = `Achieving perfect payment history would improve your score significantly over time.`;
        } else {
          simulation.explanation = `You already have excellent payment history!`;
        }
        break;

      default:
        simulation.explanation = 'Unknown action type.';
    }

    res.json({ simulation });

  } catch (error) {
    console.error('Credit simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate credit impact' });
  }
});

// Get credit education content
app.get('/api/credit-health/education', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get user's current credit score for personalized content
    const { data: creditScore, error: scoreError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (scoreError) throw scoreError;

    const currentScore = creditScore && creditScore.length > 0 ? creditScore[0].score : 650;

    const educationContent = {
      articles: [
        {
          id: 1,
          title: 'Understanding Your Credit Score',
          summary: 'Learn what factors influence your credit score and how it\'s calculated.',
          content: 'Your credit score is calculated based on five main factors...',
          readTime: '5 min',
          difficulty: 'Beginner',
          relevant: true
        },
        {
          id: 2,
          title: 'Optimizing Credit Utilization',
          summary: 'Discover strategies to keep your credit utilization low and improve your score.',
          content: 'Credit utilization is the second most important factor...',
          readTime: '7 min',
          difficulty: 'Intermediate',
          relevant: currentScore < 700
        },
        {
          id: 3,
          title: 'Building Credit History',
          summary: 'Learn how to establish and maintain a strong credit history.',
          content: 'The length of your credit history accounts for 15% of your score...',
          readTime: '6 min',
          difficulty: 'Beginner',
          relevant: currentScore < 650
        },
        {
          id: 4,
          title: 'Advanced Credit Strategies',
          summary: 'Expert techniques for maximizing your credit score.',
          content: 'Once you have good credit fundamentals...',
          readTime: '10 min',
          difficulty: 'Advanced',
          relevant: currentScore >= 700
        }
      ],
      tips: [
        {
          category: 'Payment History',
          tip: 'Set up automatic payments for at least the minimum amount due',
          impact: 'High'
        },
        {
          category: 'Credit Utilization',
          tip: 'Keep credit card balances below 30% of your credit limit',
          impact: 'High'
        },
        {
          category: 'Credit History',
          tip: 'Keep old credit accounts open to maintain longer credit history',
          impact: 'Medium'
        },
        {
          category: 'Credit Mix',
          tip: 'Having different types of credit can improve your score',
          impact: 'Low'
        },
        {
          category: 'New Credit',
          tip: 'Limit credit applications to avoid multiple hard inquiries',
          impact: 'Medium'
        }
      ],
      scoreRanges: {
        'Excellent (800-850)': {
          description: 'You have exceptional credit',
          benefits: ['Best interest rates', 'Premium credit cards', 'Easy loan approval'],
          tips: ['Maintain current habits', 'Monitor for identity theft']
        },
        'Very Good (740-799)': {
          description: 'You have very good credit',
          benefits: ['Good interest rates', 'Most credit products available'],
          tips: ['Optimize utilization further', 'Consider premium rewards cards']
        },
        'Good (670-739)': {
          description: 'You have good credit',
          benefits: ['Reasonable rates', 'Most loans available'],
          tips: ['Lower utilization', 'Build payment history']
        },
        'Fair (580-669)': {
          description: 'Your credit needs improvement',
          benefits: ['Limited options', 'Higher rates'],
          tips: ['Focus on payment history', 'Pay down debt']
        },
        'Poor (300-579)': {
          description: 'Your credit needs significant work',
          benefits: ['Very limited options', 'Very high rates'],
          tips: ['Consider secured cards', 'Pay all bills on time']
        }
      }
    };

    // Filter relevant articles based on credit score
    educationContent.articles = educationContent.articles.filter(article => article.relevant);

    res.json(educationContent);

  } catch (error) {
    console.error('Credit education fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch education content' });
  }
});

// Report credit dispute
app.post('/api/credit-health/dispute', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { type, description, account, amount } = req.body;

  if (!type || !description) {
    return res.status(400).json({ error: 'Dispute type and description are required' });
  }

  try {
    // In a real application, this would integrate with credit bureaus
    // For now, we'll simulate the dispute process
    
    const disputeId = `DISP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Save dispute record (you'd create a disputes table)
    const disputeRecord = {
      id: disputeId,
      user_id,
      type,
      description,
      account: account || null,
      amount: amount || null,
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
      estimated_resolution: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };

    // In a real app, save to disputes table
    // const { error } = await supabaseClient.from('disputes').insert(disputeRecord);
    // if (error) throw error;

    res.json({
      message: 'Dispute submitted successfully',
      disputeId,
      status: 'SUBMITTED',
      estimatedResolution: '30 days',
      nextSteps: [
        'Your dispute has been submitted to the credit bureaus',
        'You should receive a response within 30 days',
        'Keep all documentation related to this dispute',
        'Monitor your credit report for updates'
      ]
    });

  } catch (error) {
    console.error('Credit dispute error:', error);
    res.status(500).json({ error: 'Failed to submit dispute' });
  }
});

// Get credit monitoring alerts settings
app.get('/api/credit-health/monitoring', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // In a real app, you'd have a user_preferences table
    // For now, return default monitoring settings
    const monitoringSettings = {
      scoreChangeAlerts: true,
      utilizationAlerts: true,
      newAccountAlerts: true,
      inquiryAlerts: true,
      identityMonitoring: true,
      alertThresholds: {
        scoreChange: 10, // Alert if score changes by more than 10 points
        utilization: 50, // Alert if utilization goes above 50%
        newAccounts: 1, // Alert for any new accounts
        inquiries: 2 // Alert if more than 2 inquiries in 30 days
      },
      notificationMethods: {
        email: true,
        sms: false,
        push: true
      }
    };

    res.json({ monitoringSettings });

  } catch (error) {
    console.error('Credit monitoring fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch monitoring settings' });
  }
});

// Update credit monitoring settings
app.put('/api/credit-health/monitoring', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { settings } = req.body;

  try {
    // In a real app, save to user_preferences table
    // For now, just return success
    
    res.json({
      message: 'Monitoring settings updated successfully',
      settings
    });

  } catch (error) {
    console.error('Credit monitoring update error:', error);
    res.status(500).json({ error: 'Failed to update monitoring settings' });
  }
});

// ==========================
// GOALS ENDPOINTS
// ==========================

// Helper function to analyze user's financial profile for goal recommendations
async function analyzeUserForGoalRecommendations(user_id) {
  try {
    // Get user's financial data
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    // Get recent transactions (last 3 months)
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const accountIds = accounts.map(acc => acc.account_id);
    
    let transactions = [];
    if (accountIds.length > 0) {
      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', threeMonthsAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

    // Get credit score
    const { data: creditScore, error: creditError } = await supabaseClient
      .from('credit_scores')
      .select('score')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (creditError && creditError.code !== 'PGRST116') throw creditError;

    // Calculate financial metrics
    const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
    const monthlyIncome = transactions
      .filter(tx => tx.transaction_type === 'CREDIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;
    const monthlyExpenses = transactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;
    
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (disposableIncome / monthlyIncome) * 100 : 0;
    const creditScoreValue = creditScore && creditScore.length > 0 ? creditScore[0].score : 650;

    // Analyze spending patterns
    const categorySpending = {};
    transactions
      .filter(tx => tx.transaction_type === 'DEBIT')
      .forEach(tx => {
        const category = tx.category || 'OTHER';
        categorySpending[category] = (categorySpending[category] || 0) + Math.abs(parseFloat(tx.amount));
      });

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      disposableIncome,
      savingsRate,
      creditScore: creditScoreValue,
      emergencyFundNeeded: monthlyExpenses * 6, // 6 months of expenses
      debtPayoffCapacity: disposableIncome * 0.3, // 30% of disposable income for debt
      investmentCapacity: Math.max(0, disposableIncome * 0.2), // 20% for investments
      categorySpending,
      hasGoodCashFlow: disposableIncome > 0,
      riskProfile: creditScoreValue >= 700 ? 'moderate' : creditScoreValue >= 650 ? 'conservative' : 'very_conservative'
    };
  } catch (error) {
    console.error('Error analyzing user for goal recommendations:', error);
    return null;
  }
}

// Generate personalized goal recommendations
function generateGoalRecommendations(analysis, existingGoals = []) {
  if (!analysis) return [];

  const recommendations = [];
  const existingGoalTypes = existingGoals.map(g => g.category);

  // Emergency Fund Goal
  if (!existingGoalTypes.includes('emergency_fund') && analysis.totalBalance < analysis.emergencyFundNeeded) {
    const currentEmergencyFund = Math.min(analysis.totalBalance, analysis.emergencyFundNeeded);
    const monthsToComplete = analysis.disposableIncome > 0 ? 
      Math.ceil((analysis.emergencyFundNeeded - currentEmergencyFund) / (analysis.disposableIncome * 0.3)) : 12;
    
    recommendations.push({
      category: 'emergency_fund',
      title: 'Emergency Fund',
      description: 'Build 6 months of expenses for financial security',
      target: Math.round(analysis.emergencyFundNeeded),
      suggestedProgress: Math.round(currentEmergencyFund),
      priority: 'high',
      timeline: `${Math.min(monthsToComplete, 24)} months`,
      monthlyContribution: Math.round((analysis.emergencyFundNeeded - currentEmergencyFund) / Math.min(monthsToComplete, 24)),
      icon: '🛡️',
      aiReasoning: `Based on your monthly expenses of R${analysis.monthlyExpenses.toLocaleString()}, you need R${analysis.emergencyFundNeeded.toLocaleString()} for 6 months of coverage.`
    });
  }

  // Debt Payoff Goal (if applicable)
  if (!existingGoalTypes.includes('debt_payoff') && analysis.creditScore < 700) {
    const estimatedDebt = analysis.monthlyIncome * 0.2; // Estimate based on credit score
    recommendations.push({
      category: 'debt_payoff',
      title: 'Debt Freedom',
      description: 'Pay off high-interest debt to improve credit score',
      target: Math.round(estimatedDebt),
      suggestedProgress: 0,
      priority: 'high',
      timeline: '18 months',
      monthlyContribution: Math.round(analysis.debtPayoffCapacity),
      icon: '💳',
      aiReasoning: `Your credit score of ${analysis.creditScore} suggests debt management could help. Allocating R${Math.round(analysis.debtPayoffCapacity).toLocaleString()}/month can improve your score.`
    });
  }

  // Investment Goal
  if (!existingGoalTypes.includes('investment') && analysis.savingsRate > 10 && analysis.hasGoodCashFlow) {
    const investmentTarget = analysis.monthlyIncome * 12; // 1 year of income as long-term goal
    recommendations.push({
      category: 'investment',
      title: 'Investment Portfolio',
      description: 'Build wealth through diversified investments',
      target: Math.round(investmentTarget),
      suggestedProgress: 0,
      priority: 'medium',
      timeline: '60 months',
      monthlyContribution: Math.round(analysis.investmentCapacity),
      icon: '📈',
      aiReasoning: `With your ${analysis.savingsRate.toFixed(1)}% savings rate and R${analysis.disposableIncome.toLocaleString()} monthly surplus, you can invest R${Math.round(analysis.investmentCapacity).toLocaleString()}/month.`
    });
  }

  // Home Down Payment Goal
  if (!existingGoalTypes.includes('home_deposit') && analysis.monthlyIncome > 20000 && analysis.creditScore >= 650) {
    const homePrice = analysis.monthlyIncome * 120; // Rough estimate: 10 years of income
    const downPayment = homePrice * 0.1; // 10% down payment
    recommendations.push({
      category: 'home_deposit',
      title: 'Home Down Payment',
      description: 'Save for your dream home deposit',
      target: Math.round(downPayment),
      suggestedProgress: 0,
      priority: 'medium',
      timeline: '48 months',
      monthlyContribution: Math.round(downPayment / 48),
      icon: '🏠',
      aiReasoning: `Based on your income of R${analysis.monthlyIncome.toLocaleString()}/month, a home around R${(homePrice).toLocaleString()} would need a R${Math.round(downPayment).toLocaleString()} deposit.`
    });
  }

  // Vacation/Lifestyle Goal
  if (!existingGoalTypes.includes('vacation') && analysis.disposableIncome > 5000) {
    const vacationBudget = analysis.monthlyIncome * 0.5; // Half a month's income
    recommendations.push({
      category: 'vacation',
      title: 'Dream Vacation',
      description: 'Save for that special trip you deserve',
      target: Math.round(vacationBudget),
      suggestedProgress: 0,
      priority: 'low',
      timeline: '12 months',
      monthlyContribution: Math.round(vacationBudget / 12),
      icon: '✈️',
      aiReasoning: `You can comfortably save R${Math.round(vacationBudget / 12).toLocaleString()}/month for a R${Math.round(vacationBudget).toLocaleString()} vacation without impacting your finances.`
    });
  }

  // Retirement Goal
  if (!existingGoalTypes.includes('retirement') && analysis.monthlyIncome > 15000) {
    const retirementTarget = analysis.monthlyIncome * 300; // 25 years of income
    recommendations.push({
      category: 'retirement',
      title: 'Retirement Fund',
      description: 'Secure your financial future',
      target: Math.round(retirementTarget),
      suggestedProgress: 0,
      priority: 'medium',
      timeline: '300 months',
      monthlyContribution: Math.round(analysis.monthlyIncome * 0.15), // 15% of income
      icon: '🏖️',
      aiReasoning: `Starting with 15% of your income (R${Math.round(analysis.monthlyIncome * 0.15).toLocaleString()}/month) for retirement will build significant wealth over time.`
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

// Get user's goals with AI recommendations
app.get('/api/goals', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get existing goals
    const { data: goals, error: goalsError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;

    // Analyze user's financial profile
    const analysis = await analyzeUserForGoalRecommendations(user_id);
    
    // Generate AI recommendations
    const recommendations = generateGoalRecommendations(analysis, goals || []);

    res.json({
      goals: goals || [],
      recommendations,
      analysis: {
        totalBalance: analysis?.totalBalance || 0,
        monthlyIncome: analysis?.monthlyIncome || 0,
        monthlyExpenses: analysis?.monthlyExpenses || 0,
        savingsRate: analysis?.savingsRate || 0,
        creditScore: analysis?.creditScore || null
      }
    });

  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Create a new goal
app.post('/api/goals', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { title, description, target, category, timeline, icon } = req.body;

  if (!title || !target) {
    return res.status(400).json({ error: 'Title and target amount are required' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('goals')
      .insert({
        user_id,
        title,
        description: description || '',
        target_amount: parseFloat(target),
        current_amount: 0,
        category: category || 'other',
        timeline: timeline || 'medium_term',
        icon: icon || '🎯',
        status: 'ACTIVE',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Goal created successfully',
      goal: data
    });

  } catch (error) {
    console.error('Goal creation error:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update a goal
app.put('/api/goals/:goalId', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { goalId } = req.params;
  const { title, description, target, current, category, timeline, icon } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (target !== undefined) updateData.target_amount = parseFloat(target);
    if (current !== undefined) updateData.current_amount = parseFloat(current);
    if (category !== undefined) updateData.category = category;
    if (timeline !== undefined) updateData.timeline = timeline;
    if (icon !== undefined) updateData.icon = icon;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseClient
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({
      message: 'Goal updated successfully',
      goal: data
    });

  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete a goal
app.delete('/api/goals/:goalId', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { goalId } = req.params;

  try {
    const { data, error } = await supabaseClient
      .from('goals')
      .update({ status: 'DELETED', updated_at: new Date().toISOString() })
      .eq('id', goalId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Update goal progress
app.patch('/api/goals/:goalId/progress', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { goalId } = req.params;
  const { amount } = req.body;

  if (amount === undefined || isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: 'Valid amount is required' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('goals')
      .update({
        current_amount: parseFloat(amount),
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .eq('user_id', user_id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    // Check if goal is completed
    if (data.current_amount >= data.target_amount) {
      await supabaseClient
        .from('goals')
        .update({
          status: 'COMPLETED',
          completed_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user_id);
    }

    res.json({
      message: 'Goal progress updated successfully',
      goal: data,
      isCompleted: data.current_amount >= data.target_amount
    });

  } catch (error) {
    console.error('Goal progress update error:', error);
    res.status(500).json({ error: 'Failed to update goal progress' });
  }
});

// Get AI-powered goal insights
app.get('/api/goals/insights', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Get user's goals
    const { data: goals, error: goalsError } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (goalsError && goalsError.code !== 'PGRST116') throw goalsError;

    // Analyze user's financial profile
    const analysis = await analyzeUserForGoalRecommendations(user_id);

    const insights = [];

    if (goals && goals.length > 0) {
      goals.forEach(goal => {
        const progressPercent = (goal.current_amount / goal.target_amount) * 100;
        const remainingAmount = goal.target_amount - goal.current_amount;

        if (progressPercent >= 90) {
          insights.push({
            type: 'success',
            title: `Almost there with ${goal.title}!`,
            message: `You're ${progressPercent.toFixed(1)}% complete. Just R${remainingAmount.toLocaleString()} to go!`,
            goalId: goal.id
          });
        } else if (progressPercent < 10 && analysis?.disposableIncome) {
                    const monthsToComplete = Math.ceil(remainingAmount / (analysis.disposableIncome * 0.2));
          insights.push({
            type: 'suggestion',
            title: `Boost your ${goal.title} progress`,
            message: `You could reach this goal in ${monthsToComplete} months by saving R${Math.round(remainingAmount / monthsToComplete).toLocaleString()}/month from your surplus.`,
            goalId: goal.id
          });
        } else if (progressPercent < 50) {
          insights.push({
            type: 'motivation',
            title: `Keep going with ${goal.title}`,
            message: `You're ${progressPercent.toFixed(1)}% complete. Consider setting up automatic transfers to reach your goal faster.`,
            goalId: goal.id
          });
        }
      });
    }

    // General financial insights
    if (analysis) {
      if (analysis.savingsRate < 10) {
        insights.push({
          type: 'warning',
          title: 'Low Savings Rate',
          message: `Your savings rate is ${analysis.savingsRate.toFixed(1)}%. Try to save at least 10-20% of your income.`
        });
      }

      if (analysis.totalBalance < analysis.emergencyFundNeeded) {
        insights.push({
          type: 'urgent',
          title: 'Emergency Fund Priority',
          message: `Build your emergency fund first. You need R${(analysis.emergencyFundNeeded - analysis.totalBalance).toLocaleString()} more for 6 months coverage.`
        });
      }

      if (analysis.hasGoodCashFlow && goals?.length === 0) {
        insights.push({
          type: 'opportunity',
          title: 'Start Setting Goals',
          message: `With R${analysis.disposableIncome.toLocaleString()} monthly surplus, you're ready to start achieving financial goals!`
        });
      }
    }

    res.json({
      insights,
      analysis: {
        savingsRate: analysis?.savingsRate || 0,
        monthlyDisposable: analysis?.disposableIncome || 0,
        emergencyFundGap: Math.max(0, (analysis?.emergencyFundNeeded || 0) - (analysis?.totalBalance || 0))
      }
    });

  } catch (error) {
    console.error('Goal insights error:', error);
    res.status(500).json({ error: 'Failed to fetch goal insights' });
  }
});


// ==========================
// OFFERS ENDPOINTS
// ==========================

// Helper function to calculate user eligibility score
function calculateEligibilityScore(user, accounts, transactions, creditScore) {
  let score = 0;
  
  // Credit score weight (40%)
  if (creditScore >= 750) score += 40;
  else if (creditScore >= 700) score += 30;
  else if (creditScore >= 650) score += 20;
  else if (creditScore >= 600) score += 10;
  
  // Account balance weight (25%)
  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0);
  if (totalBalance >= 100000) score += 25;
  else if (totalBalance >= 50000) score += 20;
  else if (totalBalance >= 20000) score += 15;
  else if (totalBalance >= 10000) score += 10;
  
  // Transaction history weight (20%)
  const monthlyTransactions = transactions.length / 3; // Assuming 3 months of data
  if (monthlyTransactions >= 20) score += 20;
  else if (monthlyTransactions >= 10) score += 15;
  else if (monthlyTransactions >= 5) score += 10;
  
  // Income stability weight (15%)
  const creditTransactions = transactions.filter(tx => tx.transaction_type === 'CREDIT');
  const avgMonthlyIncome = creditTransactions.reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) / 3;
  if (avgMonthlyIncome >= 50000) score += 15;
  else if (avgMonthlyIncome >= 30000) score += 12;
  else if (avgMonthlyIncome >= 15000) score += 8;
  else if (avgMonthlyIncome >= 8000) score += 5;
  
  return Math.min(score, 100);
}

// Generate personalized offers based on user profile
function generatePersonalizedOffers(userProfile, eligibilityScore, creditScore) {
  const baseOffers = [
    {
      id: 1,
      title: 'Premium Credit Card',
      description: 'Premium rewards card with airport lounge access and comprehensive travel insurance.',
      category: 'credit-cards',
      provider: 'ABSA Bank',
      badge: 'Pre-approved',
      badgeColor: 'green',
      baseInterestRate: 19.75,
      baseAnnualFee: 0,
      baseCreditLimit: 50000,
      requirements: {
        minIncome: 30000,
        minCreditScore: 700
      },
      benefits: ['Airport lounge access', 'Travel insurance', 'Concierge service'],
      expiryDays: 30
    },
    {
      id: 2,
      title: 'Home Loan',
      description: 'Competitive home loan rates with flexible repayment options.',
      category: 'home-loans',
      provider: 'ABSA Bank',
      badge: 'Best Rate',
      badgeColor: 'blue',
      baseInterestRate: 11.5,
      baseAnnualFee: 0,
      baseLoanAmount: 2000000,
      requirements: {
        minIncome: 25000,
        minCreditScore: 650
      },
      benefits: ['No transfer fees', 'Flexible repayment', 'Free bond origination'],
      expiryDays: 90
    },
    {
      id: 3,
      title: 'Vehicle Finance',
      description: 'Finance your dream car with competitive rates and flexible terms.',
      category: 'vehicle-finance',
      provider: 'ABSA Bank',
      badge: 'Special Rate',
      badgeColor: 'purple',
      baseInterestRate: 12.25,
      baseAnnualFee: 99,
      baseLoanAmount: 500000,
      requirements: {
        minIncome: 15000,
        minCreditScore: 600
      },
      benefits: ['Up to 84 months terms', 'Balloon payment options', 'Insurance included'],
      expiryDays: 45
    },
    {
      id: 4,
      title: 'Investment Account',
      description: 'High-yield investment account with no minimum balance requirements.',
      category: 'investments',
      provider: 'ABSA Bank',
      badge: 'New',
      badgeColor: 'orange',
      baseInterestRate: 8.5,
      baseAnnualFee: 0,
      baseCreditLimit: 0,
      requirements: {
        minIncome: 5000,
        minCreditScore: 550
      },
      benefits: ['No minimum balance', 'Daily compounding', 'Online access'],
      expiryDays: 60
    },
    {
      id: 5,
      title: 'Personal Loan',
      description: 'Quick personal loan approval with funds available within 48 hours.',
      category: 'personal-loans',
      provider: 'ABSA Bank',
      badge: 'Fast Approval',
      badgeColor: 'red',
      baseInterestRate: 15.5,
      baseAnnualFee: 0,
      baseLoanAmount: 200000,
      requirements: {
        minIncome: 8000,
        minCreditScore: 580
      },
      benefits: ['48-hour approval', 'No collateral needed', 'Flexible terms'],
      expiryDays: 21
    },
    {
      id: 6,
      title: 'Life Insurance',
      description: 'Comprehensive life cover with Vitality rewards and health benefits.',
      category: 'insurance',
      provider: 'ABSA Bank',
      badge: 'Exclusive',
      badgeColor: 'teal',
      baseInterestRate: 0, // Premium amount
      baseAnnualFee: 180,
      baseCreditLimit: 0,
      requirements: {
        minIncome: 10000,
        minCreditScore: 600
      },
      benefits: ['Vitality rewards', 'Health screening', 'Premium discounts'],
      expiryDays: 120
    },
    {
      id: 7,
      title: 'Cashback Credit Card',
      description: 'Earn up to 5% cashback on all purchases with no spending caps.',
      category: 'credit-cards',
      provider: 'ABSA Bank',
      badge: 'Popular',
      badgeColor: 'yellow',
      baseInterestRate: 18.25,
      baseAnnualFee: 99,
      baseCreditLimit: 30000,
      requirements: {
        minIncome: 12000,
        minCreditScore: 650
      },
      benefits: ['Up to 5% cashback', 'No spending caps', 'Monthly rewards'],
      expiryDays: 35
    },
    {
      id: 8,
      title: 'Fixed Deposit',
      description: 'Secure your savings with guaranteed returns and flexible terms.',
      category: 'investments',
      provider: 'ABSA Bank',
      badge: 'Guaranteed',
      badgeColor: 'green',
      baseInterestRate: 9.75,
      baseAnnualFee: 0,
      baseCreditLimit: 0,
      requirements: {
        minIncome: 5000,
        minCreditScore: 500
      },
      benefits: ['Guaranteed returns', 'Flexible terms', 'SARB protected'],
      expiryDays: 180
    }
  ];

  return baseOffers
    .filter(offer => {
      // Filter based on eligibility
      return creditScore >= offer.requirements.minCreditScore;
    })
    .map(offer => {
      // Calculate personalized rates and terms
      const rateDiscount = Math.max(0, (eligibilityScore - 50) * 0.1); // Up to 5% discount
      const interestRate = Math.max(0.5, offer.baseInterestRate - rateDiscount);
      
      // Calculate approval chance
      let approvalChance = 50;
      if (creditScore >= offer.requirements.minCreditScore + 100) approvalChance += 40;
      else if (creditScore >= offer.requirements.minCreditScore + 50) approvalChance += 30;
      else if (creditScore >= offer.requirements.minCreditScore + 25) approvalChance += 20;
      else if (creditScore >= offer.requirements.minCreditScore) approvalChance += 10;
      
      if (eligibilityScore >= 80) approvalChance += 10;
      else if (eligibilityScore >= 60) approvalChance += 5;
      
      approvalChance = Math.min(98, approvalChance);

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + offer.expiryDays);

      // Format rate display
      let rateDisplay;
      if (offer.category === 'insurance') {
        rateDisplay = `From R${Math.round(offer.baseAnnualFee * (100 - rateDiscount * 2) / 100)}/month`;
      } else if (offer.category === 'investments') {
        rateDisplay = `${interestRate.toFixed(2)}% p.a.`;
      } else {
        rateDisplay = `${interestRate.toFixed(2)}%`;
      }

      return {
        ...offer,
        interestRate: rateDisplay,
        annualFee: offer.baseAnnualFee === 0 ? 'R0' : 
                   offer.id === 1 && eligibilityScore >= 70 ? 'R0 first year' : 
                   `R${offer.baseAnnualFee}/year`,
        requirements: `Min income: R${offer.requirements.minIncome.toLocaleString()}/month`,
        expiryDate: expiryDate.toISOString().split('T')[0],
        approvalChance,
        eligibilityScore
      };
    });
}

// Get personalized offers for user
app.get('/api/offers', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { category, sortBy } = req.query;

  try {
    // Get user's financial data
    const { data: accounts, error: accountError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', user_id)
      .eq('status', 'ACTIVE');

    if (accountError) throw accountError;

    // Get user's credit score
    const { data: creditScoreData, error: creditError } = await supabaseClient
      .from('credit_scores')
      .select('*')
      .eq('user_id', user_id)
      .order('score_date', { ascending: false })
      .limit(1);

    if (creditError) throw creditError;

    const creditScore = creditScoreData && creditScoreData.length > 0 ? creditScoreData[0].score : 650;

    // Get recent transactions
    const accountIds = accounts.map(acc => acc.account_id);
    let transactions = [];
    
    if (accountIds.length > 0) {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const { data: txData, error: txError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .gte('transaction_date', threeMonthsAgo.toISOString());

      if (txError) throw txError;
      transactions = txData || [];
    }

    // Calculate eligibility score
    const eligibilityScore = calculateEligibilityScore(req.user, accounts, transactions, creditScore);

    // Generate personalized offers
    let offers = generatePersonalizedOffers(req.user, eligibilityScore, creditScore);

    // Apply category filter
    if (category && category !== 'all') {
      offers = offers.filter(offer => offer.category === category);
    }

    // Apply sorting
    switch (sortBy) {
      case 'approval':
        offers.sort((a, b) => b.approvalChance - a.approvalChance);
        break;
      case 'rate':
        offers.sort((a, b) => {
          const aRate = parseFloat(a.interestRate.replace('%', '').replace(' p.a.', ''));
          const bRate = parseFloat(b.interestRate.replace('%', '').replace(' p.a.', ''));
          return aRate - bRate;
        });
        break;
      case 'expiry':
        offers.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
        break;
      default:
        // Keep relevance order (highest eligibility score first)
        offers.sort((a, b) => b.approvalChance - a.approvalChance);
        break;
    }

    res.json({
      offers,
      userCreditScore: creditScore,
      eligibilityScore,
      totalBalance: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance), 0)
    });

  } catch (error) {
    console.error('Offers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch personalized offers' });
  }
});

// Get saved offers for user
app.get('/api/offers/saved', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    // Check if saved_offers table exists, if not return empty array
    const { data: savedOffers, error } = await supabaseClient
      .from('saved_offers')
      .select('offer_id')
      .eq('user_id', user_id);

    if (error && error.code === 'PGRST116') {
      // Table doesn't exist, return empty array
      return res.json({ savedOffers: [] });
    }

    if (error) throw error;

    res.json({ 
      savedOffers: savedOffers ? savedOffers.map(item => item.offer_id) : []
    });

  } catch (error) {
    console.error('Saved offers fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch saved offers' });
  }
});

// Save/unsave an offer
app.post('/api/offers/:offerId/save', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { offerId } = req.params;

  try {
    // Check if offer is already saved
    const { data: existing, error: checkError } = await supabaseClient
      .from('saved_offers')
      .select('*')
      .eq('user_id', user_id)
      .eq('offer_id', parseInt(offerId));

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing && existing.length > 0) {
      // Remove from saved
      const { error: deleteError } = await supabaseClient
        .from('saved_offers')
        .delete()
        .eq('user_id', user_id)
        .eq('offer_id', parseInt(offerId));

      if (deleteError) throw deleteError;
      
      res.json({ saved: false, message: 'Offer removed from saved' });
    } else {
      // Add to saved
      const { error: insertError } = await supabaseClient
        .from('saved_offers')
        .insert({
          user_id,
          offer_id: parseInt(offerId),
          saved_at: new Date().toISOString()
        });

      if (insertError) throw insertError;
      
      res.json({ saved: true, message: 'Offer saved successfully' });
    }

  } catch (error) {
    console.error('Save offer error:', error);
    res.status(500).json({ error: 'Failed to save/unsave offer' });
  }
});

// Apply for an offer
app.post('/api/offers/:offerId/apply', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;
  const { offerId } = req.params;

  try {
    // Log the application
    const { error: insertError } = await supabaseClient
      .from('offer_applications')
      .insert({
        user_id,
        offer_id: parseInt(offerId),
        application_date: new Date().toISOString(),
        status: 'PENDING'
      });

    if (insertError && insertError.code !== 'PGRST116') throw insertError;

    // In a real scenario, you would integrate with application processing systems
    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      applicationId: `APP-${Date.now()}`,
      status: 'PENDING'
    });

  } catch (error) {
    console.error('Apply for offer error:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Get user's offer applications
app.get('/api/offers/applications', authenticateToken, async (req, res) => {
  const user_id = req.user.user_id;

  try {
    const { data: applications, error } = await supabaseClient
      .from('offer_applications')
      .select('*')
      .eq('user_id', user_id)
      .order('application_date', { ascending: false });

    if (error && error.code === 'PGRST116') {
      return res.json({ applications: [] });
    }

    if (error) throw error;

    res.json({ applications: applications || [] });

  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});
// ==========================
// ANALYTICS ENDPOINTS
// ==========================

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
  });
})();

module.exports = app;