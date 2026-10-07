const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Progress = require('../models/Progress');
const { calculateBMI } = require('../utils/calculations');

// ─── GET /api/progress ────────────────────────────────────────────────────────
// Get progress history (last 30 entries)
router.get('/', protect, async (req, res) => {
  try {
    const records = await Progress.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(30);
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/progress ───────────────────────────────────────────────────────
// Log a daily progress entry
router.post('/', protect, async (req, res) => {
  try {
    const { weight, caloriesBurned, trainingDuration, workoutsCompleted,
      waterIntake, cricketMetrics, badmintonMetrics, gymMetrics } = req.body;

    const effectiveWeight = weight || req.user.weight;
    const bmiData = calculateBMI(effectiveWeight, req.user.height);

    const record = await Progress.create({
      user: req.user._id,
      weight: effectiveWeight,
      bmi: bmiData.bmi,
      caloriesBurned: caloriesBurned || 0,
      trainingDuration: trainingDuration || 0,
      workoutsCompleted: workoutsCompleted || 1,
      waterIntake: waterIntake || 0,
      cricketMetrics: cricketMetrics || {},
      badmintonMetrics: badmintonMetrics || {},
      gymMetrics: gymMetrics || {}
    });

    res.status(201).json({
      success: true,
      message: '📊 Progress entry logged successfully.',
      record
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/progress/chart ──────────────────────────────────────────────────
// Returns last 7 or 30 days of data formatted for Chart.js
router.get('/chart', protect, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const records = await Progress.find({ user: req.user._id, date: { $gte: since } })
      .sort({ date: 1 });

    const labels = records.map(r => new Date(r.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    const weights = records.map(r => r.weight);
    const calories = records.map(r => r.caloriesBurned);
    const bmis = records.map(r => r.bmi);

    res.json({
      success: true,
      chartData: { labels, weights, calories, bmis }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
