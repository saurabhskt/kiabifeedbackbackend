-- Run manually OR let TypeORM synchronize=true auto-create in dev
CREATE DATABASE kiabi_feedback;
\c kiabi_feedback;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL,
  gender VARCHAR(30) NOT NULL, age_group VARCHAR(10) NOT NULL,
  employment_status VARCHAR(20) NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS outfits (
  id SERIAL PRIMARY KEY, name VARCHAR(150) NOT NULL, category VARCHAR(80) NOT NULL,
  tag VARCHAR(50) NOT NULL, emoji VARCHAR(10) NOT NULL, bg_color VARCHAR(20) NOT NULL,
  description VARCHAR(200) NOT NULL, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY, user_id INT REFERENCES users(id) ON DELETE SET NULL,
  outfit_id INT NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('love','nope')),
  dwell_time_ms INT DEFAULT 0, user_name VARCHAR(100), user_gender VARCHAR(30),
  user_age_group VARCHAR(10), user_employment VARCHAR(20), voted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey tables
CREATE TABLE IF NOT EXISTS survey_sessions (
  id SERIAL PRIMARY KEY, session_id VARCHAR(36) UNIQUE NOT NULL,
  user_name VARCHAR(100) NOT NULL, user_gender VARCHAR(30) NOT NULL,
  user_age_group VARCHAR(10) NOT NULL, user_employment VARCHAR(20) NOT NULL,
  income_bracket VARCHAR(20) DEFAULT 'not_answered',
  total_answered INT DEFAULT 0, total_skipped INT DEFAULT 0,
  yes_count INT DEFAULT 0, nope_count INT DEFAULT 0,
  skipped_card_ids TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_answers (
  id SERIAL PRIMARY KEY, session_id VARCHAR(36) NOT NULL
    REFERENCES survey_sessions(session_id) ON DELETE CASCADE,
  card_id VARCHAR(10) NOT NULL, section VARCHAR(60) NOT NULL,
  statement TEXT NOT NULL, answer VARCHAR(6) NOT NULL CHECK (answer IN ('yes','nope')),
  dwell_time_ms INT DEFAULT 0, user_gender VARCHAR(30),
  user_age_group VARCHAR(10), user_employment VARCHAR(20),
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sa_card    ON survey_answers(card_id);
CREATE INDEX IF NOT EXISTS idx_sa_section ON survey_answers(section);
CREATE INDEX IF NOT EXISTS idx_sa_answer  ON survey_answers(answer);
CREATE INDEX IF NOT EXISTS idx_sa_gender  ON survey_answers(user_gender);
CREATE INDEX IF NOT EXISTS idx_sa_age     ON survey_answers(user_age_group);

-- Analytics views
CREATE OR REPLACE VIEW card_yes_rates AS
SELECT card_id, section, COUNT(*) AS total_responses,
  SUM(CASE WHEN answer='yes' THEN 1 ELSE 0 END) AS yes_count,
  ROUND(SUM(CASE WHEN answer='yes' THEN 1 ELSE 0 END)*100.0/NULLIF(COUNT(*),0),1) AS yes_rate_pct,
  ROUND(AVG(dwell_time_ms)) AS avg_dwell_ms
FROM survey_answers GROUP BY card_id, section ORDER BY section, card_id;

CREATE OR REPLACE VIEW income_distribution AS
SELECT income_bracket, COUNT(*) AS sessions,
  ROUND(COUNT(*)*100.0/SUM(COUNT(*)) OVER(),1) AS pct
FROM survey_sessions GROUP BY income_bracket ORDER BY sessions DESC;

CREATE OR REPLACE VIEW skip_frequency AS
SELECT unnest(skipped_card_ids) AS card_id, COUNT(*) AS times_skipped
FROM survey_sessions GROUP BY card_id ORDER BY times_skipped DESC;
