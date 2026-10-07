const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');
const Step = require('../models/Step');
const User = require('../models/User');

/**
 * Helper: compute time boundaries for today, current week, and current month
 */
function getDateBoundaries() {
  const now = new Date();

  // Today boundaries (local)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // This Week boundaries (starting Monday)
  const dayOfWeek = now.getDay(); // 0 is Sunday
  const diffToMonday = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), diffToMonday + 6, 23, 59, 59, 999);

  // This Month boundaries
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return { todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd };
}

// ─── GET /api/steps ───────────────────────────────────────────────────────────
// Retrieve today's, this week's, and this month's real step data for authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd } = getDateBoundaries();

    // Query steps for the current month window (covers today and this week as well)
    const [todayRecords, weekRecords, monthRecords, recentLogs] = await Promise.all([
      Step.find({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }),
      Step.find({ user: userId, date: { $gte: weekStart, $lte: weekEnd } }),
      Step.find({ user: userId, date: { $gte: monthStart, $lte: monthEnd } }),
      Step.find({ user: userId }).sort({ date: -1 }).limit(10)
    ]);

    const todaySteps = todayRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);
    const weeklySteps = weekRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);
    const monthlySteps = monthRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);

    const isGoogleConfigured = !!(
      process.env.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
    );
    const isGoogleConnected = !!(req.user.googleFit && req.user.googleFit.connected);

    res.json({
      success: true,
      todaySteps,
      weeklySteps,
      monthlySteps,
      dailyGoal: 10000,
      googleFit: {
        configured: isGoogleConfigured,
        connected: isGoogleConnected,
        connectedAt: req.user.googleFit ? req.user.googleFit.connectedAt : null
      },
      recentLogs: recentLogs.map(l => ({
        id: l._id,
        date: l.date,
        stepCount: l.stepCount,
        source: l.source,
        distanceKm: l.distanceKm,
        caloriesBurned: l.caloriesBurned
      }))
    });
  } catch (error) {
    console.error('Steps GET Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── POST /api/steps/log ──────────────────────────────────────────────────────
// Manually log steps for the authenticated athlete
router.post('/log', protect, async (req, res) => {
  try {
    const { stepCount, date } = req.body;
    const steps = parseInt(stepCount, 10);

    if (isNaN(steps) || steps < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid non-negative step count.' });
    }

    const logDate = date ? new Date(date) : new Date();
    const distanceKm = Math.round(steps * 0.00075 * 100) / 100;
    const caloriesBurned = Math.round(steps * 0.04);

    const record = await Step.create({
      user: req.user._id,
      date: logDate,
      stepCount: steps,
      source: 'Manual',
      distanceKm,
      caloriesBurned
    });

    // Recompute totals
    const { todayStart, todayEnd, weekStart, weekEnd, monthStart, monthEnd } = getDateBoundaries();
    const [todayRecords, weekRecords, monthRecords] = await Promise.all([
      Step.find({ user: req.user._id, date: { $gte: todayStart, $lte: todayEnd } }),
      Step.find({ user: req.user._id, date: { $gte: weekStart, $lte: weekEnd } }),
      Step.find({ user: req.user._id, date: { $gte: monthStart, $lte: monthEnd } })
    ]);

    const todaySteps = todayRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);
    const weeklySteps = weekRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);
    const monthlySteps = monthRecords.reduce((sum, r) => sum + (r.stepCount || 0), 0);

    res.status(201).json({
      success: true,
      message: `Recorded ${steps.toLocaleString()} steps.`,
      record,
      totals: {
        todaySteps,
        weeklySteps,
        monthlySteps
      }
    });
  } catch (error) {
    console.error('Steps Log Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/steps/google/status ─────────────────────────────────────────────
// Check Google Fit OAuth credentials status (accessible to show setup guide or live status)
router.get('/google/status', async (req, res) => {
  let user = null;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'Fitora_super_secret_jwt_key_2026_sports_platform'
      );
      user = await User.findById(decoded.id);
    } catch (_) {}
  }

  const clientId = process.env.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const configured = !!(clientId && (process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET));
  const connected = !!(user && user.googleFit && user.googleFit.connected);

  res.json({
    success: true,
    configured,
    connected,
    clientId: configured ? clientId : null,
    connectedAt: user && user.googleFit ? user.googleFit.connectedAt : null,
    setupInstructions: configured ? [] : [
      '1. Open Google Cloud Console (https://console.cloud.google.com)',
      '2. Enable "Fitness API" under APIs & Services > Library',
      '3. Create an OAuth 2.0 Web Client ID under Credentials',
      '4. Add Authorized Redirect URI: http://localhost:5000/api/steps/google/callback',
      '5. Add GOOGLE_FIT_CLIENT_ID and GOOGLE_FIT_CLIENT_SECRET in backend/.env',
      '6. Restart the backend server'
    ]
  });
});

// ─── GET /api/steps/google/auth ───────────────────────────────────────────────
// Initiates the official Google Health / Google Fit authorization flow
router.get('/google/auth', protect, async (req, res) => {
  const clientId = process.env.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_FIT_REDIRECT_URI || 'http://localhost:5000/api/steps/google/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      configured: false,
      error: 'OAUTH_NOT_CONFIGURED',
      provider: 'Google Fit',
      message: 'Google Fit OAuth 2.0 credentials are not configured yet in backend/.env.',
      setupInstructions: [
        '1. Open Google Cloud Console (https://console.cloud.google.com)',
        '2. Enable "Fitness API" in APIs & Services > Enabled APIs & Services',
        '3. Create OAuth 2.0 Client ID Credentials (Web Application)',
        `4. Add Authorized Redirect URI: ${redirectUri}`,
        '5. Add GOOGLE_FIT_CLIENT_ID and GOOGLE_FIT_CLIENT_SECRET to backend/.env',
        '6. Restart the backend server'
      ]
    });
  }

  // Create state token containing user ID for verification in callback
  const state = jwt.sign(
    { userId: req.user._id.toString() },
    process.env.JWT_SECRET || 'Fitora_super_secret_jwt_key_2026_sports_platform',
    { expiresIn: '15m' }
  );

  const scopes = [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read'
  ].join(' ');

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;

  res.json({
    success: true,
    configured: true,
    authUrl: googleAuthUrl
  });
});

