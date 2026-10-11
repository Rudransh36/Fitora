const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const DietPlan = require('../models/DietPlan');
const { calculateTDEE } = require('../utils/calculations');
const { generateDietPlan } = require('../utils/recommendations');

// ─── GET /api/diet ────────────────────────────────────────────────────────────
// Returns the user's most recent diet plan (or generates one if none exists)
router.get('/', protect, async (req, res) => {
  try {
    let dietPlan = await DietPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });

    const userPref = req.user.dietaryPreference || 'Vegetarian';
    const planPref = dietPlan ? dietPlan.dietaryPreference : null;
    const isMismatch = !planPref || String(planPref).trim().toLowerCase() !== String(userPref).trim().toLowerCase();

    if (!dietPlan || isMismatch) {
      // Auto-generate on first visit or when user's dietary preference has changed
      await DietPlan.deleteMany({ user: req.user._id });
      dietPlan = await _generateAndSave(req.user);
    }

    res.json({ success: true, dietPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/diet/generate ──────────────────────────────────────────────────
// Force regenerate diet plan (e.g. after profile update)
router.post('/generate', protect, async (req, res) => {
  try {
    if (req.body && req.body.dietaryPreference) {
      let dp = String(req.body.dietaryPreference).trim();
      const lower = dp.toLowerCase();
      if (lower === 'vegetarian') dp = 'Vegetarian';
      else if (lower === 'eggetarian') dp = 'Eggetarian';
      else if (lower.includes('non')) dp = 'Non-Vegetarian';

      req.user.dietaryPreference = dp;
      if (req.body.sport) req.user.selectedSport = req.body.sport;
      if (req.body.fitnessGoal) req.user.fitnessGoal = req.body.fitnessGoal;

      if (typeof req.user.save === 'function') {
        await req.user.save();
      } else {
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user._id, {
          dietaryPreference: dp,
          ...(req.body.sport && { selectedSport: req.body.sport }),
          ...(req.body.fitnessGoal && { fitnessGoal: req.body.fitnessGoal })
        }).catch(() => {});
      }
    }
    // Delete old plan and regenerate
    await DietPlan.deleteMany({ user: req.user._id });
    const dietPlan = await _generateAndSave(req.user);
    res.status(201).json({
      success: true,
      message: '🥗 Your personalized diet plan has been generated!',
      dietPlan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── Internal helper: generate + save diet plan ───────────────────────────────
async function _generateAndSave(user) {
  const tdee = calculateTDEE(
    user.weight, user.height, user.age,
    user.gender, user.activityLevel, user.fitnessGoal
  );

  const planData = generateDietPlan({
    targetCalories: tdee.targetCalories,
    sport: user.selectedSport || 'Gym',
    fitnessGoal: user.fitnessGoal || 'General fitness',
    dietaryPreference: user.dietaryPreference || 'Vegetarian',
    weight: user.weight,
    activityLevel: user.activityLevel
  });

  return await DietPlan.create({
    user: user._id,
    sport: user.selectedSport || 'Gym',
    fitnessGoal: user.fitnessGoal || 'General fitness',
    dietaryPreference: user.dietaryPreference || 'Vegetarian',
    estimatedDailyCalories: tdee.targetCalories,
    macroTargets: planData.macroTargets,
    meals: planData.meals,
    sportNutritionFocus: planData.sportNutritionFocus,
    hydrationGuideline: planData.hydrationGuideline,
    disclaimer: planData.disclaimer
  });
}

module.exports = router;
