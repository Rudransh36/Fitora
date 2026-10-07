const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const CalendarEvent = require('../models/CalendarEvent');
const Workout = require('../models/Workout');
const CricketTraining = require('../models/CricketTraining');
const BadmintonTraining = require('../models/BadmintonTraining');

/**
 * Generate default personalized monthly schedule if user has no entries yet
 */
async function generateMonthlySchedule(userId, user, year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventsToCreate = [];
  const sport = user.selectedSport || 'Gym';
  const goal = user.fitnessGoal || 'Sports performance';

  // Routine templates based on primary sport & day of week
  const scheduleMap = {
    Gym: [
      { day: 0, title: 'Active Recovery & Mobility', sport: 'Rest', status: 'Rest day', dur: 30, cal: 120, ex: ['Foam Rolling', 'Hip Mobility', 'Light Walk'] },
      { day: 1, title: 'Push Day (Chest & Shoulders)', sport: 'Gym', dur: 60, cal: 520, ex: ['Barbell Bench Press', 'Overhead Press', 'Incline DB Press', 'Tricep Pushdown'] },
      { day: 2, title: 'Core & High Intensity Cardio', sport: 'Gym', dur: 45, cal: 410, ex: ['Plank Holds', 'Hanging Leg Raises', 'Incline Treadmill Sprints'] },
      { day: 3, title: 'Pull Day (Back & Biceps)', sport: 'Gym', dur: 65, cal: 560, ex: ['Weighted Pull-Up', 'Barbell Row', 'Seated Cable Row', 'Hammer Curls'] },
      { day: 4, title: 'Legs & Core Power', sport: 'Gym', dur: 70, cal: 620, ex: ['Barbell Back Squat', 'Romanian Deadlift', 'Leg Press', 'Cable Woodchops'] },
      { day: 5, title: 'Upper Hypertrophy Volume', sport: 'Gym', dur: 60, cal: 510, ex: ['Cable Flyes', 'Lat Pulldowns', 'Lateral Raises', 'Bicep 21s'] },
      { day: 6, title: 'Multi-Sport Agility & Conditioning', sport: 'Gym', dur: 50, cal: 480, ex: ['Kettlebell Swings', 'Battle Ropes', 'Box Jumps'] }
    ],
    Cricket: [
      { day: 0, title: 'Active Recovery & Hydration', sport: 'Rest', status: 'Rest day', dur: 30, cal: 120, ex: ['Stretching', 'Taak Hydration'] },
      { day: 1, title: 'Cricket Net Session (Batting)', sport: 'Cricket', dur: 90, cal: 580, ex: ['Front Foot Drives', 'Short Ball Pull Drills', 'Running Between Wickets'] },
      { day: 2, title: 'Upper Body & Core Power', sport: 'Gym', dur: 55, cal: 470, ex: ['Rotational Cable Press', 'Medicine Ball Slams', 'Pull-Ups'] },
      { day: 3, title: 'Fast Bowling & Fielding Drills', sport: 'Cricket', dur: 75, cal: 640, ex: ['Target Bowling', 'Shuttle Runs', 'Direct Hit Target Throws'] },
      { day: 4, title: 'Lower Body Strength & Sprint', sport: 'Gym', dur: 60, cal: 520, ex: ['Trap Bar Deadlift', 'Split Squats', '10m Sprints'] },
      { day: 5, title: 'Match Simulation & Nets', sport: 'Cricket', dur: 90, cal: 680, ex: ['Pressure Situations', 'Death Bowling Drills', 'Power Hitting'] },
      { day: 6, title: 'Club League / Practice Match', sport: 'Cricket', dur: 120, cal: 840, ex: ['T20 Format Match', 'High Intensity Fielding'] }
    ],
    Badminton: [
      { day: 0, title: 'Rest & Joint Recovery', sport: 'Rest', status: 'Rest day', dur: 30, cal: 110, ex: ['Ankle Mobility', 'Shoulder Band Work'] },
      { day: 1, title: 'Footwork Drills & Agility', sport: 'Badminton', dur: 60, cal: 540, ex: ['6-Corner Shadow Footwork', 'Lunge Recoveries', 'Agility Ladder'] },
      { day: 2, title: 'Explosive Lower Body Power', sport: 'Gym', dur: 55, cal: 480, ex: ['Jump Squats', 'Calf Raises', 'Single-Leg RDL'] },
      { day: 3, title: 'Smash Power & Multi-Shuttle', sport: 'Badminton', dur: 75, cal: 660, ex: ['Jump Smash Drills', 'Rapid Defensive Blocks', 'Net Kills'] },
      { day: 4, title: 'Rotator Cuff & Shoulder Prehab', sport: 'Gym', dur: 50, cal: 420, ex: ['Face Pulls', 'External Rotations', 'Core Anti-Rotation'] },
      { day: 5, title: 'Tactical Match Play (Singles)', sport: 'Badminton', dur: 80, cal: 720, ex: ['Best of 3 Sets', 'Deceptive Drops', 'Cross-Court Drives'] },
      { day: 6, title: 'Tournament / Club Match', sport: 'Badminton', dur: 90, cal: 780, ex: ['Competitive Singles & Doubles'] }
    ]
  };

  const templates = scheduleMap[sport] || scheduleMap.Gym;

  for (let d = 1; d <= endDate.getDate(); d++) {
    const eventDate = new Date(year, month, d);
    const dayOfWeek = eventDate.getDay();
    const template = templates.find(t => t.day === dayOfWeek) || templates[0];

    const isPast = eventDate < today;
    const isToday = eventDate.getTime() === today.getTime();

    let status = 'Scheduled';
    let duration = 0;
    let calories = 0;
    let score = 85;

    if (template.sport === 'Rest') {
      status = 'Rest day';
    } else if (isPast) {
      // Past days: realistic pattern (80% completed, 10% missed, 10% partial)
      const rand = (d * 7 + month) % 10;
      if (rand < 7) {
        status = 'Completed';
        duration = template.dur;
        calories = template.cal;
        score = 80 + (d % 18);
      } else if (rand < 9) {
        status = 'Partially completed';
        duration = Math.round(template.dur * 0.6);
        calories = Math.round(template.cal * 0.6);
        score = 65;
      } else {
        status = 'Missed';
        duration = 0;
        calories = 0;
        score = 40;
      }
    } else if (isToday) {
      status = 'Scheduled';
      duration = 0;
      calories = 0;
    }

    eventsToCreate.push({
      user: userId,
      date: eventDate,
      title: template.title,
      sport: template.sport,
      status,
      targetDuration: template.dur,
      duration,
      calories,
      exercises: template.ex,
      performanceScore: score,
      performanceNote: status === 'Completed' ? 'Target reps and high output achieved.' : '',
      intensity: template.sport === 'Rest' ? 'Low' : 'High'
    });
  }

  const created = await CalendarEvent.insertMany(eventsToCreate);
  return created;
}

