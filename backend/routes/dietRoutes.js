const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const DietPlan = require('../models/DietPlan');
const { calculateTDEE } = require('../utils/calculations');
const { generateDietPlan } = require('../utils/recommendations');

// ─── Internal helper: build plan object ───────────────────────────────────────
function _buildPlanObject(user) {
  const weight = user.weight || 72;
  const height = user.height || 175;
  const age = user.age || 24;
  const gender = user.gender || 'Male';
  const activityLevel = user.activityLevel || 'Moderately Active';
  const fitnessGoal = user.fitnessGoal || 'General fitness';
  const sport = user.selectedSport || 'Gym';
  const dietaryPreference = user.dietaryPreference || 'Vegetarian';

  const tdee = calculateTDEE(weight, height, age, gender, activityLevel, fitnessGoal);

  const planData = generateDietPlan({
    targetCalories: tdee.targetCalories,
    sport,
    fitnessGoal,
    dietaryPreference,
    weight,
    activityLevel
  });

  return {
    _id: 'diet_' + (user._id || 'user') + '_' + Date.now(),
    user: user._id,
    sport,
    fitnessGoal,
    dietaryPreference,
    estimatedDailyCalories: tdee.targetCalories,
    macroTargets: planData.macroTargets,
    meals: planData.meals,
    sportNutritionFocus: planData.sportNutritionFocus,
    hydrationGuideline: planData.hydrationGuideline,
    disclaimer: planData.disclaimer,
    createdAt: new Date()
  };
}

// ─── Internal helper: generate + save diet plan (with graceful fallback) ──────
async function _generateAndSave(user) {
  const mongoose = require('mongoose');
  const planData = _buildPlanObject(user);

  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    try {
      return await DietPlan.create(planData);
    } catch (saveErr) {
      console.warn('DietPlan DB save notice:', saveErr.message);
      return planData;
    }
  }
  return planData;
}

// ─── GET /api/diet ────────────────────────────────────────────────────────────
// Returns the user's most recent diet plan (or generates one if none exists)
router.get('/', protect, async (req, res) => {
  try {
    const mongoose = require('mongoose');
    let dietPlan = null;

    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      try {
        dietPlan = await DietPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      } catch (e) {
        console.warn('DietPlan find notice:', e.message);
      }
    }

    const userPref = req.user.dietaryPreference || 'Vegetarian';
    const planPref = dietPlan ? dietPlan.dietaryPreference : null;
    const isMismatch = !planPref || String(planPref).trim().toLowerCase() !== String(userPref).trim().toLowerCase();

    if (!dietPlan || isMismatch) {
      if (mongoose.connection && mongoose.connection.readyState >= 1) {
        await DietPlan.deleteMany({ user: req.user._id }).catch(() => {});
      }
      dietPlan = await _generateAndSave(req.user);
    }

    res.json({ success: true, dietPlan });
  } catch (error) {
    const fallback = _buildPlanObject(req.user);
    res.json({ success: true, dietPlan: fallback });
  }
});

// ─── POST /api/diet/generate ──────────────────────────────────────────────────
// Force regenerate diet plan (e.g. after profile update or preference switch)
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

      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState >= 1) {
        if (typeof req.user.save === 'function') {
          await req.user.save().catch(() => {});
        } else {
          const User = require('../models/User');
          await User.findByIdAndUpdate(req.user._id, {
            dietaryPreference: dp,
            ...(req.body.sport && { selectedSport: req.body.sport }),
            ...(req.body.fitnessGoal && { fitnessGoal: req.body.fitnessGoal })
          }).catch(() => {});
        }
      }
    }

    const mongoose = require('mongoose');
    if (mongoose.connection && mongoose.connection.readyState >= 1) {
      await DietPlan.deleteMany({ user: req.user._id }).catch(() => {});
    }
    const dietPlan = await _generateAndSave(req.user);

    res.status(201).json({
      success: true,
      message: '🥗 Your personalized diet plan has been generated!',
      dietPlan
    });
  } catch (error) {
    const fallback = _buildPlanObject(req.user);
    res.status(201).json({
      success: true,
      message: '🥗 Your personalized diet plan has been generated!',
      dietPlan: fallback
    });
  }
});

module.exports = router;
