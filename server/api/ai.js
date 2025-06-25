// const express = require('express');
// const router = express.Router();
// const { OpenAI } = require("openai");
// const authenticateToken = require('../middleware/auth');
// const supabaseClient = require('../supabaseClient');

// console.log('🤖 AI routes file loaded');

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// // Add a simple test route
// router.get('/test', (req, res) => {
//   console.log('✅ AI test route hit');
//   res.json({ message: 'AI routes are working!' });
// });

// router.post('/ask-context', (req, res, next) => {
//   console.log('🔍 Ask-context route hit with body:', req.body);
//   next();
// }, authenticateToken, async (req, res) => {
//   console.log('🔐 Authentication passed, user:', req.user?.user_id);
  
//   const { question } = req.body;
//   if (!question) {
//     console.log('❌ No question provided');
//     return res.status(400).json({ error: "Question is required" });
//   }

//   try {
//     console.log('📊 Fetching user data for:', req.user.user_id);
    
//     // First, get the user data with directly related tables
//     const { data: userData, error: userError } = await supabaseClient
//       .from('users')
//       .select(`
//         user_id, first_name, last_name, email, phone, id_number, dob, gender, address,
//         accounts(*),
//         income(*),
//         credit_scores(*),
//         loan_suggestions(*),
//         ai_conversations(*),
//         call_logs(*),
//         suspicious_activities(*)
//       `)
//       .eq('user_id', req.user.user_id)
//       .single();

//     if (userError || !userData) {
//       console.log('❌ User data fetch error:', userError?.message || 'No user data found');
//       throw new Error(userError?.message || 'User fetch failed');
//     }

//     console.log('✅ User data fetched successfully');

//     // Now get transactions for user's accounts
//     let transactions = [];
//     if (userData.accounts && userData.accounts.length > 0) {
//       const accountIds = userData.accounts.map(account => account.account_id);
      
//       const { data: transactionData, error: transactionError } = await supabaseClient
//         .from('transactions')
//         .select('*')
//         .in('account_id', accountIds)
//         .order('transaction_date', { ascending: false })
//         .limit(50); // Limit to recent transactions to avoid token limits

//       if (transactionError) {
//         console.log('⚠️ Transaction fetch error:', transactionError.message);
//         // Don't throw error, just log it and continue without transactions
//       } else {
//         transactions = transactionData || [];
//         console.log(`✅ Fetched ${transactions.length} transactions`);
//       }
//     }

//     // Combine all data
//     const fullData = {
//       ...userData,
//       transactions
//     };

//     const prompt = `
// You are LynqAI, a friendly and helpful financial assistant for ABSA Bank. A user has the following financial data:

// User Profile:
// - Name: ${fullData.first_name} ${fullData.last_name}
// - Email: ${fullData.email}
// - Phone: ${fullData.phone}

// Accounts: ${JSON.stringify(fullData.accounts, null, 2)}

// Recent Transactions: ${JSON.stringify(transactions.slice(0, 10), null, 2)} // Only show last 10 for context

// Income Sources: ${JSON.stringify(fullData.income, null, 2)}

// Credit Score: ${fullData.credit_scores && fullData.credit_scores.length > 0 ? fullData.credit_scores[0].score : 'Not available'}

// The user asks: "${question}"

// Please provide a helpful, personalized, and friendly response based on their financial data. Keep the response concise but informative.
//     `;

//     console.log('🤖 Calling OpenAI...');
    
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 300,
//     });

//     const answer = completion.choices[0].message.content.trim();
//     console.log('✅ OpenAI response received');

//     // Save conversation
//     await supabaseClient.from('ai_conversations').insert({
//       user_id: req.user.user_id,
//       message: question,
//       response: answer,
//       sentiment: null,
//     });

//     console.log('💾 Conversation saved to database');

//     res.json({ answer });
//   } catch (err) {
//     console.error('❌ AI context error:', err);
//     res.status(500).json({ error: 'AI service failed: ' + err.message });
//   }
// });

