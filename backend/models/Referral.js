const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  refereeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  referralCode: {
    type: String,
    required: true,
    index: true
  },
  referralPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralPlan'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'completed',
    index: true
  },
  creditsGrantedToReferrer: {
    type: Number,
    default: 10,
    min: 0
  },
  creditsGrantedToReferee: {
    type: Number,
    default: 10,
    min: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Add base fields
addBaseFields(referralSchema);

// Indexes
referralSchema.index({ referrerId: 1, tenantId: 1 });
referralSchema.index({ refereeId: 1, tenantId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ status: 1, createdAt: -1 });

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;

