const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const seedData = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }

    console.log('Seeding data...');

    const users = [
      { email: 'admin@ex.com', password: await bcrypt.hash('admin123', 10), role: 'admin' },
      { email: 'user@ex.com', password: await bcrypt.hash('user123', 10), role: 'user' },
      { email: 'ro@ex.com', password: await bcrypt.hash('ro123', 10), role: 'read-only' }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Users seeded');

    const transactions = [];
    const categories = ['Food', 'Transport', 'Salary', 'Shopping', 'Bills', 'Entertainment'];
    
    for (const user of createdUsers) {
      for (let i = 0; i < 8; i++) {
        const isIncome = Math.random() > 0.6;
        transactions.push({
          user: user._id,
          type: isIncome ? 'income' : 'expense',
          amount: Math.floor(Math.random() * 500) + 50,
          category: categories[Math.floor(Math.random() * categories.length)],
          description: isIncome ? 'Income transaction' : 'Expense transaction',
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    await Transaction.insertMany(transactions);
    console.log('Transactions seeded');
  } catch (error) {
    console.error('Seed error:', error);
  }
};

module.exports = seedData;
