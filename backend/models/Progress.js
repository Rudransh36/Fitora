const mongoose = require('mongoose');

/**
 * Progress Schema
 * Historical timeline records for chart visualizations (weekly & monthly filters).
 * Tracks weight, BMI, calories burned, hydration, workout volume, and sport metrics.
 */
const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    weight: { type: Number, required: true },
    bmi: { type: Number, required: true },
    caloriesBurned: { type: Number, default: 0 },
    trainingDuration: { type: Number, default: 0 }, // in minutes
    workoutsCompleted: { type: Number, default: 1 },
    waterIntake: { type: Number, default: 0 }, // in ml

    // Sport-specific progress indicators (for charts)
    cricketMetrics: {
      runningPerformance: { type: Number, default: 0 }, // in km
      sprintSpeed: { type: Number, default: 0 }, // in km/h
      enduranceScore: { type: Number, default: 75 }, // 0-100
      agilityScore: { type: Number, default: 78 } // 0-100
    },
    badmintonMetrics: {
      agilityScore: { type: Number, default: 80 }, // 0-100
      flexibilityScore: { type: Number, default: 75 }, // 0-100
      speedScore: { type: Number, default: 82 }, // 0-100
      enduranceScore: { type: Number, default: 78 }, // 0-100
      smashesLogged: { type: Number, default: 0 }
    },
    gymMetrics: {
      totalVolumeLifted: { type: Number, default: 0 },
      benchPr: { type: Number, default: 0 },
      squatPr: { type: Number, default: 0 },
      deadliftPr: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Progress', progressSchema);
