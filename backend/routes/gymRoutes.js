const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Workout = require('../models/Workout');
const { calculateEstimatedCaloriesBurned, calculate1RM } = require('../utils/calculations');
const { getGymRecommendations } = require('../utils/recommendations');

// ─── GET /api/gym ─────────────────────────────────────────────────────────────
// Get all workout sessions (latest 20)
router.get('/', protect, async (req, res) => {
  try {
    const workouts = await Workout.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(20);

    res.json({ success: true, count: workouts.length, workouts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function normalizeMuscleGroup(input) {
  if (!input) return 'Chest';
  const val = String(input).trim();
  const valid = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Full Body'];
  if (valid.includes(val)) return val;
  const lower = val.toLowerCase();
  if (lower.includes('chest') || lower.includes('push')) return 'Chest';
  if (lower.includes('back') || lower.includes('pull')) return 'Back';
  if (lower.includes('leg') || lower.includes('quad') || lower.includes('squat') || lower.includes('hamstring') || lower.includes('calf')) return 'Legs';
  if (lower.includes('shoulder') || lower.includes('delt')) return 'Shoulders';
  if (lower.includes('arm') || lower.includes('bicep') || lower.includes('tricep')) return 'Arms';
  if (lower.includes('core') || lower.includes('abs')) return 'Core';
  return 'Full Body';
}

function normalizeIntensity(input) {
  if (!input) return 'High';
  const val = String(input).trim();
  const valid = ['Low', 'Moderate', 'High', 'Max'];
  if (valid.includes(val)) return val;
  const lower = val.toLowerCase();
  if (lower === 'medium') return 'Moderate';
  if (lower === 'intense') return 'High';
  return 'High';
}

// ─── POST /api/gym ────────────────────────────────────────────────────────────
// Log a new gym workout session
router.post('/', protect, async (req, res) => {
  try {
    const { exerciseName, muscleGroup, routine, sets, duration, intensity } = req.body;

    const validMuscle = normalizeMuscleGroup(muscleGroup);
    const validIntensity = normalizeIntensity(intensity);

    // Determine activity type for calorie calculation
    let activityType = 'gym_general';
    if (routine && routine.toLowerCase().includes('push')) activityType = 'gym_push';
    else if (routine && routine.toLowerCase().includes('pull')) activityType = 'gym_pull';
    else if (validMuscle === 'Legs') activityType = 'gym_legs';

    const burnCalc = calculateEstimatedCaloriesBurned(
      activityType,
      duration || 45,
      req.user.weight || 72,
      validIntensity
    );

    const normalizedSets = (sets || []).map((s, idx) => ({
      setNumber: s.setNumber || idx + 1,
      target: s.target || '',
      weight: s.weight !== undefined ? Number(s.weight) : (s.weightKg !== undefined ? Number(s.weightKg) : 0),
      reps: s.reps !== undefined ? Number(s.reps) : 0,
      completed: s.completed !== undefined ? s.completed : true
    }));

    const totalVolume = normalizedSets.reduce((sum, s) => s.completed ? sum + (s.weight * s.reps) : sum, 0);

    const workout = await Workout.create({
      user: req.user._id,
      exerciseName: exerciseName || 'Gym Workout',
      muscleGroup: validMuscle,
      routine: routine || 'Push Day',
      sets: normalizedSets.length > 0 ? normalizedSets : [{ setNumber: 1, target: '', weight: 60, reps: 10, completed: true }],
      totalVolume,
      duration: duration || 45,
      intensity: validIntensity,
      estimatedCaloriesBurned: req.body.calories || req.body.estimatedCaloriesBurned || burnCalc.estimatedCalories
    });

    res.status(201).json({
      success: true,
      message: `💪 Workout logged: ${workout.exerciseName}`,
      workout,
      calorieEstimate: burnCalc
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/gym/stats ───────────────────────────────────────────────────────
// Weekly + monthly stats and PRs for gym dashboard
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [weekWorkouts, monthWorkouts, allWorkouts] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: sevenDaysAgo } }),
      Workout.find({ user: userId, date: { $gte: thirtyDaysAgo } }),
      Workout.find({ user: userId }).sort({ date: -1 })
    ]);

    const weekVolume = weekWorkouts.reduce((s, w) => s + (w.totalVolume || 0), 0);
    const monthVolume = monthWorkouts.reduce((s, w) => s + (w.totalVolume || 0), 0);
    const weekCalories = weekWorkouts.reduce((s, w) => s + (w.estimatedCaloriesBurned || 0), 0);

    // Personal Records (highest weight × reps set for each exercise)
    const prMap = {};
    allWorkouts.forEach(workout => {
      workout.sets.forEach(set => {
        const key = workout.exerciseName;
        if (!prMap[key] || (set.weight * set.reps) > (prMap[key].weight * prMap[key].reps)) {
          prMap[key] = { weight: set.weight, reps: set.reps, volume: set.weight * set.reps };
        }
      });
    });

    // Weekly chart data (7 days)
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const dayWorkouts = weekWorkouts.filter(w => {
        const wd = new Date(w.date);
        return wd.toDateString() === d.toDateString();
      });
      weeklyChart.push({
        day: dayStr,
        volume: dayWorkouts.reduce((s, w) => s + (w.totalVolume || 0), 0),
        calories: dayWorkouts.reduce((s, w) => s + (w.estimatedCaloriesBurned || 0), 0)
      });
    }

    res.json({
      success: true,
      stats: {
        weekSessions: weekWorkouts.length,
        monthSessions: monthWorkouts.length,
        weekVolume,
        monthVolume,
        weekCalories,
        personalRecords: prMap
      },
      weeklyChart,
      recentWorkouts: allWorkouts.slice(0, 5)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/gym/calculate-1rm ─────────────────────────────────────────────
// Calculate 1RM from weight and reps
router.post('/calculate-1rm', protect, (req, res) => {
  try {
    const { weight, reps } = req.body;
    const result = calculate1RM(weight, reps);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/gym/recommendations ────────────────────────────────────────────
// AI-generated gym training recommendations
router.get('/recommendations', protect, async (req, res) => {
  try {
    const user = req.user;
    const recentWorkouts = await Workout.find({ user: user._id }).sort({ date: -1 }).limit(7);
    const recommendations = getGymRecommendations(user, recentWorkouts);
    res.json({ success: true, recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── DELETE /api/gym/:id ──────────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findOne({ _id: req.params.id, user: req.user._id });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found.' });
    }
    await workout.deleteOne();
    res.json({ success: true, message: 'Workout deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
