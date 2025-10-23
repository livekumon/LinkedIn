const CreditTransaction = require('../models/CreditTransaction');
const User = require('../models/User');
const Idea = require('../models/Idea');
const ArticleVersion = require('../models/ArticleVersion');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const mongoose = require('mongoose');

// Get user's credit transactions (audit trail)
exports.getCreditTransactions = async (req, res) => {
  try {
    const { startDate, endDate, transactionType, reason } = req.query;
    
    const filter = {
      userId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (transactionType) filter.transactionType = transactionType;
    if (reason) filter.reason = reason;

    const transactions = await CreditTransaction.find(filter)
      .populate('ideaId', 'content status')
      .populate('planId', 'displayName price')
      .sort({ createdAt: -1 })
      .limit(100);

    return successResponse(res, { 
      transactions, 
      count: transactions.length 
    }, 'Credit transactions retrieved successfully');
  } catch (error) {
    console.error('Get credit transactions error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get credit usage statistics
exports.getCreditStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const tenantId = req.user.tenantId;

    // Get current user credits
    const user = await User.findById(userId);
    
    // Get total credits used
    const totalUsed = await CreditTransaction.aggregate([
      {
        $match: {
          userId: userId,
          tenantId: tenantId,
          transactionType: 'deduct',
          softDelete: false
        }
      },
      {
        $group: {
          _id: null,
          totalCreditsUsed: { $sum: { $abs: '$creditsChanged' } }
        }
      }
    ]);

    // Get credits used per idea
    const usageByIdea = await CreditTransaction.aggregate([
      {
        $match: {
          userId: userId,
          tenantId: tenantId,
          transactionType: 'deduct',
          softDelete: false
        }
      },
      {
        $group: {
          _id: '$ideaId',
          creditsUsed: { $sum: { $abs: '$creditsChanged' } },
          generationCount: { $sum: 1 }
        }
      },
      {
        $sort: { creditsUsed: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Populate idea details
    const Idea = require('../models/Idea');
    const populatedUsage = await Promise.all(
      usageByIdea.map(async (item) => {
        const idea = await Idea.findById(item._id).select('content status');
        return {
          ideaId: item._id,
          idea: idea,
          creditsUsed: item.creditsUsed,
          generationCount: item.generationCount
        };
      })
    );

    // Get usage by reason
    const usageByReason = await CreditTransaction.aggregate([
      {
        $match: {
          userId: userId,
          tenantId: tenantId,
          softDelete: false
        }
      },
      {
        $group: {
          _id: '$reason',
          count: { $sum: 1 },
          totalCredits: { $sum: '$creditsChanged' }
        }
      }
    ]);

    const stats = {
      currentBalance: user.aiCreditsRemaining,
      totalCredits: user.aiCreditsTotal,
      totalUsed: totalUsed.length > 0 ? totalUsed[0].totalCreditsUsed : 0,
      usageByIdea: populatedUsage,
      usageByReason: usageByReason,
      currentPlan: user.currentPlan
    };

    return successResponse(res, stats, 'Credit statistics retrieved successfully');
  } catch (error) {
    console.error('Get credit stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get credits for a specific idea
exports.getIdeaCredits = async (req, res) => {
  try {
    const { ideaId } = req.params;

    const transactions = await CreditTransaction.find({
      userId: req.user._id,
      ideaId: ideaId,
      tenantId: req.user.tenantId,
      softDelete: false
    }).sort({ createdAt: -1 });

    const totalCredits = transactions
      .filter(t => t.transactionType === 'deduct')
      .reduce((sum, t) => sum + Math.abs(t.creditsChanged), 0);

    return successResponse(res, {
      transactions,
      totalCreditsUsed: totalCredits,
      generationCount: transactions.filter(t => t.transactionType === 'deduct').length
    }, 'Idea credit usage retrieved successfully');
  } catch (error) {
    console.error('Get idea credits error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get detailed credit usage by ideas
exports.getCreditUsageByIdea = async (req, res) => {
  try {
    const userId = req.user._id;
    const tenantId = req.user.tenantId;

    // Get all ideas with credit usage
    const ideas = await Idea.find({
      createdBy: userId,
      tenantId,
      softDelete: false
    })
    .select('title content status creditsUsed aiGenerationCount createdAt updatedAt')
    .sort({ creditsUsed: -1, createdAt: -1 });

    // Get credit transactions for each idea
    const ideasWithTransactions = await Promise.all(
      ideas.map(async (idea) => {
        const transactions = await CreditTransaction.find({
          ideaId: idea._id,
          userId,
          tenantId,
          softDelete: false
        })
        .select('transactionType creditsChanged reason createdAt notes')
        .sort({ createdAt: -1 });

        return {
          _id: idea._id,
          title: idea.title,
          content: idea.content?.substring(0, 100) + '...',
          status: idea.status,
          creditsUsed: idea.creditsUsed || 0,
          aiGenerationCount: idea.aiGenerationCount || 0,
          createdAt: idea.createdAt,
          updatedAt: idea.updatedAt,
          transactions
        };
      })
    );

    // Calculate summary stats
    const totalCreditsUsed = ideas.reduce((sum, idea) => sum + (idea.creditsUsed || 0), 0);
    const totalGenerations = ideas.reduce((sum, idea) => sum + (idea.aiGenerationCount || 0), 0);
    const ideasWithAI = ideas.filter(idea => idea.aiGenerationCount > 0).length;

    return successResponse(res, {
      ideas: ideasWithTransactions,
      summary: {
        totalIdeas: ideas.length,
        ideasWithAI,
        totalCreditsUsed,
        totalGenerations,
        averageCreditsPerIdea: ideas.length > 0 ? (totalCreditsUsed / ideas.length).toFixed(2) : 0
      }
    }, 'Credit usage by idea retrieved successfully');
  } catch (error) {
    console.error('Get credit usage by idea error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get detailed credit usage by articles
exports.getCreditUsageByArticle = async (req, res) => {
  try {
    const userId = req.user._id;
    const tenantId = req.user.tenantId;

    // Get all transactions with idea information
    const transactions = await CreditTransaction.find({
      userId,
      tenantId,
      softDelete: false,
      transactionType: 'deduct',
      reason: 'ai_generation'
    })
    .populate({
      path: 'ideaId',
      select: 'title status'
    })
    .select('creditsChanged createdAt metadata notes ideaId')
    .sort({ createdAt: -1 });

    // Get article versions for each transaction
    const articlesWithCredits = await Promise.all(
      transactions.map(async (tx) => {
        let articlePreview = null;
        
        if (tx.ideaId) {
          // Get the most recent article version for this idea
          const articleVersion = await ArticleVersion.findOne({
            ideaId: tx.ideaId._id,
            userId,
            tenantId,
            softDelete: false
          })
          .select('content tone createdAt')
          .sort({ createdAt: -1 });

          if (articleVersion) {
            articlePreview = {
              content: articleVersion.content?.substring(0, 150) + '...',
              tone: articleVersion.tone,
              generatedAt: articleVersion.createdAt
            };
          }
        }

        return {
          _id: tx._id,
          ideaTitle: tx.ideaId?.title || 'Deleted Idea',
          ideaId: tx.ideaId?._id,
          ideaStatus: tx.ideaId?.status,
          creditsUsed: tx.creditsChanged,
          generatedAt: tx.createdAt,
          article: articlePreview,
          metadata: tx.metadata,
          notes: tx.notes
        };
      })
    );

    // Calculate summary
    const totalArticlesGenerated = transactions.length;
    const totalCreditsUsed = transactions.reduce((sum, tx) => sum + tx.creditsChanged, 0);

    return successResponse(res, {
      articles: articlesWithCredits,
      summary: {
        totalArticlesGenerated,
        totalCreditsUsed,
        averageCreditsPerArticle: totalArticlesGenerated > 0 ? (totalCreditsUsed / totalArticlesGenerated).toFixed(2) : 0
      }
    }, 'Credit usage by article retrieved successfully');
  } catch (error) {
    console.error('Get credit usage by article error:', error);
    return errorResponse(res, error.message, 500);
  }
};

