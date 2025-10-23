const Plan = require('../models/Plan');
const Feature = require('../models/Feature');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Get all active plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({
      tenantId: req.user.tenantId,
      softDelete: false,
      isActive: true
    })
      .populate('features')
      .sort({ sortOrder: 1 });

    return successResponse(res, { plans, count: plans.length }, 'Plans retrieved successfully');
  } catch (error) {
    console.error('Get plans error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get single plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false,
      isActive: true
    }).populate('features');

    if (!plan) {
      return notFoundResponse(res, 'Plan not found');
    }

    return successResponse(res, { plan }, 'Plan retrieved successfully');
  } catch (error) {
    console.error('Get plan by ID error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all features
exports.getAllFeatures = async (req, res) => {
  try {
    const features = await Feature.find({
      tenantId: req.user.tenantId,
      softDelete: false
    }).sort({ category: 1, name: 1 });

    return successResponse(res, { features, count: features.length }, 'Features retrieved successfully');
  } catch (error) {
    console.error('Get features error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get feature by ID
exports.getFeatureById = async (req, res) => {
  try {
    const feature = await Feature.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!feature) {
      return notFoundResponse(res, 'Feature not found');
    }

    return successResponse(res, { feature }, 'Feature retrieved successfully');
  } catch (error) {
    console.error('Get feature by ID error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get user's current plan and credits
exports.getUserPlanInfo = async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id)
      .populate('currentPlan')
      .populate('planHistory.planId');

    if (!user) {
      return notFoundResponse(res, 'User not found');
    }

    const planInfo = {
      currentPlan: user.currentPlan,
      aiCreditsRemaining: user.aiCreditsRemaining,
      aiCreditsTotal: user.aiCreditsTotal,
      planHistory: user.planHistory
    };

    return successResponse(res, planInfo, 'User plan info retrieved successfully');
  } catch (error) {
    console.error('Get user plan info error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Create new plan (Admin only)
exports.createPlan = async (req, res) => {
  try {
    const planData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const plan = await Plan.create(planData);
    return successResponse(res, { plan }, 'Plan created successfully', 201);
  } catch (error) {
    console.error('Create plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update plan (Admin only)
exports.updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId, softDelete: false },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!plan) {
      return notFoundResponse(res, 'Plan not found');
    }

    return successResponse(res, { plan }, 'Plan updated successfully');
  } catch (error) {
    console.error('Update plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete plan (Admin only - soft delete)
exports.deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!plan) {
      return notFoundResponse(res, 'Plan not found');
    }

    plan.softDelete = true;
    plan.updatedBy = req.user._id;
    await plan.save();

    return successResponse(res, null, 'Plan deleted successfully');
  } catch (error) {
    console.error('Delete plan error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Create new feature (Admin only)
exports.createFeature = async (req, res) => {
  try {
    const featureData = {
      ...req.body,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    };

    const feature = await Feature.create(featureData);
    return successResponse(res, { feature }, 'Feature created successfully', 201);
  } catch (error) {
    console.error('Create feature error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update feature (Admin only)
exports.updateFeature = async (req, res) => {
  try {
    const feature = await Feature.findOneAndUpdate(
      { _id: req.params.id, tenantId: req.user.tenantId, softDelete: false },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!feature) {
      return notFoundResponse(res, 'Feature not found');
    }

    return successResponse(res, { feature }, 'Feature updated successfully');
  } catch (error) {
    console.error('Update feature error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete feature (Admin only - soft delete)
exports.deleteFeature = async (req, res) => {
  try {
    const feature = await Feature.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!feature) {
      return notFoundResponse(res, 'Feature not found');
    }

    feature.softDelete = true;
    feature.updatedBy = req.user._id;
    await feature.save();

    return successResponse(res, null, 'Feature deleted successfully');
  } catch (error) {
    console.error('Delete feature error:', error);
    return errorResponse(res, error.message, 500);
  }
};

