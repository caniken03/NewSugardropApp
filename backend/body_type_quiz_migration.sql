-- Body Type Quiz Database Schema Migration
-- Add columns to users table for storing quiz results and enhanced profile data

-- Add Body Type Quiz result columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS body_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS sugarpoints_range VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_path VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS quiz_completed_at TIMESTAMPTZ;

-- Add enhanced profile columns for onboarding
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS activity_level VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS health_goals JSONB;
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_sugar_points_target INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS completed_onboarding BOOLEAN DEFAULT FALSE;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_body_type ON users(body_type);
CREATE INDEX IF NOT EXISTS idx_users_completed_onboarding ON users(completed_onboarding);
CREATE INDEX IF NOT EXISTS idx_users_activity_level ON users(activity_level);

-- Comments for documentation
COMMENT ON COLUMN users.body_type IS 'Body type classification from quiz: Ectomorph, Mesomorph, Endomorph, or Hybrid';
COMMENT ON COLUMN users.sugarpoints_range IS 'Recommended daily SugarPoints range based on body type (e.g., "75-100")';
COMMENT ON COLUMN users.onboarding_path IS 'Personalized onboarding path: Standard, Conservative, High Energy, or Balanced';
COMMENT ON COLUMN users.daily_sugar_points_target IS 'Personalized daily SugarPoints target (replaces daily_sugar_goal)';
COMMENT ON COLUMN users.health_goals IS 'Array of selected health goals from onboarding';
COMMENT ON COLUMN users.completed_onboarding IS 'Whether user has completed the full onboarding flow including quiz';