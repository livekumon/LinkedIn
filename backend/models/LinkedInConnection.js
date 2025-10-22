const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const linkedInConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  linkedInId: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String
  },
  profilePicture: {
    type: String
  },
  accessToken: {
    type: String,
    required: true,
    select: false
  },
  refreshToken: {
    type: String,
    select: false
  },
  tokenExpiry: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Add base fields
addBaseFields(linkedInConnectionSchema);

// Indexes
linkedInConnectionSchema.index({ userId: 1, tenantId: 1 });
linkedInConnectionSchema.index({ linkedInId: 1 });

const LinkedInConnection = mongoose.model('LinkedInConnection', linkedInConnectionSchema);

module.exports = LinkedInConnection;


