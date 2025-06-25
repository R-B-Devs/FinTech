const express = require('express');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/analyze', async (req, res) => {
  const results = [];

  // Path to a CSV file 
  const filePath = 'data/transactions.csv';

  const stream = fs.createReadStream(filePath)
    .pipe(csv());

  stream.on('data', (data) => results.push(data));
  stream.on('end', async () => {
  const prompt = `
You are a personal finance analyst AI.

Below is a user's real transaction data for June 2024:
${JSON.stringify(results.slice(0, 10), null, 2)}

🔍 Analyze this and return ONLY the following insights:
1. Total income vs total expenses (as numbers)
2. Which category had the highest spending?
3. 3 budgeting or saving tips based on their habits
4. One practical investment suggestion
5. Final bullet-point summary

⚠️ DO NOT retell the transactions or list them out.
✅ Focus only on insights and advice.
`;



    try {
      const aiRes = await axios.post('http://host.docker.internal:11434/api/generate', {

        model: 'mistral',
        prompt: prompt,
        stream: false,
      });

      res.json({ insights: aiRes.data.response, data: results });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Ollama failed to respond' });
    }
  });
  stream.on('error', (err) => {
    console.error('File read error:', err);
    res.status(500).json({ error: 'Failed to read CSV file' });
  });
});

app.listen(5001, () => console.log('🔥 Server running at http://0.0.0.0:5001'));
