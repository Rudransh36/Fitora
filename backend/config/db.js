const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Robust MongoDB Connection Manager
 *
 * KEY FIX: On Vercel (serverless), each cold-start invocation initialises
 * from scratch. We previously set `bufferCommands = false`, which meant
 * ANY Mongoose query that ran before `mongoose.connect()` fully resolved
 * would throw immediately — causing "Cannot call findOne() before initial
 * connection is complete" errors for EVERY diet/gym/cricket/badminton route.
 *
 * Solution:
 * 1. Remove the global `bufferCommands = false` so Mongoose queues commands
 *    while the connection is being established.
 * 2. Cache the connection promise so concurrent requests reuse the same
 *    connection attempt instead of hammering Atlas with multiple connects.
 * 3. Increase the serverSelectionTimeout to 10 s so Atlas has enough time
 *    to wake up on the first cold-start request.
 */

let isConnected = false;
let memoryServer = null;
let cachedPromise = null;

const connectDB = async () => {
  // Already connected — return immediately
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    isConnected = true;
    return mongoose.connection;
  }

  // A connection attempt is already in flight — wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI = process.env.MONGO_URI;

  if (process.env.VERCEL) {
    // NOTE: Do NOT set bufferCommands = false here.
    // Mongoose's default (bufferCommands = true) queues commands until the
    // connection resolves, which is the correct behavior for serverless where
    // the connect() call and the query may be microseconds apart.

    if (!mongoURI) {
      console.warn('⚠️ MONGO_URI is not set in Vercel Environment Variables. Please add it in Vercel → Settings → Environment Variables.');
      isConnected = false;
      return null;
    }
  }

  const uriToUse = mongoURI || 'mongodb://127.0.0.1:27017/fitora';

  cachedPromise = (async () => {
    try {
      const conn = await mongoose.connect(uriToUse, {
        // Allow up to 10 s for Atlas to accept the first connection on cold-start
        serverSelectionTimeoutMS: 10000,
        // Keep the connection alive across Vercel's reused function instances
        maxPoolSize: 10,
        socketTimeoutMS: 45000,
      });

      isConnected = true;
      console.log(`✅ Connected to MongoDB at: ${conn.connection.host}`);
      return conn;
    } catch (primaryError) {
      console.warn(`ℹ️ MongoDB connection failed (${primaryError.message})`);

      if (process.env.VERCEL) {
        console.warn('⚠️ Atlas connection failed on Vercel. Check that MONGO_URI is correct and your Atlas cluster IP allowlist includes 0.0.0.0/0.');
        isConnected = false;
        cachedPromise = null;  // allow retry on next request
        return null;
      }

      // ── Local-only fallback: embedded MongoMemoryServer with disk persistence ──
      console.log('🚀 Starting embedded MongoDB with disk persistence for local development...');

      const dbDir = path.join(__dirname, '..', '.data', 'db');
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create({
          instance: {
            dbPath: dbDir,
            storageEngine: 'wiredTiger',
            dbName: 'fitora'
          }
        });
        const memUri = memoryServer.getUri('fitora');
        const conn = await mongoose.connect(memUri);
        isConnected = true;
        console.log(`✅ Persistent embedded MongoDB active at: ${memUri}`);
        console.log(`📁 Database files saved to: ${dbDir}`);
        return conn;
      } catch (memError) {
        console.warn(`⚠️ Persistent embedded MongoDB warning: ${memError.message}. Trying in-memory fallback...`);
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          memoryServer = await MongoMemoryServer.create({
            instance: { dbName: 'fitora' }
          });
          const memUri = memoryServer.getUri('fitora');
          const conn = await mongoose.connect(memUri);
          isConnected = true;
          console.log(`✅ Embedded in-memory MongoDB active at: ${memUri}`);
          return conn;
        } catch (fallbackError) {
          console.error(`❌ Embedded MongoDB fallback error: ${fallbackError.message}`);
          isConnected = false;
          cachedPromise = null;
          return null;
        }
      }
    }
  })();

  return cachedPromise;
};

const getDBStatus = () => isConnected;

// Graceful shutdown to flush WiredTiger journal and avoid stale locks
const gracefulExit = async () => {
  if (memoryServer) {
    try {
      await memoryServer.stop({ doCleanup: false });
    } catch (_) {}
  }
  process.exit(0);
};

process.on('SIGINT', gracefulExit);
process.on('SIGTERM', gracefulExit);

module.exports = { connectDB, getDBStatus };
