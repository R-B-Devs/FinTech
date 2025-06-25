require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const { Parser } = require('json2csv');

// Load token from .env
const token = process.env.JWT_SECRET;
const API_URL = 'http://localhost:3001/api/users/transactions';

async function fetchTransactionsAndSaveCSV() {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        limit: 100,
        offset: 0
      }
    });

    const transactions = response.data.transactions;

    if (!transactions || transactions.length === 0) {
      console.log('⚠️ No transactions found for the user.');
      return;
    }

    // Flatten nested fields (like `accounts.account_type`)
    const flattened = transactions.map(tx => ({
      transaction_id: tx.transaction_id,
      account_id: tx.account_id,
      transaction_type: tx.transaction_type,
      amount: tx.amount,
      description: tx.description,
      category: tx.category,
      merchant_name: tx.merchant_name,
      transaction_date: tx.transaction_date,
      balance_after: tx.balance_after,
      location: tx.location,
      account_type: tx.accounts?.account_type || '',
    }));

    const json2csv = new Parser();
    const csv = json2csv.parse(flattened);

    fs.writeFileSync('transactions.csv', csv);
    console.log('✅ CSV file created: transactions.csv');

  } catch (error) {
    console.error('❌ Failed to fetch transactions or save CSV:', error.response?.data || error.message);
  }
}

fetchTransactionsAndSaveCSV();
