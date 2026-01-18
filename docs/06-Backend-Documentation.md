# توثيق الواجهة الخلفية (Backend)

## نظرة عامة

الواجهة الخلفية (Backend) مبنية باستخدام **Laravel 12** و **PHP 8.2+**. توفر API RESTful للواجهة الأمامية وتتعامل مع جميع منطق العمل وإدارة البيانات.

## التقنيات المستخدمة

- **Laravel 12**: إطار عمل PHP
- **Laravel Sanctum**: نظام المصادقة
- **Eloquent ORM**: للتعامل مع قاعدة البيانات
- **SQLite/MySQL**: قاعدة البيانات

---

## البنية الأساسية

### 1. Routes (المسارات)

#### الملف: `routes/api.php`

يحتوي على جميع نقاط النهاية (Endpoints) للـ API:

```php
// مسارات عامة
Route::get('/health', ...);  // فحص صحة النظام

// مسارات المصادقة (عامة)
Route::prefix('auth')->group(function () {
    Route::post('/login', ...);
    Route::post('/register', ...);
});

// مسارات محمية (تتطلب مصادقة)
Route::middleware('auth:sanctum')->group(function () {
    // مسارات الطلاب
    Route::prefix('student')->middleware('role:student')->group(function () {
        // ...
    });
    
    // مسارات المشرفين
    Route::prefix('supervisor')->middleware('role:supervisor')->group(function () {
        // ...
    });
});
```

#### بنية المسارات

- **Public Routes**: متاحة للجميع (مثل: تسجيل الدخول)
- **Protected Routes**: تتطلب مصادقة (Token)
- **Role-based Routes**: تتطلب دور معين

---

### 2. Controllers (المتحكمات)

#### الموقع: `app/Http/Controllers/`

**هيكل Controller نموذجي:**

```php
<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Services\ProjectService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(
        protected ProjectService $projectService
    ) {}
    
    /**
     * عرض قائمة المشاريع
     */
    public function index(Request $request)
    {
        // منطق عرض المشاريع
    }
    
    /**
     * عرض تفاصيل مشروع
     */
    public function show(Project $project)
    {
        // التحقق من الصلاحيات
        $this->authorize('view', $project);
        
        return new ProjectResource($project);
    }
}
```

#### Controllers حسب الأدوار

**Student Controllers:**
- `ProjectController` - إدارة المشاريع
- `ProposalController` - إدارة المقترحات
- `DocumentController` - إدارة الوثائق
- `GroupController` - إدارة المجموعات
- `RequestController` - إدارة الطلبات

**Supervisor Controllers:**
- `ProjectController` - المشاريع المشرفة عليها
- `ProposalController` - المقترحات
- `EvaluationController` - التقييم
- `NoteController` - الملاحظات

**Projects Committee Controllers:**
- `ProposalController` - مراجعة المقترحات
- `ProjectController` - إدارة المشاريع
- `RequestController` - معالجة الطلبات
- `ReportController` - التقارير

---

### 3. Models (النماذج)

#### الموقع: `app/Models/`

**مثال: Model Project**

```php
<?php

namespace App\Models;

use App\Enums\ProjectStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'title',
        'description',
        'status',
        'supervisor_id',
        // ...
    ];
    
    protected $casts = [
        'keywords' => 'array',
        'status' => ProjectStatus::class,
    ];
    
    /**
     * العلاقة مع المشرف
     */
    public function supervisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }
    
    /**
     * العلاقة مع الطلاب
     */
    public function students(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_student');
    }
}
```

#### Models الرئيسية

- `User` - المستخدمون
- `Project` - المشاريع
- `Proposal` - المقترحات
- `Document` - الوثائق
- `Grade` - الدرجات
- `TimePeriod` - الفترات الزمنية
- `Notification` - الإشعارات

---

### 4. Services (الخدمات)

#### الموقع: `app/Services/`

**الغرض**: احتواء منطق العمل المعقد وفصله عن Controllers

**مثال: ProjectService**

```php
<?php

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}
    
    /**
     * تسجيل طالب في مشروع
     */
    public function registerStudent(Project $project, User $student)
    {
        return DB::transaction(function () use ($project, $student) {
            // التحقق من صحة التسجيل
            // إنشاء تسجيل
            // إرسال إشعارات
            
            return $registration;
        });
    }
}
```

#### Services المتاحة

- `ProjectService` - منطق المشاريع
- `ProposalService` - منطق المقترحات
- `DocumentService` - إدارة الوثائق
- `NotificationService` - الإشعارات
- `TimeWindowService` - الفترات الزمنية
- `EvaluationService` - التقييم
- `GroupService` - المجموعات
- `RequestService` - الطلبات
- `ReportService` - التقارير

---

### 5. Middleware (البرمجيات الوسيطة)

#### الموقع: `app/Http/Middleware/`

**RoleMiddleware** - التحقق من الأدوار:

```php
public function handle(Request $request, Closure $next, string ...$roles)
{
    if (!auth()->check()) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    
    $user = auth()->user();
    
    if (!in_array($user->role, $roles)) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }
    
    return $next($request);
}
```

**WindowMiddleware** - التحقق من الفترات الزمنية:

