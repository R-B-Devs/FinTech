// Hardcoded dummy user (you can upgrade this later to DB)
const validUser = {
  userId: 'Maneo',
  password: '0123456789101',
};

exports.loginUser = (req, res) => {
  const { userId, password } = req.body;

  if (userId === validUser.userId && password === validUser.password) {
    res.json({ token: 'hardcoded-access-token-1234' });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

exports.registerUser = (req, res) => {
  // For now, just respond with success
  res.json({ message: 'User registered successfully (fake backend)' });
};

exports.forgotPassword = (req, res) => {
  // Respond as if an email was sent
  res.json({ message: 'Password reset instructions sent (fake)' });
};
