const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /api/notifications - Retrieve notifications from PostgreSQL with filtering
router.get('/', async (req, res) => {
  try {
    const { category, severity, is_read, search } = req.query;
    let query = `
      SELECT id, title, description, severity, category, target_handle, risk_score, is_read, action_data, created_at
      FROM notifications
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (category && category !== 'All') {
      query += ` AND LOWER(category) = LOWER($${idx++})`;
      params.push(category.trim());
    }

    if (severity && severity !== 'All') {
      query += ` AND UPPER(severity) = UPPER($${idx++})`;
      params.push(severity.trim());
    }

    if (is_read !== undefined && is_read !== '') {
      query += ` AND is_read = $${idx++}`;
      params.push(is_read === 'true' || is_read === true);
    }

    if (search) {
      query += ` AND (LOWER(title) LIKE LOWER($${idx}) OR LOWER(description) LIKE LOWER($${idx}) OR LOWER(target_handle) LIKE LOWER($${idx}))`;
      params.push(`%${search.trim()}%`);
      idx++;
    }

    query += ` ORDER BY created_at DESC, id DESC LIMIT 100`;

    const result = await pool.query(query, params);

    // Compute stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = FALSE THEN 1 END) as unread,
        COUNT(CASE WHEN UPPER(severity) = 'CRITICAL' THEN 1 END) as critical,
        COUNT(CASE WHEN UPPER(severity) = 'WARNING' THEN 1 END) as warning
      FROM notifications
    `);

    res.json({
      notifications: result.rows,
      total: parseInt(statsResult.rows[0].total, 10),
      unread_count: parseInt(statsResult.rows[0].unread, 10),
      critical_count: parseInt(statsResult.rows[0].critical, 10),
      warning_count: parseInt(statsResult.rows[0].warning, 10),
    });
  } catch (err) {
    console.error('Fetch notifications error:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications from PostgreSQL.', details: err.message });
  }
});

// POST /api/notifications - Create new notification in PostgreSQL
router.post('/', async (req, res) => {
  try {
    const { title, description, severity, category, target_handle, risk_score, action_data } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'Notification title and description are required.' });
    }

    const result = await pool.query(
      `INSERT INTO notifications (title, description, severity, category, target_handle, risk_score, action_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        title,
        description,
        severity || 'CRITICAL',
        category || 'Threat',
        target_handle || null,
        risk_score || null,
        action_data ? JSON.stringify(action_data) : '{}'
      ]
    );

    // Log to system_logs if CRITICAL
    if ((severity || '').toUpperCase() === 'CRITICAL') {
      await pool.query(
        `INSERT INTO system_logs (level, message, user_email)
         VALUES ('ALERT', $1, 'sentinel@fdms.cyber')`,
        [`CRITICAL Alert Logged: ${title} (${target_handle || 'System'})`]
      );
    }

    res.status(201).json({
      message: 'Notification saved to PostgreSQL',
      notification: result.rows[0]
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ error: 'Failed to create notification in PostgreSQL.' });
  }
});

// PUT /api/notifications/:id/read - Mark single notification as read/unread
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;
    const newStatus = is_read !== undefined ? is_read : true;

    const result = await pool.query(
      `UPDATE notifications SET is_read = $1 WHERE id = $2 RETURNING *`,
      [newStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Notification #${id} not found.` });
    }

    res.json({ message: 'Notification read status updated.', notification: result.rows[0] });
  } catch (err) {
    console.error('Update notification read status error:', err);
    res.status(500).json({ error: 'Failed to update notification read status.' });
  }
});

// PUT /api/notifications/read-all - Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const result = await pool.query(`UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE RETURNING id`);
    res.json({ message: 'All notifications marked as read in PostgreSQL.', updated_count: result.rowCount });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read.' });
  }
});

// DELETE /api/notifications/:id - Delete single notification
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`DELETE FROM notifications WHERE id = $1 RETURNING id`, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Notification #${id} not found.` });
    }
    res.json({ message: `Notification #${id} deleted from PostgreSQL.` });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({ error: 'Failed to delete notification.' });
  }
});

// DELETE /api/notifications - Clear all notifications
router.delete('/', async (req, res) => {
  try {
    const result = await pool.query(`DELETE FROM notifications RETURNING id`);
    res.json({ message: 'All notifications cleared from PostgreSQL.', deleted_count: result.rowCount });
  } catch (err) {
    console.error('Clear notifications error:', err);
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

module.exports = router;
