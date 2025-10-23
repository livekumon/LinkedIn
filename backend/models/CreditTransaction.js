const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const creditTransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  ideaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Idea',
    required: false,
    index: true
  },
  transactionType: {
    type: String,
    enum: ['deduct', 'add', 'refund'],
    required: true
  },
  creditsChanged: {
    type: Number,
    required: true
  },
  creditsBeforeTransaction: {
    type: Number,
    required: true
  },
  creditsAfterTransaction: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    enum: ['ai_generation', 'plan_purchase', 'admin_adjustment', 'refund', 'bonus'],
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  articleContent: {
    type: String
  },
  metadata: {
    tone: String,
    includeSources: Boolean,
    regeneration: Boolean,
    articleLength: Number
  },
  notes: {
    type: String
  }
});

// Add base fields
addBaseFields(creditTransactionSchema);

// Indexes
creditTransactionSchema.index({ userId: 1, createdAt: -1 });
creditTransactionSchema.index({ ideaId: 1 });
creditTransactionSchema.index({ transactionType: 1, reason: 1 });
creditTransactionSchema.index({ tenantId: 1, createdAt: -1 });

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);

module.exports = CreditTransaction;

