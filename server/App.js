// moodule to execute shell commands
// const { execSync } = require( 'child_process' )
const path = require( 'path' )
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://fintech:LccZN30XfIVtugue@fintech-cluster.nvugcmv.mongodb.net/?retryWrites=true&w=majority&appName=fintech-cluster';
const MONGO_DB = process.env.MONGO_DB || 'fintech_db';

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

// try
// {
//     console.log( 'Begin database sh execution' )
//     const scriptPath = path.join( __dirname, '..', 'scripts', 'setup-database.sh' )

//     // Execute script synchronously and show output
//     const output = execSync( `bash "${ scriptPath }"`, {
//         stdio: 'inherit',
//         env: {
//             ...process.env,
//             PGUSER: process.env.DB_USER || 'fintech',
//             PGPASSWORD: process.env.DB_PASSWORD
//         }
//     } )

//     console.log( 'Database setup completed' )
// } catch ( error )
// {
//     console.error( 'Database setup failed:', error.message )
//     process.exit( 1 )
// }


if (!MONGO_URI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

mongoose.connect(`${MONGO_URI}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('✅ Connected to MongoDB');
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Schemas
const userSchema = new mongoose.Schema({
    account_number: { type: String, required: true, unique: true },
    id_number: { type: String, required: true, unique: true },
    first_name: String,
    last_name: String,
    password: String,
});

const accountSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    balance: Number,
    account_type: String,
});

const transactionSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: Number,
    type: String,
    date: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET;

// JWT Authentication middleware
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid token' });
    }
}

// Registration endpoint
app.post('/api/auth/register', async (req, res) => {
    const { account_number, id_number, first_name, last_name, password } = req.body;
    if (!account_number || !id_number || !first_name || !last_name || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^\d{13}$/.test(id_number)) {
        return res.status(400).json({ error: 'Invalid South African ID number' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ account_number, id_number, first_name, last_name, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        if (error.code === 11000) {
            res.status(409).json({ error: 'Account number or ID number already exists' });
        } else {
            res.status(500).json({ error: 'Registration failed' });
        }
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { id_number, password } = req.body;
    if (!id_number || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }
    try {
        const user = await User.findOne({ id_number });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { user_id: user._id, id_number: user.id_number, first_name: user.first_name, last_name: user.last_name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.user_id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// Get user accounts
app.get('/api/users/accounts', authenticateToken, async (req, res) => {
    try {
        const accounts = await Account.find({ user_id: req.user.user_id });
        res.json({ accounts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch accounts' });
    }
});

// Get user transactions
app.get('/api/users/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user_id: req.user.user_id }).sort({ date: -1 }).limit(50);
        res.json({ transactions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Default route
app.get('/', (req, res) => {
    res.send('FinTech API running with MongoDB');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Seeding function
async function seedDatabase() {
    if (await User.countDocuments() > 0) {
        console.log('Database already seeded.');
        return;
    }
    console.log('Seeding MongoDB with initial data...');

    // USERS
    const users = await User.insertMany([
        { account_number: 'ACC001234567890', id_number: '9001010001080', first_name: 'John', last_name: 'Doe', email: 'john.doe@email.com', phone: '+27123456789', is_active: false },
        { account_number: 'ACC002345678901', id_number: '8505050002084', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@email.com', phone: '+27234567890', is_active: false },
        { account_number: 'ACC003456789012', id_number: '7712120003088', first_name: 'Michael', last_name: 'Johnson', email: 'michael.johnson@email.com', phone: '+27345678901', is_active: false },
        { account_number: 'ACC004567890123', id_number: '9203030004082', first_name: 'Sarah', last_name: 'Williams', email: 'sarah.williams@email.com', phone: '+27456789012', is_active: false },
        { account_number: 'ACC005678901234', id_number: '8801010005086', first_name: 'David', last_name: 'Brown', email: 'david.brown@email.com', phone: '+27567890123', is_active: false },
        { account_number: 'ACC006789012345', id_number: '9506060006080', first_name: 'Lisa', last_name: 'Davis', email: 'lisa.davis@email.com', phone: '+27678901234', is_active: false },
        { account_number: 'ACC007890123456', id_number: '8109090007084', first_name: 'Robert', last_name: 'Miller', email: 'robert.miller@email.com', phone: '+27789012345', is_active: false },
        { account_number: 'ACC008901234567', id_number: '9404040008088', first_name: 'Emily', last_name: 'Wilson', email: 'emily.wilson@email.com', phone: '+27890123456', is_active: false },
        { account_number: 'ACC009012345678', id_number: '8702020009082', first_name: 'James', last_name: 'Moore', email: 'james.moore@email.com', phone: '+27901234567', is_active: false },
        { account_number: 'ACC010123456789', id_number: '9008080010086', first_name: 'Amanda', last_name: 'Taylor', email: 'amanda.taylor@email.com', phone: '+27012345678', is_active: false }
    ]);
    const userMap = {};
    users.forEach(u => { userMap[u.account_number] = u; });

    // ACCOUNTS
    const accounts = await Account.insertMany([
        // Cheque
        { user_id: userMap['ACC001234567890']._id, account_type: 'CHEQUE', balance: 15420.50, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC002345678901']._id, account_type: 'CHEQUE', balance: 8750.25, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC003456789012']._id, account_type: 'CHEQUE', balance: 23150.75, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC004567890123']._id, account_type: 'CHEQUE', balance: 5280.10, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC005678901234']._id, account_type: 'CHEQUE', balance: 31250.80, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC006789012345']._id, account_type: 'CHEQUE', balance: 12980.45, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC007890123456']._id, account_type: 'CHEQUE', balance: 45670.30, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC008901234567']._id, account_type: 'CHEQUE', balance: 9840.60, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC009012345678']._id, account_type: 'CHEQUE', balance: 18750.90, credit_limit: 0, interest_rate: 0.0125 },
        { user_id: userMap['ACC010123456789']._id, account_type: 'CHEQUE', balance: 27350.20, credit_limit: 0, interest_rate: 0.0125 },
        // Savings
        { user_id: userMap['ACC001234567890']._id, account_type: 'SAVINGS', balance: 50000.00, credit_limit: 0, interest_rate: 0.0425 },
        { user_id: userMap['ACC003456789012']._id, account_type: 'SAVINGS', balance: 75000.00, credit_limit: 0, interest_rate: 0.0425 },
        { user_id: userMap['ACC005678901234']._id, account_type: 'SAVINGS', balance: 120000.00, credit_limit: 0, interest_rate: 0.0425 },
        { user_id: userMap['ACC007890123456']._id, account_type: 'SAVINGS', balance: 200000.00, credit_limit: 0, interest_rate: 0.0425 },
        { user_id: userMap['ACC010123456789']._id, account_type: 'SAVINGS', balance: 85000.00, credit_limit: 0, interest_rate: 0.0425 },
        // Credit Card
        { user_id: userMap['ACC002345678901']._id, account_type: 'CREDIT_CARD', balance: -2450.50, credit_limit: 15000.00, interest_rate: 0.1995 },
        { user_id: userMap['ACC004567890123']._id, account_type: 'CREDIT_CARD', balance: -1800.25, credit_limit: 10000.00, interest_rate: 0.1995 },
        { user_id: userMap['ACC006789012345']._id, account_type: 'CREDIT_CARD', balance: -5670.80, credit_limit: 25000.00, interest_rate: 0.1995 },
        { user_id: userMap['ACC008901234567']._id, account_type: 'CREDIT_CARD', balance: -890.40, credit_limit: 8000.00, interest_rate: 0.1995 },
        { user_id: userMap['ACC009012345678']._id, account_type: 'CREDIT_CARD', balance: -3250.60, credit_limit: 20000.00, interest_rate: 0.1995 }
    ]);
    const accountMap = {};
    accounts.forEach(a => { accountMap[`${a.user_id}_${a.account_type}`] = a; });

    // TRANSACTIONS
    const transactions = await Transaction.insertMany([
        {
            account_id: accountMap[`${userMap['ACC001234567890']._id}_CHEQUE`]._id,
            transaction_type: 'DEBIT',
            amount: -850.00,
            description: 'Grocery Shopping',
            category: 'GROCERIES',
            merchant_name: 'Pick n Pay',
            transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            balance_after: 15420.50 - 850.00,
            location: 'Johannesburg, SA'
        },
        {
            account_id: accountMap[`${userMap['ACC003456789012']._id}_CHEQUE`]._id,
            transaction_type: 'CREDIT',
            amount: 25000.00,
            description: 'Salary Deposit',
            category: 'INCOME',
            merchant_name: 'ABC Company',
            transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            balance_after: 23150.75 + 25000.00,
            location: 'Cape Town, SA'
        },
        {
            account_id: accountMap[`${userMap['ACC002345678901']._id}_CHEQUE`]._id,
            transaction_type: 'DEBIT',
            amount: -450.00,
            description: 'Restaurant',
            category: 'DINING',
            merchant_name: 'Spur Steak Ranch',
            transaction_date: new Date(Date.now() - 3 * 60 * 60 * 1000),
            balance_after: 8750.25 - 450.00,
            location: 'Pretoria, SA'
        },
        {
            account_id: accountMap[`${userMap['ACC004567890123']._id}_CHEQUE`]._id,
            transaction_type: 'DEBIT',
            amount: -1200.00,
            description: 'Fuel',
            category: 'TRANSPORT',
            merchant_name: 'Shell Garage',
            transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            balance_after: 5280.10 - 1200.00,
            location: 'Durban, SA'
        },
        {
            account_id: accountMap[`${userMap['ACC005678901234']._id}_CHEQUE`]._id,
            transaction_type: 'CREDIT',
            amount: 15000.00,
            description: 'Freelance Payment',
            category: 'INCOME',
            merchant_name: 'XYZ Client',
            transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            balance_after: 31250.80 + 15000.00,
            location: 'Cape Town, SA'
        }
    ]);

    // INCOME
    await Income.insertMany([
        {
            user_id: userMap['ACC001234567890']._id,
            source: 'Salary - ABC Company',
            amount: 25000.00,
            frequency: 'MONTHLY',
            next_payment_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 25)
        },
        {
            user_id: userMap['ACC003456789012']._id,
            source: 'Salary - Tech Corp',
            amount: 35000.00,
            frequency: 'MONTHLY',
            next_payment_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 30)
        }
    ]);

    // CREDIT SCORES
    await CreditScore.insertMany([
        {
            user_id: userMap['ACC001234567890']._id,
            score: 720,
            factors: {
                payment_history: "Good",
                credit_utilization: "Medium",
                length_of_credit: "Good",
                types_of_credit: "Excellent",
                new_credit: "Good"
            },
            recommendations: "Maintain current good credit habits"
        },
        {
            user_id: userMap['ACC002345678901']._id,
            score: 650,
            factors: {
                payment_history: "Good",
                credit_utilization: "Medium",
                length_of_credit: "Good",
                types_of_credit: "Excellent",
                new_credit: "Good"
            },
            recommendations: "Reduce credit card balances to improve credit utilization ratio"
        },
        {
            user_id: userMap['ACC003456789012']._id,
            score: 780,
            factors: {
                payment_history: "Good",
                credit_utilization: "Medium",
                length_of_credit: "Good",
                types_of_credit: "Excellent",
                new_credit: "Good"
            },
            recommendations: "Maintain current good credit habits"
        },
        {
            user_id: userMap['ACC004567890123']._id,
            score: 590,
            factors: {
                payment_history: "Good",
                credit_utilization: "Medium",
                length_of_credit: "Good",
                types_of_credit: "Excellent",
                new_credit: "Good"
            },
            recommendations: "Make payments on time and reduce overall debt"
        },
        {
            user_id: userMap['ACC005678901234']._id,
            score: 820,
            factors: {
                payment_history: "Good",
                credit_utilization: "Medium",
                length_of_credit: "Good",
                types_of_credit: "Excellent",
                new_credit: "Good"
            },
            recommendations: "Maintain current good credit habits"
        }
    ]);

    // LOAN SUGGESTIONS
    await LoanSuggestion.insertMany([
        {
            user_id: userMap['ACC001234567890']._id,
            current_loans: [{ type: "Personal", balance: 20000 }],
            suggested_plan: { type: "Consolidation", rate: 0.09 },
            potential_savings: 2500,
            status: "PENDING"
        }
    ]);

    // AI CONVERSATIONS
    await AIConversation.insertMany([
        {
            user_id: userMap['ACC001234567890']._id,
            message: "What is my current account balance?",
            response: "Your current cheque account balance is R15,420.50. Would you like to see details of your recent transactions?",
            sentiment: "NEUTRAL"
        },
        {
            user_id: userMap['ACC003456789012']._id,
            message: "I want to apply for a personal loan",
            response: "Based on your credit score of 780 and income history, you may qualify for a personal loan up to R500,000. Would you like me to start the application process?",
            sentiment: "POSITIVE"
        }
    ]);

    // CALL LOGS
    await CallLog.insertMany([
        {
            user_id: userMap['ACC001234567890']._id,
            call_type: "SUPPORT",
            duration: 320,
            status: "COMPLETED",
            started_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
            ended_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 320 * 1000),
            notes: "Assisted with online banking registration"
        }
    ]);

    // SUSPICIOUS ACTIVITIES
    await SuspiciousActivity.insertMany([
        {
            user_id: userMap['ACC002345678901']._id,
            transaction_id: transactions[2]._id,
            activity_type: "Unusual Location",
            risk_level: "MEDIUM",
            description: "Transaction from unexpected location",
            detected_at: new Date(Date.now() - 1 * 60 * 60 * 1000),
            resolved: false
        }
    ]);

    console.log('✅ MongoDB database seeded.');
}

seedDatabase().catch(console.error);

module.exports = app