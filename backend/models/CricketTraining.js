const mongoose = require('mongoose');

/**
 * CricketTraining Schema
 * Supports both Cricket match/net performance logging (compatible with existing frontend)
 * and comprehensive cricket athletic conditioning (running, sprint, agility, endurance, steps, sleep).
 */
const cricketTrainingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    // Session Classification
    sessionType: {
      type: String,
      enum: ['Match', 'Net Practice', 'Conditioning', 'Agility & Sprint', 'Mobility & Recovery'],
      default: 'Match'
    },
    // Match Specifics (matching current cricket.html UI)
    opponent: { type: String, default: 'Practice Match' },
    format: {
      type: String,
      enum: ['T20', '50-Over', 'Multi-Day', 'Net Practice', 'Fitness Drill'],
      default: 'T20'
    },
    venue: { type: String, default: 'Club Ground' },
    result: { type: String, default: 'Completed' },
    
    // Batting Metrics
    runs: { type: Number, default: 0, min: 0 },
    balls: { type: Number, default: 0, min: 0 },
    fours: { type: Number, default: 0, min: 0 },
    sixes: { type: Number, default: 0, min: 0 },
    notOut: { type: Boolean, default: false },

    // Bowling Metrics
    overs: { type: Number, default: 0, min: 0 },
    maidens: { type: Number, default: 0, min: 0 },
    runsConceded: { type: Number, default: 0, min: 0 },
    wickets: { type: Number, default: 0, min: 0 },

    // Physical Training & Fitness Metrics
    distanceRun: { type: Number, default: 4.5 }, // in km
    sprintSpeed: { type: Number, default: 28.0 }, // in km/h
    trainingDuration: { type: Number, default: 90 }, // in minutes
    intensity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Intense'],
      default: 'High'
    },
    estimatedCaloriesBurned: { type: Number, default: 650 },
    
    // Daily Monitoring Optional Metrics
    weightLogged: { type: Number },
    steps: { type: Number, default: 8500 },
    sleepDuration: { type: Number, default: 7.5 }, // in hours
    
    // Conditioning Outcomes (0-100 scale)
    agilityRating: { type: Number, default: 80 },
    enduranceRating: { type: Number, default: 82 },
    strengthRating: { type: Number, default: 75 },
    
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

module.exports = mongoose.model('CricketTraining', cricketTrainingSchema);
