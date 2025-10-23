const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    select: false,
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  profilePicture: {
    type: String
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  currentPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  aiCreditsRemaining: {
    type: Number,
    default: 15,
    min: 0
  },
  aiCreditsTotal: {
    type: Number,
    default: 15,
    min: 0
  },
  planHistory: [{
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    purchasedAt: {
      type: Date,
      default: Date.now
    },
    creditsGranted: {
      type: Number,
      default: 0
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    }
  }],
  timezone: {
    type: String,
    default: 'America/New_York'
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralStats: {
    totalReferred: {
      type: Number,
      default: 0,
      min: 0
    },
    creditsEarnedFromReferrals: {
      type: Number,
      default: 0,
      min: 0
    }
  }
});

// Add base fields (createdAt, createdBy, updatedAt, updatedBy, softDelete, tenantId)
addBaseFields(userSchema);

// Indexes
userSchema.index({ email: 1, tenantId: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ softDelete: 1 });

// Query helper to exclude soft deleted records
userSchema.query.active = function() {
  return this.where({ softDelete: false });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
