const rateLimit = require('express-rate-limit');

// Auth endpoints - 5 requests per 15 minutes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

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
  authLimiter,
  transactionLimiter,
  analyticsLimiter,
  apiLimiter
};
