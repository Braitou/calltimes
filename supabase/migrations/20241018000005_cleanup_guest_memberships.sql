-- Migration: Cleanup guest service accounts from memberships
-- Date: 2024-10-18
-- Description: Remove guest service accounts from memberships table to ensure they are treated as external guests

-- Remove all memberships for guest service accounts (identified by email pattern)
-- Guest service accounts have emails like: guest-{token}@call-times.internal
DELETE FROM memberships
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email LIKE 'guest-%@call-times.internal'
);

-- Add comment for clarity
COMMENT ON TABLE memberships IS 'Organization memberships. Only real organization members (owners) should be here, NOT guest service accounts.';


