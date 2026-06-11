/**
 * config/db.js
 * ─────────────────────────────────────────────────────────
 * MongoDB connection using Mongoose.
 * Falls back to an in-memory MongoDB instance if no valid
 * connection string is provided, ensuring the app runs out-of-the-box.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI || '';
    let isMemoryServer = false;

    // Check if URI is missing, using placeholder, or local (and user might not have local DB)
    if (!uri || uri.includes('<cluster-url>') || uri.includes('localhost')) {
      console.log('No valid MongoDB Atlas connection string found. Starting in-memory MongoDB Server...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      isMemoryServer = true;
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(
      `MongoDB Connected Successfully - Host: ${conn.connection.host} ${isMemoryServer ? '(In-Memory)' : ''}`
    );
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
