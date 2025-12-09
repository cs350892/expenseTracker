const express = require('express');
const { authenticate } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { get, set } = require('../utils/cache');

const router = express.Router();
const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Salary', 'Rent', 'Other', 'Freelance'];

router.get('/', authenticate, async (req, res) => {
  try {
    const cacheKey = `analytics_${req.user.id}`;
    const cached = get(cacheKey);
    
    if (cached) {
      return res.json(cached);
    }

    const transactions = await Transaction.find({ user: req.user.id });

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }

      if (!categoryBreakdown[t.category]) {
        categoryBreakdown[t.category] = 0;
      }
      categoryBreakdown[t.category] += t.amount;
    });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyData = {};
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    transactions.forEach(t => {
      if (t.date >= sixMonthsAgo) {
        const key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
        if (monthlyData[key]) {
          if (t.type === 'income') {
            monthlyData[key].income += t.amount;
          } else {
            monthlyData[key].expense += t.amount;
          }
        }
      }
    });

    const analytics = {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      last6Months: monthlyData
    };

    set(cacheKey, analytics, 15);

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/categories', (req, res) => {
  const cached = get('categories');
  if (cached) {
    return res.json(cached);
  }

  set('categories', CATEGORIES, 60);
  res.json(CATEGORIES);
});

module.exports = router;
