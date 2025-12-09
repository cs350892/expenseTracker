const express = require('express');
const { ObjectId } = require('mongodb');
const { getDb } = require('../db');
const { authenticate } = require('../middleware/auth');
const { getFromCache, setCache } = require('../redis');

const router = express.Router();

// Get summary (total income, expense, balance)
router.get('/summary', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Check cache
    const cacheKey = `analytics:summary:${userId}:${startDate}:${endDate}`;
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const db = getDb();
    const transactions = db.collection('transactions');

    const query = { userId: new ObjectId(userId) };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const result = await transactions.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]).toArray();

    const summary = {
      income: 0,
      expense: 0,
      balance: 0
    };

    result.forEach(item => {
      if (item._id === 'income') summary.income = item.total;
      if (item._id === 'expense') summary.expense = item.total;
    });

    summary.balance = summary.income - summary.expense;

    // Cache for 5 minutes
    await setCache(cacheKey, JSON.stringify(summary), 300);

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get category breakdown
router.get('/categories', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type } = req.query;

    // Check cache
    const cacheKey = `analytics:categories:${userId}:${startDate}:${endDate}:${type}`;
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const db = getDb();
    const transactions = db.collection('transactions');

    const query = { userId: new ObjectId(userId) };
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const result = await transactions.aggregate([
      { $match: query },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          category: '$_id.category',
          type: '$_id.type',
          total: 1,
          count: 1
        }
      },
      { $sort: { total: -1 } }
    ]).toArray();

    // Cache for 5 minutes
    await setCache(cacheKey, JSON.stringify(result), 300);

    res.json(result);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get monthly trends
router.get('/trends', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { months = 6 } = req.query;

    // Check cache
    const cacheKey = `analytics:trends:${userId}:${months}`;
    const cached = await getFromCache(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const db = getDb();
    const transactions = db.collection('transactions');

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const result = await transactions.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          date: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          type: '$_id.type',
          total: 1
        }
      },
      { $sort: { year: 1, month: 1 } }
    ]).toArray();

    // Cache for 1 hour
    await setCache(cacheKey, JSON.stringify(result), 3600);

    res.json(result);
  } catch (error) {
    console.error('Get trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent transactions
router.get('/recent', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const db = getDb();
    const transactions = db.collection('transactions');

    const result = await transactions
      .find({ userId: new ObjectId(userId) })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .toArray();

    res.json(result);
  } catch (error) {
    console.error('Get recent transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
