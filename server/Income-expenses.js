require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Parser } = require('json2csv');

// Load token from .env or hardcoded fallback
const token = localStorage.getItem('jwt') ;
const API_URL = 'http://localhost:3001/api/users/transactions';

async function fetchTransactionsAndSaveCSV() {
  if (!token || token.startsWith('http')) {
    console.error('🚫 Invalid or missing JWT token. Check .env or token assignment.');
    return;
  }

  try {
    console.log('📡 Fetching transactions from API...');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 100,
        offset: 0
      },
      timeout: 10000 // 10 seconds timeout
    });

    const transactions = response.data.transactions;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.warn('⚠️ No transactions found for the user.');
      return;
    }

    console.log(`✅ Fetched ${transactions.length} transactions.`);

    // Flatten and clean transaction data
    const flattened = transactions.map(tx => ({
      transaction_id: tx.transaction_id || '',
      account_id: tx.account_id || '',
      transaction_type: tx.transaction_type || '',
      amount: tx.amount || 0,
      description: tx.description || '',
      category: tx.category || '',
      merchant_name: tx.merchant_name || '',
      transaction_date: tx.transaction_date || '',
      balance_after: tx.balance_after || 0,
      location: tx.location || '',
      account_type: tx.accounts?.account_type || '',
    }));

    const json2csv = new Parser();
    const csv = json2csv.parse(flattened);

    const outputPath = 'transactions.csv';
    fs.writeFileSync(outputPath, csv);
    console.log(`✅ CSV file saved successfully: ${outputPath}`);

  } catch (error) {
    if (error.response) {
      console.error('❌ API error:', {
        status: error.response.status,
        data: error.response.data
      });
    } else if (error.request) {
      console.error('❌ No response received from the API. Check if the server is running.');
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
}

fetchTransactionsAndSaveCSV();
