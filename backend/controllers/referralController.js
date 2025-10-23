const User = require('../models/User');
const Referral = require('../models/Referral');
const ReferralPlan = require('../models/ReferralPlan');
const CreditTransaction = require('../models/CreditTransaction');
const { successResponse, errorResponse, notFoundResponse } = require('../utils/responseHelper');
const crypto = require('crypto');

// Generate unique referral code
const generateReferralCode = async () => {
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    // Generate 8-character alphanumeric code
    code = crypto.randomBytes(4).toString('hex').toUpperCase();
    
    // Check if code already exists
    const existingUser = await User.findOne({ referralCode: code });
    if (!existingUser) {
      isUnique = true;
    }
  }
  
  return code;
};

// Get user's referral code (create if doesn't exist)
exports.getReferralCode = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }
    
    // Generate referral code if user doesn't have one
    if (!user.referralCode) {
      user.referralCode = await generateReferralCode();
      await user.save();
    }
    
    return successResponse(res, { 
      referralCode: user.referralCode,
      referralStats: user.referralStats || { totalReferred: 0, creditsEarnedFromReferrals: 0 }
    }, 'Referral code retrieved successfully');
  } catch (error) {
    console.error('Get referral code error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Get referral statistics
exports.getReferralStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return notFoundResponse(res, 'User not found');
    }
    
    // Generate referral code if user doesn't have one (for existing users)
    if (!user.referralCode) {
      user.referralCode = await generateReferralCode();
      user.updatedBy = req.user._id;
      await user.save();
      console.log('Generated referral code for existing user:', user.email, user.referralCode);
    }
    
    // Get all referrals made by this user
    const referrals = await Referral.find({
      referrerId: req.user._id,
      tenantId: req.user.tenantId,
      softDelete: false
    })
    .populate('refereeId', 'name email profilePicture createdAt')
    .sort({ createdAt: -1 });
    
    // Get active referral plan
    const activePlan = await ReferralPlan.findOne({
      tenantId: req.user.tenantId,
      softDelete: false,
      isActive: true,
      isDefault: true
    });
    
    return successResponse(res, { 
      referralCode: user.referralCode,
      referralStats: user.referralStats || { totalReferred: 0, creditsEarnedFromReferrals: 0 },
      referrals,
      totalReferrals: referrals.length,
      activePlan: activePlan || { creditsForReferrer: 10, creditsForReferee: 10 }
    }, 'Referral stats retrieved successfully');
  } catch (error) {
    console.error('Get referral stats error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Validate referral code
exports.validateReferralCode = async (req, res) => {
  try {
    const { code, tenantId } = req.body;
    
    if (!code) {
      return errorResponse(res, 'Referral code is required', 400);
    }
    
    const referrer = await User.findOne({ 
      referralCode: code.toUpperCase(),
      softDelete: false 
    }).select('name email referralCode tenantId');
    
    if (!referrer) {
      return errorResponse(res, 'Invalid referral code', 404);
    }
    
    // Get active referral plan to show credit amounts
    const activePlan = await ReferralPlan.findOne({
      tenantId: tenantId || referrer.tenantId || 'default-tenant',
      softDelete: false,
      isActive: true,
      isDefault: true
    });
    
    return successResponse(res, { 
      valid: true,
      referrerName: referrer.name,
      creditsForReferee: activePlan?.creditsForReferee || 10,
      creditsForReferrer: activePlan?.creditsForReferrer || 10
    }, 'Valid referral code');
  } catch (error) {
    console.error('Validate referral code error:', error);
    return errorResponse(res, error.message, 500);
  }
};

// Process referral (called during registration)
exports.processReferral = async (referralCode, newUserId, tenantId) => {
  try {
    if (!referralCode) return;
    
    // Find the referrer
    const referrer = await User.findOne({ 
      referralCode: referralCode.toUpperCase(),
      softDelete: false 
    });
    
    if (!referrer) {
      console.log('Invalid referral code:', referralCode);
      return;
    }
    
    // Don't allow self-referral
    if (referrer._id.toString() === newUserId.toString()) {
      console.log('Self-referral attempt blocked');
      return;
    }
    
    // Check if this user was already referred
    const existingReferral = await Referral.findOne({
      refereeId: newUserId,
      softDelete: false
    });
    
    if (existingReferral) {
      console.log('User already has a referral');
      return;
    }
    
    // Get active referral plan
    let referralPlan = await ReferralPlan.findOne({
      tenantId: tenantId,
      softDelete: false,
      isActive: true,
      isDefault: true
    });
    
    // Use default credits if no plan configured
    const REFERRER_CREDITS = referralPlan?.creditsForReferrer || 10;
    const REFEREE_CREDITS = referralPlan?.creditsForReferee || 10;
    
    // Create referral record
    const referral = await Referral.create({
      referrerId: referrer._id,
      refereeId: newUserId,
      referralCode: referralCode.toUpperCase(),
      referralPlanId: referralPlan?._id,
      status: 'completed',
      creditsGrantedToReferrer: REFERRER_CREDITS,
      creditsGrantedToReferee: REFEREE_CREDITS,
      completedAt: new Date(),
      tenantId: tenantId,
      createdBy: newUserId,
      updatedBy: newUserId
    });
    
    // Update referrer credits
    const referrerCreditsBefore = referrer.aiCreditsRemaining;
    referrer.aiCreditsRemaining = (referrer.aiCreditsRemaining || 0) + REFERRER_CREDITS;
    referrer.aiCreditsTotal = (referrer.aiCreditsTotal || 0) + REFERRER_CREDITS;
    referrer.referralStats = referrer.referralStats || { totalReferred: 0, creditsEarnedFromReferrals: 0 };
    referrer.referralStats.totalReferred += 1;
    referrer.referralStats.creditsEarnedFromReferrals += REFERRER_CREDITS;
    referrer.updatedBy = referrer._id;
    await referrer.save();
    
    // Create credit transaction for referrer
    await CreditTransaction.create({
      userId: referrer._id,
      transactionType: 'add',
      creditsChanged: REFERRER_CREDITS,
      creditsBeforeTransaction: referrerCreditsBefore,
      creditsAfterTransaction: referrer.aiCreditsRemaining,
      reason: 'referral_reward',
      notes: `Referral reward for referring user: ${newUserId}`,
      metadata: {
        referralId: referral._id,
        refereeId: newUserId,
        planId: referralPlan?._id
      },
      tenantId: tenantId,
      createdBy: referrer._id,
      updatedBy: referrer._id
    });
    
    // Update referee credits
    const newUser = await User.findById(newUserId);
    if (newUser) {
      const refereeCreditsBefore = newUser.aiCreditsRemaining;
      newUser.aiCreditsRemaining = (newUser.aiCreditsRemaining || 0) + REFEREE_CREDITS;
      newUser.aiCreditsTotal = (newUser.aiCreditsTotal || 0) + REFEREE_CREDITS;
      newUser.referredBy = referrer._id;
      newUser.updatedBy = newUserId;
      await newUser.save();
      
      // Create credit transaction for referee
      await CreditTransaction.create({
        userId: newUser._id,
        transactionType: 'add',
        creditsChanged: REFEREE_CREDITS,
        creditsBeforeTransaction: refereeCreditsBefore,
        creditsAfterTransaction: newUser.aiCreditsRemaining,
        reason: 'referral_signup',
        notes: `Referral signup bonus from: ${referrer._id}`,
        metadata: {
          referralId: referral._id,
          referrerId: referrer._id,
          planId: referralPlan?._id
        },
        tenantId: tenantId,
        createdBy: newUserId,
        updatedBy: newUserId
      });
    }
    
    console.log(`Referral processed: ${referrer.email} referred ${newUser.email}. Referrer: ${REFERRER_CREDITS} credits, Referee: ${REFEREE_CREDITS} credits.`);
    
    return referral;
  } catch (error) {
    console.error('Process referral error:', error);
    return null;
  }
};

module.exports = {
  getReferralCode: exports.getReferralCode,
  getReferralStats: exports.getReferralStats,
  validateReferralCode: exports.validateReferralCode,
  processReferral: exports.processReferral
};

