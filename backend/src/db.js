const { MongoClient } = require('mongodb');

let db = null;
let client = null;

async function connectDb() {
  try {
    if (db) {
      return db;
    }

    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB || 'expenses';

    if (!uri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    client = new MongoClient(uri);
    await client.connect();
    
    db = client.db(dbName);
    
    // Create indexes
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Transactions collection indexes
    await db.collection('transactions').createIndex({ userId: 1, date: -1 });
    await db.collection('transactions').createIndex({ userId: 1, type: 1 });
    await db.collection('transactions').createIndex({ userId: 1, category: 1 });
    
    console.log('Database indexes created');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not connected. Call connectDb first.');
  }
  return db;
}

async function closeDb() {
  if (client) {
    await client.close();
    db = null;
    client = null;
  }
}

module.exports = { connectDb, getDb, closeDb };
