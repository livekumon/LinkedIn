const { generateLinkedInArticle } = require('../services/geminiService');
const Idea = require('../models/Idea');
const ArticleVersion = require('../models/ArticleVersion');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');

// Generate LinkedIn article from idea
exports.generateArticle = async (req, res) => {
  try {
    const { ideaId, tone = 'default', regenerate = false, includeSources = false } = req.body;

    if (!ideaId) {
      return errorResponse(res, 'Idea ID is required', 400);
    }

    // Find the idea
    const idea = await Idea.findOne({
      _id: ideaId,
      userId: req.user._id,
      softDelete: false
    });

    if (!idea) {
      return notFoundResponse(res, 'Idea not found');
    }

    // Get next version number
    const existingVersions = await ArticleVersion.find({
      ideaId,
      userId: req.user._id,
      softDelete: false
    }).sort({ version: -1 });

    const nextVersion = existingVersions.length > 0 ? existingVersions[0].version + 1 : 1;

    // Generate article using Gemini
    const article = await generateLinkedInArticle(idea.content, tone, regenerate, includeSources);

    // Save article version
    const articleVersion = await ArticleVersion.create({
      ideaId,
      userId: req.user._id,
      content: article,
      version: nextVersion,
      tone,
      tenantId: req.user.tenantId,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    // Update idea status to ai_generated
    idea.status = 'ai_generated';
    idea.updatedBy = req.user._id;
    await idea.save();

    return successResponse(res, { 
      article: articleVersion.content,
      version: articleVersion.version,
      characterCount: articleVersion.characterCount,
      tone: articleVersion.tone,
      originalIdea: idea.content 
    }, 'Article generated successfully');
  } catch (error) {
    console.error('Generate article error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get all article versions for an idea
exports.getArticleVersions = async (req, res) => {
  try {
    const { ideaId } = req.params;

    const versions = await ArticleVersion.find({
      ideaId,
      userId: req.user._id,
      softDelete: false
    }).sort({ version: -1 });

    return successResponse(res, { 
      versions,
      count: versions.length 
    }, 'Article versions retrieved successfully');
  } catch (error) {
    console.error('Get article versions error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Select an article version
exports.selectArticleVersion = async (req, res) => {
  try {
    const { versionId } = req.body;

    const version = await ArticleVersion.findOne({
      _id: versionId,
      userId: req.user._id,
      softDelete: false
    });

    if (!version) {
      return notFoundResponse(res, 'Article version not found');
    }

    // Unselect all other versions for this idea
    await ArticleVersion.updateMany(
      { ideaId: version.ideaId, userId: req.user._id },
      { isSelected: false, updatedBy: req.user._id }
    );

    // Select this version
    version.isSelected = true;
    version.status = 'selected';
    version.updatedBy = req.user._id;
    await version.save();

    return successResponse(res, { version }, 'Article version selected');
  } catch (error) {
    console.error('Select article version error:', error);
    return errorResponse(res, error.message, 500);
  }
};


