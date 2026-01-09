# 🔧 Fix for Missing personal_access_tokens Table

## Problem

The error shows that the `personal_access_tokens` table doesn't exist in your database. This table is required by Laravel Sanctum to store API authentication tokens.

## Solution Applied

✅ Created the missing migration file: `backend/database/migrations/0001_01_01_000003_create_personal_access_tokens_table.php`

## ⚡ Action Required - Run This Command

Open your terminal in the **backend** directory and run:

```bash
php artisan migrate
```

This will create the `personal_access_tokens` table in your database.

## Step-by-Step Instructions

### Option 1: Using Terminal 6 (Already in backend directory)

Since you're already in the backend directory (as shown in terminal 6), just run:

```bash
php artisan migrate
```

### Option 2: From Project Root

If you're in the project root:

```bash
cd backend
php artisan migrate
```

## Expected Output

You should see something like:

```
INFO  Running migrations.

2024_01_01_000003_create_personal_access_tokens_table .... 15ms DONE
```

## Verification

After running the migration, test the login again. It should now work!

Test with:

- Email: `admin@gpms.local`
- Password: `password`

## What This Table Does

The `personal_access_tokens` table stores:

- API tokens for authenticated users
- Token names and abilities (permissions)
- Token expiration dates
- Last used timestamps

This is essential for Laravel Sanctum's API authentication system.

## If You Get "Nothing to migrate"

If you see "Nothing to migrate", it means the migration already ran. Check if the table exists:

```bash
php artisan tinker
```

Then type:

```php
Schema::hasTable('personal_access_tokens');
```

Should return `true`.

If it returns `false`, there might be a migration tracking issue. Run:

```bash
php artisan migrate:refresh --seed
```

⚠️ **Warning**: This will drop all tables and recreate them, so only use in development!

## Quick Test After Migration

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gpms.local","password":"password"}'
```

You should now get a successful response with a token! 🎉
