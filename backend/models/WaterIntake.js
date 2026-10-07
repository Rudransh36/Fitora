const mongoose = require('mongoose');

/**
 * WaterIntake Schema
 * Tracks daily hydration against personalized targets based on body weight and activity level.
 */
const waterLogEntrySchema = new mongoose.Schema({
  amount: { type: Number, required: true }, // in ml (e.g. 250, 500)
  time: { type: Date, default: Date.now }
});

const waterIntakeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      default: function() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
      },
      index: true
    },
    targetAmount: {
      type: Number, // in ml (e.g., 3200)
      required: true,
      default: 3000
    },
    consumedAmount: {
      type: Number, // in ml (e.g., 2400)
      default: 0
    },
    percentageCompleted: {
      type: Number,
      default: 0
    },
    logs: [waterLogEntrySchema]
  },
  {
    timestamps: true
  }
);

// Calculate percentage before save
waterIntakeSchema.pre('save', function (next) {
  if (this.targetAmount > 0) {
    this.percentageCompleted = Math.min(
      100,
      Math.round((this.consumedAmount / this.targetAmount) * 100)
    );
  }
  next();
});

module.exports = mongoose.model('WaterIntake', waterIntakeSchema);