```php
public function handle(Request $request, Closure $next, string $windowType)
{
    // التحقق من وجود فترة زمنية نشطة
    if (!TimeWindowService::isWindowOpen($windowType)) {
        return response()->json([
            'message' => 'This action is not allowed outside the time window'
        ], 403);
    }
    
    return $next($request);
}
```

---

### 6. Policies (السياسات)

#### الموقع: `app/Policies/`

**الغرض**: تحديد من يمكنه تنفيذ إجراء معين على مورد معين

**مثال: ProjectPolicy**

```php
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Project;

class ProjectPolicy
{
    /**
     * يمكن للطالب عرض المشاريع المتاحة فقط
     */
    public function view(User $user, Project $project): bool
    {
        if ($user->isStudent()) {
            return $project->status->isVisibleToStudents();
        }
        
        return true;
    }
    
    /**
     * فقط لجنة المشاريع يمكنها تعديل المشاريع
     */
    public function update(User $user, Project $project): bool
    {
        return $user->isProjectsCommittee() || $user->isAdmin();
    }
}
```

---

### 7. Resources (تحويل البيانات)

#### الموقع: `app/Http/Resources/`

**الغرض**: تحويل Models إلى تنسيق JSON موحد للـ API

**مثال: ProjectResource**

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status->value,
            'supervisor' => new UserResource($this->whenLoaded('supervisor')),
            'students' => UserResource::collection($this->whenLoaded('students')),
        ];
    }
}
```

---

### 8. Enums (التعدادات)

#### الموقع: `app/Enums/`

**مثال: ProjectStatus**

```php
<?php

namespace App\Enums;

enum ProjectStatus: string
{
    case DRAFT = 'draft';
    case ANNOUNCED = 'announced';
    case AVAILABLE_FOR_REGISTRATION = 'available_for_registration';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED = 'completed';
    
    public function label(): string
    {
        return match($this) {
            self::DRAFT => 'مسودة',
            self::ANNOUNCED => 'معلن',
            // ...
        };
    }
    
    public function isVisibleToStudents(): bool
    {
        return in_array($this, [
            self::ANNOUNCED,
            self::AVAILABLE_FOR_REGISTRATION,
        ]);
    }
}
```

---

## قاعدة البيانات

### Migrations (الهجرات)

#### الموقع: `database/migrations/`

**مثال: إنشاء جدول Projects**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->enum('status', [...])->default('draft');
            $table->foreignId('supervisor_id')->nullable()
                ->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            $table->index('status');
            $table->index('supervisor_id');
        });
    }
    
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
```

### تشغيل الهجرات

```bash
# تشغيل جميع الهجرات
php artisan migrate

# التراجع عن آخر هجرة
php artisan migrate:rollback

# إعادة تعيين قاعدة البيانات
php artisan migrate:fresh
```

---

## المصادقة والأمان

### Laravel Sanctum

النظام يستخدم Laravel Sanctum للمصادقة:

```php
// في Controller
use Illuminate\Support\Facades\Auth;

public function me()
{
    return new UserResource(Auth::user());
}
```

### Token-based Authentication

```php
// تسجيل الدخول
$user = User::where('email', $email)->first();
$token = $user->createToken('auth-token')->plainTextToken;

// استخدام Token في الطلبات
// Header: Authorization: Bearer {token}
```

---

## الاستجابة الموحدة (Response Format)

جميع استجابات API تتبع تنسيق موحد:

### استجابة نجاح:

```json
{
  "success": true,
  "message": "تم بنجاح",
  "data": {
    // البيانات
  }
}
```

### استجابة خطأ:

```json
{
  "success": false,
  "message": "حدث خطأ",
  "errors": {
    "field": ["رسالة الخطأ"]
  }
}
```

---

## الأوامر المفيدة (Artisan Commands)

```bash
# إنشاء Controller
php artisan make:controller ControllerName

# إنشاء Model
php artisan make:model ModelName -m  # مع Migration

# إنشاء Service
php artisan make:class Services/ServiceName

# إنشاء Migration
php artisan make:migration create_table_name

# عرض المسارات
php artisan route:list

# تنظيف Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# تشغيل الاختبارات
php artisan test
```

---

## الاختبارات

### الموقع: `tests/`

```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;

class ProjectTest extends TestCase
{
    public function test_student_can_view_available_projects(): void
    {
        $user = User::factory()->student()->create();
        
        $response = $this->actingAs($user)
            ->getJson('/api/student/projects');
        
        $response->assertStatus(200);
    }
}
```

### تشغيل الاختبارات

```bash
php artisan test
php artisan test --filter ProjectTest
```

---

## أمثلة على API Endpoints

### تسجيل الدخول

```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "student@test.com",
  "password": "password123"
}
```

### عرض المشاريع (للطلاب)

```http
GET /api/student/projects
Authorization: Bearer {token}
```

### تسجيل في مشروع

```http
POST /api/student/projects/{id}/register
Authorization: Bearer {token}
```

---

## الخلاصة

الواجهة الخلفية توفر:
- **API RESTful** منظم وموثق
- **أمان قوي** مع Sanctum و Policies
- **كود نظيف** مع Services و Resources
- **قابلية التوسع** مع بنية معمارية واضحة

---

**التالي**: [توثيق الواجهة الأمامية](./07-Frontend-Documentation.md)
