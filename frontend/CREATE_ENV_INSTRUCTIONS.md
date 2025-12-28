# Instructions to Create .env File

Due to path encoding issues, please create the `.env` file manually in the `frontend` directory.

## Steps:

1. Navigate to the `frontend` directory in your project
2. Create a new file named `.env` (with the dot at the beginning)
3. Add the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Frontend URL (for reference)
VITE_FRONTEND_URL=http://localhost:5173
```

## Alternative: Using Command Line

If you're in the project root directory, you can create it using:

**PowerShell:**
```powershell
cd frontend
"# API Configuration`nVITE_API_BASE_URL=http://localhost:8000/api`n`n# Frontend URL (for reference)`nVITE_FRONTEND_URL=http://localhost:5173" | Out-File -FilePath .env -Encoding utf8
```

**Command Prompt:**
```cmd
cd frontend
echo # API Configuration > .env
echo VITE_API_BASE_URL=http://localhost:8000/api >> .env
echo. >> .env
echo # Frontend URL (for reference) >> .env
echo VITE_FRONTEND_URL=http://localhost:5173 >> .env
```

**Bash/Linux/Mac:**
```bash
cd frontend
cat > .env << EOF
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Frontend URL (for reference)
VITE_FRONTEND_URL=http://localhost:5173
EOF
```

## Important Notes:

- After creating the `.env` file, **restart your Vite development server** for the changes to take effect
- The `.env` file is already added to `.gitignore` so it won't be committed to version control
- If your backend runs on a different port, update `VITE_API_BASE_URL` accordingly



