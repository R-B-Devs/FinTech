const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let otpStore = {};

// Configure Nodemailer with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'absacobol@gmail.com', // Your Gmail address
    pass: 'zbbo urcg hdge doeb',   // Your Gmail app password
  },
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: '" LyngAI " <absacobol@gmail.com>', // must be same as authenticated user
      to: email,
      subject: '🔐 Your OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
      <h1 style="color: #8A1F2C; text-align: center;">🔐 LyngAI Verification</h1>
      <p>Hey there! 👋</p>
      <p>Your OTP code is:</p>
      <h2 style="text-align:center; background-color:#8A1F2C; color:#fff; padding:10px; border-radius:5px;">${otp}</h2>
      <p>This code will expire in <strong>5 minutes</strong>.</p>
      <p>If you didn’t request this, just ignore it.</p>
      <p>Stay awesome,<br/>— The LyngAI Team 💚</p>
    </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
