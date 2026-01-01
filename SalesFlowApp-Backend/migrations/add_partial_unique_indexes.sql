-- Migration: Add Partial Unique Indexes for Phone and Email
-- Date: 2026-01-01
-- Purpose: Allow phone/email reuse after account deletion (soft delete)
--
-- This migration:
-- 1. Drops existing unique constraints on phone and email
-- 2. Creates partial unique indexes that only apply to active users (deletedAt IS NULL)
-- 3. Allows multiple soft-deleted users to have the same phone/email

-- ============================================================================
-- FORWARD MIGRATION
-- ============================================================================

-- Step 1: Drop existing unique constraints
-- Note: The constraint names may vary depending on your database setup
-- If these fail, check the actual constraint names with: SHOW CREATE TABLE users;

ALTER TABLE users DROP INDEX phone;
ALTER TABLE users DROP INDEX email;

-- Step 2: Create partial unique indexes for active users only
-- These indexes enforce uniqueness only when deletedAt IS NULL

CREATE UNIQUE INDEX users_phone_active_unique 
ON users (phone) 
WHERE deletedAt IS NULL;

CREATE UNIQUE INDEX users_email_active_unique 
ON users (email) 
WHERE deletedAt IS NULL;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the indexes were created successfully
SHOW INDEX FROM users WHERE Key_name LIKE '%active%';

-- View the updated table structure
SHOW CREATE TABLE users;

-- ============================================================================
-- ROLLBACK MIGRATION (if needed)
-- ============================================================================

-- Uncomment and run these commands to rollback the migration:

-- DROP INDEX users_phone_active_unique ON users;
-- DROP INDEX users_email_active_unique ON users;
-- ALTER TABLE users ADD UNIQUE INDEX phone (phone);
-- ALTER TABLE users ADD UNIQUE INDEX email (email);
