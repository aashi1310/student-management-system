/**
 * routes/studentRoutes.js
 * ─────────────────────────────────────────────────────────
 * Express router for all /api/students endpoints.
 *
 * ⚠️  ORDER MATTERS:
 *   /search and /stats must be declared BEFORE /:id
 *   so that Express doesn't treat "search" or "stats"
 *   as a MongoDB ObjectId parameter.
 */

const express = require('express');
const router  = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStats,
} = require('../controllers/studentController');

/* ── Static routes (must come before /:id) ────────────── */

/**
 * @route   GET /api/students/search?q=<term>
 * @desc    Search students by multiple fields
 */
router.get('/search', searchStudents);

/**
 * @route   GET /api/students/stats
 * @desc    Get dashboard statistics
 */
router.get('/stats', getStats);

/* ── Collection routes ────────────────────────────────── */

/**
 * @route   GET  /api/students   — list all
 * @route   POST /api/students   — create new
 */
router
  .route('/')
  .get(getStudents)
  .post(createStudent);

/* ── Document routes ──────────────────────────────────── */

/**
 * @route   GET    /api/students/:id  — single student
 * @route   PUT    /api/students/:id  — update student
 * @route   DELETE /api/students/:id  — delete student
 */
router
  .route('/:id')
  .get(getStudentById)
  .put(updateStudent)
  .delete(deleteStudent);

module.exports = router;
