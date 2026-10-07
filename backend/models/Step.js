const mongoose = require('mongoose');

/**
 * Step Schema
 * Records daily and historical step tracking for authenticated athletes.
 * Supports manual entries, pedometer tracking, and synced Google Fit health data.
 */
const stepSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      index: true
    },
    stepCount: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    source: {
      type: String,
      enum: ['Manual', 'Google Fit', 'Device'],
      default: 'Manual'
    },
    distanceKm: {
      type: Number,
      default: 0
    },
    caloriesBurned: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index to quickly find user steps within specific date ranges
stepSchema.index({ user: 1, date: 1 });

module.exports = mongoose.model('Step', stepSchema);
