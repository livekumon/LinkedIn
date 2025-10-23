const TagSet = require('../models/TagSet');
const User = require('../models/User');
const { successResponse, errorResponse, notFoundResponse, validationErrorResponse } = require('../utils/responseHelper');

// Check if user has Pro plan (required for TagSets)
const checkProAccess = async (userId) => {
  const user = await User.findById(userId).populate('currentPlan');
  
  if (!user.currentPlan) {
    return { hasAccess: false, message: 'TagSets are a Pro feature. Please upgrade to Pro plan.' };
  }

  const planName = user.currentPlan.name?.toLowerCase();
  const allowedPlans = ['pro', 'enterprise'];
  
  if (!allowedPlans.includes(planName)) {
    return { hasAccess: false, message: 'TagSets are a Pro feature. Please upgrade to Pro or Enterprise plan.' };
  }

  return { hasAccess: true };
};

// Get all user tagsets
exports.getAllTagSets = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);
    
    const tagSets = await TagSet.find({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    }).sort({ isDefault: -1, name: 1 });

    return successResponse(res, { 
      tagSets, 
      count: tagSets.length,
      hasPro: proCheck.hasAccess
    }, 'TagSets retrieved successfully');
  } catch (error) {
    console.error('Get tagsets error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get default tagset
exports.getDefaultTagSet = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);

    const tagSet = await TagSet.findOne({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false,
      isDefault: true,
      isActive: true
    });

    return successResponse(res, { 
      tagSet: proCheck.hasAccess ? tagSet : null,
      hasPro: proCheck.hasAccess,
      message: !proCheck.hasAccess ? proCheck.message : null
    }, 'Default tagset retrieved successfully');
  } catch (error) {
    console.error('Get default tagset error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Create new tagset (Pro only)
exports.createTagSet = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);
    if (!proCheck.hasAccess) {
      return errorResponse(res, proCheck.message, 403);
    }

    const { name, description, hashtags, mentions, isDefault } = req.body;

    if (!name) {
      return validationErrorResponse(res, { message: 'Name is required' });
    }

    const tagSet = await TagSet.create({
      userId: req.user._id,
      name,
      description,
      hashtags: hashtags || [],
      mentions: mentions || [],
      isDefault: isDefault || false,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    return successResponse(res, { tagSet }, 'TagSet created successfully', 201);
  } catch (error) {
    console.error('Create tagset error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update tagset (Pro only)
exports.updateTagSet = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);
    if (!proCheck.hasAccess) {
      return errorResponse(res, proCheck.message, 403);
    }

    const tagSet = await TagSet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, tenantId: req.user.tenantId, softDelete: false },
      { ...req.body, updatedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!tagSet) {
      return notFoundResponse(res, 'TagSet not found');
    }

    return successResponse(res, { tagSet }, 'TagSet updated successfully');
  } catch (error) {
    console.error('Update tagset error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Set as default tagset (Pro only)
exports.setDefaultTagSet = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);
    if (!proCheck.hasAccess) {
      return errorResponse(res, proCheck.message, 403);
    }

    const tagSet = await TagSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!tagSet) {
      return notFoundResponse(res, 'TagSet not found');
    }

    tagSet.isDefault = true;
    tagSet.updatedBy = req.user._id;
    await tagSet.save();

    return successResponse(res, { tagSet }, 'Default tagset set successfully');
  } catch (error) {
    console.error('Set default tagset error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete tagset (Pro only)
exports.deleteTagSet = async (req, res) => {
  try {
    const proCheck = await checkProAccess(req.user._id);
    if (!proCheck.hasAccess) {
      return errorResponse(res, proCheck.message, 403);
    }

    const tagSet = await TagSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!tagSet) {
      return notFoundResponse(res, 'TagSet not found');
    }

    tagSet.softDelete = true;
    tagSet.updatedBy = req.user._id;
    await tagSet.save();

    return successResponse(res, null, 'TagSet deleted successfully');
  } catch (error) {
    console.error('Delete tagset error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Record tagset usage
exports.recordUsage = async (req, res) => {
  try {
    const tagSet = await TagSet.findOne({
      _id: req.params.id,
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    });

    if (!tagSet) {
      return notFoundResponse(res, 'TagSet not found');
    }

    tagSet.usageCount += 1;
    tagSet.lastUsedAt = new Date();
    tagSet.updatedBy = req.user._id;
    await tagSet.save();

    return successResponse(res, { tagSet }, 'Usage recorded successfully');
  } catch (error) {
    console.error('Record usage error:', error);
    return errorResponse(res, error.message, 500);
  }
};

