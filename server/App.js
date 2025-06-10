require('dotenv').config();
// Add this debug section
console.log('🔧 Environment Variables Check:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

/// Database connection using environment variables
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT),
});

// Add connection validation
if (!process.env.DB_USER || !process.env.DB_HOST || !process.env.DB_NAME || !process.env.DB_PASSWORD) {
    console.error('❌ Missing required database environment variables');
    console.error('Required: DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT');
    process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;

// Add this for immediate testing
async function testDatabaseConnection() {
    try {
        console.log('🔍 Testing database connection...');
        const result = await pool.query('SELECT NOW() as current_time, current_user as user_name');
        console.log('✅ Database test successful:', result.rows[0]);
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Error code:', error.code);
    }
}

// Call the test immediately
testDatabaseConnection();

// Test database connection
pool.on('connect', () => {
    console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// DATABASE FUNCTIONS
// =============================================

// User registration function
async function registerUser(account_number, id_number, first_name, last_name, password) {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        // 1. Check if user exists with account_number and id_number
        const findUserQuery = `
            SELECT user_id, account_number, id_number, first_name, last_name, 
                   email, phone, is_active, password_hash
            FROM users 
            WHERE account_number = $1 AND id_number = $2
        `;
        
        const findResult = await client.query(findUserQuery, [account_number, id_number]);
        
        if (findResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return { success: false, code: -1, message: 'User not found with these details' };
        }
        
        const user = findResult.rows[0];
        
        // 2. Validate that the provided names match
        if (user.first_name.toLowerCase() !== first_name.toLowerCase() || 
            user.last_name.toLowerCase() !== last_name.toLowerCase()) {
            await client.query('ROLLBACK');
            return { success: false, code: -2, message: 'User details do not match our records' };
        }
        
        // 3. Check if user is already registered
        if (user.is_active && user.password_hash) {
            await client.query('ROLLBACK');
            return { success: false, code: -3, message: 'User is already registered' };
        }
        
        // 4. Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
        
        // 5. Update user with registration details
        const updateQuery = `
            UPDATE users 
            SET password_hash = $1, salt = $2, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
            WHERE account_number = $3 AND id_number = $4
        `;
        
        await client.query(updateQuery, [password_hash, salt, account_number, id_number]);
        
        await client.query('COMMIT');
        
        return { 
            success: true, 
            code: 0, 
            message: 'Registration successful',
            user: {
                user_id: user.user_id,
                account_number: user.account_number,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        };
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Registration error:', error);
        return { success: false, code: -999, message: 'Registration failed due to server error' };
    } finally {
        client.release();
    }
}

// User login function
async function loginUser(id_number, password) {
    try {
        // 1. Get user by ID number
        const getUserQuery = `
            SELECT user_id, account_number, id_number, first_name, last_name, 
                   email, phone, password_hash, salt, is_active, last_login,
                   failed_login_attempts
            FROM users 
            WHERE id_number = $1
        `;
        
        const userResult = await pool.query(getUserQuery, [id_number]);
        
        // 2. Check if user exists
        if (userResult.rows.length === 0) {
            return { success: false, code: -1, message: 'User does not exist' };
        }
        
        const user = userResult.rows[0];
        
        // 3. Check if user is active (registered)
        if (!user.is_active) {
            return { success: false, code: 1, message: 'Account not activated. Please register first.' };
        }
        
        // 4. Check password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            // Increment failed login attempts
            await pool.query(
                'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id_number = $1',
                [id_number]
            );
            
            return { success: false, code: 2, message: 'Invalid password' };
        }
        
        // 5. Successful login - update last login and reset failed attempts
        await pool.query(
            `UPDATE users 
             SET last_login = CURRENT_TIMESTAMP, failed_login_attempts = 0 
             WHERE id_number = $1`,
            [id_number]
        );
        
        // 6. Generate JWT token
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
                last_login: user.last_login
            }
        };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, code: -999, message: 'Login failed due to server error' };
    }
}

// Get user details by ID
async function getUserById(user_id) {
    try {
        const query = `
            SELECT user_id, account_number, id_number, first_name, last_name, 
                   email, phone, is_active, last_login, created_at
            FROM users 
            WHERE user_id = $1 AND is_active = TRUE
        `;
        
        const result = await pool.query(query, [user_id]);
        
        if (result.rows.length === 0) {
            return { success: false, message: 'User not found' };
        }
        
        return { success: true, user: result.rows[0] };
        
    } catch (error) {
        console.error('Get user error:', error);
        return { success: false, message: 'Failed to get user details' };
    }
}

