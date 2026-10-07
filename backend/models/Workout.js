const mongoose = require('mongoose');

/**
 * Workout Schema
 * Stores logged gym exercises, progressive overload sets, weight, reps,
 * calculated volume, and estimated calories burned.
 */
const setSchema = new mongoose.Schema({
  setNumber: { type: Number, required: true },
  target: { type: String, default: '' },
  weight: { type: Number, required: true, min: 0 },
  reps: { type: Number, required: true, min: 0 },
  completed: { type: Boolean, default: true }
});

const workoutSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
      trim: true
    },
    muscleGroup: {
      type: String,
      enum: ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'],
      default: 'Chest'
    },
    routine: {
      type: String,
      default: 'Push Day'
    },
    sets: [setSchema],
    totalVolume: {
      type: Number, // sum of (weight * reps) for all completed sets
      default: 0
    },
    duration: {
      type: Number, // in minutes
      default: 45
    },
    intensity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Max'],
      default: 'High'
    },
    estimatedCaloriesBurned: {
      type: Number, // clearly labeled as estimated in API responses
      default: 0
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-calculate volume before saving
workoutSchema.pre('save', function (next) {
  if (this.sets && this.sets.length > 0) {
    this.totalVolume = this.sets.reduce((sum, s) => {
      return s.completed ? sum + (s.weight * s.reps) : sum;
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
