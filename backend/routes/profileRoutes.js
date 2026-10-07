const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const WaterIntake = require('../models/WaterIntake');
const DietPlan = require('../models/DietPlan');
const { generateDietPlan } = require('../utils/recommendations');
const { calculateBMI, calculateTDEE, calculateDailyWaterTarget } = require('../utils/calculations');

// ─── GET /api/profile ─────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const user = req.user;
    const bmi = calculateBMI(user.weight, user.height);
    const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel, user.fitnessGoal);
    const dailyWater = calculateDailyWaterTarget(user.weight, user.activityLevel);

    res.json({
      success: true,
      profile: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        fitnessGoal: user.fitnessGoal,
        selectedSport: user.selectedSport,
        dietaryPreference: user.dietaryPreference,
        streakDays: user.streakDays,
        restingHeartRate: user.restingHeartRate || null,
        foodsToAvoid: user.foodsToAvoid || [],
        allergies: user.allergies || ''
      },
      biometrics: {
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        bmr: tdee.bmr,
        tdee: tdee.tdee,
        targetCalories: tdee.targetCalories,
        dailyWaterMl: dailyWater,
        goalNote: tdee.goalAdjustmentNote
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/profile ─────────────────────────────────────────────────────────
router.put('/', protect, async (req, res) => {
  try {
    const allowedFields = [
      'name', 'age', 'gender', 'height', 'weight',
      'activityLevel', 'fitnessGoal', 'selectedSport',
      'dietaryPreference', 'avatar', 'restingHeartRate',
      'foodsToAvoid', 'allergies'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.dietaryPreference) {
      const dp = String(updates.dietaryPreference).trim().toLowerCase();
      if (dp === 'vegetarian') updates.dietaryPreference = 'Vegetarian';
      else if (dp === 'eggetarian') updates.dietaryPreference = 'Eggetarian';
      else if (dp === 'non-vegetarian' || dp === 'nonvegetarian' || dp === 'non veg') updates.dietaryPreference = 'Non-Vegetarian';
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    const bmi = calculateBMI(user.weight, user.height);
    const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel, user.fitnessGoal);
    const dailyWater = calculateDailyWaterTarget(user.weight, user.activityLevel);

    // ── Auto-regenerate diet plan when relevant fields change ─────────────────
    const dietRelevantFields = ['dietaryPreference', 'fitnessGoal', 'selectedSport', 'weight', 'activityLevel'];
    const dietFieldChanged = dietRelevantFields.some(f => updates[f] !== undefined);
    if (dietFieldChanged) {
      try {
        await DietPlan.deleteMany({ user: user._id });
        const planData = generateDietPlan({
          targetCalories: tdee.targetCalories,
          sport: user.selectedSport || 'Gym',
          fitnessGoal: user.fitnessGoal || 'General fitness',
          dietaryPreference: user.dietaryPreference || 'Vegetarian',
          weight: user.weight,
          activityLevel: user.activityLevel
        });
        await DietPlan.create({
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
      } catch (dietErr) {
        console.warn('Diet auto-regeneration warning:', dietErr.message);
      }
    }

    // Update stored user in response so frontend can cache it
    const updatedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      age: user.age,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      activityLevel: user.activityLevel,
      fitnessGoal: user.fitnessGoal,
      selectedSport: user.selectedSport,
      dietaryPreference: user.dietaryPreference,
      streakDays: user.streakDays,
      restingHeartRate: user.restingHeartRate || null,
      foodsToAvoid: user.foodsToAvoid || [],
      allergies: user.allergies || ''
    };

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: updatedUser,
      biometrics: {
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        bmr: tdee.bmr,
        tdee: tdee.tdee,
        targetCalories: tdee.targetCalories,
        dailyWaterMl: dailyWater
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/profile/biometrics ──────────────────────────────────────────────
// Returns computed biometric data (BMI, BMR, TDEE, water target, resting HR)
router.get('/biometrics', protect, async (req, res) => {
  try {
    const user = req.user;
    const bmi = calculateBMI(user.weight, user.height);
    const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel, user.fitnessGoal);
    const dailyWater = calculateDailyWaterTarget(user.weight, user.activityLevel);

    const hasBodyData = user.height > 0 && user.weight > 0;

    res.json({
      success: true,
      hasBodyData,
      biometrics: {
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        bmr: tdee.bmr,
        tdee: tdee.tdee,
        targetCalories: tdee.targetCalories,
        dailyWaterMl: dailyWater,
        activityLevel: user.activityLevel,
        fitnessGoal: user.fitnessGoal,
        restingHeartRate: user.restingHeartRate || null,
        goalNote: tdee.goalAdjustmentNote,
        notice: 'BMI is a general screening metric, not a clinical diagnosis. Consult a healthcare professional for medical advice.'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/profile/biometrics ──────────────────────────────────────────────
// Update resting heart rate (manually entered by user)
router.put('/biometrics', protect, async (req, res) => {
  try {
    const { restingHeartRate } = req.body;

    if (restingHeartRate !== undefined) {
      const hr = parseInt(restingHeartRate);
      if (isNaN(hr) || hr < 30 || hr > 200) {
        return res.status(400).json({
          success: false,
          message: 'Resting heart rate must be between 30 and 200 bpm.'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { restingHeartRate: parseInt(restingHeartRate) } },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Resting heart rate saved.',
      restingHeartRate: user.restingHeartRate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/profile/water ───────────────────────────────────────────────────
// Get today's water intake record
router.get('/water', protect, async (req, res) => {
  try {
    const user = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = calculateDailyWaterTarget(user.weight, user.activityLevel);

    let record = await WaterIntake.findOne({
      user: user._id,
      date: today
    });

    if (!record) {
      record = await WaterIntake.create({
        user: user._id,
        date: today,
        targetAmount: target,
        consumedAmount: 0,
        logs: []
      });
    }

    res.json({
      success: true,
      water: {
        targetAmount: record.targetAmount,
        consumedAmount: record.consumedAmount,
        remainingAmount: Math.max(0, record.targetAmount - record.consumedAmount),
        percentageCompleted: record.percentageCompleted,
        logs: record.logs,
        date: record.date
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/profile/water ──────────────────────────────────────────────────
// Add water intake entry
router.post('/water', protect, async (req, res) => {
  try {
    const { amount } = req.body;
    const ml = parseInt(amount);

    if (!ml || ml <= 0 || ml > 5000) {
      return res.status(400).json({ success: false, message: 'Water amount must be between 1 and 5000 ml.' });
    }

    const user = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = calculateDailyWaterTarget(user.weight, user.activityLevel);

    let record = await WaterIntake.findOne({ user: user._id, date: today });

    if (!record) {
      record = new WaterIntake({
        user: user._id,
        date: today,
        targetAmount: target,
        consumedAmount: 0,
        logs: []
      });
    }

    record.consumedAmount += ml;
    record.logs.push({ amount: ml, time: new Date() });
    await record.save();

    res.json({
      success: true,
      message: `Added ${ml} ml. Keep hydrating! 💧`,
      water: {
        targetAmount: record.targetAmount,
        consumedAmount: record.consumedAmount,
        remainingAmount: Math.max(0, record.targetAmount - record.consumedAmount),
        percentageCompleted: record.percentageCompleted,
        logs: record.logs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/profile/water ────────────────────────────────────────────────
// Reset today's water intake
router.delete('/water', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await WaterIntake.findOneAndDelete({ user: req.user._id, date: today });
    res.json({ success: true, message: 'Today\'s water intake has been reset.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/profile/water/history ───────────────────────────────────────────
// Last 7 days of water intake records
router.get('/water/history', protect, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const records = await WaterIntake.find({
      user: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    res.json({ success: true, history: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
