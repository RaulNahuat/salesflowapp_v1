# Database Migration Guide: Partial Unique Indexes

## Overview

This migration adds partial unique indexes to the `users` table to allow phone number and email reuse after account deletion.

## Prerequisites

- Database backup (recommended)
- Database credentials with ALTER TABLE permissions
- Access to MySQL client or database management tool

## Migration Steps

### 1. Create a Backup

Before running any migration, create a backup of your database:

```bash
# Using mysqldump
mysqldump -u your_username -p your_database_name > backup_before_migration.sql
```

### 2. Connect to Your Database

Connect to your MySQL database using your preferred method:

**Option A: MySQL Command Line**
```bash
mysql -u your_username -p your_database_name
```

**Option B: Using .env credentials**
Check your `.env` file for database credentials:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

### 3. Run the Migration

Execute the migration script:

**Option A: From MySQL prompt**
```sql
source /path/to/migrations/add_partial_unique_indexes.sql
```

**Option B: From command line**
```bash
mysql -u your_username -p your_database_name < migrations/add_partial_unique_indexes.sql
```

**Option C: Copy and paste**
Open `add_partial_unique_indexes.sql` and copy the SQL commands under "FORWARD MIGRATION", then paste them into your MySQL client.

### 4. Verify the Migration

Run these verification queries:

```sql
-- Check that the new indexes exist
SHOW INDEX FROM users WHERE Key_name LIKE '%active%';

-- You should see:
-- users_phone_active_unique
-- users_email_active_unique

-- View the table structure
SHOW CREATE TABLE users;
```

### 5. Restart the Backend Server

After the migration completes successfully:

1. Stop the backend server (Ctrl+C in the terminal running `npm run dev`)
2. Restart it: `npm run dev`

## Testing the Migration

### Test 1: Account Deletion and Re-registration

1. Create a test account with a unique phone number
2. Delete the account from the profile page
3. Register a new account with the same phone number
4. ✅ Registration should succeed

### Test 2: Duplicate Active Users

1. Create an account with phone number `1234567890`
2. Try to create another account with the same phone number
3. ✅ Should receive an error about duplicate phone

### Test 3: Database Verification

```sql
-- Check for multiple records with same phone
SELECT id, phone, email, deletedAt 
FROM users 
WHERE phone = 'your_test_phone_number';

-- You should see:
-- - One record with deletedAt = NULL (active user)
-- - One or more records with deletedAt set (deleted users)
```

## Rollback Instructions

If you need to revert this migration:

1. **Stop the backend server**

2. **Run the rollback SQL**:
   ```sql
   DROP INDEX users_phone_active_unique ON users;
   DROP INDEX users_email_active_unique ON users;
   ALTER TABLE users ADD UNIQUE INDEX phone (phone);
   ALTER TABLE users ADD UNIQUE INDEX email (email);
   ```

3. **Restore the User model**:
   - Add back `unique: true` to phone and email fields in `models/User.js`

4. **Restart the backend server**

## Troubleshooting

### Error: "Can't DROP 'phone'; check that column/key exists"

The unique constraint might have a different name. Find the actual name:

```sql
SHOW CREATE TABLE users;
```

Look for the constraint names and update the DROP INDEX commands accordingly.

### Error: "Partial indexes not supported"

Your MySQL version might not support partial indexes (WHERE clause). This feature requires:
- MySQL 8.0.13 or higher
- MariaDB 10.2 or higher

Check your version:
```sql
SELECT VERSION();
```

If your version doesn't support partial indexes, you'll need to use Option 2 from the original discussion (modify phone on deletion).

### Migration runs but indexes aren't created

Check for syntax errors in the output. Ensure your MySQL version supports the `WHERE` clause in CREATE INDEX.

## Support

If you encounter issues:
1. Check the error message carefully
2. Verify your MySQL version supports partial indexes
3. Ensure you have proper database permissions
4. Review the backup before making changes