// Get user accounts
async function getUserAccounts(user_id) {
    try {
        const query = `
            SELECT account_id, account_type, balance, credit_limit, 
                   interest_rate, created_at, status
            FROM accounts 
            WHERE user_id = $1 AND status = 'ACTIVE'
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, [user_id]);
        
        return { success: true, accounts: result.rows };
        
    } catch (error) {
        console.error('Get accounts error:', error);
        return { success: false, message: 'Failed to get user accounts' };
    }
}

// Get user transactions
async function getUserTransactions(user_id, limit = 50, offset = 0) {
    try {
        const query = `
            SELECT t.transaction_id, t.account_id, t.transaction_type, t.amount,
                   t.description, t.category, t.merchant_name, t.transaction_date,
                   t.balance_after, t.location, a.account_type
            FROM transactions t
            JOIN accounts a ON t.account_id = a.account_id
            WHERE a.user_id = $1
            ORDER BY t.transaction_date DESC
            LIMIT $2 OFFSET $3
        `;
        
        const result = await pool.query(query, [user_id, limit, offset]);
        
        return { success: true, transactions: result.rows };
        
    } catch (error) {
        console.error('Get transactions error:', error);
        return { success: false, message: 'Failed to get user transactions' };
    }
}

// Get all users function (for testing)
async function getAllUsers() {
    try {
        const query = `
            SELECT user_id, account_number, id_number, first_name, last_name, 
                   email, phone, is_active, created_at, last_login,
                   CASE 
                       WHEN password_hash IS NULL THEN 'Not Registered'
                       ELSE 'Registered'
                   END as registration_status
            FROM users 
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query);
        
        return { success: true, users: result.rows, count: result.rows.length };
        
    } catch (error) {
        console.error('Get all users error:', error);
        return { success: false, message: 'Failed to get users' };
    }
}


// =============================================
// MIDDLEWARE
// =============================================

// JWT Authentication middleware
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
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
}

// =============================================
// ROUTES
// =============================================
// Get all users endpoint (for testing)
app.get('/api/users/all', async (req, res) => {
    try {
        const result = await getAllUsers();
        
        if (result.success) {
            res.json({
                message: 'All users retrieved successfully',
                count: result.count,
                users: result.users
            });
        } else {
            res.status(500).json({ error: result.message });
        }
        
    } catch (error) {
        console.error('Get all users route error:', error);
        res.status(500).json({ error: 'Failed to get all users' });
    }
});
// Get user by ID endpoint (for testing)
app.get('/api/users/:user_id', async (req, res) => {
    try {
        const { user_id } = req.params;
        
        // Validate UUID format (basic check)
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user_id)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        const result = await getUserById(user_id);
        
        if (result.success) {
            res.json({
                message: 'User retrieved successfully',
                user: result.user
            });
        } else {
            res.status(404).json({ error: result.message });
        }
        
    } catch (error) {
        console.error('Get user by ID route error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            status: 'OK', 
            message: 'ABSA Financial Assistant API is running',
            database: 'Connected',
            timestamp: result.rows[0].now
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'ERROR', 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    const { account_number, id_number, first_name, last_name, password } = req.body;
    
    // Validation
    if (!account_number || !id_number || !first_name || !last_name || !password) {
        return res.status(400).json({ 
            error: 'All fields are required',
            required: ['account_number', 'id_number', 'first_name', 'last_name', 'password']
        });
    }
    
    // Validate South African ID number (13 digits)
    if (!/^\d{13}$/.test(id_number)) {
        return res.status(400).json({ error: 'Invalid ID number format. Must be 13 digits.' });
    }
    
    try {
        const result = await registerUser(account_number, id_number, first_name, last_name, password);
        
        if (result.success) {
            res.status(201).json({ 
                message: result.message,
                user: result.user
            });
        } else {
            const statusCode = result.code === -1 ? 404 : 400;
            res.status(statusCode).json({ 
                error: result.message,
                code: result.code
            });
        }
        
    } catch (error) {
        console.error('Registration route error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { id_number, password } = req.body;
    
    // Validation
    if (!id_number || !password) {
        return res.status(400).json({ 
            error: 'ID number and password are required',
            required: ['id_number', 'password']
        });
    }
    
    try {
        const result = await loginUser(id_number, password);
        
        if (result.success) {
            res.json({ 
                message: result.message,
                token: result.token,
                user: result.user
            });
        } else {
            const statusCode = result.code === -999 ? 500 : 401;
            res.status(statusCode).json({ 
                error: result.message,
                code: result.code
            });
        }
        
    } catch (error) {
        console.error('Login route error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    res.json({
        message: 'User profile retrieved successfully',
        user: req.user
    });
});

// Get user accounts
app.get('/api/users/accounts', authenticateToken, async (req, res) => {
    try {
        const result = await getUserAccounts(req.user.user_id);
        
        if (result.success) {
            res.json({
                message: 'Accounts retrieved successfully',
                accounts: result.accounts
            });
        } else {
            res.status(500).json({ error: result.message });
        }
        
    } catch (error) {
        console.error('Get accounts error:', error);
        res.status(500).json({ error: 'Failed to get user accounts' });
    }
});

// Get user transactions
app.get('/api/users/transactions', authenticateToken, async (req, res) => {
    try {
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
                    count: result.transactions.length
                }
            });
        } else {
            res.status(500).json({ error: result.message });
        }
        
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Failed to get user transactions' });
    }
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to ABSA Financial Assistant API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login'
            },
            users: {
                profile: 'GET /api/users/profile',
                accounts: 'GET /api/users/accounts',
                transactions: 'GET /api/users/transactions'
            }
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ABSA Financial Assistant API running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔐 Register: POST http://localhost:${PORT}/api/auth/register`);
    console.log(`🔑 Login: POST http://localhost:${PORT}/api/auth/login`);
});

module.exports = app;