const express = require('express');
const { Resend } = require('resend');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const resend = new Resend('re_P7JC9sdV_3BoFUueacRYaoy8fVzWmdr5T');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let otpStore = {};

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await resend.emails.send({
      from: 'LyngAI <onboarding@resend.dev>',
      to: [email],
      subject: 'Your OTP Code',
      html: `<div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
  <h1 style="color: #8A1F2C; text-align: center;">🔐 LyngAI Verification</h1>

  <p style="font-size: 16px; color: #8A1F2C;">
    👋 Hey there!
  </p>

  <p style="font-size: 16px; color: #333;">
    Your secret code to unlock the magic of <strong>LyngAI</strong> is:
  </p>

  <div style="text-align: center; margin: 30px 0;">
    <span style="display: inline-block; font-size: 32px; letter-spacing: 8px; background: #8a474f; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
      ${otp}
    </span>
  </div>

  <p style="font-size: 16px;">
    This code will self-destruct in <strong>5 minutes</strong>... ⏳
  </p>

  <p style="font-size: 16px; color: #8A1F2C;">
    If you didn’t request this, just ignore it — your secrets are safe. 🕵️‍♀️
  </p>

  <p style="font-size: 16px; color: #8A1F2C;">
    Stay awesome,<br/>
    — The <strong>LyngAI</strong> Team 
  </p>
</div>
`
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
