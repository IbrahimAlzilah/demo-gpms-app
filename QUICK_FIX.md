# ⚡ QUICK FIX - Run This Now!

## The Error You're Seeing

```
Table 'gpms_db.personal_access_tokens' doesn't exist
```

## The Solution (2 Steps)

### Step 1: Run Migration (Backend)

Open your backend terminal and run:

```bash
php artisan migrate
```

**Expected output:**

```
INFO  Running migrations.
0001_01_01_000003_create_personal_access_tokens_table .... DONE
```

### Step 2: Create Frontend .env File

Create file: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FRONTEND_URL=http://localhost:5173
```

Then restart frontend:

```bash
# Press Ctrl+C to stop
npm run dev
```

## Test It Works

Try logging in with:

- Email: `admin@gpms.local`
- Password: `password`

✅ Should now work!

---

📖 For detailed explanation, see: `COMPLETE_FIX_SUMMARY.md`
