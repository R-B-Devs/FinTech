const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 4000;
const SECRET_KEY = 'your_secret_key'; // use a secure key in real apps

app.use(express.json());

const users = [];

// Register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = users.find(user => user.username === username);
  if (existingUser) return res.status(400).json({ message: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid username or password' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// Status
app.get('/api/status', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Protected route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
