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

    /* ── CGPA ─────────────────────────────────────────── */
    cgpa: {
      type:     Number,
      min:      [0, 'CGPA cannot be less than 0'],
      max:      [10, 'CGPA cannot exceed 10'],
      default:  0,
    },

    /* ── Active Backlogs ──────────────────────────────── */
    activeBacklogs: {
      type:     Number,
      min:      [0, 'Active backlogs cannot be negative'],
      default:  0,
    },

    /* ── Skills ───────────────────────────────────────── */
    skills: {
      type:     [String],
      default:  [],
    },

    /* ── Photo URL ────────────────────────────────────── */
    photoUrl: {
      type:     String,
      trim:     true,
      default:  '',
    },

    /* ── Placement Status ─────────────────────────────── */
    placementStatus: {
      type:     String,
      enum:     ['Eligible', 'Not Eligible'],
      default:  'Not Eligible',
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

/* ─── Helper function to calculate placement status ─── */
const calculatePlacementStatus = (cgpa, activeBacklogs) => {
  return (cgpa >= 7.0 && activeBacklogs === 0) ? 'Eligible' : 'Not Eligible';
};

/* ─── Pre-save hook ─── */
studentSchema.pre('save', function (next) {
  if (this.isModified('cgpa') || this.isModified('activeBacklogs')) {
    this.placementStatus = calculatePlacementStatus(this.cgpa, this.activeBacklogs);
  }
  next();
});

/* ─── Pre-findOneAndUpdate hook ─── */
studentSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.cgpa !== undefined || update.activeBacklogs !== undefined) {
    // If one is not provided in update, we must get it from the current doc or default to not eligible if unknown
    // To be perfectly accurate without querying the doc, we enforce passing both or rely on default controller logic.
    // Assuming the controller passes both if updated, or we let the controller handle it explicitly.
    // For safety, let's just use what's provided or skip if incomplete (controller handles it better).
    // Actually, setting placementStatus in controller is safer for updates since hook doesn't have full doc.
    // But we'll try to set it if both are provided.
    if (update.cgpa !== undefined && update.activeBacklogs !== undefined) {
      update.placementStatus = calculatePlacementStatus(update.cgpa, update.activeBacklogs);
    }
  }
  next();
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
