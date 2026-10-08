const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Robust MongoDB Connection Manager
 * 1. Tries primary connection string (e.g., local MongoDB service or MongoDB Atlas).
 * 2. If no MongoDB server is running locally, it gracefully starts an embedded MongoMemoryServer
 *    configured with disk persistence (.data/db) so data, users, and workouts survive restarts.
 */
let isConnected = false;
let memoryServer = null;

const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    isConnected = true;
    return mongoose.connection;
  }

  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitora';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Try real connection for 2.5s
    });

    isConnected = true;
    console.log(`✅ Connected to MongoDB at: ${conn.connection.host}`);
    return conn;
  } catch (primaryError) {
    console.warn(`ℹ️  Standard MongoDB instance not reachable at ${mongoURI} (${primaryError.message})`);

    if (process.env.VERCEL) {
      console.warn('⚠️ Running on Vercel: Primary MongoDB connection failed. Please ensure MONGO_URI is set in Vercel settings.');
      isConnected = false;
      return null;
    }

    console.log(`🚀 Starting high-speed embedded database instance with disk persistence...`);

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
      console.warn(`⚠️  Persistent embedded MongoDB warning: ${memError.message}. Starting fallback in-memory instance...`);
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
      }
    }
  }
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
