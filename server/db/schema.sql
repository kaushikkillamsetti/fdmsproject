-- ============================================================================
-- FDMS (Fake Detection Management System) PostgreSQL Schema
-- ============================================================================

-- Drop tables in reverse dependency order if needed for clean reload (optional)
-- DROP TABLE IF EXISTS system_logs CASCADE;
-- DROP TABLE IF EXISTS detections CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;
-- DROP TABLE IF EXISTS comments CASCADE;
-- DROP TABLE IF EXISTS likes CASCADE;
-- DROP TABLE IF EXISTS followers CASCADE;
-- DROP TABLE IF EXISTS videos CASCADE;
-- DROP TABLE IF EXISTS creators CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (Authentication, Multi-Role Access & Platform Accounts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) UNIQUE NOT NULL,
    phone_number VARCHAR(40),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(40) NOT NULL DEFAULT 'User', -- 'Admin', 'Analyst', 'User'
    badge_id VARCHAR(50),                          -- e.g. 'SEC-9921', 'ADM-001'
    organization VARCHAR(150) DEFAULT 'FDMS Intelligence',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status VARCHAR(30) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- 2. CREATORS TABLE (Social Media Influencers & Monitored Profiles)
CREATE TABLE IF NOT EXISTS creators (
    id VARCHAR(50) PRIMARY KEY,                    -- e.g. 'CR-101'
    name VARCHAR(120) NOT NULL,
    handle VARCHAR(100),                           -- e.g. '@aria_sterling'
    platform VARCHAR(50) NOT NULL,                 -- 'Instagram', 'YouTube', 'TikTok', 'Twitch', 'Twitter'
    category VARCHAR(80),                          -- 'Fashion & Style', 'Technology', etc.
    followers_count VARCHAR(50),                   -- '1.4M'
    engagement_rate VARCHAR(30),                   -- '1.8%'
    status VARCHAR(50) NOT NULL DEFAULT 'Safe',    -- 'Safe', 'Moderate Risk', 'High Risk'
    risk_score NUMERIC(5,2) DEFAULT 0.0,           -- 0.00 to 100.00
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. VIDEOS TABLE (Monitored Post Media & Analytics)
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY,                    -- e.g. 'VID-901'
    creator_id VARCHAR(50) REFERENCES creators(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    views_count VARCHAR(50),
    likes_count VARCHAR(50),
    comments_count VARCHAR(50),
    upload_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. REPORTS TABLE (Audit & Forensic Investigations)
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(50) PRIMARY KEY,                    -- e.g. 'REP-8801'
    creator_name VARCHAR(120) NOT NULL,
    creator_id VARCHAR(50) REFERENCES creators(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    score NUMERIC(5,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Flagged',
    generated_by VARCHAR(120) DEFAULT 'Lead Security Analyst',
    report_date VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. DETECTIONS TABLE (AI Neural Network Scans & Telemetry)
CREATE TABLE IF NOT EXISTS detections (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(100) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    suspicious_score INT NOT NULL,
    confidence_score INT NOT NULL,
    followers_base INT DEFAULT 0,
    fake_followers_count INT DEFAULT 0,
    fake_likes_count INT DEFAULT 0,
    fake_comments_count INT DEFAULT 0,
    status_label VARCHAR(50) NOT NULL,
    badge_class VARCHAR(50) NOT NULL,
    analyzed_by VARCHAR(120) DEFAULT 'AI Sentinel Core',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. SYSTEM LOGS TABLE (Security Audit Trail & Governance)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20) DEFAULT 'INFO',              -- 'INFO', 'WARN', 'ALERT', 'AUTH'
    message TEXT NOT NULL,
    user_email VARCHAR(160),
    ip_address VARCHAR(50) DEFAULT '127.0.0.1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. NOTIFICATIONS TABLE (Real-Time Threat Alerts, Bot Infiltration & Incidents)
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    severity VARCHAR(30) DEFAULT 'CRITICAL',       -- 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'
    category VARCHAR(50) DEFAULT 'Threat',         -- 'Threat', 'Bot Attack', 'Report', 'System'
    target_handle VARCHAR(100),
    risk_score NUMERIC(5,2),
    is_read BOOLEAN DEFAULT FALSE,
    action_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create helpful indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_creators_platform ON creators(platform);
CREATE INDEX IF NOT EXISTS idx_creators_status ON creators(status);
CREATE INDEX IF NOT EXISTS idx_detections_handle ON detections(handle);
CREATE INDEX IF NOT EXISTS idx_reports_score ON reports(score);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
