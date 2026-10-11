const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('./index');

async function initializeDatabase() {
  console.log('🔄 [PostgreSQL] Initializing tables from schema.sql...');
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  await pool.query(schemaSql);
  console.log('✅ [PostgreSQL] All tables and indexes created successfully.');

  // Seed Default Users
  console.log('🌱 [PostgreSQL] Seeding default accounts...');
  
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@1234', salt);
  const analystPasswordHash = await bcrypt.hash('Analyst@1234', salt);
  const creatorPasswordHash = await bcrypt.hash('Creator@1234', salt);

  const defaultUsers = [
    {
      full_name: 'Kaushik Killamsetty',
      email: 'admin@fdms.cyber',
      phone_number: '+1 (555) 019-2831',
      password_hash: adminPasswordHash,
      user_type: 'Admin',
      badge_id: 'ADM-001',
      organization: 'FDMS Global Security Ops',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    {
      full_name: 'Alex Vance',
      email: 'analyst@fdms.cyber',
      phone_number: '+1 (555) 084-9122',
      password_hash: analystPasswordHash,
      user_type: 'Analyst',
      badge_id: 'SEC-9042',
      organization: 'Cyber Threat Analysis Unit',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      full_name: 'Alex Vance',
      email: 'alex.vance@fdms.cyber',
      phone_number: '+1 (555) 084-9122',
      password_hash: analystPasswordHash,
      user_type: 'Analyst',
      badge_id: 'SEC-9042',
      organization: 'Cyber Threat Analysis Unit',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      full_name: 'Sarah Connor',
      email: 'creator@fdms.cyber',
      phone_number: '+1 (555) 432-8877',
      password_hash: creatorPasswordHash,
      user_type: 'User',
      badge_id: 'CRE-5501',
      organization: 'Apex Influencer Agency',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    }
  ];

  for (const u of defaultUsers) {
    await pool.query(`
      INSERT INTO users (full_name, email, phone_number, password_hash, user_type, badge_id, organization, avatar_url)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (email) DO UPDATE SET 
        password_hash = EXCLUDED.password_hash,
        user_type = EXCLUDED.user_type,
        badge_id = EXCLUDED.badge_id,
        full_name = EXCLUDED.full_name;
    `, [u.full_name, u.email, u.phone_number, u.password_hash, u.user_type, u.badge_id, u.organization, u.avatar_url]);
  }

  // Seed Creators
  const creators = [
    { id: 'CR-101', name: 'Aria Sterling', handle: '@aria_sterling', platform: 'Instagram', category: 'Fashion & Style', followers_count: '1.4M', engagement_rate: '1.8%', status: 'High Risk', risk_score: 88.5 },
    { id: 'CR-102', name: 'NovaTech Reviews', handle: '@novatech', platform: 'YouTube', category: 'Technology', followers_count: '850K', engagement_rate: '8.4%', status: 'Safe', risk_score: 14.2 },
    { id: 'CR-103', name: 'CyberGamer_00', handle: '@cybergamer', platform: 'Twitch', category: 'Gaming', followers_count: '420K', engagement_rate: '4.2%', status: 'Moderate Risk', risk_score: 54.0 },
    { id: 'CR-104', name: 'Elena FitLife', handle: '@elenafit', platform: 'TikTok', category: 'Fitness', followers_count: '2.1M', engagement_rate: '1.1%', status: 'High Risk', risk_score: 79.2 },
    { id: 'CR-105', name: 'Marcus Vlogs', handle: '@marcusvlogs', platform: 'YouTube', category: 'Travel', followers_count: '620K', engagement_rate: '6.9%', status: 'Safe', risk_score: 18.0 }
  ];

  for (const c of creators) {
    await pool.query(`
      INSERT INTO creators (id, name, handle, platform, category, followers_count, engagement_rate, status, risk_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        handle = EXCLUDED.handle,
        platform = EXCLUDED.platform,
        category = EXCLUDED.category,
        followers_count = EXCLUDED.followers_count,
        engagement_rate = EXCLUDED.engagement_rate,
        status = EXCLUDED.status,
        risk_score = EXCLUDED.risk_score;
    `, [c.id, c.name, c.handle, c.platform, c.category, c.followers_count, c.engagement_rate, c.status, c.risk_score]);
  }

  // Seed Videos
  const videos = [
    { id: 'VID-901', creator_id: 'CR-102', title: 'SECRET AI HACKS 2026 🔥', platform: 'YouTube', views_count: '1,420,000', likes_count: '142,000', comments_count: '12,400', upload_date: '2026-07-28' },
    { id: 'VID-902', creator_id: 'CR-101', title: 'Summer Fashion Try-On Haul', platform: 'Instagram', views_count: '890,000', likes_count: '12,000', comments_count: '450', upload_date: '2026-07-25' },
    { id: 'VID-903', creator_id: 'CR-104', title: '10 Min Ab Workout Challenge', platform: 'TikTok', views_count: '2,400,000', likes_count: '84,000', comments_count: '1,200', upload_date: '2026-07-20' },
    { id: 'VID-904', creator_id: 'CR-102', title: 'Unboxing Quantum Phone 15', platform: 'YouTube', views_count: '510,000', likes_count: '48,000', comments_count: '3,800', upload_date: '2026-07-15' }
  ];

  for (const v of videos) {
    await pool.query(`
      INSERT INTO videos (id, creator_id, title, platform, views_count, likes_count, comments_count, upload_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET 
        title = EXCLUDED.title,
        views_count = EXCLUDED.views_count,
        likes_count = EXCLUDED.likes_count,
        comments_count = EXCLUDED.comments_count;
    `, [v.id, v.creator_id, v.title, v.platform, v.views_count, v.likes_count, v.comments_count, v.upload_date]);
  }

  // Seed Reports
  const reports = [
    { id: 'REP-8801', creator_name: 'Aria Sterling', reason: 'Abnormal follower spike + 82% bot likes', score: 88.5, status: 'Flagged', report_date: '2026-07-30' },
    { id: 'REP-8802', creator_name: 'Elena FitLife', reason: 'Comment farm syndication detected', score: 79.2, status: 'Flagged', report_date: '2026-07-29' },
    { id: 'REP-8803', creator_name: 'CyberGamer_00', reason: 'Suspicious twitch viewbotting clusters', score: 54.0, status: 'Monitored', report_date: '2026-07-24' }
  ];

  for (const r of reports) {
    await pool.query(`
      INSERT INTO reports (id, creator_name, reason, score, status, report_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET 
        reason = EXCLUDED.reason,
        score = EXCLUDED.score,
        status = EXCLUDED.status;
    `, [r.id, r.creator_name, r.reason, r.score, r.status, r.report_date]);
  }

  // Seed System Logs
  const logCount = await pool.query('SELECT COUNT(*) FROM system_logs');
  if (parseInt(logCount.rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO system_logs (level, message, user_email) VALUES
      ('INFO', 'Neural network model v4.2 loaded into GPU memory.', 'system@fdms.cyber'),
      ('SYSTEM', 'PostgreSQL database pool healthy and synchronized.', 'admin@fdms.cyber'),
      ('ALERT', 'High risk threshold triggered for @aria_sterling (88.5%).', 'analyst@fdms.cyber'),
      ('AUDIT', 'Report REP-8801 compiled and hashed with SHA-256.', 'analyst@fdms.cyber'),
      ('AUTH', 'User admin@fdms.cyber granted master governance token.', 'admin@fdms.cyber');
    `);
  }

  // Seed Notifications
  const notifCount = await pool.query('SELECT COUNT(*) FROM notifications');
  if (parseInt(notifCount.rows[0].count, 10) === 0) {
    await pool.query(`
      INSERT INTO notifications (title, description, severity, category, target_handle, risk_score, is_read, action_data) VALUES
      ('High-Risk Bot Farm Identified', 'Creator @aria_sterling breached 88% fake followers threshold across 14,000 synthetic profiles.', 'CRITICAL', 'Threat', '@aria_sterling', 88.5, FALSE, '{"ip":"185.220.101.4","platform":"Instagram","vectors":["Follower Infiltration","Synthetic Likes"]}'::jsonb),
      ('Simulated Bot Swarm Infiltration Blocked', 'Sandbox bot attack simulator stress-test completed: 25,000 bot requests isolated and quarantined.', 'WARNING', 'Bot Attack', '@aria_sterling', 84.2, FALSE, '{"bots":25000,"quarantined":true,"platform":"Instagram"}'::jsonb),
      ('New Forensic Audit Report Generated', 'Report REP-8801 for Elena FitLife has been compiled and is ready for PDF / CSV download.', 'INFO', 'Report', '@elenafit', 79.2, FALSE, '{"report_id":"REP-8801","platform":"TikTok"}'::jsonb),
      ('Real-time Webhook Alert Dispatched', 'Automated webhook delivered to security-ops@fdms.cyber for creator risk exceeding 80% threshold.', 'CRITICAL', 'Threat', '@aria_sterling', 88.5, TRUE, '{"endpoint":"https://hooks.slack.com/services/FDMS/ALERT","status":"200 OK"}'::jsonb),
      ('Creator Profile Integrity Updated', 'Marcus Vlogs (@marcusvlogs) status verified as Safe following manual forensic audit review.', 'SUCCESS', 'System', '@marcusvlogs', 18.0, TRUE, '{"status":"Safe","analyst":"Alex Vance"}'::jsonb);
    `);
  }

  console.log('✨ [PostgreSQL] Database seeding complete! Ready for authentication and queries.');
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✅ Done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Database initialization error:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
