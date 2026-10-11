const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// List all registered users from PostgreSQL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone_number, user_type, badge_id, organization, avatar_url, status, created_at, last_login
       FROM users
       ORDER BY id ASC`
    );
    res.json({ users: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to retrieve users from PostgreSQL.' });
  }
});

// Update user role or details
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_type, status, organization } = req.body;

    const result = await pool.query(
      `UPDATE users
       SET user_type = COALESCE($1, user_type),
           status = COALESCE($2, status),
           organization = COALESCE($3, organization)
       WHERE id = $4
       RETURNING id, full_name, email, user_type, status, organization`,
      [user_type, status, organization, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully in PostgreSQL.', user: result.rows[0] });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user.' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, email', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: `User ${result.rows[0].email} removed from PostgreSQL.`, id });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user.' });
  }
});

module.exports = router;
