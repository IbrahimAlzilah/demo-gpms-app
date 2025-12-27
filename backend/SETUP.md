# Laravel Backend Setup Guide

## Next Steps to Get Your Backend Running

### 1. Install Dependencies

```bash
cd backend
composer install
```

This will install Laravel Sanctum and all other required packages.

### 2. Environment Configuration

Copy the `.env.example` file to `.env` (if not already done):

```bash
cp .env.example .env
```

Update the `.env` file with your database configuration:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gpms_db
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Application URL
APP_URL=http://localhost:8000
```

### 3. Generate Application Key

```bash
php artisan key:generate
```

### 4. Run Database Migrations

```bash
php artisan migrate
```

This will create all the database tables.

### 5. Seed the Database

```bash
php artisan db:seed
```

This will create:

-   Admin user: `admin@gpms.local` / `password`
-   Supervisor: `supervisor@gpms.local` / `password`
-   5 Sample students: `student1@gpms.local` to `student5@gpms.local` / `password`
-   Committee members

### 6. Create Storage Link (for file uploads)

```bash
php artisan storage:link
```

This creates a symbolic link for document storage.

### 7. Start the Development Server

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### 8. Test the API

You can test the login endpoint:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gpms.local","password":"password"}'
```

### 9. Connect Frontend to Backend

Update your frontend `.env` file (or `.env.local`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

### 10. Important Notes

#### Authentication

-   The API uses Laravel Sanctum for authentication
-   Tokens are returned in the login response
-   Include the token in the `Authorization` header: `Bearer {token}`

#### CORS

-   CORS is configured in `config/cors.php`
-   Make sure your frontend URL is in the `allowed_origins` array

#### File Uploads

-   Documents are stored in `storage/app/documents`
-   Make sure the directory exists and is writable
-   The storage link makes files accessible via `/storage/documents/`

### 11. API Endpoints Overview

#### Authentication

-   `POST /api/auth/login` - Login
-   `POST /api/auth/register` - Register (optional)
-   `POST /api/auth/logout` - Logout
-   `GET /api/auth/me` - Get current user
-   `POST /api/auth/recover-password` - Password recovery
-   `POST /api/auth/reset-password` - Reset password

#### Student Endpoints

-   `GET /api/student/proposals` - List proposals
-   `POST /api/student/proposals` - Create proposal
-   `GET /api/student/projects` - List projects
-   `POST /api/student/projects/{id}/register` - Register for project
-   `GET /api/student/groups` - Get group
-   `POST /api/student/groups` - Create group
-   `GET /api/student/documents` - List documents
-   `POST /api/student/documents` - Upload document
-   `GET /api/student/requests` - List requests
-   `POST /api/student/requests` - Create request
-   `GET /api/student/grades` - View grades

#### Supervisor Endpoints

-   `GET /api/supervisor/projects` - List supervised projects
-   `GET /api/supervisor/supervision-requests` - List requests
-   `POST /api/supervisor/supervision-requests/{id}/approve` - Approve request
-   `POST /api/supervisor/evaluations` - Submit grade
-   `GET /api/supervisor/notes` - List notes
-   `POST /api/supervisor/notes` - Add note

#### Projects Committee Endpoints

-   `GET /api/projects-committee/proposals` - List proposals
-   `POST /api/projects-committee/proposals/{id}/approve` - Approve proposal
-   `POST /api/projects-committee/proposals/{id}/reject` - Reject proposal
-   `GET /api/projects-committee/periods` - List periods
-   `POST /api/projects-committee/periods` - Create period
-   `POST /api/projects-committee/projects/announce` - Announce projects
-   `GET /api/projects-committee/reports` - Generate reports

#### Discussion Committee Endpoints

-   `GET /api/discussion-committee/projects` - List assigned projects
-   `POST /api/discussion-committee/evaluations` - Submit final grade

#### Admin Endpoints

-   `GET /api/admin/users` - List users
-   `POST /api/admin/users` - Create user
-   `PUT /api/admin/users/{id}` - Update user
-   `DELETE /api/admin/users/{id}` - Delete user
-   `GET /api/admin/reports` - System reports

### 12. Troubleshooting

#### Migration Errors

If you get foreign key errors, make sure migrations run in order. You may need to:

```bash
php artisan migrate:fresh
php artisan db:seed
```

#### CORS Issues

-   Check `config/cors.php` has your frontend URL
-   Clear config cache: `php artisan config:clear`

#### File Upload Issues

-   Ensure `storage/app/documents` directory exists
-   Check file permissions
-   Verify `storage:link` was run

#### Authentication Issues

-   Verify Sanctum is installed: `composer show laravel/sanctum`
-   Check token is being sent in Authorization header
-   Verify user status is 'active'

### 13. Production Considerations

Before deploying to production:

1. **Security**

    - Change all default passwords
    - Use strong passwords
    - Enable HTTPS
    - Review CORS settings
    - Set `APP_DEBUG=false`

2. **Database**

    - Use proper database credentials
    - Set up database backups
    - Optimize database indexes

3. **File Storage**

    - Consider using S3 or cloud storage
    - Set up proper file permissions
    - Implement file size limits

4. **Performance**

    - Enable caching
    - Optimize database queries
    - Use queue workers for heavy tasks

5. **Monitoring**
    - Set up error logging
    - Monitor API performance
    - Track user activity

### 14. Next Development Steps

1. **Add Authorization Policies** (if needed)

    - Create policies in `app/Policies/`
    - Implement fine-grained permissions

2. **Add Form Request Validation**

    - Create Form Request classes for better validation
    - Move validation logic from controllers

3. **Add API Documentation**

    - Consider using Laravel API Documentation or Swagger
    - Document all endpoints

4. **Add Tests**

    - Write feature tests for critical endpoints
    - Test authentication and authorization
    - Test business logic workflows

5. **Add Notifications**

    - Implement real-time notifications (WebSockets/Pusher)
    - Email notifications for important events

6. **Add Reporting**
    - Enhance report generation
    - Add export functionality (PDF/Excel)
