const mongoose = require('mongoose');
const Idea = require('../models/Idea');
const LinkedInPost = require('../models/LinkedInPost');
const ArticleVersion = require('../models/ArticleVersion');
const LinkedInConnection = require('../models/LinkedInConnection');
const User = require('../models/User');
const Payment = require('../models/Payment');
const CreditTransaction = require('../models/CreditTransaction');

// Get dashboard analytics
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;
    
    // Get idea counts by status
    const matchQuery = { userId: new mongoose.Types.ObjectId(userId), softDelete: false };
    if (tenantId) {
      matchQuery.tenantId = tenantId;
    }
    
    const ideaStats = await Idea.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get LinkedIn posts count
    const linkedInPostsCount = await LinkedInPost.countDocuments({
      userId,
      tenantId,
      softDelete: false
    });

    // Get published posts count
    const publishedPostsCount = await LinkedInPost.countDocuments({
      userId,
      tenantId,
      softDelete: false,
      status: 'published'
    });

    // Get scheduled posts count
    const scheduledPostsCount = await LinkedInPost.countDocuments({
      userId,
      tenantId,
      softDelete: false,
      status: 'scheduled'
    });

    // Get AI generated articles count
    const aiGeneratedCount = await ArticleVersion.countDocuments({
      userId,
      tenantId,
      softDelete: false
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentIdeasQuery = { userId: new mongoose.Types.ObjectId(userId), softDelete: false, createdAt: { $gte: sevenDaysAgo } };
    if (tenantId) {
      recentIdeasQuery.tenantId = tenantId;
    }
    
    const recentIdeas = await Idea.countDocuments(recentIdeasQuery);

    const recentPosts = await LinkedInPost.countDocuments({
      userId,
      tenantId,
      softDelete: false,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get LinkedIn connection status
    const linkedInConnection = await LinkedInConnection.findOne({
      userId,
      tenantId,
      softDelete: false
    });

    // Get top performing ideas (by status)
    const topIdeasQuery = { userId: new mongoose.Types.ObjectId(userId), softDelete: false, status: { $in: ['posted', 'ai_generated'] } };
    if (tenantId) {
      topIdeasQuery.tenantId = tenantId;
    }
    
    const topIdeas = await Idea.find(topIdeasQuery)
    .sort({ updatedAt: -1 })
    .limit(5)
    .select('title content status postedAt createdAt');

    // Get user credit info
    const user = await User.findById(userId).select('aiCreditsRemaining aiCreditsTotal currentPlan');

    // Get payment statistics
    const totalPayments = await Payment.countDocuments({
      userId,
      tenantId,
      status: 'completed',
      softDelete: false
    });

    const totalSpentResult = await Payment.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          tenantId: tenantId,
          status: 'completed',
          softDelete: false
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get recent payment
    const lastPayment = await Payment.findOne({
      userId,
      tenantId,
      status: 'completed',
      softDelete: false
    })
    .sort({ completedAt: -1 })
    .select('amount completedAt aiCreditsGranted')
    .populate('planId', 'displayName');

    // Get credit usage statistics
    const creditsUsed = (user.aiCreditsTotal || 0) - (user.aiCreditsRemaining || 0);
    
    const creditStats = await CreditTransaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          tenantId: tenantId,
          softDelete: false
        }
      },
      {
        $group: {
          _id: '$transactionType',
          count: { $sum: 1 },
          total: { $sum: '$creditsChanged' }
        }
      }
    ]);

    // Get recent transactions (last 5)
    const recentTransactions = await CreditTransaction.find({
      userId: new mongoose.Types.ObjectId(userId),
      tenantId,
      softDelete: false
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('transactionType creditsChanged reason notes createdAt');

    // Format idea stats
    const formattedIdeaStats = {
      draft: 0,
      ai_generated: 0,
      scheduled: 0,
      posted: 0,
      archived: 0
    };

    ideaStats.forEach(stat => {
      formattedIdeaStats[stat._id] = stat.count;
    });

    const analytics = {
      ideas: {
        total: Object.values(formattedIdeaStats).reduce((sum, count) => sum + count, 0),
        byStatus: formattedIdeaStats
      },
      linkedIn: {
        totalPosts: linkedInPostsCount,
        published: publishedPostsCount,
        scheduled: scheduledPostsCount,
        isConnected: !!linkedInConnection
      },
      ai: {
        generatedArticles: aiGeneratedCount
      },
      activity: {
        recentIdeas,
        recentPosts,
        lastWeek: {
          ideas: recentIdeas,
          posts: recentPosts
        }
      },
      // AI Credits
      credits: {
        remaining: user?.aiCreditsRemaining || 0,
        total: user?.aiCreditsTotal || 0,
        used: creditsUsed,
        usagePercentage: user?.aiCreditsTotal > 0 ? Math.round((creditsUsed / user.aiCreditsTotal) * 100) : 0
      },
      // Payments
      payments: {
        totalPayments,
        totalSpent: totalSpentResult.length > 0 ? totalSpentResult[0].total : 0,
        lastPayment: lastPayment ? {
          amount: lastPayment.amount,
          date: lastPayment.completedAt,
          credits: lastPayment.aiCreditsGranted,
          plan: lastPayment.planId?.displayName || 'Plan'
        } : null
      },
      // Credit Usage Stats
      creditUsage: creditStats,
      recentTransactions,
      topIdeas
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get performance metrics
const getPerformanceMetrics = async (req, res) => {
  try {
    const userId = req.user.id;
    const tenantId = req.user.tenantId;

    // Get posts by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyPosts = await LinkedInPost.aggregate([
      {
        $match: {
          userId,
          tenantId,
          softDelete: false,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get ideas by category
    const categoryMatchQuery = { userId: new mongoose.Types.ObjectId(userId), softDelete: false };
    if (tenantId) {
      categoryMatchQuery.tenantId = tenantId;
    }
    
    const ideasByCategory = await Idea.aggregate([
      { $match: categoryMatchQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        monthlyPosts,
        ideasByCategory
      }
    });

  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch performance metrics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardAnalytics,
  getPerformanceMetrics
};