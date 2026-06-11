const ActivityLog = require('../models/ActivityLog');

const getLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLogs
};
