// const express = require('express');
// const router = express.Router();
// const Groq = require("groq-sdk"); // Changed from OpenAI
// const authenticateToken = require('../middleware/auth');
// const supabaseClient = require('../supabaseClient');

// console.log('🤖 AI routes file loaded');

// // Initialize Groq client instead of OpenAI
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY, // Make sure to set this in your .env file
// });

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

//     console.log('🤖 Calling Groq...');
    
//     // Replace OpenAI API call with Groq
//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile", // Using the model from their docs
//       messages: [{ 
//         role: "user", 
//         content: prompt 
//       }],
//       max_tokens: 300,
//       temperature: 0.7, // Optional: adjust creativity
//     });

//     const answer = completion.choices[0].message.content.trim();
//     console.log('✅ Groq response received');

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


// // Add this new route to your AI routes file
// router.get('/dashboard-insights', authenticateToken, async (req, res) => {
//   console.log('📊 Dashboard insights route hit for user:', req.user?.user_id);
  
//   try {
//     console.log('📊 Fetching user data for insights:', req.user.user_id);
    
//     // Get user data with related tables
//     const { data: userData, error: userError } = await supabaseClient
//       .from('users')
//       .select(`
//         user_id, first_name, last_name, email, phone,
//         accounts(*),
//         income(*),
//         credit_scores(*)
//       `)
//       .eq('user_id', req.user.user_id)
//       .single();

//     if (userError || !userData) {
//       console.log('❌ User data fetch error:', userError?.message || 'No user data found');
//       throw new Error(userError?.message || 'User fetch failed');
//     }

//     // Get transactions for user's accounts
//     let transactions = [];
//     if (userData.accounts && userData.accounts.length > 0) {
//       const accountIds = userData.accounts.map(account => account.account_id);
      
//       const { data: transactionData, error: transactionError } = await supabaseClient
//         .from('transactions')
//         .select('*')
//         .in('account_id', accountIds)
//         .order('transaction_date', { ascending: false })
//         .limit(100); // Get more for analysis

//       if (!transactionError) {
//         transactions = transactionData || [];
//       }
//     }

//     // Analyze spending by category
//     const categorySpending = {};
//     const monthlyData = {};
//     let totalIncome = 0;
//     let totalExpenses = 0;

//     // Process transactions
//     transactions.forEach(transaction => {
//       const amount = parseFloat(transaction.amount) || 0;
//       const category = transaction.category || 'Other';
//       const date = new Date(transaction.transaction_date);
//       const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

//       // Category spending
//       if (!categorySpending[category]) {
//         categorySpending[category] = 0;
//       }
//       categorySpending[category] += Math.abs(amount);

//       // Monthly data
//       if (!monthlyData[monthKey]) {
//         monthlyData[monthKey] = { income: 0, expenses: 0 };
//       }

//       if (transaction.transaction_type === 'credit') {
//         monthlyData[monthKey].income += amount;
//         totalIncome += amount;
//       } else {
//         monthlyData[monthKey].expenses += amount;
//         totalExpenses += amount;
//       }
//     });

//     // Get income data
//     const incomeData = userData.income || [];
//     const monthlyIncomeFromSources = incomeData.reduce((total, income) => {
//       return total + (parseFloat(income.amount) || 0);
//     }, 0);

//     // Create financial summary for AI insights
//     const financialSummary = {
//       totalBalance: userData.accounts?.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0) || 0,
//       totalIncome: totalIncome + monthlyIncomeFromSources,
//       totalExpenses,
//       creditScore: userData.credit_scores?.[0]?.score || null,
//       savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
//       topSpendingCategory: Object.keys(categorySpending).reduce((a, b) => 
//         categorySpending[a] > categorySpending[b] ? a : b, 'None'),
//       transactionCount: transactions.length
//     };

//     // Generate AI insights using Groq
//     const insightsPrompt = `
// You are LynqAI, a financial AI assistant. Analyze this user's financial data and provide 3 personalized financial insights:

// Financial Summary:
// - Total Balance: R${financialSummary.totalBalance.toLocaleString()}
// - Monthly Income: R${financialSummary.totalIncome.toLocaleString()}
// - Monthly Expenses: R${financialSummary.totalExpenses.toLocaleString()}
// - Savings Rate: ${financialSummary.savingsRate.toFixed(1)}%
// - Credit Score: ${financialSummary.creditScore || 'Not available'}
// - Top Spending Category: ${financialSummary.topSpendingCategory}
// - Number of Transactions: ${financialSummary.transactionCount}

