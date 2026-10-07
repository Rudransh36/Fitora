const mongoose = require('mongoose');

/**
 * Food Schema
 * Database catalog of traditional and modern Indian foods,
 * with dedicated Maharashtrian dishes, practical household portion sizes,
 * and nutritional metrics (approximate calories, protein, carbs, fats).
 */
const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    regionalName: {
      type: String,
      trim: true
    },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Fruit', 'Beverage'],
      required: true,
      index: true
    },
    mealSlot: {
      type: String,
      enum: ['Breakfast', 'Mid-Morning', 'Lunch', 'Evening-Snack', 'Dinner', 'Post-Workout'],
      default: 'Lunch'
    },
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Eggetarian', 'Non-Vegetarian'],
      required: true,
      index: true
    },
    isMaharashtrian: {
      type: Boolean,
      default: false
    },
    portion: {
      type: String,
      required: true // e.g. "1 bowl (150g)", "1 bhakri", "2 eggs", "1 cup (150g)"
    },
    approxCalories: {
      type: Number,
      required: true
    },
    approxProtein: {
      type: Number, // in grams
      required: true
    },
    approxCarbs: {
      type: Number, // in grams
      required: true
    },
    approxFats: {
      type: Number, // in grams
      required: true
    },
    approxFiber: {
      type: Number, // in grams
      default: 2
    },
    benefits: {
      type: String,
      default: 'Provides sustained energy and wholesome nutrition'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Food', foodSchema);
