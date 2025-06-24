const express = require('express');
const router = express.Router();
const { OpenAI } = require("openai");
const authenticateToken = require('../middleware/auth');
const supabaseClient = require('../supabaseClient');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/ask-context', authenticateToken, async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  try {
    const { data: fullData, error } = await supabaseClient
      .from('users')
      .select(`
        user_id, first_name, last_name, email, phone, id_number, dob, gender, address,
        accounts(*),
        transactions(*),
        income(*),
        credit_scores(*),
        loan_suggestions(*),
        ai_conversations(*),
        call_logs(*),
        suspicious_activities(*)
      `)
      .eq('user_id', req.user.user_id)
      .single();

    if (error || !fullData) {
      throw new Error(error?.message || 'Fetch failed');
    }

    const prompt = `
You are LynqAI, a financial assistant. A user has the following data:
${JSON.stringify(fullData, null, 2)}

They ask: "${question}"

Provide a helpful, personalized answer using their data.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 250,
    });

    const answer = completion.choices[0].message.content.trim();

    await supabaseClient.from('ai_conversations').insert({
      user_id: req.user.user_id,
      message: question,
      response: answer,
      sentiment: null,
    });

    res.json({ answer });
  } catch (err) {
    console.error('AI context error:', err);
    res.status(500).json({ error: 'AI service failed' });
  }
});

module.exports = router;
