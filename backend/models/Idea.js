const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const ideaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: ['general', 'business', 'technology', 'creative', 'personal', 'other'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['draft', 'ai_generated', 'scheduled', 'posted', 'archived'],
    default: 'draft'
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  postedAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  }
});

// Add base fields (createdAt, createdBy, updatedAt, updatedBy, softDelete, tenantId)
addBaseFields(ideaSchema);

// Indexes
ideaSchema.index({ userId: 1, tenantId: 1 });
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ status: 1 });
ideaSchema.index({ tags: 1 });

// Query helper to exclude soft deleted records
ideaSchema.query.active = function() {
  return this.where({ softDelete: false });
};

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;

