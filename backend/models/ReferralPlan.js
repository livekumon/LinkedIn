const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const referralPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  creditsForReferrer: {
    type: Number,
    required: [true, 'Credits for referrer is required'],
    min: 0,
    default: 10
  },
  creditsForReferee: {
    type: Number,
    required: [true, 'Credits for referee is required'],
    min: 0,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  minimumReferrals: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumReferrals: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Add base fields
addBaseFields(referralPlanSchema);

// Indexes
referralPlanSchema.index({ tenantId: 1, softDelete: 1, isActive: 1 });
referralPlanSchema.index({ isDefault: 1, isActive: 1 });

// Ensure only one default plan
referralPlanSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('ReferralPlan').updateMany(
      { _id: { $ne: this._id }, tenantId: this.tenantId, isDefault: true },
      { isDefault: false }
    );
  }
  next();
});

const ReferralPlan = mongoose.model('ReferralPlan', referralPlanSchema);

module.exports = ReferralPlan;

