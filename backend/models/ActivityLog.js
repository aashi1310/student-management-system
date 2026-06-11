const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['Student Created', 'Student Updated', 'Student Deleted'],
    },
    studentName: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
