# Frontend Configuration Guide

## Environment Variables

Create a `.env` file in the `frontend` directory with the following variables:

```env
# API Configuration
# Update this to match your backend API URL
VITE_API_BASE_URL=http://localhost:8000/api

# Frontend URL (for reference)
VITE_FRONTEND_URL=http://localhost:5173
```

## Setup Instructions

1. **Create the `.env` file:**
   ```bash
   cd frontend
   cp .env.example .env  # If .env.example exists
   # Or create .env manually with the content above
   ```

2. **Update the API Base URL:**
   - If your backend runs on a different port, update `VITE_API_BASE_URL`
   - For production, use your production API URL (e.g., `https://api.yourdomain.com/api`)

3. **Restart the development server:**
   ```bash
   npm run dev
   ```

## Backend Connection

The frontend is configured to connect to the Laravel backend API. Make sure:

1. **Backend is running** on the port specified in `VITE_API_BASE_URL` (default: `http://localhost:8000`)
2. **CORS is configured** in the backend to allow requests from the frontend URL
3. **Authentication tokens** are stored in `localStorage` and sent with each request via the `Authorization` header

## API Response Format

The frontend expects backend responses in the following format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... }  // For paginated responses
}
```

The axios interceptor automatically extracts the `data` field from successful responses.

## Error Handling

The frontend handles common HTTP errors:
- **401 Unauthorized**: Automatically redirects to login page
- **403 Forbidden**: Shows error message
- **422 Validation Error**: Displays validation errors
- **500 Server Error**: Shows generic error message

