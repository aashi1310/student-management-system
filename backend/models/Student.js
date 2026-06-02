/**
 * models/Student.js
 * ─────────────────────────────────────────────────────────
 * Mongoose schema and model for a Student document.
 * Includes field-level validation, custom error messages,
 * and automatic createdAt / updatedAt timestamps.
 */

const mongoose = require('mongoose');

/* ─── Phone number regex: exactly 10 digits ─── */
const PHONE_REGEX = /^\d{10}$/;

/* ─── Basic email format regex ─── */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ─── Student ID: alphanumeric, 3–15 characters ─── */
const STUDENT_ID_REGEX = /^[a-zA-Z0-9]{3,15}$/;

const studentSchema = new mongoose.Schema(
  {
    /* ── Student ID ───────────────────────────────────── */
    studentId: {
      type:     String,
      required: [true, 'Student ID is required'],
      unique:   true,
      trim:     true,
      uppercase: true,
      validate: {
        validator: (v) => STUDENT_ID_REGEX.test(v),
        message:   'Student ID must be 3–15 alphanumeric characters',
      },
    },

    /* ── Full Name ────────────────────────────────────── */
    name: {
      type:     String,
      required: [true, 'Full name is required'],
      trim:     true,
      minlength: [3,  'Name must be at least 3 characters'],
      maxlength: [50, 'Name must be 50 characters or less'],
      validate: {
        validator: (v) => !/\d/.test(v),
        message:   'Name must not contain numbers',
      },
    },

    /* ── Email ────────────────────────────────────────── */
    email: {
      type:      String,
      required:  [true, 'Email address is required'],
      unique:    true,
      trim:      true,
      lowercase: true,
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message:   'Please provide a valid email address',
      },
    },

    /* ── Course ───────────────────────────────────────── */
    course: {
      type:      String,
      required:  [true, 'Course is required'],
      trim:      true,
      minlength: [2, 'Course must be at least 2 characters'],
    },

    /* ── Semester ─────────────────────────────────────── */
    semester: {
      type:     Number,
      required: [true, 'Semester is required'],
      min:      [1, 'Semester must be at least 1'],
      max:      [8, 'Semester cannot exceed 8'],
    },

    /* ── Phone ────────────────────────────────────────── */
    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
      trim:     true,
      validate: {
        validator: (v) => PHONE_REGEX.test(v),
        message:   'Phone number must be exactly 10 digits',
      },
    },
  },
  {
    /* Automatically add createdAt and updatedAt fields */
    timestamps: true,
    /* Clean up Mongoose internals from JSON output */
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

/* ─── Compound index for fast search queries ─── */
studentSchema.index({
  studentId: 'text',
  name:      'text',
  email:     'text',
  course:    'text',
  phone:     'text',
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
