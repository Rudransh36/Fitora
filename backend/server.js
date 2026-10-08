const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files from the parent directory
app.use(express.static(path.join(__dirname, '..')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',       require('./routes/authRoutes'));
app.use('/api/profile',    require('./routes/profileRoutes'));
app.use('/api/dashboard',  require('./routes/dashboardRoutes'));
app.use('/api/gym',        require('./routes/gymRoutes'));
app.use('/api/cricket',    require('./routes/cricketRoutes'));
app.use('/api/badminton',  require('./routes/badmintonRoutes'));
app.use('/api/diet',       require('./routes/dietRoutes'));
app.use('/api/progress',   require('./routes/progressRoutes'));
app.use('/api/calendar',   require('./routes/calendarRoutes'));
app.use('/api/steps',      require('./routes/stepRoutes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '✅ Fitora API is live and running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ─── Catch-all: serve index.html for any non-API route ────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔴 Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ─── Serverless Database Middleware (Vercel) ──────────────────────────────────
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
    } catch (err) {
      console.error('Serverless DB connect error:', err.message);
    }
    next();
  });
}

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const { seedDefaultData } = require('./utils/seedData');

const startServer = async () => {
  await connectDB();
  await seedDefaultData();
  app.listen(PORT, () => {
    console.log('\n🏋️  ══════════════════════════════════════════════');
    console.log(`🚀  Fitora API Server running on http://localhost:${PORT}`);
    console.log(`🌐  Frontend available at  http://localhost:${PORT}`);
    console.log(`🔗  API Base URL           http://localhost:${PORT}/api`);
    console.log('🏋️  ══════════════════════════════════════════════\n');
  });
};

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;
