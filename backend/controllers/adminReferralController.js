const Referral = require('../models/Referral');
const ReferralPlan = require('../models/ReferralPlan');
const User = require('../models/User');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Get referral analytics with daily/weekly/monthly breakdown
exports.getReferralAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query; // daily, weekly, monthly
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000); // Last 12 weeks
        break;
      case 'monthly':
      default:
        startDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000); // Last 12 months
        break;
    }
    
    // Get referral growth over time
    const referralGrowth = await Referral.aggregate([
      {
        $match: {
          tenantId: req.user.tenantId,
          softDelete: false,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            ...(period === 'daily' && { day: { $dayOfMonth: '$createdAt' } }),
            ...(period === 'weekly' && { week: { $week: '$createdAt' } })
          },
          count: { $sum: 1 },
          creditsGranted: { 
            $sum: { $add: ['$creditsGrantedToReferrer', '$creditsGrantedToReferee'] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
      }
    ]);
    
    // Get total stats
    const totalStats = await Referral.aggregate([
      {
        $match: {
          tenantId: req.user.tenantId,
          softDelete: false,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          totalCreditsGranted: { 
            $sum: { $add: ['$creditsGrantedToReferrer', '$creditsGrantedToReferee'] }
          },
          avgCreditsPerReferral: {
            $avg: { $add: ['$creditsGrantedToReferrer', '$creditsGrantedToReferee'] }
          }
        }
      }
    ]);
    
    // Get top referrers
    const topReferrers = await Referral.aggregate([
      {
        $match: {
          tenantId: req.user.tenantId,
          softDelete: false,
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$referrerId',
          totalReferrals: { $sum: 1 },
          totalCreditsEarned: { $sum: '$creditsGrantedToReferrer' }
        }
      },
      {
        $sort: { totalReferrals: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          totalReferrals: 1,
          totalCreditsEarned: 1,
          userName: '$user.name',
          userEmail: '$user.email'
        }
      }
    ]);
    
    // Get recent referrals
    const recentReferrals = await Referral.find({
      tenantId: req.user.tenantId,
      softDelete: false
    })
    .populate('referrerId', 'name email')
    .populate('refereeId', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);
    
    return successResponse(res, {
      period,
      growth: referralGrowth,
      stats: totalStats[0] || { totalReferrals: 0, totalCreditsGranted: 0, avgCreditsPerReferral: 0 },
      topReferrers,
      recentReferrals
    }, 'Referral analytics retrieved successfully');
  } catch (error) {
    console.error('Get referral analytics error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all referral plans
exports.getAllReferralPlans = async (req, res) => {
  try {
    const plans = await ReferralPlan.find({
      tenantId: req.user.tenantId,
      softDelete: false
    }).sort({ isDefault: -1, createdAt: -1 });
    
    return successResponse(res, { plans, count: plans.length }, 'Referral plans retrieved successfully');
  } catch (error) {
    console.error('Get referral plans error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get active referral plan (public endpoint)
exports.getActiveReferralPlan = async (req, res) => {
  try {
    // Get tenantId from authenticated user or use default
    const tenantId = req.user?.tenantId || process.env.DEFAULT_TENANT_ID || 'default-tenant';
    
    const plan = await ReferralPlan.findOne({
      tenantId: tenantId,
      softDelete: false,
      isActive: true,
      isDefault: true
    });
    
    if (!plan) {
      // Return default values if no plan configured
      return successResponse(res, { 
        plan: {
          creditsForReferrer: 10,
          creditsForReferee: 10
        }
      }, 'Using default referral plan');
    }
    
    return successResponse(res, { plan }, 'Active referral plan retrieved successfully');
  } catch (error) {
    console.error('Get active referral plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Create referral plan
exports.createReferralPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };
    
    const plan = await ReferralPlan.create(planData);
    return successResponse(res, { plan }, 'Referral plan created successfully', 201);
  } catch (error) {
    console.error('Create referral plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update referral plan
exports.updateReferralPlan = async (req, res) => {
  try {
    const plan = await ReferralPlan.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });
    
    if (!plan) {
      return notFoundResponse(res, 'Referral plan not found');
    }
    
    Object.assign(plan, req.body);
    plan.updatedBy = req.user._id;
    await plan.save();
    
    return successResponse(res, { plan }, 'Referral plan updated successfully');
  } catch (error) {
    console.error('Update referral plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete referral plan (soft delete)
exports.deleteReferralPlan = async (req, res) => {
  try {
    const plan = await ReferralPlan.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });
    
    if (!plan) {
      return notFoundResponse(res, 'Referral plan not found');
    }
    
    // Don't allow deleting the default plan if it's the only active one
    if (plan.isDefault) {
      const activePlans = await ReferralPlan.countDocuments({
        tenantId: req.user.tenantId,
        softDelete: false,
        isActive: true
      });
      
      if (activePlans <= 1) {
        return errorResponse(res, 'Cannot delete the only active referral plan', 400);
      }
    }
    
    plan.softDelete = true;
    plan.isActive = false;
    plan.updatedBy = req.user._id;
    await plan.save();
    
    return successResponse(res, null, 'Referral plan deleted successfully');
  } catch (error) {
    console.error('Delete referral plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Toggle plan active status
exports.toggleReferralPlanStatus = async (req, res) => {
  try {
    const plan = await ReferralPlan.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });
    
    if (!plan) {
      return notFoundResponse(res, 'Referral plan not found');
    }
    
    plan.isActive = !plan.isActive;
    plan.updatedBy = req.user._id;
    await plan.save();
    
    return successResponse(res, { plan }, `Referral plan ${plan.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (error) {
    console.error('Toggle referral plan status error:', error);
    return errorResponse(res, error.message, 500);
  }
};

module.exports = {
  getReferralAnalytics: exports.getReferralAnalytics,
  getAllReferralPlans: exports.getAllReferralPlans,
  getActiveReferralPlan: exports.getActiveReferralPlan,
  createReferralPlan: exports.createReferralPlan,
  updateReferralPlan: exports.updateReferralPlan,
  deleteReferralPlan: exports.deleteReferralPlan,
  toggleReferralPlanStatus: exports.toggleReferralPlanStatus
};

