const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const tagSetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true
  },
  hashtags: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Hashtags should start with # and contain no spaces
        return /^#[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Hashtags must start with # and contain no spaces'
    }
  }],
  mentions: [{
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Mentions should start with @ and contain no spaces
        return /^@[a-zA-Z0-9_-]+$/.test(v);
      },
      message: 'Mentions must start with @ and contain no spaces'
    }
  }],
  isDefault: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUsedAt: {
    type: Date
  }
});

// Add base fields
addBaseFields(tagSetSchema);

// Indexes
tagSetSchema.index({ userId: 1, tenantId: 1, isActive: 1 });
tagSetSchema.index({ userId: 1, isDefault: 1 });

// Pre-save middleware to ensure only one default tagset per user
tagSetSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('TagSet').updateMany(
      { 
        userId: this.userId, 
        tenantId: this.tenantId,
        _id: { $ne: this._id }
      },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const TagSet = mongoose.model('TagSet', tagSetSchema);

module.exports = TagSet;




