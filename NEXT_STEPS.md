# الخطوات التالية - Next Steps

## ما تم إنجازه ✅

تم تطبيق السيناريو الكامل لنظام GPMS بما في ذلك:
- ✅ جميع الأدوار الأربعة (طالب، مشرف، لجنة مناقشة، لجنة مشاريع)
- ✅ نظام النوافذ الزمنية المتعددة والمتداخلة
- ✅ نموذج تقييم مزدوج (مشرف + لجنة مناقشة)
- ✅ Policies والصلاحيات
- ✅ Enums وحالات واضحة
- ✅ Frontend hooks وcomponents
- ✅ API endpoints كاملة

## الخطوات المطلوبة قبل التشغيل

### 1. إعداد قاعدة البيانات

```bash
cd backend

# إنشاء ملف .env إذا لم يكن موجوداً
cp .env.example .env

# تحرير .env وضبط إعدادات قاعدة البيانات
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=gpms
# DB_USERNAME=root
# DB_PASSWORD=

# تثبيت المكتبات
composer install

# توليد مفتاح التطبيق
php artisan key:generate

# تشغيل migrations
php artisan migrate

# (اختياري) تشغيل seeders لبيانات تجريبية
php artisan db:seed
```

### 2. إعداد Frontend

```bash
cd frontend

# تثبيت المكتبات
npm install

# إنشاء ملف .env.local
cp .env.example .env.local

# تحرير .env.local وضبط VITE_API_URL
# VITE_API_URL=http://localhost:8000/api
```

### 3. تشغيل التطبيق

```bash
# Terminal 1: Backend
cd backend
php artisan serve
# يعمل على http://localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev
# يعمل على http://localhost:5173
```

### 4. إنشاء مستخدمين تجريبيين

يمكنك إنشاء seeder أو استخدام tinker:

```bash
php artisan tinker
```

```php
// مستخدم admin/لجنة مشاريع
User::create([
    'name' => 'لجنة المشاريع',
    'email' => 'committee@university.edu',
    'password' => Hash::make('password'),
    'role' => 'projects_committee',
    'status' => 'active',
]);

// مستخدم مشرف
User::create([
    'name' => 'د. أحمد محمد',
    'email' => 'supervisor@university.edu',
    'password' => Hash::make('password'),
    'role' => 'supervisor',
    'emp_id' => 'EMP001',
    'department' => 'علوم الحاسب',
    'status' => 'active',
]);

// مستخدم طالب
User::create([
    'name' => 'محمد علي',
    'email' => 'student@university.edu',
    'password' => Hash::make('password'),
    'role' => 'student',
    'student_id' => 'STU001',
    'department' => 'علوم الحاسب',
    'status' => 'active',
]);

// مستخدم لجنة مناقشة
User::create([
    'name' => 'د. فاطمة أحمد',
    'email' => 'discussion@university.edu',
    'password' => Hash::make('password'),
    'role' => 'discussion_committee',
    'emp_id' => 'EMP002',
    'department' => 'علوم الحاسب',
    'status' => 'active',
]);
```

## اختبار التدفقات الأساسية

### 1. تدفق لجنة المشاريع
```
1. تسجيل دخول بحساب لجنة المشاريع
2. إنشاء نافذة زمنية لتقديم المقترحات
3. إنشاء نافذة زمنية للتسجيل
4. (انتظار مقترحات من الطلاب/المشرفين)
```

### 2. تدفق المشرف
```
1. تسجيل دخول بحساب مشرف
2. تقديم مقترح مشروع جديد
3. (انتظار مراجعة لجنة المشاريع)
4. (عند إسناد مشروع) إدارة المراحل والاجتماعات
5. تقييم المشروع
```

### 3. تدفق الطالب
```
1. تسجيل دخول بحساب طالب
2. تصفح المشاريع المتاحة
3. التسجيل في مشروع
4. رفع وثائق
5. متابعة الملاحظات
6. رؤية الدرجة النهائية
```

### 4. تدفق لجنة المناقشة
```
1. تسجيل دخول بحساب لجنة مناقشة
2. استعراض المشاريع المسندة
3. تسجيل درجات المناقشة
```

## التحقق من الأخطاء

### Backend
```bash
cd backend

# التحقق من syntax
php artisan about

# التحقق من routes
php artisan route:list

# تشغيل اختبارات (إذا وجدت)
php artisan test
```

### Frontend
```bash
cd frontend

# التحقق من TypeScript
npm run type-check

# التحقق من linting
npm run lint

# بناء للإنتاج
npm run build
```

## التحسينات المقترحة (اختيارية)

### 1. إضافة Seeder شامل
إنشاء `DatabaseSeeder` يولد:
- مستخدمين لكل دور
- نوافذ زمنية نموذجية
- مقترحات تجريبية
- مشاريع تجريبية

### 2. إضافة Validation Rules مخصصة
- `UniqueStudentRegistration` - طالب واحد لمشروع واحد
- `WithinTimeWindow` - التحقق من النافذة الزمنية
- `ProjectCapacity` - التحقق من السعة

### 3. إضافة Events & Listeners
بدلاً من الإشعارات المباشرة، استخدم events:
- `ProposalSubmitted`
- `ProposalApproved`
- `ProjectAnnounced`
- `StudentRegistered`
- `GradeSubmitted`

### 4. إضافة Queue Jobs
للعمليات الثقيلة:
- إرسال الإشعارات بشكل غير متزامن
- توليد التقارير
- معالجة الملفات الكبيرة

### 5. إضافة API Documentation
استخدام Swagger/OpenAPI:
```bash
composer require darkaonline/l5-swagger
php artisan l5-swagger:generate
```

### 6. إضافة اختبارات شاملة
```php
// tests/Feature/ProposalTest.php
public function test_student_can_submit_proposal_during_window()
public function test_student_cannot_submit_proposal_outside_window()
public function test_committee_can_approve_proposal()
```

### 7. تحسين الأمان
- Rate limiting على endpoints حساسة
- CSRF protection (موجود افتراضياً)
- Input sanitization
- File upload validation (MIME types, size)
- SQL injection protection (موجود مع Eloquent)

### 8. إضافة Logging & Monitoring
```php
// config/logging.php
'channels' => [
    'proposal_actions' => [...],
    'grade_submissions' => [...],
    'security_events' => [...],
]
```

### 9. تحسينات UI/UX
- Skeleton loaders
- Optimistic updates
- Better error messages
- Contextual help
- Keyboard shortcuts
- Dark mode

### 10. إضافة Dashboard Analytics
- Charts لإحصائيات المقترحات
- Progress tracking
- Deadline alerts
- Performance metrics

## الدعم والصيانة

### Backup Strategy
- نسخ احتياطي يومي لقاعدة البيانات
- نسخ احتياطي للملفات المرفوعة
- Version control (Git)

### Monitoring
- Laravel Telescope (development)
- Application Performance Monitoring (APM)
- Error tracking (Sentry, Bugsnag)
- Uptime monitoring

### Updates
- تحديث Laravel بانتظام
- تحديث المكتبات (composer update)
- تحديث frontend dependencies (npm update)
- متابعة security advisories

## الخلاصة

النظام جاهز للتشغيل بعد:
1. ✅ تشغيل migrations
2. ✅ إنشاء مستخدمين تجريبيين
3. ✅ إنشاء نوافذ زمنية
4. ✅ اختبار التدفقات الأساسية

جميع الميزات المطلوبة مطبقة ومتكاملة. النظام يدعم السيناريو الكامل مع نوافذ زمنية متعددة ونموذج تقييم مزدوج.
