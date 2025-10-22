const Idea = require('../models/Idea');
const { successResponse, errorResponse, notFoundResponse, validationErrorResponse } = require('../utils/responseHelper');

// Create new idea
exports.createIdea = async (req, res) => {
  try {
    const { title, content, tags, category } = req.body;

    if (!title || !content) {
      return validationErrorResponse(res, { message: 'Title and content are required' });
    }

    const idea = await Idea.create({
      title,
      content,
      tags: tags || [],
      category: category || 'general',
      status: 'draft',
      userId: req.user._id,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    return successResponse(res, { idea }, 'Idea created successfully', 201);
  } catch (error) {
    console.error('Create idea error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all ideas for logged-in user
exports.getAllIdeas = async (req, res) => {
  try {
    const { status, category, search } = req.query;
    
    const filter = {
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const ideas = await Idea.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    return successResponse(res, { ideas, count: ideas.length }, 'Ideas retrieved successfully');
  } catch (error) {
    console.error('Get ideas error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get single idea by ID
exports.getIdeaById = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user._id,
      softDelete: false
    }).populate('userId', 'name email');

    if (!idea) {
      return notFoundResponse(res, 'Idea not found');
    }

    return successResponse(res, { idea }, 'Idea retrieved successfully');
  } catch (error) {
    console.error('Get idea by ID error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Update idea
exports.updateIdea = async (req, res) => {
  try {
    const { title, content, tags, category, status, isFavorite } = req.body;

    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user._id,
      softDelete: false
    });

    if (!idea) {
      return notFoundResponse(res, 'Idea not found');
    }

    if (title) idea.title = title;
    if (content) idea.content = content;
    if (tags) idea.tags = tags;
    if (category) idea.category = category;
    if (status) idea.status = status;
    if (isFavorite !== undefined) idea.isFavorite = isFavorite;
    
    idea.updatedBy = req.user._id;
    await idea.save();

    return successResponse(res, { idea }, 'Idea updated successfully');
  } catch (error) {
    console.error('Update idea error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Delete idea (soft delete)
exports.deleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user._id,
      softDelete: false
    });

    if (!idea) {
      return notFoundResponse(res, 'Idea not found or already deleted');
    }

    idea.softDelete = true;
    idea.updatedBy = req.user._id;
    await idea.save();

    return successResponse(res, null, 'Idea deleted successfully');
  } catch (error) {
    console.error('Delete idea error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get favorite ideas
exports.getFavoriteIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      isFavorite: true,
      softDelete: false
    }).sort({ createdAt: -1 });

    return successResponse(res, { ideas, count: ideas.length }, 'Favorite ideas retrieved successfully');
  } catch (error) {
    console.error('Get favorite ideas error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get ideas statistics
exports.getIdeasStats = async (req, res) => {
  try {
    const stats = await Idea.aggregate([
      {
        $match: {
          userId: req.user._id,
          softDelete: false
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Idea.countDocuments({
      userId: req.user._id,
      softDelete: false
    });

    const favorites = await Idea.countDocuments({
      userId: req.user._id,
      isFavorite: true,
      softDelete: false
    });

    return successResponse(res, { stats, total, favorites }, 'Stats retrieved successfully');
  } catch (error) {
    console.error('Get stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get deleted ideas (recycle bin)
exports.getDeletedIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find({
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: true
    }).sort({ updatedAt: -1 });

    return successResponse(res, { ideas, count: ideas.length }, 'Deleted ideas retrieved successfully');
  } catch (error) {
    console.error('Get deleted ideas error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Restore idea from recycle bin
exports.restoreIdea = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user._id,
      softDelete: true
    });

    if (!idea) {
      return notFoundResponse(res, 'Deleted idea not found');
    }

    idea.softDelete = false;
    idea.updatedBy = req.user._id;
    await idea.save();

    return successResponse(res, { idea }, 'Idea restored successfully');
  } catch (error) {
    console.error('Restore idea error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Permanently delete idea
exports.permanentDeleteIdea = async (req, res) => {
  try {
    const idea = await Idea.findOne({
      _id: req.params.id,
      userId: req.user._id,
      softDelete: true
    });

    if (!idea) {
      return notFoundResponse(res, 'Deleted idea not found');
    }

    await Idea.findByIdAndDelete(req.params.id);

    return successResponse(res, null, 'Idea permanently deleted');
  } catch (error) {
    console.error('Permanent delete error:', error);
    return errorResponse(res, error.message, 500);
  }
};

