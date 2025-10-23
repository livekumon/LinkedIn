const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const linkedInPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true
  },
  articleVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ArticleVersion',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  linkedInPostId: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'failed', 'scheduled'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
});

// Add base fields
addBaseFields(linkedInPostSchema);

// Indexes
linkedInPostSchema.index({ userId: 1, tenantId: 1 });
linkedInPostSchema.index({ ideaId: 1 });
linkedInPostSchema.index({ status: 1 });

const LinkedInPost = mongoose.model('LinkedInPost', linkedInPostSchema);

module.exports = LinkedInPost;


