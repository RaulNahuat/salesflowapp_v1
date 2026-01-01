-- Quick Migration Script
-- Run this directly in your MySQL client

-- Step 1: Drop existing unique constraints
ALTER TABLE users DROP INDEX phone;
ALTER TABLE users DROP INDEX email;

-- Step 2: Create partial unique indexes
CREATE UNIQUE INDEX users_phone_active_unique ON users (phone) WHERE deletedAt IS NULL;
CREATE UNIQUE INDEX users_email_active_unique ON users (email) WHERE deletedAt IS NULL;

-- Step 3: Verify
SHOW INDEX FROM users WHERE Key_name LIKE '%active%';
