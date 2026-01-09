# Frontend-Backend Connection Setup & Verification Guide

## Quick Setup Checklist

### Frontend Setup

1. **Create `.env` file** in `frontend/` directory:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Frontend URL (for reference)
VITE_FRONTEND_URL=http://localhost:5173
```

**⚠️ IMPORTANT for Windows with Arabic paths**: If you encounter issues creating the `.env` file via terminal, create it manually using a text editor (VS Code, Notepad++, etc.) with UTF-8 encoding.

2. **Install dependencies**:

```bash
cd frontend
npm install
```

3. **Start frontend server**:

```bash
npm run dev
```

Frontend will run on: http://localhost:5173

### Backend Setup

1. **Install Composer dependencies**:

```bash
cd backend
composer install
```

2. **Create `.env` file** (copy from `.env.example` if it exists):

```bash
cp .env.example .env
```

3. **Configure database** in `backend/.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gpms_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

FRONTEND_URL=http://localhost:5173
APP_URL=http://localhost:8000
```

4. **Generate application key**:

```bash
php artisan key:generate
```

5. **Run migrations**:

```bash
php artisan migrate
```

6. **Seed database** (creates test users):

```bash
php artisan db:seed
```

7. **Start backend server**:

```bash
php artisan serve
```

Backend will run on: http://localhost:8000

## Verification Steps

### 1. Test Backend Health

Open your browser or use curl to test:

```bash
curl http://localhost:8000/api/health
```

Expected response:

```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "timestamp": "2025-12-27T19:00:00.000000Z",
    "database": "connected"
  }
}
```

### 2. Test CORS Configuration

Open browser console on http://localhost:5173 and run:

```javascript
fetch("http://localhost:8000/api/health")
  .then((res) => res.json())
  .then((data) => console.log("Backend reachable:", data))
  .catch((err) => console.error("Connection error:", err));
```

If you see a CORS error, check:

- Backend `config/cors.php` includes `http://localhost:5173`
- Backend `.env` has `FRONTEND_URL=http://localhost:5173`
- Run `php artisan config:clear` in backend

### 3. Test Login Endpoint

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gpms.local","password":"password"}'
```

Expected response:

```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {...},
    "permissions": [...]
  }
}
```

## Default Test Accounts

After running `php artisan db:seed`, you can use:

- **Admin**: admin@gpms.local / password
- **Supervisor**: supervisor@gpms.local / password
- **Students**: student1@gpms.local to student5@gpms.local / password

## Common Issues & Solutions

### Issue 1: 500 Internal Server Error

**Symptoms**: Frontend shows "Internal Server Error" when trying to login

**Solutions**:

1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Verify database connection:
   ```bash
   cd backend
   php artisan tinker
   DB::connection()->getPdo();
   ```
3. Ensure migrations ran successfully:
   ```bash
   php artisan migrate:status
   ```
4. Check if Laravel Sanctum is installed:
   ```bash
   composer show laravel/sanctum
   ```

### Issue 2: CORS Error

**Symptoms**: Browser console shows "has been blocked by CORS policy"

**Solutions**:

1. Verify `backend/config/cors.php` allows your frontend URL
2. Clear Laravel config cache:
   ```bash
   cd backend
   php artisan config:clear
   php artisan cache:clear
   ```
3. Restart backend server

### Issue 3: 404 Not Found on API Routes

**Symptoms**: `/api/auth/login` returns 404

**Solutions**:

1. Ensure backend is running on port 8000
2. Verify `VITE_API_BASE_URL` in frontend `.env` is correct
3. Check Laravel routes:
   ```bash
   php artisan route:list --path=api/auth
   ```

### Issue 4: Frontend .env Not Loading

**Symptoms**: API requests go to wrong URL

**Solutions**:

1. Verify `.env` file exists in `frontend/` directory
2. Restart Vite dev server (Ctrl+C and `npm run dev`)
3. Check Vite loads env vars:
   - Open browser console
   - Type: `import.meta.env.VITE_API_BASE_URL`

### Issue 5: Database Connection Refused

**Symptoms**: "SQLSTATE[HY000] [2002] Connection refused"

**Solutions**:

1. Ensure MySQL/MariaDB is running
2. Verify database credentials in `backend/.env`
3. Create database if it doesn't exist:
   ```sql
   CREATE DATABASE gpms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Issue 6: Token/Authentication Issues

**Symptoms**: 401 Unauthorized on protected routes

**Solutions**:

1. Verify Sanctum configuration: `backend/config/sanctum.php`
2. Check if token is being sent in Authorization header (browser Network tab)
3. Ensure user status is 'active' in database

## Debug Mode

To see detailed errors during development, ensure in `backend/.env`:

```env
APP_DEBUG=true
APP_ENV=local
```

⚠️ **Never use `APP_DEBUG=true` in production!**

## Monitoring Requests

### Backend Logs

Watch Laravel logs in real-time:

```bash
tail -f backend/storage/logs/laravel.log
```

### Frontend Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "XHR" or "Fetch"
4. Try logging in and inspect the request/response

## File Structure Check

Verify these key files exist:

- ✅ `frontend/.env` (create if missing)
- ✅ `frontend/src/lib/axios.ts`
- ✅ `backend/.env` (copy from .env.example)
- ✅ `backend/config/cors.php`
- ✅ `backend/routes/api.php`
- ✅ `backend/app/Http/Controllers/AuthController.php`

## Success Indicators

When everything is working correctly:

1. ✅ Backend shows: "Server running on [http://127.0.0.1:8000]"
2. ✅ Frontend shows: "VITE v... ready in ... ms"
3. ✅ `/api/health` returns 200 OK
4. ✅ Login redirects to appropriate dashboard
5. ✅ No CORS errors in browser console
6. ✅ Backend logs show successful requests (200 status)

## Need Help?

If you're still experiencing issues:

1. Check Laravel logs: `backend/storage/logs/laravel.log`
2. Check browser console for JavaScript errors
3. Verify both servers are running (frontend on :5173, backend on :8000)
4. Ensure `.env` files are properly configured in both directories
5. Try the health check endpoint first to verify basic connectivity
