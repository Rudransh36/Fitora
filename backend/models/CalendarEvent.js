const mongoose = require('mongoose');

/**
 * CalendarEvent Schema
 * Tracks scheduled, completed, missed, and rest-day training sessions for live calendar & performance tracking.
 */
const calendarEventSchema = new mongoose.Schema(
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
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    sport: {
      type: String,
      enum: ['Gym', 'Cricket', 'Badminton', 'Running', 'Rest', 'Other'],
      default: 'Gym'
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Partially completed', 'Missed', 'Rest day'],
      default: 'Scheduled'
    },
    targetDuration: {
      type: Number, // in minutes
      default: 60
    },
    duration: {
      type: Number, // actual in minutes
      default: 0
    },
    calories: {
      type: Number, // calories burned
      default: 0
    },
    exercises: {
      type: [String],
      default: []
    },
    performanceScore: {
      type: Number, // 0 - 100 scale
      min: 0,
      max: 100,
      default: 85
    },
    performanceNote: {
      type: String,
      default: ''
    },
    intensity: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Maximum'],
      default: 'Moderate'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