// ─── GET /api/steps/google/callback ───────────────────────────────────────────
// Google OAuth callback endpoint
router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error || !code) {
    return res.redirect(`/index.html?googleFitError=${encodeURIComponent(error || 'Authorization cancelled')}`);
  }

  try {
    // Decode state to get authenticated user
    const decoded = jwt.verify(
      state,
      process.env.JWT_SECRET || 'Fitora_super_secret_jwt_key_2026_sports_platform'
    );
    const user = await User.findById(decoded.userId).select('+googleFit.accessToken +googleFit.refreshToken');
    if (!user) {
      return res.redirect('/index.html?googleFitError=User%20not%20found');
    }

    const clientId = process.env.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_FIT_REDIRECT_URI || 'http://localhost:5000/api/steps/google/callback';

    // Exchange authorization code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange token with Google');
    }

    // Save tokens on user
    user.googleFit = {
      connected: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || (user.googleFit && user.googleFit.refreshToken),
      tokenExpiry: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000),
      connectedAt: new Date()
    };
    await user.save();

    // Sync real step data from Google Fitness API for the past 30 days
    await syncGoogleFitnessSteps(user._id, tokenData.access_token);

    res.redirect('/index.html?googleFit=connected');
  } catch (err) {
    console.error('Google Fit OAuth Callback Error:', err.message);
    res.redirect(`/index.html?googleFitError=${encodeURIComponent(err.message)}`);
  }
});

// ─── POST /api/steps/google/sync ──────────────────────────────────────────────
// Manually trigger a real sync from Google Fitness API
router.post('/google/sync', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+googleFit.accessToken +googleFit.refreshToken');
    if (!user || !user.googleFit || !user.googleFit.connected) {
      return res.status(400).json({
        success: false,
        message: 'Google Fit is not connected. Please connect Google Fit first.'
      });
    }

    let accessToken = user.googleFit.accessToken;
    // Check if access token expired and refresh if necessary
    if (user.googleFit.tokenExpiry && new Date() >= user.googleFit.tokenExpiry && user.googleFit.refreshToken) {
      const clientId = process.env.GOOGLE_FIT_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_FIT_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: user.googleFit.refreshToken,
          grant_type: 'refresh_token'
        })
      });
      const refreshData = await refreshRes.json();
      if (refreshRes.ok && refreshData.access_token) {
        accessToken = refreshData.access_token;
        user.googleFit.accessToken = accessToken;
        user.googleFit.tokenExpiry = new Date(Date.now() + (refreshData.expires_in || 3600) * 1000);
        await user.save();
      }
    }

    const syncedCount = await syncGoogleFitnessSteps(user._id, accessToken);

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} daily records from Google Fit.`,
      syncedRecords: syncedCount
    });
  } catch (error) {
    console.error('Google Fit Sync Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Helper: Query Google Fitness REST API and store real steps into MongoDB
 */
async function syncGoogleFitnessSteps(userId, accessToken) {
  const endTimeMs = Date.now();
  const startTimeMs = endTimeMs - (30 * 24 * 60 * 60 * 1000); // 30 days ago

  const googleRes = await fetch('https://fitness.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      aggregateBy: [{
        dataTypeName: 'com.google.step_count.delta',
        dataSourceId: 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'
      }],
      bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
      startTimeMillis: startTimeMs,
      endTimeMillis: endTimeMs
    })
  });

  if (!googleRes.ok) {
    const errText = await googleRes.text();
    console.warn('Google Fitness aggregate response not ok:', googleRes.status, errText);
    return 0;
  }

  const data = await googleRes.json();
  let count = 0;

  if (data.bucket && Array.isArray(data.bucket)) {
    for (const b of data.bucket) {
      let bucketSteps = 0;
      if (b.dataset && b.dataset[0] && b.dataset[0].point) {
        for (const pt of b.dataset[0].point) {
          if (pt.value && pt.value[0] && pt.value[0].intVal) {
            bucketSteps += pt.value[0].intVal;
          }
        }
      }

      if (bucketSteps > 0) {
        const bucketDate = new Date(parseInt(b.startTimeMillis, 10));
        const dayStart = new Date(bucketDate.getFullYear(), bucketDate.getMonth(), bucketDate.getDate(), 0, 0, 0, 0);
        const dayEnd = new Date(bucketDate.getFullYear(), bucketDate.getMonth(), bucketDate.getDate(), 23, 59, 59, 999);

        // Upsert step record for this day and user
        await Step.findOneAndUpdate(
          { user: userId, source: 'Google Fit', date: { $gte: dayStart, $lte: dayEnd } },
          {
            user: userId,
            date: dayStart,
            stepCount: bucketSteps,
            source: 'Google Fit',
            distanceKm: Math.round(bucketSteps * 0.00075 * 100) / 100,
            caloriesBurned: Math.round(bucketSteps * 0.04)
          },
          { upsert: true, new: true }
        );
        count++;
      }
    }
  }

  return count;
}

module.exports = router;
