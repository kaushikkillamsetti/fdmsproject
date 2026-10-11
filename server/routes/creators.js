const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all creators from PostgreSQL (with platform, status, search filtering)
router.get('/', async (req, res) => {
  try {
    const { platform, status, search } = req.query;
    let query = `
      SELECT id, name, handle, platform, category, followers_count, engagement_rate, status, risk_score, avatar_url, created_at
      FROM creators
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (platform) {
      query += ` AND LOWER(platform) = LOWER($${paramIndex++})`;
      params.push(platform.trim());
    }

    if (status) {
      query += ` AND LOWER(status) = LOWER($${paramIndex++})`;
      params.push(status.trim());
    }

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(handle) LIKE LOWER($${paramIndex}) OR LOWER(id) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC, id ASC`;

    const result = await pool.query(query, params);
    res.json({ creators: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Fetch creators error:', err);
    res.status(500).json({ error: 'Failed to retrieve creators from PostgreSQL.' });
  }
});

// POST new creator into PostgreSQL
router.post('/', async (req, res) => {
  try {
    const { name, handle, platform, category, followers_count, engagement_rate, status, risk_score } = req.body;
    if (!name || !platform) {
      return res.status(400).json({ error: 'Name and platform are required.' });
    }

    const id = `CR-${Math.floor(100 + Math.random() * 900)}`;
    const result = await pool.query(
      `INSERT INTO creators (id, name, handle, platform, category, followers_count, engagement_rate, status, risk_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [id, name, handle || `@${name.toLowerCase().replace(/\s+/g, '_')}`, platform, category || 'General', followers_count || '100K', engagement_rate || '2.5%', status || 'Safe', risk_score || 15.0]
    );

    res.status(201).json({ message: 'Creator registered in PostgreSQL.', creator: result.rows[0] });
  } catch (err) {
    console.error('Create creator error:', err);
    res.status(500).json({ error: 'Failed to save creator in PostgreSQL.' });
  }
});

// DELETE creator from PostgreSQL
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM creators WHERE id = $1 RETURNING id, name', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    res.json({ message: `Creator ${result.rows[0].name} deleted from PostgreSQL.`, id });
  } catch (err) {
    console.error('Delete creator error:', err);
    res.status(500).json({ error: 'Failed to delete creator.' });
  }
});

module.exports = router;
