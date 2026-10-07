const mongoose = require('mongoose');

/**
 * BadmintonTraining Schema
 * Tracks badminton court matches (compatible with existing live scoreboard & match history),
 * as well as athletic badminton drills (footwork, agility, flexibility, speed, endurance, strength).
 */
const badmintonTrainingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Training Classification
    trainingType: {
      type: String,
      enum: [
        'Match',
        'Footwork Drills',
        'Agility Drills',
        'Speed Training',
        'Endurance Training',
        'Flexibility/Mobility',
        'Strength Training',
        'Recovery/Rest'
      ],
      default: 'Match'
    },
    // Match Fields (matching existing badminton.html UI)
    opponent: { type: String, default: 'Opponent' },
    mode: {
      type: String,
      enum: ['Singles', 'Doubles', 'Mixed Doubles'],
      default: 'Singles'
    },
    scoreSummary: { type: String, default: '21-17, 21-19' },
    result: {
      type: String,
      enum: ['Win', 'Loss', 'In Progress', 'Completed'],
      default: 'Win'
    },
    duration: { type: Number, default: 45 }, // in minutes
    intensity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Extreme'],
      default: 'High'
    },
    // Technical & Shot Metrics
    smashes: { type: Number, default: 16, min: 0 },
    unforcedErrors: { type: Number, default: 6, min: 0 },
    avgRallyLength: { type: Number, default: 8.4 }, // average shots per rally

    // Specific Athletic Dimensions (0 - 100)
    footworkScore: { type: Number, default: 82 },
    agilityScore: { type: Number, default: 85 },
    flexibilityScore: { type: Number, default: 78 },
    speedScore: { type: Number, default: 86 },
    enduranceScore: { type: Number, default: 80 },
    strengthScore: { type: Number, default: 76 },

    estimatedCaloriesBurned: { type: Number, default: 520 },
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

module.exports = mongoose.model('BadmintonTraining', badmintonTrainingSchema);