// Category Breakdown: ${JSON.stringify(categorySpending, null, 2)}

// Please provide exactly 3 insights in this JSON format:
// [
//   {
//     "type": "success|warning|info",
//     "title": "Insight Title",
//     "message": "Detailed message about the insight",
//     "confidence": 85
//   }
// ]

// Focus on actionable advice based on their spending patterns, savings rate, and financial behavior. Keep messages under 100 characters.
//     `;

//     console.log('🤖 Calling Groq for insights...');
    
//     const completion = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [{ 
//         role: "user", 
//         content: insightsPrompt 
//       }],
//       max_tokens: 800,
//       temperature: 0.3,
//     });

//     let aiInsights = [];
//     try {
//       const aiResponse = completion.choices[0].message.content.trim();
//       // Try to parse JSON from AI response
//       const jsonMatch = aiResponse.match(/$$[\s\S]*$$/);
//       if (jsonMatch) {
//         aiInsights = JSON.parse(jsonMatch[0]);
//       }
//     } catch (parseError) {
//       console.log('⚠️ Could not parse AI insights, using defaults');
//       // Fallback insights
//       aiInsights = [
//         {
//           type: 'info',
//           title: 'Spending Analysis',
//           message: `Your top spending category is ${financialSummary.topSpendingCategory}`,
//           confidence: 90
//         },
//         {
//           type: financialSummary.savingsRate > 20 ? 'success' : 'warning',
//           title: 'Savings Rate',
//           message: `Your current savings rate is ${financialSummary.savingsRate.toFixed(1)}%`,
//           confidence: 95
//         },
//         {
//           type: 'info',
//           title: 'Transaction Activity',
//           message: `You've made ${financialSummary.transactionCount} transactions recently`,
//           confidence: 100
//         }
//       ];
//     }

//     // Format spending by category for frontend
//     const spendingByCategory = Object.entries(categorySpending)
//       .map(([category, amount]) => ({ category, amount }))
//       .sort((a, b) => b.amount - a.amount)
//       .slice(0, 8); // Top 8 categories

//     // Format monthly data for chart
//     const monthlyChartData = Object.entries(monthlyData)
//       .sort(([a], [b]) => a.localeCompare(b))
//       .slice(-6) // Last 6 months
//       .map(([month, data]) => ({
//         month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
//         income: data.income,
//         expenses: data.expenses
//       }));

//     console.log('✅ Dashboard insights generated');

//     res.json({
//       aiInsights,
//       spendingByCategory,
//       monthlyChartData,
//       financialSummary
//     });

//   } catch (err) {
//     console.error('❌ Dashboard insights error:', err);
//     res.status(500).json({ error: 'Failed to generate dashboard insights: ' + err.message });
//   }
// });

// console.log('🚀 AI router setup complete');
// module.exports = router;

const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk");
const authenticateToken = require('../middleware/auth');
const supabaseClient = require('../supabaseClient');

console.log('🤖 AI routes file loaded');

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Test route
router.get('/test', (req, res) => {
  console.log('✅ AI test route hit');
  res.json({ message: 'AI routes are working!' });
});

// Chat route
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

    let transactions = [];
    if (userData.accounts && userData.accounts.length > 0) {
      const accountIds = userData.accounts.map(account => account.account_id);
      
      const { data: transactionData, error: transactionError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: false })
        .limit(50);

      if (transactionError) {
        console.log('⚠️ Transaction fetch error:', transactionError.message);
      } else {
        transactions = transactionData || [];
        console.log(`✅ Fetched ${transactions.length} transactions`);
      }
    }

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

Recent Transactions: ${JSON.stringify(transactions.slice(0, 10), null, 2)}

Income Sources: ${JSON.stringify(fullData.income, null, 2)}

Credit Score: ${fullData.credit_scores && fullData.credit_scores.length > 0 ? fullData.credit_scores[0].score : 'Not available'}

The user asks: "${question}"

