-- This script creates the first super admin account
-- Run this manually after creating the admins table
-- Password: mostaql@999

-- Insert the first super admin
INSERT INTO admins (admin_id, username, email, password, avatar, role, is_super_admin, created_at, last_active)
VALUES (
  'admin_super_001',
  'izzeldeen nasser',
  'thedevelper@goatly.space',
  '$2a$12$25z.11kUuuRh1zc3Um.1PO1adq3eJc57FW6C373wb80po.HXGjaHO',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
  'admin',
  true,
  NOW(),
  NOW()
);

-- Note: After running this migration, login at /admin-auth/login
-- Email: thedevelper@goatly.space
-- Password: mostaql@999
