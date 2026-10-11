require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db');
const { initializeDatabase } = require('./db/seed');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const creatorsRoutes = require('./routes/creators');
const videosRoutes = require('./routes/videos');
const reportsRoutes = require('./routes/reports');
const detectionsRoutes = require('./routes/detections');
const databaseRoutes = require('./routes/database');
const notificationsRoutes = require('./routes/notifications');
const alertsRoutes = require('./routes/alerts');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API with PostgreSQL check
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await pool.query('SELECT 1 as connected, NOW() as server_time');
    res.json({
      status: 'healthy',
      app: 'FDMS (Fake Detection Management System)',
      database: 'PostgreSQL connected',
      db_time: dbTest.rows[0].server_time,
      port: PORT,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      app: 'FDMS (Fake Detection Management System)',
      database: 'PostgreSQL disconnected',
      error: err.message,
    });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/creators', creatorsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/detections', detectionsRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/alerts', alertsRoutes);

// Serve Static Frontend files from root directory
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));

// Fallback to index.html for SPA routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Server & Ensure PostgreSQL Tables Ready
async function startServer() {
  try {
    console.log('🔄 Checking and initializing PostgreSQL tables...');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`========================================================`);
      console.log(`🚀 FDMS Platform Server Running on http://localhost:${PORT}`);
      console.log(`📁 PostgreSQL Database: ${process.env.PGDATABASE || 'fdms_db'} on port ${process.env.PGPORT || 5432}`);
      console.log(`🛡️  Multi-Role Auth: Security Analyst, Admin, Brand/User`);
      console.log(`🌐 Full Application Available at: http://localhost:${PORT}`);
      console.log(`========================================================`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
