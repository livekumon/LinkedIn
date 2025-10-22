const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const articleVersionSchema = new mongoose.Schema({
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  tone: {
    type: String,
    enum: ['professional', 'casual', 'inspiring', 'educational', 'storytelling', 'default'],
    default: 'default'
  },
  characterCount: {
    type: Number
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'selected', 'published', 'scheduled'],
    default: 'draft'
  }
});

// Add base fields
addBaseFields(articleVersionSchema);

// Indexes
articleVersionSchema.index({ ideaId: 1, version: -1 });
articleVersionSchema.index({ userId: 1, tenantId: 1 });

// Pre-save hook to calculate character count
articleVersionSchema.pre('save', function(next) {
  if (this.content) {
    this.characterCount = this.content.length;
  }
  next();
});

const ArticleVersion = mongoose.model('ArticleVersion', articleVersionSchema);

module.exports = ArticleVersion;


