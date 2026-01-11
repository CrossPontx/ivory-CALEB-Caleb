-- Add new social media fields to tech_profiles table
ALTER TABLE tech_profiles 
ADD COLUMN IF NOT EXISTS tiktok_handle VARCHAR(100),
ADD COLUMN IF NOT EXISTS facebook_handle VARCHAR(100),
ADD COLUMN IF NOT EXISTS other_social_links JSONB;

-- Add comments for documentation
COMMENT ON COLUMN tech_profiles.tiktok_handle IS 'TikTok username without @ symbol';
COMMENT ON COLUMN tech_profiles.facebook_handle IS 'Facebook username or page name';
COMMENT ON COLUMN tech_profiles.other_social_links IS 'Array of additional social media links with platform, handle, and url fields';

-- Example of other_social_links structure:
-- [
--   {"platform": "YouTube", "handle": "channelname", "url": "https://youtube.com/@channelname"},
--   {"platform": "Pinterest", "handle": "username", "url": "https://pinterest.com/username"}
-- ]