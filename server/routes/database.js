const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/database/overview - Real PostgreSQL database architecture & table stats
router.get('/overview', async (req, res) => {
  try {
    // 1. Fetch real tables from information_schema
    const tablesQuery = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name ASC;
    `);

    // 2. Fetch row count and size for each table
    const tableStats = [];
    for (const row of tablesQuery.rows) {
      const tableName = row.table_name;
      
      // Row count
      const countRes = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
      const rowCount = parseInt(countRes.rows[0].count, 10);

      // Columns metadata
      const colsRes = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position ASC;
      `, [tableName]);

      tableStats.push({
        table_name: tableName,
        row_count: rowCount,
        column_count: colsRes.rows.length,
        columns: colsRes.rows,
      });
    }

    // 3. PostgreSQL version & database metadata
    const versionRes = await pool.query('SELECT version();');
    const dbSizeRes = await pool.query("SELECT pg_size_pretty(pg_database_size('fdms_db')) as size;");

    res.json({
      database: 'fdms_db',
      connected: true,
      pg_version: versionRes.rows[0].version,
      database_size: dbSizeRes.rows[0].size,
      total_tables: tableStats.length,
      tables: tableStats,
    });
  } catch (err) {
    console.error('Database overview error:', err);
    res.status(500).json({ error: 'Failed to query PostgreSQL system catalogs.', details: err.message });
  }
});

// GET /api/database/table/:tableName - Fetch live rows from any allowed table
router.get('/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const allowedTables = ['users', 'creators', 'videos', 'reports', 'detections', 'system_logs', 'notifications'];

    if (!allowedTables.includes(tableName.toLowerCase())) {
      return res.status(400).json({ error: `Table '${tableName}' is not in allowed query list.` });
    }

    let queryText = `SELECT * FROM "${tableName}" ORDER BY 1 DESC LIMIT 50`;
    // For users table, mask password hash
    if (tableName.toLowerCase() === 'users') {
      queryText = `SELECT id, full_name, email, phone_number, user_type, badge_id, organization, avatar_url, status, created_at, last_login FROM users ORDER BY id ASC LIMIT 50`;
    }

    const result = await pool.query(queryText);
    res.json({
      table: tableName,
      rows: result.rows,
      count: result.rows.length,
    });
  } catch (err) {
    console.error('Database table query error:', err);
    res.status(500).json({ error: `Failed to query table ${req.params.tableName}.` });
  }
});

module.exports = router;