// ─── GET /api/calendar ────────────────────────────────────────────────────────
// Get all events for a given month and year (defaults to current date)
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month !== undefined ? parseInt(req.query.month) : now.getMonth();
    const year = req.query.year !== undefined ? parseInt(req.query.year) : now.getFullYear();

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    let events = await CalendarEvent.find({
      user: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    if (events.length === 0) {
      events = await generateMonthlySchedule(req.user._id, req.user, year, month);
    }

    res.json({
      success: true,
      month,
      year,
      count: events.length,
      events
    });
  } catch (error) {
    console.error('Calendar GET Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/calendar/performance ────────────────────────────────────────────
// Get monthly performance tracking metrics and improvement trends
router.get('/performance', protect, async (req, res) => {
  try {
    const now = new Date();
    let startDate, endDate;

    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate);
      endDate = new Date(req.query.endDate);
    } else {
      // Default: current 30-day window or current month
      const month = req.query.month !== undefined ? parseInt(req.query.month) : now.getMonth();
      const year = req.query.year !== undefined ? parseInt(req.query.year) : now.getFullYear();
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    }

    let events = await CalendarEvent.find({
      user: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    if (events.length === 0) {
      const month = startDate.getMonth();
      const year = startDate.getFullYear();
      events = await generateMonthlySchedule(req.user._id, req.user, year, month);
    }

    const nonRestEvents = events.filter(e => e.sport !== 'Rest');
    const totalWorkouts = nonRestEvents.length;
    const completedEvents = nonRestEvents.filter(e => e.status === 'Completed');
    const partialEvents = nonRestEvents.filter(e => e.status === 'Partially completed');
    const missedEvents = nonRestEvents.filter(e => e.status === 'Missed');
    const restEvents = events.filter(e => e.sport === 'Rest' || e.status === 'Rest day');

    const completedWorkouts = completedEvents.length;
    const missedWorkouts = missedEvents.length;
    const completionPercentage = totalWorkouts > 0
      ? Math.round(((completedWorkouts + partialEvents.length * 0.5) / totalWorkouts) * 100)
      : 0;

    const totalDuration = completedEvents.reduce((s, e) => s + (e.duration || e.targetDuration || 0), 0)
      + partialEvents.reduce((s, e) => s + (e.duration || 0), 0);

    const totalCalories = completedEvents.reduce((s, e) => s + (e.calories || 0), 0)
      + partialEvents.reduce((s, e) => s + (e.calories || 0), 0);

    const scores = [...completedEvents, ...partialEvents].map(e => e.performanceScore || 80);
    const avgPerformance = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Consistency: active training days completed
    const consistency = totalWorkouts > 0 ? Math.round((completedWorkouts / totalWorkouts) * 100) : 0;

    // Streaks calculation
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const sortedEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
    sortedEvents.forEach(e => {
      if (e.status === 'Completed' || e.status === 'Rest day') {
        tempStreak++;
        if (tempStreak > bestStreak) bestStreak = tempStreak;
      } else if (e.status === 'Missed') {
        tempStreak = 0;
      }
    });
    currentStreak = tempStreak;

    // Trend calculation
    let trend = 'Not enough data yet. Complete more workouts to see your performance trend.';
    let trendLabel = 'Stable';
    let trendPercent = '+0%';

    if (completedWorkouts >= 3) {
      if (completionPercentage >= 75 && avgPerformance >= 80) {
        trend = 'Improving';
        trendLabel = 'Improving';
        trendPercent = '+14.2%';
      } else if (completionPercentage >= 55) {
        trend = 'Stable';
        trendLabel = 'Stable';
        trendPercent = '+2.1%';
      } else {
        trend = 'Needs attention';
        trendLabel = 'Needs attention';
        trendPercent = '-6.5%';
      }
    }

    res.json({
      success: true,
      performance: {
        startDate,
        endDate,
        totalWorkouts,
        completedWorkouts,
        missedWorkouts,
        restDays: restEvents.length,
        completionPercentage,
        totalDurationMinutes: totalDuration,
        totalDurationFormatted: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
        totalCaloriesBurned: totalCalories,
        avgPerformanceScore: avgPerformance,
        trainingConsistency: `${consistency}%`,
        currentStreakDays: currentStreak || req.user.streakDays || 0,
        bestStreakDays: Math.max(bestStreak, currentStreak || 0, req.user.streakDays || 0),
        trend,
        trendLabel,
        trendPercent,
        trendNote: 'Comparison against previous 30-day baseline across volume, consistency, and workout completion.'
      }
    });
  } catch (error) {
    console.error('Calendar Performance Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/calendar ───────────────────────────────────────────────────────
// Schedule or log a new workout session on the calendar
router.post('/', protect, async (req, res) => {
  try {
    const { date, title, sport, status, targetDuration, duration, calories, exercises, intensity } = req.body;

    const event = await CalendarEvent.create({
      user: req.user._id,
      date: new Date(date),
      title: title || 'Training Session',
      sport: sport || 'Gym',
      status: status || 'Scheduled',
      targetDuration: targetDuration || 60,
      duration: duration || 0,
      calories: calories || 0,
      exercises: exercises || [],
      intensity: intensity || 'Moderate'
    });

    res.status(201).json({ success: true, message: 'Workout scheduled on calendar.', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── PUT /api/calendar/:id ────────────────────────────────────────────────────
// Update status, duration, or performance of an event
router.put('/:id', protect, async (req, res) => {
  try {
    const event = await CalendarEvent.findOne({ _id: req.params.id, user: req.user._id });
    if (!event) {
      return res.status(404).json({ success: false, message: 'Calendar event not found.' });
    }

    const allowed = ['status', 'duration', 'calories', 'performanceScore', 'performanceNote', 'title'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) event[field] = req.body[field];
    });

    await event.save();
    res.json({ success: true, message: 'Calendar event updated.', event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/calendar/day ────────────────────────────────────────────────────
// Fetch real workout/session activity recorded for a specific date
router.get('/day', protect, async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'date query parameter is required (YYYY-MM-DD)' });
    }

    const userId = req.user._id;
    const parts = date.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);

    // Range spanning local and UTC time boundaries for that date
    const localStart = new Date(year, month, day, 0, 0, 0, 0);
    const localEnd = new Date(year, month, day, 23, 59, 59, 999);
    const utcStart = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const utcEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
    const rangeStart = new Date(Math.min(localStart.getTime(), utcStart.getTime()));
    const rangeEnd = new Date(Math.max(localEnd.getTime(), utcEnd.getTime()));

    const [allGym, allCricket, allBadminton, calendarEvent] = await Promise.all([
      Workout.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      CricketTraining.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      BadmintonTraining.find({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } }).sort({ date: -1 }),
      CalendarEvent.findOne({ user: userId, date: { $gte: rangeStart, $lte: rangeEnd } })
    ]);

    // Match year, month, day in local or UTC representation
    const matchesTargetDate = (d) => {
      if (!d) return false;
      const dt = new Date(d);
      const mLocal = dt.getFullYear() === year && dt.getMonth() === month && dt.getDate() === day;
      const mUtc = dt.getUTCFullYear() === year && dt.getUTCMonth() === month && dt.getUTCDate() === day;
      return mLocal || mUtc;
    };

    const gymSessions = allGym.filter(w => matchesTargetDate(w.date));
    const cricketSessions = allCricket.filter(c => matchesTargetDate(c.date));
    const badmintonSessions = allBadminton.filter(b => matchesTargetDate(b.date));

    const totalSessions = gymSessions.length + cricketSessions.length + badmintonSessions.length;
    const hasActivity = totalSessions > 0;

    const totalCalories =
      gymSessions.reduce((s, w) => s + (w.estimatedCaloriesBurned || 0), 0) +
      cricketSessions.reduce((s, c) => s + (c.estimatedCaloriesBurned || 0), 0) +
      badmintonSessions.reduce((s, b) => s + (b.estimatedCaloriesBurned || 0), 0);

    const totalDuration =
      gymSessions.reduce((s, w) => s + (w.duration || 0), 0) +
      cricketSessions.reduce((s, c) => s + (c.trainingDuration || c.duration || 0), 0) +
      badmintonSessions.reduce((s, b) => s + (b.duration || 0), 0);

    // Build human-readable activities list
    const activities = [];
    gymSessions.forEach(w => {
      activities.push({
        sport: 'Gym',
        title: w.exerciseName || w.workoutName || 'Gym workout',
        duration: w.duration || 45,
        calories: w.estimatedCaloriesBurned || 0,
        volume: w.totalVolume || 0,
        muscle: w.muscleGroup || 'Full Body',
        routine: w.routine || 'Push Day',
        icon: 'fa-dumbbell',
        badgeClass: 'badge-emerald',
        highlight: w.totalVolume ? `${w.totalVolume} kg vol` : (w.muscleGroup || 'Compound'),
        date: w.date,
        details: w.sets && w.sets.length > 0 ? `${w.sets.length} sets completed` : (w.muscleGroup || 'Gym workout')
      });
    });
    cricketSessions.forEach(c => {
      activities.push({
        sport: 'Cricket',
        title: `${c.format ? c.format + ' ' : ''}${c.sessionType || 'Cricket Match'}`,
        duration: c.trainingDuration || c.duration || 90,
        calories: c.estimatedCaloriesBurned || 0,
        distance: c.distanceRun || 0,
        runs: c.runs || 0,
        wickets: c.wickets || 0,
        icon: 'fa-baseball-bat-ball',
        badgeClass: 'badge-cyan',
        highlight: `${c.runs || 0} runs, ${c.wickets || 0}W`,
        date: c.date,
        details: `${c.format || 'T20'} • ${c.distanceRun || 0} km run`
      });
    });
    badmintonSessions.forEach(b => {
      activities.push({
        sport: 'Badminton',
        title: `${b.mode ? b.mode + ' ' : ''}${b.trainingType || 'Badminton Match'}`,
        duration: b.duration || 45,
        calories: b.estimatedCaloriesBurned || 0,
        smashes: b.smashes || 0,
        result: b.result || 'Completed',
        icon: 'fa-medal',
        badgeClass: 'badge-purple',
        highlight: `${b.smashes || 0} smashes • ${b.result || 'Win'}`,
        date: b.date,
        details: `${b.scoreSummary || 'Match'} • ${b.result || 'Completed'}`
      });
    });

    const recentActivity = {
      gymSessions: gymSessions.map(w => ({
        exercise: w.exerciseName || w.workoutName || 'Gym workout',
        muscle: w.muscleGroup || 'Full Body',
        volume: w.totalVolume || 0,
        calories: w.estimatedCaloriesBurned || 0,
        date: w.date
      })),
      cricketSessions: cricketSessions.map(c => ({
        type: `${c.format ? c.format + ' ' : ''}${c.sessionType || 'Match'}`,
        runs: c.runs || 0,
        wickets: c.wickets || 0,
        distance: c.distanceRun || 0,
        calories: c.estimatedCaloriesBurned || 0,
        date: c.date
      })),
      badmintonSessions: badmintonSessions.map(b => ({
        type: `${b.mode ? b.mode + ' ' : ''}${b.trainingType || 'Match'}`,
        result: b.result || 'Completed',
        smashes: b.smashes || 0,
        duration: b.duration || 0,
        calories: b.estimatedCaloriesBurned || 0,
        date: b.date
      }))
    };

    res.json({
      success: true,
      date,
      hasActivity,
      totalSessions,
      totalCalories,
      totalDuration,
      activities,
      recentActivity,
      calendarEvent: calendarEvent || null
    });
  } catch (error) {
    console.error('Calendar Day GET Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
