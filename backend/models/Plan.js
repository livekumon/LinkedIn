const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    unique: true,
    lowercase: true
  },
  displayName: {
    type: String,
    required: [true, 'Display name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  aiArticleCredits: {
    type: Number,
    required: [true, 'AI article credits is required'],
    min: 0,
    default: 0
  },
  features: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature'
  }],
  tag: {
    type: String,
    trim: true
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  highlighted: {
    type: Boolean,
    default: false
  },
  isUnlimited: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Add base fields (createdAt, createdBy, updatedAt, updatedBy, softDelete, tenantId)
addBaseFields(planSchema);

// Indexes
planSchema.index({ name: 1, tenantId: 1 }, { unique: true });
planSchema.index({ tenantId: 1, softDelete: 1, isActive: 1 });
planSchema.index({ sortOrder: 1 });

const Plan = mongoose.model('Plan', planSchema);

module.exports = Plan;

