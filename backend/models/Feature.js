const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const featureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Feature name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['core', 'ai', 'publishing', 'analytics', 'support', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    trim: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
});

// Add base fields (createdAt, createdBy, updatedAt, updatedBy, softDelete, tenantId)
addBaseFields(featureSchema);

// Indexes
featureSchema.index({ tenantId: 1, softDelete: 1 });
featureSchema.index({ category: 1, isActive: 1 });

const Feature = mongoose.model('Feature', featureSchema);

module.exports = Feature;

