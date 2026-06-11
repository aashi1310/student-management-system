/**
 * controllers/studentController.js
 * ─────────────────────────────────────────────────────────
 * All business logic for the Student resource.
 * Each exported function maps 1-to-1 to a route handler.
 */

const mongoose = require('mongoose');
const Student  = require('../models/Student');
const ActivityLog = require('../models/ActivityLog');

/* ─────────────────────────────────────────────────────────
   HELPER — strip and sanitise a plain-text search term
───────────────────────────────────────────────────────── */
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ─────────────────────────────────────────────────────────
   HELPER — format Mongoose validation errors
───────────────────────────────────────────────────────── */
const formatValidationErrors = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return messages.join('. ');
};

const calculatePlacementStatus = (cgpa, activeBacklogs) => {
  return (cgpa >= 7.0 && activeBacklogs === 0) ? 'Eligible' : 'Not Eligible';
};

/* ─────────────────────────────────────────────────────────
   1. CREATE STUDENT
   POST /api/students
───────────────────────────────────────────────────────── */
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, course, semester, phone, cgpa, activeBacklogs, skills, photoUrl } = req.body;

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

    const existingById = await Student.findOne({
      studentId: studentId.toString().trim().toUpperCase(),
    });
    if (existingById) {
      return res.status(409).json({
        success: false,
        message: `Student ID "${studentId.toUpperCase()}" already exists`,
      });
    }

    const existingByEmail = await Student.findOne({
      email: email.toString().trim().toLowerCase(),
    });
    if (existingByEmail) {
      return res.status(409).json({
        success: false,
        message: `Email "${email.toLowerCase()}" is already registered`,
      });
    }

    const student = await Student.create({
      studentId,
      name,
      email,
      course,
      semester,
      phone,
      cgpa: cgpa || 0,
      activeBacklogs: activeBacklogs || 0,
      skills: skills || [],
      photoUrl: photoUrl || '',
    });

    await ActivityLog.create({
      action: 'Student Created',
      studentName: student.name,
      studentId: student.studentId,
    });

    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
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
   2. GET ALL STUDENTS (With Pagination, Sorting, Filters)
   GET /api/students
───────────────────────────────────────────────────────── */
const getStudents = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      q, 
      branch, 
      semester, 
      placementStatus, 
      cgpaMin, 
      cgpaMax,
      sortField = 'createdAt',
      sortDir = 'desc'
    } = req.query;

    const query = {};

    // Search query
    if (q) {
      const safeQuery = escapeRegex(q.toString().trim());
      const regex     = new RegExp(safeQuery, 'i');
      query.$or = [
        { studentId: regex },
        { name:      regex },
        { email:     regex },
        { course:    regex },
        { phone:     regex },
      ];
    }

    // Advanced Filters
    if (branch && branch !== 'all') {
      query.course = new RegExp(escapeRegex(branch.trim()), 'i');
    }
    if (semester && semester !== 'all') {
      query.semester = Number(semester);
    }
    if (placementStatus && placementStatus !== 'all') {
      query.placementStatus = placementStatus;
    }
    if (cgpaMin !== undefined || cgpaMax !== undefined) {
      query.cgpa = {};
      if (cgpaMin !== undefined) query.cgpa.$gte = Number(cgpaMin);
      if (cgpaMax !== undefined) query.cgpa.$lte = Number(cgpaMax);
    }

    // Pagination setup
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    const sortOptions = {};
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortField === 'id') sortOptions.studentId = dir;
    else sortOptions[sortField] = dir;

    const students = await Student.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    const totalStudents = await Student.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: students,
      currentPage: pageNum,
      totalPages: Math.ceil(totalStudents / limitNum),
      totalStudents,
    });
  } catch (err) {
    next(err);
  }
};