// console.log('🚀 AI router setup complete');
// module.exports = router;

const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk"); // Changed from OpenAI
const authenticateToken = require('../middleware/auth');
const supabaseClient = require('../supabaseClient');

console.log('🤖 AI routes file loaded');

// Initialize Groq client instead of OpenAI
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Make sure to set this in your .env file
});

// Add a simple test route
router.get('/test', (req, res) => {
  console.log('✅ AI test route hit');
  res.json({ message: 'AI routes are working!' });
});

router.post('/ask-context', (req, res, next) => {
  console.log('🔍 Ask-context route hit with body:', req.body);
  next();
}, authenticateToken, async (req, res) => {
  console.log('🔐 Authentication passed, user:', req.user?.user_id);
  
  const { question } = req.body;
  if (!question) {
    console.log('❌ No question provided');
    return res.status(400).json({ error: "Question is required" });
  }

  try {
    console.log('📊 Fetching user data for:', req.user.user_id);
    
    // First, get the user data with directly related tables
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select(`
        user_id, first_name, last_name, email, phone, id_number, dob, gender, address,
        accounts(*),
        income(*),
        credit_scores(*),
        loan_suggestions(*),
        ai_conversations(*),
        call_logs(*),
        suspicious_activities(*)
      `)
      .eq('user_id', req.user.user_id)
      .single();

    if (userError || !userData) {
      console.log('❌ User data fetch error:', userError?.message || 'No user data found');
      throw new Error(userError?.message || 'User fetch failed');
    }

    console.log('✅ User data fetched successfully');

    // Now get transactions for user's accounts
    let transactions = [];
    if (userData.accounts && userData.accounts.length > 0) {
      const accountIds = userData.accounts.map(account => account.account_id);
      
      const { data: transactionData, error: transactionError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: false })
        .limit(50); // Limit to recent transactions to avoid token limits

      if (transactionError) {
        console.log('⚠️ Transaction fetch error:', transactionError.message);
        // Don't throw error, just log it and continue without transactions
      } else {
        transactions = transactionData || [];
        console.log(`✅ Fetched ${transactions.length} transactions`);
      }
    }

    // Combine all data
    const fullData = {
      ...userData,
      transactions
    };

    const prompt = `
You are LynqAI, a friendly and helpful financial assistant for ABSA Bank. A user has the following financial data:

User Profile:
- Name: ${fullData.first_name} ${fullData.last_name}
- Email: ${fullData.email}
- Phone: ${fullData.phone}

Accounts: ${JSON.stringify(fullData.accounts, null, 2)}

Recent Transactions: ${JSON.stringify(transactions.slice(0, 10), null, 2)} // Only show last 10 for context

Income Sources: ${JSON.stringify(fullData.income, null, 2)}

Credit Score: ${fullData.credit_scores && fullData.credit_scores.length > 0 ? fullData.credit_scores[0].score : 'Not available'}

The user asks: "${question}"

Please provide a helpful, personalized, and friendly response based on their financial data. Keep the response concise but informative.
    `;

    console.log('🤖 Calling Groq...');
    
    // Replace OpenAI API call with Groq
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Using the model from their docs
      messages: [{ 
        role: "user", 
        content: prompt 
      }],
      max_tokens: 300,
      temperature: 0.7, // Optional: adjust creativity
    });

    const answer = completion.choices[0].message.content.trim();
    console.log('✅ Groq response received');

    // Save conversation
    await supabaseClient.from('ai_conversations').insert({
      user_id: req.user.user_id,
      message: question,
      response: answer,
      sentiment: null,
    });

    console.log('💾 Conversation saved to database');

    res.json({ answer });
  } catch (err) {
    console.error('❌ AI context error:', err);
    res.status(500).json({ error: 'AI service failed: ' + err.message });
  }
});

console.log('🚀 AI router setup complete');
module.exports = router;