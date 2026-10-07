const mongoose = require('mongoose');

/**
 * WorkoutPlan Schema
 * Generates and stores weekly customized workout schedules (Monday - Sunday)
 * tailored to user goals and selected sports (Gym, Cricket, Badminton).
 */
const exerciseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: { type: Number, default: 3 },
  reps: { type: String, default: '8-12 reps' },
  duration: { type: String, default: '20 mins' },
  restPeriod: { type: String, default: '90s' },
  completed: { type: Boolean, default: false }
});

const dayPlanSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  focus: { type: String, required: true },
  isRestDay: { type: Boolean, default: false },
  exercises: [exerciseItemSchema]
});

const workoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    sport: {
      type: String,
      enum: ['Gym', 'Cricket', 'Badminton'],
      default: 'Gym'
    },
    planName: { type: String, default: 'Custom Weekly Athletic Schedule' },
    weeklyPlan: [dayPlanSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
