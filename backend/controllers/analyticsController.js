const Student = require('../models/Student');

const getAnalytics = async (req, res, next) => {
  try {
    const branchDistribution = await Student.aggregate([
      {
        $group: {
          _id: { $toUpper: { $trim: { input: '$course' } } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const averageCgpaByBranch = await Student.aggregate([
      {
        $group: {
          _id: { $toUpper: { $trim: { input: '$course' } } },
          avgCgpa: { $avg: '$cgpa' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const placementEligibilityByBranch = await Student.aggregate([
      {
        $group: {
          _id: {
            branch: { $toUpper: { $trim: { input: '$course' } } },
            status: '$placementStatus'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedPlacement = {};
    placementEligibilityByBranch.forEach(item => {
      const branch = item._id.branch;
      if (!formattedPlacement[branch]) {
        formattedPlacement[branch] = { Eligible: 0, 'Not Eligible': 0 };
      }
      formattedPlacement[branch][item._id.status] = item.count;
    });

    const formattedAverageCgpa = averageCgpaByBranch.map(item => ({
      _id: item._id,
      avgCgpa: Number(item.avgCgpa.toFixed(2))
    }));

    return res.status(200).json({
      success: true,
      data: {
        branchDistribution,
        averageCgpaByBranch: formattedAverageCgpa,
        placementEligibilityByBranch: formattedPlacement
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAnalytics
};
