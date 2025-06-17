const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ========== OTP Setup ==========
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let otpStore = {};

// Nodemailer Transport (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'absacobol@gmail.com',
    pass: 'zbbo urcg hdge doeb',
  },
});

app.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await transporter.sendMail({
      from: '"LynqAI" <absacobol@gmail.com>',
      to: email,
      subject: '🔐 Your OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px; border: 1px solid #ddd;">
          <h1 style="color: #8A1F2C; text-align: center;">🔐 LynqAI Verification</h1>
          <p>Hey there! 👋</p>
          <p>Your OTP code is:</p>
          <h2 style="text-align:center; background-color:#8A1F2C; color:#fff; padding:10px; border-radius:5px;">${otp}</h2>
          <p>This code will expire in <strong>5 minutes</strong>.</p>
          <p>If you didn’t request this, just ignore it.</p>
          <p>Stay awesome,<br/>— The LynqAI Team 💚</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const entry = otpStore[email];

  if (!entry || Date.now() > entry.expires) {
    return res.json({ success: false, message: 'OTP expired or invalid.' });
  }

  if (entry.otp !== otp) {
    return res.json({ success: false, message: 'Incorrect OTP.' });
  }

  delete otpStore[email];
  res.json({ success: true, message: 'OTP verified successfully!' });
});

// ========== WebRTC Signaling via Socket.IO ==========
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log('👤 New client connected:', socket.id);

  // Join Room
  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`📞 User ${socket.id} joined room ${roomId}`);
    socket.to(roomId).emit('user-joined', socket.id);
  });

  // Send Offer
  socket.on('offer', ({ roomId, offer }) => {
    socket.to(roomId).emit('offer', { offer, sender: socket.id });
  });

  // Send Answer
  socket.on('answer', ({ roomId, answer }) => {
    socket.to(roomId).emit('answer', { answer, sender: socket.id });
  });

  // Send ICE Candidate
  socket.on('ice-candidate', ({ roomId, candidate }) => {
    socket.to(roomId).emit('ice-candidate', { candidate, sender: socket.id });
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 Backend + WebRTC signaling running at http://localhost:${PORT}`);
});
