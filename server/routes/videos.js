const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET all videos from PostgreSQL
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT v.id, v.creator_id, v.title, v.platform, v.views_count, v.likes_count, v.comments_count, v.upload_date, c.name as creator_name
       FROM videos v
       LEFT JOIN creators c ON v.creator_id = c.id
       ORDER BY v.upload_date DESC`
    );
    res.json({ videos: result.rows, total: result.rows.length });
  } catch (err) {
    console.error('Fetch videos error:', err);
    res.status(500).json({ error: 'Failed to retrieve videos from PostgreSQL.' });
  }
});

// DELETE video from PostgreSQL
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }
    res.json({ message: 'Video deleted from PostgreSQL.', id });
  } catch (err) {
    console.error('Delete video error:', err);
    res.status(500).json({ error: 'Failed to delete video.' });
  }
});

module.exports = router;
