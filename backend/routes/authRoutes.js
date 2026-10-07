const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Generate a signed JWT for the given user ID.
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'Fitora_super_secret_jwt_key_2026_sports_platform',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      name, email, password, age, gender, height, weight,
      activityLevel, fitnessGoal, selectedSport, dietaryPreference
    } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please log in instead.'
      });
    }

    // Map frontend activity levels to Mongoose enum
    const activityMap = {
      'Beginner Athlete': 'Lightly Active',
      'Intermediate Athlete': 'Moderately Active',
      'Advanced Athlete': 'Very Active',
      'Pro Athlete': 'Extremely Active',
      'Sedentary': 'Sedentary',
      'Lightly Active': 'Lightly Active',
      'Moderately Active': 'Moderately Active',
      'Very Active': 'Very Active',
      'Extremely Active': 'Extremely Active'
    };
    const normalizedActivity = activityMap[activityLevel] || 'Moderately Active';

    // Create user
    const user = await User.create({
      name, email, password,
      age: age || 24,
      gender: gender || 'Male',
      height: height || 175,
      weight: weight || 72,
      activityLevel: normalizedActivity,
      fitnessGoal: fitnessGoal || 'Sports performance',
      selectedSport: selectedSport || 'Gym',
      dietaryPreference: dietaryPreference || 'Vegetarian'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: `Welcome to Fitora, ${user.name}! Your account has been created successfully.`,
      token,
      user: {
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
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.'
    });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again.'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}! 💪`,
      token,
      user: {
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
        streakDays: user.streakDays
      }
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const { protect } = require('../middleware/authMiddleware');
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ─── GET /api/auth/google/status ──────────────────────────────────────────────
router.get('/google/status', (req, res) => {
  const configured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  res.json({
    success: true,
    configured,
    clientId: process.env.GOOGLE_CLIENT_ID || null
  });
});

// ─── GET /api/auth/apple/status ───────────────────────────────────────────────
router.get('/apple/status', (req, res) => {
  const configured = !!(process.env.APPLE_CLIENT_ID);
  res.json({
    success: true,
    configured,
    clientId: process.env.APPLE_CLIENT_ID || null
  });
});

// ─── GET /api/auth/google ─────────────────────────────────────────────────────
// Initiates real Google OAuth 2.0 flow or returns configuration instructions
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId || !clientSecret) {
    return res.status(400).json({
      success: false,
      configured: false,
      error: 'OAUTH_NOT_CONFIGURED',
      provider: 'Google',
      message: 'Google OAuth 2.0 credentials are not configured yet in backend/.env.',
      setupInstructions: [
        '1. Go to Google Cloud Console (https://console.cloud.google.com)',
        '2. Navigate to APIs & Services > Credentials > Create Credentials > OAuth client ID',
        '3. Choose "Web application"',
        `4. Add Authorized Redirect URI: ${redirectUri}`,
        '5. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env',
        '6. Restart the backend server'
      ]
    });
  }

  const scope = encodeURIComponent('openid email profile');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(googleAuthUrl);
});

// ─── GET /api/auth/google/callback ────────────────────────────────────────────
// Google OAuth Redirect Callback
router.get('/google/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect(`/login.html?error=${encodeURIComponent(error || 'Google authorization cancelled')}`);
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || 'Failed to exchange token with Google');
    }

    // Fetch user info from Google API
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const profile = await userinfoResponse.json();

    if (!profile.email) {
      throw new Error('Google did not return an email address');
    }

    // Find or create athlete user
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || 'Google Athlete',
        email: profile.email.toLowerCase(),
        password: 'OAuth_Google_' + Math.random().toString(36).slice(-12),
        avatar: profile.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        age: 24,
        gender: 'Male',
        height: 175,
        weight: 72,
        activityLevel: 'Moderately Active',
        fitnessGoal: 'Sports performance',
        selectedSport: 'Gym',
        dietaryPreference: 'Vegetarian'
      });
    }

    const token = generateToken(user._id);

    // Redirect to frontend with auth payload
    res.redirect(`/index.html?token=${encodeURIComponent(token)}&provider=google`);
  } catch (err) {
    console.error('Google OAuth Callback Error:', err.message);
    res.redirect(`/login.html?error=${encodeURIComponent(err.message)}`);
  }
});

// ─── POST /api/auth/oauth/google ──────────────────────────────────────────────
// Direct ID Token verification (Google One-Tap or GIS frontend SDK)
router.post('/oauth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, message: 'ID token credential is required' });
    }

    // Verify token with Google's endpoint
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    const tokenInfo = await verifyRes.json();

    if (!verifyRes.ok || !tokenInfo.email) {
      return res.status(401).json({ success: false, message: 'Invalid Google identity token' });
    }

    let user = await User.findOne({ email: tokenInfo.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: tokenInfo.name || 'Google Athlete',
        email: tokenInfo.email.toLowerCase(),
        password: 'OAuth_Google_' + Math.random().toString(36).slice(-12),
        avatar: tokenInfo.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        age: 24,
        gender: 'Male',
        height: 175,
        weight: 72,
        activityLevel: 'Moderately Active',
        fitnessGoal: 'Sports performance',
        selectedSport: 'Gym',
        dietaryPreference: 'Vegetarian'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Welcome to Fitora, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        height: user.height,
        weight: user.weight,
        selectedSport: user.selectedSport,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ─── GET /api/auth/apple ──────────────────────────────────────────────────────
router.get('/apple', (req, res) => {
  const clientId = process.env.APPLE_CLIENT_ID;
  const redirectUri = process.env.APPLE_CALLBACK_URL || 'http://localhost:5000/api/auth/apple/callback';

  if (!clientId) {
    return res.status(400).json({
      success: false,
      configured: false,
      error: 'OAUTH_NOT_CONFIGURED',
      provider: 'Apple',
      message: 'Apple Sign-In credentials are not configured in backend/.env.',
      setupInstructions: [
        '1. Go to Apple Developer Account (https://developer.apple.com)',
        '2. Navigate to Certificates, Identifiers & Profiles > Identifiers > Services IDs',
        '3. Enable Sign in with Apple and configure domains & Return URLs',
        `4. Add Return URL: ${redirectUri}`,
        '5. Set APPLE_CLIENT_ID, APPLE_TEAM_ID, and APPLE_KEY_ID in backend/.env',
        '6. Restart the backend server'
      ]
    });
  }

  const appleAuthUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code%20id_token&scope=name%20email&response_mode=form_post`;
  res.redirect(appleAuthUrl);
});

module.exports = router;
