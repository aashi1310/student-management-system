/**
 * config/db.js
 * ─────────────────────────────────────────────────────────
 * MongoDB Atlas connection using Mongoose.
 * Exports an async function that resolves when the
 * connection is established, or exits the process on error.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * Reads the connection URI from process.env.MONGO_URI.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These options are now defaults in Mongoose 7+ / 8+,
      // but are kept explicit for clarity.
      serverSelectionTimeoutMS: 10000, // Fail fast on bad URI
      socketTimeoutMS: 45000,
    });

    console.log(
      `MongoDB Connected Successfully - Host: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure code so the host can restart the app
    process.exit(1);
  }
};

module.exports = connectDB;
