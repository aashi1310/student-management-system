/**
 * controllers/studentController.js
 * ─────────────────────────────────────────────────────────
 * All business logic for the Student resource.
 * Each exported function maps 1-to-1 to a route handler.
 *
 * Functions:
 *   createStudent    POST   /api/students
 *   getStudents      GET    /api/students
 *   getStudentById   GET    /api/students/:id
 *   updateStudent    PUT    /api/students/:id
 *   deleteStudent    DELETE /api/students/:id
 *   searchStudents   GET    /api/students/search?q=
 *   getStats         GET    /api/students/stats
 */

const mongoose = require('mongoose');
const Student  = require('../models/Student');

/* ─────────────────────────────────────────────────────────
   HELPER — strip and sanitise a plain-text search term
───────────────────────────────────────────────────────── */
/**
 * Escape special regex characters from user input to prevent
 * ReDoS (Regular Expression Denial of Service) attacks.
 * @param {string} str
 * @returns {string}
 */
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ─────────────────────────────────────────────────────────
   HELPER — format Mongoose validation errors into a
   single human-readable string.
───────────────────────────────────────────────────────── */
const formatValidationErrors = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return messages.join('. ');
};

/* ─────────────────────────────────────────────────────────
   1. CREATE STUDENT
   POST /api/students
───────────────────────────────────────────────────────── */
/**
 * @route   POST /api/students
 * @desc    Create a new student record
 * @access  Public
 */
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, course, semester, phone } = req.body;

    /* ── Basic presence check before hitting Mongoose ── */
    const missingFields = [];
    if (!studentId) missingFields.push('studentId');
    if (!name)      missingFields.push('name');
    if (!email)     missingFields.push('email');
    if (!course)    missingFields.push('course');
    if (!semester)  missingFields.push('semester');
    if (!phone)     missingFields.push('phone');

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    /* ── Check for duplicate studentId (case-insensitive) ── */
    const existingById = await Student.findOne({
      studentId: studentId.toString().trim().toUpperCase(),
    });
    if (existingById) {
      return res.status(409).json({
        success: false,
        message: `Student ID "${studentId.toUpperCase()}" already exists`,
      });
    }

    /* ── Check for duplicate email ── */
    const existingByEmail = await Student.findOne({
      email: email.toString().trim().toLowerCase(),
    });
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: `Email "${email.toLowerCase()}" is already registered`,
      });
    }

    /* ── Create and save ── */
    const student = await Student.create({
      studentId,
      name,
      email,
      course,
      semester,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data:    student,
    });
  } catch (err) {
    /* Mongoose validation errors → 400 */
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: formatValidationErrors(err),
      });
    }
    /* Duplicate key (race condition after our manual check) */
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists`,
      });
    }
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   2. GET ALL STUDENTS
   GET /api/students
───────────────────────────────────────────────────────── */
/**
 * @route   GET /api/students
 * @desc    Retrieve all students, newest first
 * @access  Public
 */
const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count:   students.length,
      data:    students,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   3. GET SINGLE STUDENT
   GET /api/students/:id
───────────────────────────────────────────────────────── */
/**
 * @route   GET /api/students/:id
 * @desc    Get a single student by MongoDB ObjectId
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    /* Validate that :id is a valid MongoDB ObjectId */
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      data:    student,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   4. UPDATE STUDENT
   PUT /api/students/:id
───────────────────────────────────────────────────────── */
/**
 * @route   PUT /api/students/:id
 * @desc    Update a student's mutable fields (studentId is locked)
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    /* Only allow updating these mutable fields */
    const { name, email, course, semester, phone } = req.body;

    /* At least one updatable field must be provided */
    if (!name && !email && !course && semester === undefined && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update',
      });
    }

    /* Build the update payload — only include provided fields */
    const updateData = {};
    if (name     !== undefined) updateData.name     = name;
    if (email    !== undefined) updateData.email    = email;
    if (course   !== undefined) updateData.course   = course;
    if (semester !== undefined) updateData.semester = semester;
    if (phone    !== undefined) updateData.phone    = phone;

    /* Check for duplicate email if email is being changed */
    if (email) {
      const emailConflict = await Student.findOne({
        email: email.toString().trim().toLowerCase(),
        _id:   { $ne: id },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: `Email "${email.toLowerCase()}" is already used by another student`,
        });
      }
    }

    const student = await Student.findByIdAndUpdate(
      id,
      updateData,
      {
        new:          true,  // Return the updated document
        runValidators: true, // Run schema validators on update
      }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data:    student,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: formatValidationErrors(err),
      });
    }
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).json({
        success: false,
        message: `A student with this ${field} already exists`,
      });
    }
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   5. DELETE STUDENT
   DELETE /api/students/:id
───────────────────────────────────────────────────────── */
/**
 * @route   DELETE /api/students/:id
 * @desc    Permanently delete a student record
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format',
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Student "${student.name}" (${student.studentId}) has been deleted successfully`,
      data:    { id: student._id, studentId: student.studentId },
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   6. SEARCH STUDENTS
   GET /api/students/search?q=value
───────────────────────────────────────────────────────── */
/**
 * @route   GET /api/students/search
 * @desc    Search students by studentId, name, email, course, or phone
 * @access  Public
 * @query   q {string} - search term
 */
const searchStudents = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || !q.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query using the "q" parameter',
      });
    }

    const safeQuery = escapeRegex(q.toString().trim());
    const regex     = new RegExp(safeQuery, 'i'); // Case-insensitive

    const students = await Student.find({
      $or: [
        { studentId: regex },
        { name:      regex },
        { email:     regex },
        { course:    regex },
        { phone:     regex },
      ],
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count:   students.length,
      query:   q,
      data:    students,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   7. DASHBOARD STATISTICS
   GET /api/students/stats
───────────────────────────────────────────────────────── */
/**
 * @route   GET /api/students/stats
 * @desc    Return aggregated dashboard statistics
 * @access  Public
 */
const getStats = async (req, res, next) => {
  try {
    /* Run all aggregation queries in parallel for performance */
    const [
      totalStudents,
      courseAgg,
      semesterAgg,
      latestStudentAgg,
    ] = await Promise.all([
      /* Count of all students */
      Student.countDocuments(),

      /* Distinct course count */
      Student.aggregate([
        {
          $group: {
            _id: { $toLower: { $trim: { input: '$course' } } },
          },
        },
        { $count: 'totalCourses' },
      ]),

      /* Maximum semester value */
      Student.aggregate([
        { $group: { _id: null, highestSemester: { $max: '$semester' } } },
      ]),

      /* Most recently added student */
      Student.findOne({}).sort({ createdAt: -1 }).select('name studentId createdAt'),
    ]);

    const totalCourses    = courseAgg[0]?.totalCourses    ?? 0;
    const highestSemester = semesterAgg[0]?.highestSemester ?? 0;
    const latestStudent   = latestStudentAgg
      ? { name: latestStudentAgg.name, studentId: latestStudentAgg.studentId }
      : null;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        highestSemester,
        latestStudent: latestStudent ? latestStudent.name : '—',
        latestStudentId: latestStudent ? latestStudent.studentId : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ─── Exports ─── */
module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStats,
};