/* ─────────────────────────────────────────────────────────
   3. GET SINGLE STUDENT
   GET /api/students/:id
───────────────────────────────────────────────────────── */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // Maybe the id is a studentId string instead of ObjectId
      const studentByStrId = await Student.findOne({ studentId: id });
      if (studentByStrId) {
        return res.status(200).json({ success: true, data: studentByStrId });
      }

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
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let studentToUpdate;
    if (mongoose.Types.ObjectId.isValid(id)) {
      studentToUpdate = await Student.findById(id);
    } else {
      studentToUpdate = await Student.findOne({ studentId: id });
    }

    if (!studentToUpdate) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const { name, email, course, semester, phone, cgpa, activeBacklogs, skills, photoUrl } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (course !== undefined) updateData.course = course;
    if (semester !== undefined) updateData.semester = semester;
    if (phone !== undefined) updateData.phone = phone;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (activeBacklogs !== undefined) updateData.activeBacklogs = activeBacklogs;
    if (skills !== undefined) updateData.skills = skills;
    if (photoUrl !== undefined) updateData.photoUrl = photoUrl;

    // Calculate placement status
    const newCgpa = cgpa !== undefined ? cgpa : studentToUpdate.cgpa;
    const newBacklogs = activeBacklogs !== undefined ? activeBacklogs : studentToUpdate.activeBacklogs;
    updateData.placementStatus = calculatePlacementStatus(newCgpa, newBacklogs);

    if (email) {
      const emailConflict = await Student.findOne({
        email: email.toString().trim().toLowerCase(),
        _id:   { $ne: studentToUpdate._id },
      });
      if (emailConflict) {
        return res.status(409).json({
          success: false,
          message: `Email "${email.toLowerCase()}" is already used by another student`,
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      studentToUpdate._id,
      updateData,
      {
        new:          true,
        runValidators: true,
      }
    );

    await ActivityLog.create({
      action: 'Student Updated',
      studentName: updatedStudent.name,
      studentId: updatedStudent.studentId,
    });

    return res.status(200).json({
      success: true,
      message: 'Student record updated successfully',
      data:    updatedStudent,
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
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student;
    if (mongoose.Types.ObjectId.isValid(id)) {
      student = await Student.findByIdAndDelete(id);
    } else {
      student = await Student.findOneAndDelete({ studentId: id });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    await ActivityLog.create({
      action: 'Student Deleted',
      studentName: student.name,
      studentId: student.studentId,
    });

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
   (Kept for backwards compatibility if needed, but getStudents handles it now)
───────────────────────────────────────────────────────── */
const searchStudents = async (req, res, next) => {
  // Delegate to getStudents
  return getStudents(req, res, next);
};

/* ─────────────────────────────────────────────────────────
   7. DASHBOARD STATISTICS
   GET /api/students/stats
───────────────────────────────────────────────────────── */
const getStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      courseAgg,
      semesterAgg,
      latestStudentAgg,
      placementAgg,
      backlogAgg,
      cgpaAgg
    ] = await Promise.all([
      Student.countDocuments(),
      Student.aggregate([
        { $group: { _id: { $toLower: { $trim: { input: '$course' } } } } },
        { $count: 'totalCourses' },
      ]),
      Student.aggregate([
        { $group: { _id: null, highestSemester: { $max: '$semester' } } },
      ]),
      Student.findOne({}).sort({ createdAt: -1 }).select('name studentId createdAt'),
      Student.countDocuments({ placementStatus: 'Eligible' }),
      Student.countDocuments({ activeBacklogs: { $gt: 0 } }),
      Student.aggregate([
        { $group: { _id: null, avgCgpa: { $avg: '$cgpa' } } }
      ])
    ]);

    const totalCourses    = courseAgg[0]?.totalCourses    ?? 0;
    const highestSemester = semesterAgg[0]?.highestSemester ?? 0;
    const latestStudent   = latestStudentAgg
      ? { name: latestStudentAgg.name, studentId: latestStudentAgg.studentId }
      : null;
    const avgCgpa = cgpaAgg[0]?.avgCgpa ?? 0;

    return res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalCourses,
        highestSemester,
        latestStudent: latestStudent ? latestStudent.name : '—',
        latestStudentId: latestStudent ? latestStudent.studentId : null,
        placementEligible: placementAgg,
        studentsWithBacklogs: backlogAgg,
        avgCgpa: Number(avgCgpa.toFixed(2))
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStats,
};