Please provide a helpful, personalized, and friendly response based on their financial data. Keep the response concise but informative.
    `;

    console.log('🤖 Calling Groq...');
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ 
        role: "user", 
        content: prompt 
      }],
      max_tokens: 300,
      temperature: 0.7,
    });

    const answer = completion.choices[0].message.content.trim();
    console.log('✅ Groq response received');

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

// Dashboard insights route - FIXED FOR CREDIT/DEBIT
router.get('/dashboard-insights', authenticateToken, async (req, res) => {
  console.log('📊 Dashboard insights route hit for user:', req.user?.user_id);
  
  try {
    console.log('📊 Fetching user data for insights:', req.user.user_id);
    
    // Get user data with related tables
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select(`
        user_id, first_name, last_name, email, phone,
        accounts(*),
        income(*),
        credit_scores(*)
      `)
      .eq('user_id', req.user.user_id)
      .single();

    if (userError || !userData) {
      console.log('❌ User data fetch error:', userError?.message || 'No user data found');
      throw new Error(userError?.message || 'User fetch failed');
    }

    console.log('✅ User data fetched successfully');

    // Get transactions for user's accounts
    let transactions = [];
    if (userData.accounts && userData.accounts.length > 0) {
      const accountIds = userData.accounts.map(account => account.account_id);
      
      const { data: transactionData, error: transactionError } = await supabaseClient
        .from('transactions')
        .select('*')
        .in('account_id', accountIds)
        .order('transaction_date', { ascending: false })
        .limit(100);

      if (!transactionError) {
        transactions = transactionData || [];
        console.log(`✅ Fetched ${transactions.length} transactions for insights`);
      } else {
        console.log('⚠️ Transaction fetch error:', transactionError.message);
      }
    }

    console.log('📝 Sample transactions for debugging:', transactions.slice(0, 3).map(t => ({
      type: t.transaction_type,
      category: t.category,
      amount: t.amount
    })));

    // FIXED: Analyze spending by category and income/expenses using transaction_type
    const categorySpending = {};
    const monthlyData = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    // Process transactions
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const category = transaction.category || 'Other';
      const transactionType = transaction.transaction_type?.toUpperCase();
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      // Initialize monthly data
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      // FIXED: Use transaction_type to determine income vs expense
      if (transactionType === 'CREDIT') {
        // CREDIT = Income
        monthlyData[monthKey].income += Math.abs(amount);
        totalIncome += Math.abs(amount);
      } else if (transactionType === 'DEBIT') {
        // DEBIT = Expense
        monthlyData[monthKey].expenses += Math.abs(amount);
        totalExpenses += Math.abs(amount);
        
        // For expenses, also track by category for spending breakdown
        if (!categorySpending[category]) {
          categorySpending[category] = 0;
        }
        categorySpending[category] += Math.abs(amount);
      }
    });

    // Get additional income data from income table
    const incomeData = userData.income || [];
    const monthlyIncomeFromSources = incomeData.reduce((total, income) => {
      return total + (parseFloat(income.amount) || 0);
    }, 0);

    // Add income from income table to total
    totalIncome += monthlyIncomeFromSources;

    // Create financial summary for AI insights
    const financialSummary = {
      totalBalance: userData.accounts?.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0) || 0,
      totalIncome,
      totalExpenses,
      creditScore: userData.credit_scores?.[0]?.score || null,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0,
      topSpendingCategory: Object.keys(categorySpending).length > 0 ? 
        Object.keys(categorySpending).reduce((a, b) => categorySpending[a] > categorySpending[b] ? a : b) : 'None',
      transactionCount: transactions.length
    };

    console.log('📈 Financial summary calculated:', {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      savingsRate: financialSummary.savingsRate.toFixed(2) + '%',
      topCategory: financialSummary.topSpendingCategory,
      categoriesFound: Object.keys(categorySpending).length,
      monthlyDataPoints: Object.keys(monthlyData).length
    });

    // Generate AI insights using Groq
    let aiInsights = [];
    
    if (Object.keys(categorySpending).length > 0 || totalIncome > 0 || totalExpenses > 0) {
      try {
        const insightsPrompt = `
You are LynqAI, a financial AI assistant. Based on this user's financial data, provide exactly 3 personalized insights.

Financial Summary:
- Total Balance: R${financialSummary.totalBalance.toLocaleString()}
- Total Income (CREDIT transactions): R${financialSummary.totalIncome.toLocaleString()}
- Total Expenses (DEBIT transactions): R${financialSummary.totalExpenses.toLocaleString()}
- Savings Rate: ${financialSummary.savingsRate.toFixed(1)}%
- Credit Score: ${financialSummary.creditScore || 'Not available'}
- Top Expense Category: ${financialSummary.topSpendingCategory}
- Number of Transactions: ${financialSummary.transactionCount}

