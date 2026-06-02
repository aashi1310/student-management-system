/**
 * server.js
 * ─────────────────────────────────────────────────────────
 * Application entry point for the Student Management
 * System backend.
 *
 * Responsibilities:
 *   1. Load environment variables from .env
 *   2. Connect to MongoDB Atlas
 *   3. Initialise Express with all middleware
 *   4. Register API routes
 *   5. Attach 404 + global error handlers
 *   6. Start the HTTP server
 */

/* ── 1. Environment variables must be loaded first ── */
require('dotenv').config();

const express            = require('express');
const cors               = require('cors');
const connectDB          = require('./config/db');
const studentRoutes      = require('./routes/studentRoutes');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware    = require('./middleware/errorMiddleware');

/* ── 2. Connect to MongoDB Atlas ── */
connectDB();

/* ── 3. Initialise Express ── */
const app = express();

/* ── Built-in middleware ─────────────────────────────── */

/* Parse incoming JSON request bodies (limit: 10 kb) */
app.use(express.json({ limit: '10kb' }));

/* Parse URL-encoded form data */
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

/* ── CORS ────────────────────────────────────────────── */
/*
 * In development the frontend is served from the filesystem
 * (file://) or a local dev server, so we allow all origins.
 * For production, replace the origin list with your actual
 * frontend domain(s).
 */
const corsOptions = {
  origin:
    process.env.NODE_ENV === 'production'
      ? process.env.ALLOWED_ORIGINS?.split(',') || []
      : '*',
  methods:  ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(cors(corsOptions));

/* ── Security headers (lightweight, no extra packages) ── */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

/* ── 4. API Routes ───────────────────────────────────── */

/**
 * Health-check — useful for uptime monitors / load-balancers.
 * GET /api/health
 */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Management System API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Student resource routes.
 * Base URL: /api/students
 */
app.use('/api/students', studentRoutes);

/* ── 5. Error-handling middleware ────────────────────── */
/* Must come AFTER routes */
app.use(notFoundMiddleware);
app.use(errorMiddleware);

/* ── 6. Start server ─────────────────────────────────── */
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log('  🎓  Student Management System — Backend');
  console.log('═══════════════════════════════════════════════');
  console.log(`  🚀  Server running on port ${PORT}`);
  console.log(`  🌍  Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`  📡  API Base URL: http://localhost:${PORT}/api`);
  console.log('═══════════════════════════════════════════════');
});

/* ── Graceful shutdown handling ─────────────────────── */
const shutdown = (signal) => {
  console.log(`\n⚡  ${signal} received — shutting down gracefully…`);
  server.close(() => {
    console.log('✅  HTTP server closed.');
    process.exit(0);
  });
  /* Force exit after 10 seconds if connections are hanging */
  setTimeout(() => {
    console.error('❌  Forced shutdown after timeout.');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

/* Log unhandled promise rejections (e.g., bad MONGO_URI) */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌  Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});
