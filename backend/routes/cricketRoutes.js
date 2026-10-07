const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CricketTraining = require('../models/CricketTraining');
const { calculateEstimatedCaloriesBurned } = require('../utils/calculations');
const { getCricketRecommendations } = require('../utils/recommendations');

// ─── GET /api/cricket ─────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const sessions = await CricketTraining.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(20);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/cricket ────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      sessionType, opponent, format, venue, result,
      runs, balls, fours, sixes, notOut,
      overs, maidens, runsConceded, wickets,
      distanceRun, sprintSpeed, trainingDuration, intensity,
      weightLogged, steps, sleepDuration,
      agilityRating, enduranceRating, strengthRating
    } = req.body;

    const incomingType = sessionType || req.body.type || 'Match';
    const validSessionTypes = ['Match', 'Net Practice', 'Conditioning', 'Agility & Sprint', 'Mobility & Recovery'];
    const safeSessionType = validSessionTypes.includes(incomingType) ? incomingType : 'Match';
    const safeIntensity = ['Low', 'Moderate', 'High', 'Intense'].includes(intensity) ? intensity : 'High';

    // Calorie estimate based on session type
    let actType = 'cricket_match';
    if (safeSessionType === 'Net Practice') actType = 'cricket_nets';
    else if (safeSessionType === 'Conditioning' || safeSessionType === 'Agility & Sprint') actType = 'cricket_running';

    const burnCalc = calculateEstimatedCaloriesBurned(
      actType,
      trainingDuration || req.body.duration || 90,
      req.user.weight || 72,
      safeIntensity
    );

    const session = await CricketTraining.create({
      user: req.user._id,
      sessionType: safeSessionType,
      opponent: opponent || 'Practice Match',
      format: format || 'T20',
      venue: venue || 'Club Ground',
      result: result || 'Completed',
      runs: runs || 0, balls: balls || 0,
      fours: fours || 0, sixes: sixes || 0,
      notOut: notOut || false,
      overs: overs || 0, maidens: maidens || 0,
      runsConceded: runsConceded || 0, wickets: wickets || 0,
      distanceRun: distanceRun || 4.5,
      sprintSpeed: sprintSpeed || 28.0,
      trainingDuration: trainingDuration || req.body.duration || 90,
      intensity: safeIntensity,
      estimatedCaloriesBurned: req.body.calories || req.body.estimatedCaloriesBurned || burnCalc.estimatedCalories,
      weightLogged, steps: steps || 8500,
      sleepDuration: sleepDuration || 7.5,
      agilityRating: agilityRating || 80,
      enduranceRating: enduranceRating || 82,
      strengthRating: strengthRating || 75
    });

    res.status(201).json({
      success: true,
      message: `🏏 Cricket session logged: ${sessionType || 'Match'}`,
      session,
      calorieEstimate: burnCalc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/cricket/stats ───────────────────────────────────────────────────
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [allSessions, recentSessions] = await Promise.all([
      CricketTraining.find({ user: userId }).sort({ date: -1 }),
      CricketTraining.find({ user: userId, date: { $gte: sevenDaysAgo } })
    ]);

    const totalRuns = allSessions.reduce((s, c) => s + (c.runs || 0), 0);
    const totalWickets = allSessions.reduce((s, c) => s + (c.wickets || 0), 0);
    const avgRunsPerMatch = allSessions.length > 0 ? Math.round(totalRuns / allSessions.length) : 0;
    const totalDistance = allSessions.reduce((s, c) => s + (c.distanceRun || 0), 0);
    const avgSprintSpeed = allSessions.length > 0
      ? parseFloat((allSessions.reduce((s, c) => s + (c.sprintSpeed || 0), 0) / allSessions.length).toFixed(1))
      : 0;
    const avgSleep = allSessions.length > 0
      ? parseFloat((allSessions.reduce((s, c) => s + (c.sleepDuration || 7.5), 0) / allSessions.length).toFixed(1))
      : 7.5;

    // Weekly performance chart
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const daySessions = recentSessions.filter(s => new Date(s.date).toDateString() === d.toDateString());
      weeklyChart.push({
        day: dayStr,
        runs: daySessions.reduce((s, c) => s + (c.runs || 0), 0),
        distance: daySessions.reduce((s, c) => s + (c.distanceRun || 0), 0),
        calories: daySessions.reduce((s, c) => s + (c.estimatedCaloriesBurned || 0), 0)
      });
    }

    res.json({
      success: true,
      stats: {
        totalSessions: allSessions.length,
        totalRuns, totalWickets, avgRunsPerMatch,
        totalDistance: parseFloat(totalDistance.toFixed(1)),
        avgSprintSpeed, avgSleep,
        wins: allSessions.filter(s => s.result === 'Win').length
      },
      weeklyChart,
      recentSessions: allSessions.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/cricket/recommendations ────────────────────────────────────────
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    const recentSessions = await CricketTraining.find({ user: user._id }).sort({ date: -1 }).limit(5);
    const recommendations = getCricketRecommendations(user, recentSessions);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/cricket/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const session = await CricketTraining.findOne({ _id: req.params.id, user: req.user._id });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    await session.deleteOne();
    res.json({ success: true, message: 'Cricket session deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