Expense Categories: ${JSON.stringify(categorySpending, null, 2)}

Respond with ONLY a valid JSON array:
[
  {
    "type": "success",
    "title": "Financial Strength",
    "message": "Brief positive insight about their finances",
    "confidence": 90
  },
  {
    "type": "warning", 
    "title": "Improvement Area",
    "message": "Brief suggestion for improvement",
    "confidence": 85
  },
  {
    "type": "info",
    "title": "Financial Tip",
    "message": "Brief general financial advice", 
    "confidence": 95
  }
]

Keep messages under 70 characters. Use "success" for good habits, "warning" for concerns, "info" for tips.
        `;

        console.log('🤖 Calling Groq for insights...');
        
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [{ 
            role: "user", 
            content: insightsPrompt 
          }],
          max_tokens: 800,
          temperature: 0.3,
        });

        const aiResponse = completion.choices[0].message.content.trim();
        console.log('🤖 AI Response received, length:', aiResponse.length);
        
        // Try to parse JSON from AI response
        const jsonMatch = aiResponse.match(/$$[\s\S]*$$/);
        if (jsonMatch) {
          aiInsights = JSON.parse(jsonMatch[0]);
          console.log('✅ AI insights parsed successfully:', aiInsights.length, 'insights');
        } else {
          throw new Error('No JSON array found in AI response');
        }
      } catch (parseError) {
        console.log('⚠️ Could not parse AI insights, using fallback:', parseError.message);
      }
    }

    // Enhanced fallback insights based on actual data
    if (aiInsights.length === 0) {
      aiInsights = [];
      
      if (totalIncome > 0 && totalExpenses > 0) {
        const savingsAmount = totalIncome - totalExpenses;
        aiInsights.push({
          type: savingsAmount > 0 ? 'success' : 'warning',
          title: savingsAmount > 0 ? 'Positive Cash Flow' : 'Budget Concern',
          message: savingsAmount > 0 ? 
            `You're saving R${Math.abs(savingsAmount).toLocaleString()} monthly!` : 
            `Expenses exceed income by R${Math.abs(savingsAmount).toLocaleString()}`,
          confidence: 95
        });
      }
      
      if (financialSummary.topSpendingCategory !== 'None') {
        const topAmount = categorySpending[financialSummary.topSpendingCategory] || 0;
        aiInsights.push({
          type: 'info',
          title: 'Top Expense Category',
          message: `${financialSummary.topSpendingCategory}: R${topAmount.toLocaleString()}`,
          confidence: 90
        });
      }
      
      if (financialSummary.savingsRate !== 0) {
        aiInsights.push({
          type: financialSummary.savingsRate > 20 ? 'success' : 'info',
                    title: 'Savings Rate',
          message: `${financialSummary.savingsRate.toFixed(1)}% savings rate - ${financialSummary.savingsRate > 20 ? 'Great!' : 'Room to improve'}`,
          confidence: 90
        });
      }
      
      // If still no insights, add generic ones
      if (aiInsights.length === 0) {
        aiInsights = [
          {
            type: 'info',
            title: 'Account Setup',
            message: 'Your account is ready for financial tracking',
            confidence: 100
          },
          {
            type: 'success',
            title: 'AI Monitoring',
            message: 'LynqAI is analyzing your financial patterns',
            confidence: 100
          },
          {
            type: 'info',
            title: 'Get Started',
            message: 'Add transactions to get personalized insights',
            confidence: 100
          }
        ];
      }
    }

    // Format spending by category for frontend (only DEBIT transactions)
    const spendingByCategory = Object.entries(categorySpending)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8); // Top 8 expense categories

    // Format monthly data for chart
    const monthlyChartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // Last 6 months
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
        income: data.income,
        expenses: data.expenses
      }));

    console.log('✅ Dashboard insights generated successfully');
    console.log('📊 Final data summary:', {
      aiInsightsCount: aiInsights.length,
      spendingCategoriesCount: spendingByCategory.length,
      monthlyDataCount: monthlyChartData.length,
      sampleMonthlyData: monthlyChartData.slice(0, 2)
    });

    res.json({
      aiInsights,
      spendingByCategory,
      monthlyChartData,
      financialSummary
    });

  } catch (err) {
    console.error('❌ Dashboard insights error:', err);
    res.status(500).json({ error: 'Failed to generate dashboard insights: ' + err.message });
  }
});

console.log('🚀 AI router setup complete');
module.exports = router;