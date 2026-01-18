# دليل الإعداد والتشغيل

## نظرة عامة

هذا الدليل يوفر تعليمات خطوة بخطوة لإعداد وتشغيل مشروع نظام إدارة مشاريع التخرج (GPMS) على جهازك المحلي.

## المتطلبات الأساسية

قبل البدء، تأكد من تثبيت البرامج التالية:

### للواجهة الخلفية (Backend)
- **PHP 8.2** أو أحدث
- **Composer** (مدير تبعيات PHP)
- **Node.js 18+** و **npm**
- **قاعدة بيانات**: SQLite (مضمنة) أو MySQL/PostgreSQL

### للواجهة الأمامية (Frontend)
- **Node.js 18+** و **npm**
- **Git** (اختياري، لنسخ المشروع)

### أدوات مفيدة
- **Visual Studio Code** أو أي محرر نصوص
- **Postman** أو **Thunder Client** (لاختبار API)

---

## الخطوة 1: نسخ المشروع

### الخيار 1: من Git Repository
```bash
git clone <repository-url>
cd demo-gpms-app
```

### الخيار 2: من ملف مضغوط
1. فك ضغط الملف
2. افتح Terminal في مجلد المشروع

---

## الخطوة 2: إعداد الواجهة الخلفية (Backend)

### 2.1 الانتقال لمجلد Backend

```bash
cd backend
```

### 2.2 تثبيت التبعيات

```bash
composer install
```

