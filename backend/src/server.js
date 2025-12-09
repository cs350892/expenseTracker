require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');
const seedData = require('./utils/seed');
const { authLimiter, transactionLimiter, analyticsLimiter, apiLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

app.get('/', (req, res) => {
  res.send('backend running');
});

// Apply specific rate limiters to routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/transactions', transactionLimiter, transactionRoutes);
app.use('/api/analytics', analyticsLimiter, analyticsRoutes);
app.use('/api/users', apiLimiter, usersRoutes);

connectDB().then(async () => {
  await seedData();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
