const { exportTransactionsToCSV } = require('./export.js'); // Adjust the path as needed

const userId = 'user-123';     // Replace with a valid userId
const token = 'your-jwt-token'; // Replace with your real token

async function testExport() {
  try {
    const result = await exportTransactionsToCSV(userId, token, './test_output/transactions.csv');
    console.log('Export Result:', result);
  } catch (err) {
    console.error('Export failed:', err);
  }
}

testExport();
