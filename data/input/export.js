// === STEP 1: Export transactions to CSV (Node.js) ===
// File: export.js

const fs = require('fs');
const axios = require('axios');
const path = require('path');

const API_BASE_URL = 'http://localhost:3001';

async function exportTransactionsToCSV(userId, token, outputPath = './data/input/transactions.csv') {
  const response = await axios.get(`${API_BASE_URL}/api/users/transactions`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.data.transactions || response.data.transactions.length === 0) {
    console.log('No transactions found.');
    return;
  }

  const csvHeader = [
    'Transaction ID','Account ID','Type','Amount','Description','Category','Merchant','Date','Balance After','Location','Account Type'
  ].join(',');

  const csvRows = response.data.transactions.map(tx => [
    tx.transaction_id,
    tx.account_id,
    tx.transaction_type,
    tx.amount,
    `"${tx.description?.replace(/"/g, '""') || ''}"`,
    tx.category,
    tx.merchant_name,
    tx.transaction_date,
    tx.balance_after,
    tx.location,
    tx.accounts?.account_type || ''
  ].join(','));

  const fullCsv = [csvHeader, ...csvRows].join('\n');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, fullCsv);
  console.log('✅ transactions.csv exported at:', outputPath);
}

module.exports = { exportTransactionsToCSV };
