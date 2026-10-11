const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');

// 1. REGISTER NEW USER (Saves to PostgreSQL users table)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, phone_number, password, user_type, organization } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const role = user_type || 'User';

    // Check if email already registered in PostgreSQL
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Generate Role-Specific Badge ID
    const randomBadgeNum = Math.floor(1000 + Math.random() * 9000);
    let badgeId = `USR-${randomBadgeNum}`;
    if (role === 'Admin') badgeId = `ADM-${randomBadgeNum}`;
    else if (role === 'Analyst') badgeId = `SEC-${randomBadgeNum}`;
    else if (role === 'User') badgeId = `CRE-${randomBadgeNum}`;

    // Hash password securely with bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Default avatar
    const defaultAvatar = role === 'Admin'
      ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      : (role === 'Analyst' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80');

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (full_name, email, phone_number, password_hash, user_type, badge_id, organization, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, full_name, email, phone_number, user_type, badge_id, organization, avatar_url, created_at`,
      [full_name.trim(), cleanEmail, phone_number || '', passwordHash, role, badgeId, organization || 'FDMS Network', defaultAvatar]
    );

    const newUser = result.rows[0];

    // Log registration into PostgreSQL system_logs
    await pool.query(
      `INSERT INTO system_logs (level, message, user_email, ip_address)
       VALUES ('AUTH', $1, $2, $3)`,
      [`User ${newUser.email} registered as ${newUser.user_type} (Badge: ${newUser.badge_id})`, newUser.email, req.ip || '127.0.0.1']
    );

    // Create JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, user_type: newUser.user_type, full_name: newUser.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account successfully registered and saved to PostgreSQL.',
      user: newUser,
      token,
    });
  } catch (err) {
    console.error('Registration Error:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// 2. MULTI-ROLE LOGIN (Supports Analyst, Admin, and User / Brand portals)
router.post('/login', async (req, res) => {
  try {
    const { email, password, requested_role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Query user from PostgreSQL
    const userResult = await pool.query(
      `SELECT id, full_name, email, phone_number, password_hash, user_type, badge_id, organization, avatar_url, status
       FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address.' });
    }

    const user = userResult.rows[0];

    if (user.status && user.status.toLowerCase() === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by system administration.' });
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid password credentials. Please verify your password.' });
    }

    // Role portal check (warning or validation if user logs in via a role-specific portal)
    let roleNotice = null;
    if (requested_role && requested_role !== user.user_type) {
      if (requested_role === 'Admin' && user.user_type !== 'Admin') {
        return res.status(403).json({
          error: `Access Denied: You do not have System Administrator clearance. Your assigned role is ${user.user_type}. Please use the ${user.user_type} Portal.`
        });
      }
      roleNotice = `Note: Logged in as ${user.user_type}.`;
    }

    // Update last_login in PostgreSQL
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    // Record login into PostgreSQL system_logs
    await pool.query(
      `INSERT INTO system_logs (level, message, user_email, ip_address)
       VALUES ('AUTH', $1, $2, $3)`,
      [`Authentication successful for ${user.email} (${user.user_type}) via portal`, user.email, req.ip || '127.0.0.1']
    );

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Don't return password hash
    delete user.password_hash;

    res.json({
      message: `Welcome back, ${user.full_name}! Authenticated via PostgreSQL.`,
      user,
      token,
      roleNotice,
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error during login authentication.' });
  }
});

// 3. GET CURRENT USER PROFILE
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, phone_number, user_type, badge_id, organization, avatar_url, created_at, last_login
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// 4. SPECIAL ADMIN GOVERNANCE LOGIN (Restricted exclusively to Master Administrators)
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, master_key } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Master Admin Email and Password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userResult = await pool.query(
      `SELECT id, full_name, email, phone_number, password_hash, user_type, badge_id, organization, avatar_url, status
       FROM users WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'No administrative account found with this email.' });
    }

    const user = userResult.rows[0];

    // Strictly enforce Admin clearance
    if (user.user_type !== 'Admin') {
      return res.status(403).json({
        error: 'ACCESS DENIED: This portal is strictly restricted to System Administrators. Your account does not have Admin clearance.'
      });
    }

    // Verify password hash
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid master administrator password credentials.' });
    }

    // Optional Master Key check
    if (master_key && master_key.trim() !== 'ADM-MASTER-2026' && master_key.trim() !== 'ADM-001') {
      // Optional extra passkey verification if provided
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    await pool.query(
      `INSERT INTO system_logs (level, message, user_email, ip_address)
       VALUES ('AUTH', $1, $2, $3)`,
      [`Special Master Administrator login verified for ${user.email}`, user.email, req.ip || '127.0.0.1']
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: 'Admin', full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password_hash;
    res.json({
      message: `Master Administrator clearance verified. Welcome, ${user.full_name}.`,
      user,
      token,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Server error during administrator authentication.' });
  }
});

// 5. UPDATE USER PROFILE (Saves into PostgreSQL users table)
router.put('/profile', async (req, res) => {
  try {
    const { id, full_name, email, phone_number, organization } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required to update profile.' });
    }

    const cleanEmail = email ? email.trim().toLowerCase() : null;

    // Check email uniqueness if email changed
    if (cleanEmail) {
      const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [cleanEmail, id]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'This email is already in use by another account.' });
      }
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = COALESCE($1, full_name),
           email = COALESCE($2, email),
           phone_number = COALESCE($3, phone_number),
           organization = COALESCE($4, organization)
       WHERE id = $5
       RETURNING id, full_name, email, phone_number, user_type, badge_id, organization, avatar_url, status, created_at, last_login`,
      [full_name, cleanEmail, phone_number, organization, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found in database.' });
    }

    const updatedUser = result.rows[0];

    await pool.query(
      `INSERT INTO system_logs (level, message, user_email)
       VALUES ('INFO', $1, $2)`,
      [`Profile updated for ${updatedUser.full_name} (${updatedUser.email})`, updatedUser.email]
    );

    res.json({
      message: 'Profile settings successfully saved in PostgreSQL.',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile in database.' });
  }
});

// 6. CHANGE PASSWORD (Updates bcrypt hash in PostgreSQL)
router.post('/change-password', async (req, res) => {
  try {
    const { id, current_password, new_password } = req.body;
    if (!id || !current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    const userRes = await pool.query('SELECT password_hash, email FROM users WHERE id = $1', [id]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(current_password, userRes.rows[0].password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password does not match our records.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(new_password, salt);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, id]);
    await pool.query(
      `INSERT INTO system_logs (level, message, user_email)
       VALUES ('AUTH', $1, $2)`,
      [`Password updated successfully for ${userRes.rows[0].email}`, userRes.rows[0].email]
    );

    res.json({ message: 'Password has been successfully changed and encrypted in PostgreSQL.' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

module.exports = router;
