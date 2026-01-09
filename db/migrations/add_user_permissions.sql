-- Add permission fields to users table
ALTER TABLE users 
ADD COLUMN camera_permission_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN photos_permission_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN notifications_permission_granted BOOLEAN DEFAULT FALSE,
ADD COLUMN permissions_requested_at TIMESTAMP;

-- Add index for faster permission queries
CREATE INDEX idx_users_permissions ON users(camera_permission_granted, photos_permission_granted, notifications_permission_granted);