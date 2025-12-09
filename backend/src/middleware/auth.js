const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    console.log('Auth middleware - Cookies:', req.cookies);
    console.log('Auth middleware - Token:', token);
    
    if (!token) {
      console.log('Auth middleware - No token found');
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = { authenticate };
