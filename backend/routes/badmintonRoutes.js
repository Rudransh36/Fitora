const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const BadmintonTraining = require('../models/BadmintonTraining');
const { calculateEstimatedCaloriesBurned } = require('../utils/calculations');
const { getBadmintonRecommendations } = require('../utils/recommendations');

// ─── GET /api/badminton ───────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await BadmintonTraining.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(20);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/badminton ──────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      trainingType, opponent, mode, scoreSummary, result,
      duration, intensity, smashes, unforcedErrors, avgRallyLength,
      footworkScore, agilityScore, flexibilityScore,
      speedScore, enduranceScore, strengthScore
    } = req.body;

    const incomingType = trainingType || req.body.type || 'Match';
    const validTrainingTypes = ['Match', 'Footwork Drills', 'Smash & Net Drills', 'Agility Drills', 'Recovery/Rest'];
    const safeTrainingType = validTrainingTypes.includes(incomingType) ? incomingType : 'Match';
    const safeIntensity = ['Low', 'Moderate', 'High', 'Intense'].includes(intensity) ? intensity : 'High';

    let actType = 'badminton_match';
    if (safeTrainingType === 'Footwork Drills' || safeTrainingType === 'Agility Drills') actType = 'badminton_drills';
    else if (safeTrainingType === 'Recovery/Rest') actType = 'badminton_casual';

    const burnCalc = calculateEstimatedCaloriesBurned(
      actType,
      duration || 45,
      req.user.weight || 72,
      safeIntensity
    );

    const session = await BadmintonTraining.create({
      user: req.user._id,
      trainingType: safeTrainingType,
      opponent: opponent || 'Opponent',
      mode: mode || 'Singles',
      scoreSummary: scoreSummary || '21-17',
      result: result || 'Win',
      duration: duration || 45,
      intensity: safeIntensity,
      smashes: smashes || 0,
      unforcedErrors: unforcedErrors || 0,
      avgRallyLength: avgRallyLength || 8,
      footworkScore: footworkScore || 80,
      agilityScore: agilityScore || 80,
      flexibilityScore: flexibilityScore || 78,
      speedScore: speedScore || 82,
      enduranceScore: enduranceScore || 79,
      strengthScore: strengthScore || 76,
      estimatedCaloriesBurned: req.body.calories || req.body.estimatedCaloriesBurned || burnCalc.estimatedCalories
    });

    res.status(201).json({
      success: true,
      message: `🏸 Badminton session logged: ${trainingType || 'Match'}`,
      session,
      calorieEstimate: burnCalc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/badminton/stats ─────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [allSessions, recentSessions] = await Promise.all([
      BadmintonTraining.find({ user: userId }).sort({ date: -1 }),
      BadmintonTraining.find({ user: userId, date: { $gte: sevenDaysAgo } })
    ]);

    const totalSmashes = allSessions.reduce((s, b) => s + (b.smashes || 0), 0);
    const wins = allSessions.filter(s => s.result === 'Win').length;
    const winRate = allSessions.length > 0 ? Math.round((wins / allSessions.length) * 100) : 0;

    const avgScores = {
      footwork: avg(allSessions, 'footworkScore'),
      agility: avg(allSessions, 'agilityScore'),
      flexibility: avg(allSessions, 'flexibilityScore'),
      speed: avg(allSessions, 'speedScore'),
      endurance: avg(allSessions, 'enduranceScore'),
      strength: avg(allSessions, 'strengthScore')
    };

    // Weekly chart
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const daySessions = recentSessions.filter(s => new Date(s.date).toDateString() === d.toDateString());
      weeklyChart.push({
        day: dayStr,
        smashes: daySessions.reduce((s, b) => s + (b.smashes || 0), 0),
        calories: daySessions.reduce((s, b) => s + (b.estimatedCaloriesBurned || 0), 0),
        agility: daySessions.length > 0 ? avg(daySessions, 'agilityScore') : 0
      });
    }

    res.json({
      success: true,
      stats: {
        totalSessions: allSessions.length,
        totalSmashes, wins, winRate, avgScores,
        totalCalories: allSessions.reduce((s, b) => s + (b.estimatedCaloriesBurned || 0), 0)
      },
      weeklyChart,
      recentSessions: allSessions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/badminton/recommendations ──────────────────────────────────────
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    const recentSessions = await BadmintonTraining.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const recommendations = getBadmintonRecommendations(user, recentSessions);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/badminton/:id ────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await BadmintonTraining.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    await session.deleteOne();
    res.json({ success: true, message: 'Badminton session deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: average of a numeric field from an array
function avg(arr, field) {
  if (!arr.length) return 0;
  return Math.round(arr.reduce((s, x) => s + (x[field] || 0), 0) / arr.length);
}

module.exports = router;