> **ملاحظة**: إذا لم يكن Composer مثبتاً، يمكنك تنزيله من [getcomposer.org](https://getcomposer.org)

### 2.3 إنشاء ملف البيئة (.env)

```bash
# في Windows
copy .env.example .env

# في Linux/Mac
cp .env.example .env
```

### 2.4 توليد مفتاح التطبيق

```bash
php artisan key:generate
```

### 2.5 تكوين قاعدة البيانات

افتح ملف `.env` وعدّل إعدادات قاعدة البيانات:

#### للاستخدام مع SQLite (الأسهل للتطوير):

```env
DB_CONNECTION=sqlite
# DB_DATABASE يتم تجاهله مع SQLite
```

ثم قم بإنشاء ملف قاعدة البيانات:

```bash
# في Windows (PowerShell)
New-Item database/database.sqlite -ItemType File

# في Linux/Mac
touch database/database.sqlite
```

#### للاستخدام مع MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gpms_db
DB_USERNAME=root
DB_PASSWORD=your_password
```

> **ملاحظة**: تأكد من إنشاء قاعدة البيانات في MySQL قبل المتابعة

### 2.6 تشغيل الهجرات (Migrations)

```bash
php artisan migrate
```

هذا الأمر سينشئ جميع الجداول في قاعدة البيانات.

### 2.7 (اختياري) إضافة بيانات تجريبية

```bash
php artisan db:seed
```

> **ملاحظة**: قد لا يتوفر Seeder في المشروع حالياً

### 2.8 تثبيت تبعيات Frontend Assets

```bash
npm install
```

### 2.9 بناء Assets

```bash
npm run build
```

---

## الخطوة 3: إعداد الواجهة الأمامية (Frontend)

### 3.1 الانتقال لمجلد Frontend

افتح Terminal جديد (لا تغلق Terminal Backend):

```bash
cd ../frontend
```

### 3.2 تثبيت التبعيات

```bash
npm install
```

> **ملاحظة**: قد يستغرق هذا بعض الوقت حسب سرعة الإنترنت

### 3.3 تكوين متغيرات البيئة

قم بإنشاء ملف `.env` في مجلد `frontend`:

```env
VITE_API_URL=http://localhost:8000/api
```

> **ملاحظة**: تأكد من أن `VITE_API_URL` يشير إلى عنوان Backend API

---

## الخطوة 4: تشغيل المشروع

### 4.1 تشغيل الواجهة الخلفية (Backend)

في Terminal الأول (من مجلد `backend`):

```bash
php artisan serve
```

سيتم تشغيل الخادم على: `http://localhost:8000`

### 4.2 تشغيل الواجهة الأمامية (Frontend)

في Terminal الثاني (من مجلد `frontend`):

```bash
npm run dev
```

سيتم تشغيل التطبيق على: `http://localhost:5173` (أو منفذ آخر)

### 4.3 (اختياري) تشغيل Queue Worker

إذا كان النظام يستخدم Queues، شغّل Queue Worker في Terminal ثالث:

```bash
cd backend
php artisan queue:work
```

---

## الخطوة 5: التحقق من التشغيل

### 5.1 التحقق من Backend

افتح المتصفح وانتقل إلى:
```
http://localhost:8000/api/health
```

يجب أن ترى استجابة JSON تحتوي على:
```json
{
  "success": true,
  "message": "API is running"
}
```

### 5.2 التحقق من Frontend

افتح المتصفح وانتقل إلى:
```
http://localhost:5173
```

يجب أن ترى صفحة تسجيل الدخول.

---

## إنشاء مستخدم تجريبي

### الطريقة 1: استخدام Tinker

```bash
cd backend
php artisan tinker
```

ثم في Tinker:

```php
$user = \App\Models\User::create([
    'name' => 'طالب تجريبي',
    'email' => 'student@test.com',
    'password' => bcrypt('password123'),
    'role' => 'student',
    'student_id' => 'STU001',
    'status' => 'active'
]);
```

### الطريقة 2: استخدام Seeder (إن وُجد)

```bash
php artisan db:seed --class=UserSeeder
```

### مستخدمون تجريبيون مقترحون

#### طالب:
- **Email/ID**: `student` أو `STU001`
- **Password**: `password123`
- **Role**: `student`

#### مشرف:
- **Email/ID**: `supervisor` أو `SUP001`
- **Password**: `password123`
- **Role**: `supervisor`

#### لجنة المشاريع:
- **Email/ID**: `committee` أو `COM001`
- **Password**: `password123`
- **Role**: `projects_committee`

#### مسؤول:
- **Email/ID**: `admin`
- **Password**: `password123`
- **Role**: `admin`

> **تحذير**: تأكد من تغيير كلمات المرور في بيئة الإنتاج!

---

## حل المشاكل الشائعة

### مشكلة: "Class not found" في Backend

**الحل**:
```bash
cd backend
composer dump-autoload
```

### مشكلة: "Permission denied" في قاعدة البيانات SQLite

**الحل**: تأكد من صلاحيات الملف:
```bash
# Linux/Mac
chmod 664 database/database.sqlite
chmod 775 database
```

### مشكلة: "Port already in use"

**الحل**: 
- Backend: غير المنفذ في `.env`:
  ```env
  APP_PORT=8001
  ```
  ثم شغّل: `php artisan serve --port=8001`

- Frontend: Vite سيستخدم منفذ آخر تلقائياً

### مشكلة: "Module not found" في Frontend

**الحل**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### مشكلة: "CORS error"

**الحل**: تأكد من أن `VITE_API_URL` في `frontend/.env` صحيح:
```env
VITE_API_URL=http://localhost:8000/api
```

---

## أوامر مفيدة للتطوير

### Backend

```bash
# تنظيف Cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# عرض المسارات
php artisan route:list

# إنشاء Migration جديد
php artisan make:migration create_table_name

# إنشاء Controller جديد
php artisan make:controller ControllerName

# إنشاء Model جديد
php artisan make:model ModelName

# تشغيل الاختبارات
php artisan test
```

### Frontend

```bash
# بناء للإنتاج
npm run build

# معاينة الإنتاج
npm run preview

# فحص الأخطاء
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint -- --fix
```

---

## بنية ملفات الإعداد المهمة

### backend/.env
```env
APP_NAME="GPMS"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
# DB_DATABASE=database/database.sqlite

# API
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### frontend/.env
```env
VITE_API_URL=http://localhost:8000/api
```

---

## سير العمل للتطوير

### العمل اليومي

1. **ابدأ Backend**:
   ```bash
   cd backend
   php artisan serve
   ```

2. **ابدأ Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **افتح المتصفح**: `http://localhost:5173`

### عند إضافة Migration جديد

```bash
cd backend
php artisan make:migration add_field_to_table
# عدّل الملف الذي تم إنشاؤه
php artisan migrate
```

### عند تغيير Routes

```bash
cd backend
php artisan route:clear
php artisan route:list  # للتحقق
```

---

## إعدادات IDE (Visual Studio Code)

### Extensiones مفيدة

1. **PHP Intelephense** - لدعم PHP
2. **Laravel Blade** - لدعم Blade Templates
3. **ES7+ React/Redux/React-Native snippets** - لـ React
4. **Tailwind CSS IntelliSense** - لـ TailwindCSS
5. **Prettier** - لتنسيق الكود
6. **ESLint** - لفحص الكود

### إعدادات Workspace

إنشاء ملف `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "php.suggest.basic": false,
  "php.validate.executablePath": "path/to/php"
}
```

---

## الخطوات التالية

بعد إعداد المشروع بنجاح:

1. ✅ اقرأ [نظرة عامة على المشروع](./01-Project-Overview.md)
2. ✅ استكشف [هندسة النظام](./02-System-Architecture.md)
3. ✅ راجع [الأدوار والصلاحيات](./04-User-Roles.md)
4. ✅ ابدأ التطوير!

---

## الخلاصة

الآن يجب أن يكون المشروع جاهزاً للعمل! إذا واجهت أي مشاكل، راجع قسم "حل المشاكل الشائعة" أعلاه.

**التالي**: [توثيق الواجهة الخلفية](./06-Backend-Documentation.md)
