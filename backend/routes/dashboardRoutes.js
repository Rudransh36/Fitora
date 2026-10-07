const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Workout = require('../models/Workout');
const CricketTraining = require('../models/CricketTraining');
const BadmintonTraining = require('../models/BadmintonTraining');
const WaterIntake = require('../models/WaterIntake');
const CalendarEvent = require('../models/CalendarEvent');
const { calculateBMI, calculateTDEE, calculateDailyWaterTarget } = require('../utils/calculations');

// ─── GET /api/dashboard ───────────────────────────────────────────────────────
// Aggregates KPI data for the dashboard homepage with range support ('today', 'this-week', 'this-month')
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;
    const range = req.query.range || 'today';

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let rangeStart;
    let rangeEnd = new Date(endOfToday.getTime() + 24 * 60 * 60 * 1000); // 24-hr buffer for clock/tz skew
    let rangeLabel = 'Today';

    if (range === 'this-month') {
      rangeStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      rangeLabel = 'This Month';
    } else if (range === 'this-week') {
      // this-week: last 7 days
      rangeStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      rangeLabel = 'This Week';
    } else {
      // today: default
      rangeStart = startOfToday;
      rangeLabel = 'Today';
    }

    // Parallel queries scoped strictly to this userId
    const [
      rangeWorkouts,
      cricketSessions,
      badmintonSessions,
      todayWaterDoc,
      calendarEvents
    ] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      CricketTraining.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      BadmintonTraining.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      WaterIntake.findOne({ user: userId, date: { $gte: startOfToday, $lte: endOfToday } }),
      CalendarEvent.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } })
    ]);

    // ── Calories — strictly from real records, zero if no data ──────────────────
    const gymCalories = rangeWorkouts.reduce((s, w) => s + (w.estimatedCaloriesBurned || 0), 0);
    const cricketCalories = cricketSessions.reduce((s, c) => s + (c.estimatedCaloriesBurned || 0), 0);
    const badmintonCalories = badmintonSessions.reduce((s, b) => s + (b.estimatedCaloriesBurned || 0), 0);
    const totalCaloriesBurned = gymCalories + cricketCalories + badmintonCalories;

    // ── Duration (minutes) — zero if field missing ───────────────────────────────
    const gymDuration = rangeWorkouts.reduce((s, w) => s + (w.duration || 0), 0);
    const cricketDuration = cricketSessions.reduce((s, c) => s + (c.trainingDuration || c.duration || 0), 0);
    const badmintonDuration = badmintonSessions.reduce((s, b) => s + (b.duration || 0), 0);
    const totalDurationMinutes = gymDuration + cricketDuration + badmintonDuration;

    // ── Session counts — real count only ────────────────────────────────────────
    const totalWorkouts = rangeWorkouts.length + cricketSessions.length + badmintonSessions.length;
    const todaySessionsCount = range === 'today'
      ? totalWorkouts
      : (
          rangeWorkouts.filter(w => new Date(w.date) >= startOfToday && new Date(w.date) <= endOfToday).length +
          cricketSessions.filter(c => new Date(c.date) >= startOfToday && new Date(c.date) <= endOfToday).length +
          badmintonSessions.filter(b => new Date(b.date) >= startOfToday && new Date(b.date) <= endOfToday).length
        );

    // ── Biometrics ────────────────────────────────────────────────────────────────
    const bmi = calculateBMI(user.weight, user.height);
    const tdee = calculateTDEE(user.weight, user.height, user.age, user.gender, user.activityLevel, user.fitnessGoal);
    const dailyWaterTarget = calculateDailyWaterTarget(user.weight, user.activityLevel);
    const waterConsumedToday = todayWaterDoc ? todayWaterDoc.consumedAmount : 0;

    // ── Active days in range ──────────────────────────────────────────────────────
    const activeDaySet = new Set([
      ...rangeWorkouts.map(w => new Date(w.date).toDateString()),
      ...cricketSessions.map(c => new Date(c.date).toDateString()),
      ...badmintonSessions.map(b => new Date(b.date).toDateString())
    ]);
    const activeDays = activeDaySet.size;

    // ── Consistency & completion — derived from real activity, no hardcoded values ─
    let completionPercentage = 0;
    let consistencyText = 'No activity yet';
    let performanceTrendText = 'Start training to see trends';
    let avgPerformance = 0;

    if (range === 'today') {
      completionPercentage = totalWorkouts >= 1 ? 100 : 0;
      consistencyText = totalWorkouts > 0 ? 'Active Today' : 'Rest Day';
      performanceTrendText = totalWorkouts > 0 ? 'Active Session' : 'No session today';
      avgPerformance = totalWorkouts > 0
        ? Math.min(100, Math.round((totalCaloriesBurned / Math.max(1, tdee.targetCalories * 0.3)) * 100))
        : 0;
    } else if (range === 'this-week') {
      const targetDays = 5;
      completionPercentage = Math.min(100, Math.round((activeDays / targetDays) * 100));
      consistencyText = activeDays > 0
        ? `${Math.round((activeDays / 7) * 100)}% (${activeDays}/7 days)`
        : 'No sessions this week';
      performanceTrendText = activeDays > 0
        ? `${activeDays} active day${activeDays > 1 ? 's' : ''} this week`
        : 'No activity recorded';
      avgPerformance = totalWorkouts > 0
        ? Math.min(100, Math.round((totalCaloriesBurned / Math.max(1, tdee.targetCalories * 2)) * 100))
        : 0;
    } else if (range === 'this-month') {
      const daysSoFar = now.getDate();
      const targetActiveDays = Math.round(daysSoFar * 0.7);
      completionPercentage = Math.min(100, Math.round((activeDays / Math.max(1, targetActiveDays)) * 100));
      consistencyText = activeDays > 0
        ? `${Math.round((activeDays / Math.max(1, daysSoFar)) * 100)}% (${activeDays}/${daysSoFar} days)`
        : 'No sessions this month';
      performanceTrendText = activeDays > 0
        ? `${activeDays} active day${activeDays > 1 ? 's' : ''} this month`
        : 'No activity recorded';
      avgPerformance = totalWorkouts > 0
        ? Math.min(100, Math.round((totalCaloriesBurned / Math.max(1, tdee.targetCalories * 8)) * 100))
        : 0;
    }

    // ── Real Chart Data: aggregate actual calories/minutes per time bucket ────────
    let chartLabels = [];
    let chartCalories = [];
    let chartMinutes = [];

    const allSessions = [
      ...rangeWorkouts.map(s => ({ date: s.date, cal: s.estimatedCaloriesBurned || 0, dur: s.duration || 0 })),
      ...cricketSessions.map(s => ({ date: s.date, cal: s.estimatedCaloriesBurned || 0, dur: s.trainingDuration || s.duration || 0 })),
      ...badmintonSessions.map(s => ({ date: s.date, cal: s.estimatedCaloriesBurned || 0, dur: s.duration || 0 }))
    ];

    if (range === 'today') {
      chartLabels = ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'];
      chartCalories = [0, 0, 0, 0, 0, 0];
      chartMinutes = [0, 0, 0, 0, 0, 0];
      allSessions.forEach(s => {
        const hour = new Date(s.date).getHours();
        const bucket = Math.min(5, Math.floor(hour / 4));
        chartCalories[bucket] += s.cal;
        chartMinutes[bucket] += s.dur;
      });
    } else if (range === 'this-week') {
      chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      chartCalories = [0, 0, 0, 0, 0, 0, 0];
      chartMinutes = [0, 0, 0, 0, 0, 0, 0];
      allSessions.forEach(s => {
        const dayOfWeek = new Date(s.date).getDay(); // 0=Sun
        const idx = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon→0, Sun→6
        chartCalories[idx] += s.cal;
        chartMinutes[idx] += s.dur;
      });
    } else {
      chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      chartCalories = [0, 0, 0, 0];
      chartMinutes = [0, 0, 0, 0];
      allSessions.forEach(s => {
        const dayOfMonth = new Date(s.date).getDate();
        const weekIdx = Math.min(3, Math.floor((dayOfMonth - 1) / 7));
        chartCalories[weekIdx] += s.cal;
        chartMinutes[weekIdx] += s.dur;
      });
    }

    // ── Recent activity — from real DB records only ───────────────────────────────
    const recentActivity = {
      gymSessions: rangeWorkouts.slice(0, 15).map(w => ({
        exercise: w.exerciseName,
        muscle: w.muscleGroup,
        volume: w.totalVolume,
        calories: w.estimatedCaloriesBurned,
        date: w.date
      })),
      cricketSessions: cricketSessions.slice(0, 15).map(c => ({
        type: c.sessionType,
        runs: c.runs,
        wickets: c.wickets,
        distance: c.distanceRun,
        calories: c.estimatedCaloriesBurned,
        date: c.date
      })),
      badmintonSessions: badmintonSessions.slice(0, 15).map(b => ({
        type: b.trainingType,
        result: b.result,
        smashes: b.smashes,
        duration: b.duration,
        calories: b.estimatedCaloriesBurned,
        date: b.date
      }))
    };

    res.json({
      success: true,
      range,
      rangeLabel,
      kpis: {
        dailyCaloriesBurned: totalCaloriesBurned,
        targetCalories: range === 'today' ? tdee.targetCalories : tdee.targetCalories * 7,
        totalWorkouts,
        todaySessionsCount,
        todayWorkouts: todaySessionsCount,
        weeklyWorkouts: totalWorkouts,
        totalDurationMinutes,
        totalDurationFormatted: totalDurationMinutes > 0
          ? `${Math.floor(totalDurationMinutes / 60)}h ${totalDurationMinutes % 60}m`
          : '0h 0m',
        waterConsumedMl: waterConsumedToday,
        waterTargetMl: dailyWaterTarget,
        completionPercentage,
        consistencyText,
        performanceTrendText,
        avgPerformance,
        bmi: bmi.bmi,
        bmiCategory: bmi.category,
        bmr: tdee.bmr,
        tdee: tdee.tdee,
        dailyWaterMl: dailyWaterTarget,
        recoveryScore: 0,
        streakDays: user.streakDays || 0
      },
      recentActivity,
      chartData: {
        labels: chartLabels,
        calories: chartCalories,
        minutes: chartMinutes
      },
      sportSplit: {
        gym: (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length) > 0
          ? Math.round((rangeWorkouts.length / (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length)) * 100)
          : 0,
        cricket: (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length) > 0
          ? Math.round((cricketSessions.length / (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length)) * 100)
          : 0,
        badminton: (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length) > 0
          ? Math.max(0, 100 - Math.round((rangeWorkouts.length / (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length)) * 100) - Math.round((cricketSessions.length / (rangeWorkouts.length + cricketSessions.length + badmintonSessions.length)) * 100))
          : 0,
        total: rangeWorkouts.length + cricketSessions.length + badmintonSessions.length
      },
      user: {
        name: user.name,
        avatar: user.avatar,
        selectedSport: user.selectedSport,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Dashboard Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
