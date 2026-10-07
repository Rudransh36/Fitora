const mongoose = require('mongoose');

/**
 * DietPlan Schema
 * Generates and stores customized Indian meal plans structured across 5-6 meal slots:
 * Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner, and Post-Workout.
 * Adapts to Gym (hypertrophy/strength), Cricket (stamina/hydration), and Badminton (agility/endurance).
 */
const mealItemSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  portion: { type: String, required: true },
  approxCalories: { type: Number, required: true },
  approxProtein: { type: Number, required: true },
  approxCarbs: { type: Number, required: true },
  approxFats: { type: Number, required: true },
  note: { type: String, default: '' }
});

const dietPlanSchema = new mongoose.Schema(
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
    fitnessGoal: {
      type: String,
      default: 'General fitness'
    },
    dietaryPreference: {
      type: String,
      enum: ['Vegetarian', 'Eggetarian', 'Non-Vegetarian'],
      default: 'Vegetarian'
    },
    estimatedDailyCalories: {
      type: Number,
      required: true
    },
    macroTargets: {
      proteinGrams: { type: Number, required: true },
      carbsGrams: { type: Number, required: true },
      fatsGrams: { type: Number, required: true }
    },
    meals: {
      breakfast: [mealItemSchema],
      midMorningSnack: [mealItemSchema],
      lunch: [mealItemSchema],
      eveningSnack: [mealItemSchema],
      dinner: [mealItemSchema],
      postWorkout: [mealItemSchema]
    },
    sportNutritionFocus: {
      type: String,
      default: 'Balanced Indian whole foods with optimal macronutrient partitioning'
    },
    hydrationGuideline: {
      type: String,
      default: 'Drink 3.0 to 3.5 Litres of water throughout the day, including electrolyte/taak post session'
    },
    disclaimer: {
      type: String,
      default: 'Disclaimer: Nutritional values and calorie counts are scientific approximations for educational and fitness monitoring purposes, not a clinical prescription.'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DietPlan', dietPlanSchema);
