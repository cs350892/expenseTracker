const rateLimit = require('express-rate-limit');
const failedLoginAttempts = {};

// Custom middleware for failed login attempts
function failedLoginLimiter(req, res, next) {
  const ip = req.ip;
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 20;
  const now = Date.now();
  if (!failedLoginAttempts[ip]) {
    failedLoginAttempts[ip] = [];
  }
  // Remove old attempts
  failedLoginAttempts[ip] = failedLoginAttempts[ip].filter(ts => now - ts < windowMs);
  if (failedLoginAttempts[ip].length >= maxAttempts) {
    return res.status(429).json({ error: 'Too many failed login attempts, please try again after 15 minutes' });
  }
  req.failedLoginLimiter = {
    record: () => {
      failedLoginAttempts[ip].push(now);
    }
  };
  next();
}

// Transaction endpoints - 100 requests per hour
const transactionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});

// Analytics endpoints - 50 requests per hour
const analyticsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many requests, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});

// General API limiter - 200 requests per hour
const apiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  failedLoginLimiter,
  transactionLimiter,
  analyticsLimiter,
  apiLimiter
};
