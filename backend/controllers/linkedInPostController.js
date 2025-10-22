const { postToLinkedIn } = require('../services/linkedInPostService');
const LinkedInPost = require('../models/LinkedInPost');
const ArticleVersion = require('../models/ArticleVersion');
const Idea = require('../models/Idea');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Post article to LinkedIn
exports.postArticle = async (req, res) => {
  try {
    const { articleVersionId } = req.body;

    if (!articleVersionId) {
      return errorResponse(res, 'Article version ID is required', 400);
    }

    // Get article version
    const articleVersion = await ArticleVersion.findOne({
      _id: articleVersionId,
      userId: req.user._id,
      softDelete: false
    });

    if (!articleVersion) {
      return notFoundResponse(res, 'Article version not found');
    }

    // Post to LinkedIn
    const result = await postToLinkedIn(req.user._id, req.user.tenantId, articleVersion.content);

    // Save post record
    const linkedInPost = await LinkedInPost.create({
      userId: req.user._id,
      ideaId: articleVersion.ideaId,
      articleVersionId: articleVersion._id,
      content: articleVersion.content,
      linkedInPostId: result.postId,
      status: 'published',
      publishedAt: new Date(),
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Update article version status
    articleVersion.status = 'published';
    articleVersion.updatedBy = req.user._id;
    await articleVersion.save();

    // Update idea status and posted date
    await Idea.findByIdAndUpdate(articleVersion.ideaId, {
      status: 'posted',
      postedAt: new Date(),
      updatedBy: req.user._id
    });

    return successResponse(res, { 
      post: linkedInPost,
      linkedInPostId: result.postId 
    }, 'Posted to LinkedIn successfully', 201);
  } catch (error) {
    console.error('Post to LinkedIn error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Schedule article for later
exports.scheduleArticle = async (req, res) => {
  try {
    const { articleVersionId, scheduledAt } = req.body;

    if (!articleVersionId || !scheduledAt) {
      return errorResponse(res, 'Article version ID and scheduled time are required', 400);
    }

    // Get article version
    const articleVersion = await ArticleVersion.findOne({
      _id: articleVersionId,
      userId: req.user._id,
      softDelete: false
    });

    if (!articleVersion) {
      return notFoundResponse(res, 'Article version not found');
    }

    // Create scheduled post record
    const linkedInPost = await LinkedInPost.create({
      userId: req.user._id,
      ideaId: articleVersion.ideaId,
      articleVersionId: articleVersion._id,
      content: articleVersion.content,
      status: 'scheduled',
      scheduledAt: new Date(scheduledAt),
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Update article version status
    articleVersion.status = 'scheduled';
    articleVersion.updatedBy = req.user._id;
    await articleVersion.save();

    // Update idea status and scheduled date
    await Idea.findByIdAndUpdate(articleVersion.ideaId, {
      status: 'scheduled',
      scheduledFor: new Date(scheduledAt),
      updatedBy: req.user._id
    });

    return successResponse(res, { 
      post: linkedInPost 
    }, 'Article scheduled successfully', 201);
  } catch (error) {
    console.error('Schedule article error:', error);
    return errorResponse(res, error.message, 500);
  }
};

