const express = require('express');
const { authenticate } = require('../middleware/auth');
const { getTransactions, getTransaction, createTransaction, updateTransaction, deleteTransaction } = require('../controllers/transactionController');

const router = express.Router();

router.get('/', authenticate, getTransactions);
router.get('/:id', authenticate, getTransaction);
router.post('/', authenticate, createTransaction);
router.put('/:id', authenticate, updateTransaction);
router.delete('/:id', authenticate, deleteTransaction);

module.exports = router;

// Get single transaction
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const transactions = db.collection('transactions');

    const transaction = await transactions.findOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.id)
    });

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
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ error: 'Type, amount, and category are required' });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ error: 'Type must be income or expense' });
    }

    const db = getDb();
    const transactions = db.collection('transactions');

    const transaction = {
      userId: new ObjectId(req.user.id),
      type,
      amount: parseFloat(amount),
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      createdAt: new Date()
    };

    const result = await transactions.insertOne(transaction);

    // Invalidate cache
    await delCache(`transactions:${req.user.id}:*`);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: { _id: result.insertedId, ...transaction }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update transaction
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const db = getDb();
    const transactions = db.collection('transactions');

    const updateData = {};
    if (type) updateData.type = type;
    if (amount) updateData.amount = parseFloat(amount);
    if (category) updateData.category = category;
    if (description !== undefined) updateData.description = description;
    if (date) updateData.date = new Date(date);
    updateData.updatedAt = new Date();

    const result = await transactions.findOneAndUpdate(
      { _id: new ObjectId(req.params.id), userId: new ObjectId(req.user.id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Invalidate cache
    await delCache(`transactions:${req.user.id}:*`);

    res.json({ message: 'Transaction updated successfully', transaction: result });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb();
    const transactions = db.collection('transactions');

    const result = await transactions.deleteOne({
      _id: new ObjectId(req.params.id),
      userId: new ObjectId(req.user.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Invalidate cache
    await delCache(`transactions:${req.user.id}:*`);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
