const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all audit reports from PostgreSQL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, creator_name, reason, score, status, generated_by, report_date, created_at
       FROM reports
       ORDER BY created_at DESC, id DESC`
    );
    res.json({ reports: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Fetch reports error:', err);
    res.status(500).json({ error: 'Failed to retrieve reports from PostgreSQL.' });
  }
});

// POST create new report in PostgreSQL
router.post('/', async (req, res) => {
  try {
    const { creator_name, reason, score, status, generated_by } = req.body;
    if (!creator_name || score === undefined) {
      return res.status(400).json({ error: 'Creator name and detection score are required.' });
    }

    const reportId = `REP-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `INSERT INTO reports (id, creator_name, reason, score, status, generated_by, report_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [reportId, creator_name, reason || 'AI Neural Anomaly Scan Triggered', score, status || 'Flagged', generated_by || 'Security Analyst', today]
    );

    // Also record to system_logs
    await pool.query(
      `INSERT INTO system_logs (level, message, user_email)
       VALUES ('AUDIT', $1, $2)`,
      [`Forensic Report ${reportId} compiled for ${creator_name} (Score: ${score}%)`, generated_by || 'system@fdms.cyber']
    );

    res.status(201).json({ message: 'Audit report saved in PostgreSQL.', report: result.rows[0] });
  } catch (err) {
    console.error('Create report error:', err);
    res.status(500).json({ error: 'Failed to save report in PostgreSQL.' });
  }
});

module.exports = router;
