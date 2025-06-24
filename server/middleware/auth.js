const jwt = require('jsonwebtoken');
const supabaseClient = require('../supabaseClient');
const { getUserById } = require('../App'); // If needed, you can move getUserById here too

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Fetch the user from Supabase
    const { data: users, error } = await supabaseClient
      .from('users')
      .select('*')
      .eq('user_id', decoded.user_id)
      .eq('is_active', true);

    if (error || !users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid token - user not found' });
    }

    req.user = users[0]; // Attach user to request
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authenticateToken;
