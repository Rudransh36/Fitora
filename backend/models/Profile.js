const mongoose = require('mongoose');

/**
 * Profile Schema
 * Stores comprehensive user biometrics, calculated BMI, BMR, TDEE,
 * daily calorie targets, water targets, and personal fitness indicators.
 */
const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    age: { type: Number, default: 24 },
    gender: { type: String, default: 'Male' },
    height: { type: Number, default: 175 }, // in cm
    weight: { type: Number, default: 72 }, // in kg
    activityLevel: { type: String, default: 'Moderately Active' },
    fitnessGoal: { type: String, default: 'Sports performance' },
    selectedSport: { type: String, default: 'Gym' },
    dietaryPreference: { type: String, default: 'Vegetarian' },
    
    // Computed assessment metrics
    bmi: { type: Number, default: 23.5 },
    bmiCategory: { type: String, default: 'Normal weight' },
    bmr: { type: Number, default: 1720 }, // Basal Metabolic Rate
    tdee: { type: Number, default: 2660 }, // Total Daily Energy Expenditure
    targetCalories: { type: Number, default: 2500 }, // Goal-adjusted daily calorie requirement
    waterTarget: { type: Number, default: 3200 }, // Daily target in ml
    
    // Target macronutrient breakdown (in grams)
    targetProtein: { type: Number, default: 140 },
    targetCarbs: { type: Number, default: 310 },
    targetFats: { type: Number, default: 70 },
    
    // Physiological indicators
    restingHeartRate: { type: Number, default: 58 },
    recoveryScore: { type: Number, default: 88 },
    sleepHours: { type: Number, default: 7.8 }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Profile', profileSchema);
