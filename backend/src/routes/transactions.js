const express = require('express');
const { authenticate } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const { requireWrite } = require('../middleware/role');
const { del } = require('../utils/cache');

const router = express.Router();

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Salary', 'Rent', 'Other', 'Freelance'];

// Get all transactions with pagination and filters
router.get('/', authenticate, async (req, res) => {
  try {
    const { desc, type, category, limit = 10, page = 1 } = req.query;

    const query = { user: req.user.id };
    if (desc) query.description = new RegExp(desc, 'i');
    if (type) query.type = type;
    if (category) query.category = category;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single transaction
router.get('/:id', authenticate, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create transaction
router.post('/', authenticate, requireWrite, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category required' });
    }

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      type,
      amount,
      category,
      description,
      date: date || Date.now()
    });

    del(`analytics_${req.user.id}`);

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction
router.put('/:id', authenticate, requireWrite, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (category && !CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}` });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { type, amount, category, description, date },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    del(`analytics_${req.user.id}`);

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, requireWrite, async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    del(`analytics_${req.user.id}`);

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
