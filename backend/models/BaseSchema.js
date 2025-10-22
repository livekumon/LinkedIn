const mongoose = require('mongoose');

/**
 * Base schema with mandatory fields for all collections
 * Includes: createdAt, createdBy, updatedAt, updatedBy, softDelete, tenantId
 */
const baseSchemaFields = {
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  softDelete: {
    type: Boolean,
    default: false,
    index: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  }
};

/**
 * Pre-save middleware to update the updatedAt field
 */
const updateTimestamp = function(next) {
  this.updatedAt = Date.now();
  next();
};

/**
 * Helper function to add base fields to any schema
 */
const addBaseFields = (schema) => {
  schema.add(baseSchemaFields);
  schema.pre('save', updateTimestamp);
  schema.pre('findOneAndUpdate', function(next) {
    this.set({ updatedAt: Date.now() });
    next();
  });
};

module.exports = {
  baseSchemaFields,
  addBaseFields
};

