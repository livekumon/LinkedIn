const mongoose = require('mongoose');
const { addBaseFields } = require('./BaseSchema');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  paypalOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  paypalPaymentId: {
    type: String,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'approved', 'completed', 'failed', 'refunded'],
    default: 'created',
    required: true,
    index: true
  },
  aiCreditsGranted: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    default: 'paypal'
  },
  payerEmail: {
    type: String
  },
  payerName: {
    type: String
  },
  paypalResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for querying user payments
paymentSchema.index({ userId: 1, status: 1, createdAt: -1 });

// Index for payment tracking
paymentSchema.index({ paypalOrderId: 1, status: 1 });

// Add base fields (createdAt, updatedAt, etc.)
addBaseFields(paymentSchema);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;

