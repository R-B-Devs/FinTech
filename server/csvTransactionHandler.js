const fs = require('fs');
const axios = require('axios');
const csv = require('csv-parser');
const path = require('path');

// Configure your API base URL (assuming it's running locally)
const API_BASE_URL = 'http://localhost:3001'; // Update if your API runs elsewhere

// Helper function to make authenticated API calls
async function makeAuthenticatedCall(method, endpoint, token, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`API call failed to ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Function 1: Export user transactions to CSV
async function exportTransactionsToCSV(userId, token, outputPath = './transactions.csv') {
  try {
    // Get transactions from API
    const response = await makeAuthenticatedCall(
      'get',
      `/api/users/transactions`,
      token
    );

    if (!response.transactions || response.transactions.length === 0) {
      console.log('No transactions found for this user');
      return { success: false, message: 'No transactions found' };
    }

    // Prepare CSV content
    const csvHeader = [
      'Transaction ID',
      'Account ID',
      'Type',
      'Amount',
      'Description',
      'Category',
      'Merchant',
      'Date',
      'Balance After',
      'Location',
      'Account Type'
    ].join(',');

    const csvRows = response.transactions.map(tx => {
      return [
        tx.transaction_id,
        tx.account_id,
        tx.transaction_type,
        tx.amount,
        `"${tx.description?.replace(/"/g, '""') || ''}"`, // Escape quotes in description
        tx.category,
        tx.merchant_name,
        tx.transaction_date,
        tx.balance_after,
        tx.location,
        tx.accounts?.account_type || ''
      ].join(',');
    });

    const csvContent = [csvHeader, ...csvRows].join('\n');

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(outputPath, csvContent);
    console.log(`Successfully exported ${response.transactions.length} transactions to ${outputPath}`);

    return {
      success: true,
      filePath: outputPath,
      transactionCount: response.transactions.length
    };
  } catch (error) {
    console.error('Failed to export transactions:', error);
    return { success: false, error: error.message };
  }
}

// Function 2: Import credit scores from CSV and post to API
// update path to csv updated the csv file path to match the new structure

async function importCreditScoresFromCSV(csvFilePath='./cobol/credit_scores.csv', token) {
  return new Promise((resolve, reject) => {
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    if (!fs.existsSync(csvFilePath)) {
      const error = `CSV file not found at ${csvFilePath}`;
      console.error(error);
      return resolve({
        ...results,
        error
      });
    }

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', async (row) => {
        try {
          results.processed++;
          
          // Validate required fields
          if (!row.user_id || !row.score) {
            results.failed++;
            results.errors.push(`Row ${results.processed}: Missing user_id or score`);
            return;
          }

          const score = parseInt(row.score);
          if (isNaN(score) || score < 300 || score > 850) {
            results.failed++;
            results.errors.push(`Row ${results.processed}: Invalid score value ${row.score}`);
            return;
          }

          // Post to API
          await makeAuthenticatedCall(
            'post',
            '/api/users/credit-score',
            token,
            { score }
          );

          results.succeeded++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Row ${results.processed}: ${error.message}`);
        }
      })
      .on('end', () => {
        console.log(`Credit score import complete. Processed: ${results.processed}, Succeeded: ${results.succeeded}, Failed: ${results.failed}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('CSV processing error:', error);
        reject(error);
      });
  });
}

module.exports = {
  exportTransactionsToCSV,
  importCreditScoresFromCSV
};