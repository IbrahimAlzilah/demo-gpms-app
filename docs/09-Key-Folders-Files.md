# المجلدات والملفات المهمة

## نظرة عامة

هذا القسم يوضح الغرض من كل مجلد وملف مهم في المشروع، وكيف يساهم كل منها في عمل النظام.

---

## بنية المشروع الرئيسية

```
demo-gpms-app/
├── backend/              # الواجهة الخلفية (Laravel)
├── frontend/             # الواجهة الأمامية (React)
└── docs/                 # التوثيق
```

---

## الواجهة الخلفية (Backend)

### المجلدات الرئيسية

#### `backend/app/`
**الغرض**: يحتوي على جميع كود التطبيق الرئيسي

**المجلدات الفرعية:**

##### `app/Http/Controllers/`
**الغرض**: المتحكمات التي تتعامل مع طلبات HTTP

**المهم منها:**
- `AuthController.php` - المصادقة وإدارة المستخدمين
- `NotificationController.php` - الإشعارات
- `TimeWindowController.php` - الفترات الزمنية
- `Student/` - Controllers خاصة بالطلاب
  - `ProjectController.php` - إدارة المشاريع للطلاب
  - `ProposalController.php` - إدارة المقترحات
  - `DocumentController.php` - إدارة الوثائق
  - `GroupController.php` - إدارة المجموعات
  - `RequestController.php` - إدارة الطلبات
- `Supervisor/` - Controllers خاصة بالمشرفين
- `ProjectsCommittee/` - Controllers خاصة بلجنة المشاريع
- `DiscussionCommittee/` - Controllers خاصة بلجنة المناقشة
- `Admin/` - Controllers خاصة بالمسؤولين

##### `app/Models/`
**الغرض**: نماذج البيانات (Eloquent Models)

**الملفات المهمة:**
- `User.php` - نموذج المستخدمين (الطلاب، المشرفين، اللجان)
- `Project.php` - نموذج المشاريع
- `Proposal.php` - نموذج المقترحات
- `Document.php` - نموذج الوثائق
- `Grade.php` - نموذج الدرجات
- `TimePeriod.php` - نموذج الفترات الزمنية
- `Notification.php` - نموذج الإشعارات
- `ProjectGroup.php` - نموذج مجموعات المشاريع
- `ProjectRegistration.php` - نموذج تسجيلات المشاريع

##### `app/Services/`
**الغرض**: منطق العمل المعقد (Business Logic)

**الملفات المهمة:**
- `ProjectService.php` - منطق إدارة المشاريع (التسجيل، الموافقة، إلخ)
- `ProposalService.php` - منطق إدارة المقترحات
- `DocumentService.php` - منطق إدارة الوثائق
- `NotificationService.php` - منطق إرسال الإشعارات
- `TimeWindowService.php` - منطق إدارة الفترات الزمنية
- `EvaluationService.php` - منطق التقييم
- `GroupService.php` - منطق إدارة المجموعات
- `RequestService.php` - منطق معالجة الطلبات
- `ReportService.php` - منطق توليد التقارير

##### `app/Http/Middleware/`
**الغرض**: البرمجيات الوسيطة (Middleware)

**الملفات:**
- `RoleMiddleware.php` - التحقق من أدوار المستخدمين
- `WindowMiddleware.php` - التحقق من الفترات الزمنية

##### `app/Policies/`
**الغرض**: سياسات الصلاحيات

**الملفات:**
- `ProjectPolicy.php` - صلاحيات المشاريع
- `ProposalPolicy.php` - صلاحيات المقترحات
- `DocumentPolicy.php` - صلاحيات الوثائق
- `GradePolicy.php` - صلاحيات الدرجات

##### `app/Enums/`
**الغرض**: التعدادات (Enums)

**الملفات:**
- `ProjectStatus.php` - حالات المشاريع
- `ProposalStatus.php` - حالات المقترحات
- `RequestStatus.php` - حالات الطلبات
- `TimePeriodType.php` - أنواع الفترات الزمنية

##### `app/Http/Resources/`
**الغرض**: تحويل البيانات إلى تنسيق JSON موحد

**مثال:**
- `ProjectResource.php` - تحويل Project Model إلى JSON
- `UserResource.php` - تحويل User Model إلى JSON

#### `backend/routes/`
**الغرض**: تعريف مسارات API

**الملفات:**
- `api.php` - **ملف مهم جداً**: يحتوي على جميع مسارات API
  - مسارات عامة (Public)
  - مسارات محمية (Protected)
  - مسارات خاصة بالأدوار
- `web.php` - مسارات الويب (إذا استُخدمت)
- `console.php` - أوامر Artisan

#### `backend/database/`
**الغرض**: إدارة قاعدة البيانات

##### `database/migrations/`
**الغرض**: هجرات قاعدة البيانات (إنشاء الجداول)

**الملفات المهمة:**
- `0001_01_01_000000_create_users_table.php` - جدول المستخدمين
- `2024_01_01_000001_create_proposals_table.php` - جدول المقترحات
- `2024_01_01_000002_create_projects_table.php` - جدول المشاريع
- `2024_01_01_000003_create_project_groups_table.php` - جدول المجموعات
- `2024_01_01_000005_create_project_registrations_table.php` - جدول التسجيلات
- `2024_01_01_000006_create_documents_table.php` - جدول الوثائق
- `2024_01_01_000008_create_grades_table.php` - جدول الدرجات
- `2024_01_01_000013_create_time_periods_table.php` - جدول الفترات الزمنية
- `2024_01_01_000015_create_notifications_table.php` - جدول الإشعارات

##### `database/seeders/`
**الغرض**: بذور البيانات (بيانات تجريبية)

##### `database/factories/`
**الغرض**: مصانع البيانات (لإنشاء بيانات تجريبية)

#### `backend/config/`
**الغرض**: ملفات الإعدادات

**الملفات المهمة:**
- `app.php` - إعدادات التطبيق العامة
- `database.php` - إعدادات قاعدة البيانات
- `auth.php` - إعدادات المصادقة
- `sanctum.php` - إعدادات Laravel Sanctum
- `cors.php` - إعدادات CORS

#### `backend/public/`
**الغرض**: المجلد العام (Web Server Root)

**الملفات:**
- `index.php` - نقطة الدخول للتطبيق

#### `backend/storage/`
**الغرض**: التخزين

**المجلدات:**
- `app/` - ملفات التطبيق (مثل: الوثائق المرفوعة)
- `logs/` - ملفات السجلات
- `framework/` - ملفات الإطار

#### `backend/tests/`
**الغرض**: الاختبارات

**المجلدات:**
- `Feature/` - اختبارات الميزات
- `Unit/` - اختبارات الوحدات

### الملفات المهمة في الجذر

#### `backend/composer.json`
**الغرض**: تعريف تبعيات PHP

#### `backend/.env`
**الغرض**: متغيرات البيئة (يجب إنشاؤه من `.env.example`)

#### `backend/artisan`
**الغرض**: سطر أوامر Laravel

---

## الواجهة الأمامية (Frontend)

### المجلدات الرئيسية

#### `frontend/src/`
**الغرض**: الكود المصدر الرئيسي

##### `src/pages/`
**الغرض**: صفحات التطبيق

**البنية:**
- `auth/` - صفحات المصادقة
  - `login/` - صفحة تسجيل الدخول
  - `password-recovery/` - استعادة كلمة المرور
- `student/` - صفحات الطلاب
  - `StudentDashboardPage.tsx` - لوحة التحكم
  - `proposals/` - إدارة المقترحات
  - `projects/` - إدارة المشاريع
  - `groups/` - إدارة المجموعات
  - `requests/` - إدارة الطلبات
  - `documents/` - إدارة الوثائق
  - `grades/` - الدرجات
- `supervisor/` - صفحات المشرفين
- `committee/` - صفحات اللجان
  - `projects/` - لجنة المشاريع
  - `discussion/` - لجنة المناقشة
- `admin/` - صفحات المسؤولين

**هيكل صفحة نموذجية:**
```
page-name/
├── PageName.tsx           # المكون الرئيسي
├── components/            # مكونات خاصة بالصفحة
├── hooks/                 # Custom hooks
├── api/                   # استدعاءات API
├── types/                 # أنواع TypeScript
└── schema/                # مخططات التحقق (Zod)
```

##### `src/components/`
**الغرض**: مكونات React

**المجلدات:**
- `common/` - مكونات مشتركة قابلة لإعادة الاستخدام
  - `Button.tsx` - أزرار
  - `Card.tsx` - بطاقات
  - `Table.tsx` - جداول
  - `Modal.tsx` - نوافذ منبثقة
  - `LoadingSpinner.tsx` - مؤشر التحميل
- `layout/` - مكونات التخطيط
  - `Header.tsx` - رأس الصفحة
  - `Sidebar.tsx` - الشريط الجانبي
  - `Breadcrumbs.tsx` - مسار التنقل
- `ui/` - مكونات واجهة المستخدم الأساسية (من Radix UI)

##### `src/routes/`
**الغرض**: التوجيه (Routing)

**الملفات:**
- `index.tsx` - **ملف مهم جداً**: Router الرئيسي
- `config.tsx` - إعدادات المسارات
- `guards.tsx` - حماية المسارات
- `lazy.tsx` - Lazy loading للصفحات
- `types.ts` - أنواع المسارات

##### `src/services/`
**الغرض**: خدمات API

**الملفات:**
- `api.service.ts` - خدمة API الأساسية (Wrapper حول axios)

##### `src/lib/`
**الغرض**: المكتبات والإعدادات

**المجلدات:**
- `axios.ts` - **ملف مهم**: إعداد Axios و Interceptors
- `constants/` - الثوابت
  - `routes.ts` - مسارات التطبيق
  - `index.ts` - ثوابت أخرى
- `i18n/` - الترجمة
  - `locales/ar/ar.json` - الترجمة العربية
  - `locales/en/en.json` - الترجمة الإنجليزية
- `utils/` - أدوات مساعدة

##### `src/stores/`
**الغرض**: إدارة الحالة (Zustand)

**الملفات:**
- `auth.store.ts` - **ملف مهم**: حالة المصادقة والمستخدم

##### `src/hooks/`
**الغرض**: Custom Hooks

**مثال:**
- `useAuth.ts` - Hook للمصادقة
- `useToast.ts` - Hook للإشعارات

##### `src/types/`
**الغرض**: أنواع TypeScript

**الملفات:**
- `user.types.ts` - أنواع المستخدمين
- `project.types.ts` - أنواع المشاريع
- `proposal.types.ts` - أنواع المقترحات
- `common.types.ts` - أنواع مشتركة

##### `src/context/`
**الغرض**: React Context

**الملفات:**
- `theme-provider.tsx` - إدارة المظهر (فاتح/داكن)
- `direction-provider.tsx` - إدارة الاتجاه (RTL/LTR)

##### `src/utils/`
**الغرض**: أدوات مساعدة

##### `src/styles/`
**الغرض**: ملفات الأنماط

**الملفات:**
- `index.css` - الأنماط الرئيسية
- `globals.css` - الأنماط العامة

### الملفات المهمة في الجذر

#### `frontend/src/App.tsx`
**الغرض**: **ملف مهم جداً** - مكون التطبيق الرئيسي

#### `frontend/src/main.tsx`
**الغرض**: **ملف مهم جداً** - نقطة الدخول

#### `frontend/package.json`
**الغرض**: تعريف تبعيات Node.js

#### `frontend/vite.config.ts`
**الغرض**: إعدادات Vite

#### `frontend/tsconfig.json`
**الغرض**: إعدادات TypeScript

#### `frontend/.env`
**الغرض**: متغيرات البيئة (مثل: `VITE_API_URL`)

---

## ملفات التوثيق

### `docs/`
**الغرض**: جميع ملفات التوثيق

**الملفات:**
- `README.md` - الفهرس الرئيسي للتوثيق
- `01-Project-Overview.md` - نظرة عامة على المشروع
- `02-System-Architecture.md` - هندسة النظام
- `03-Project-Structure.md` - بنية المشروع
- `04-User-Roles.md` - الأدوار والصلاحيات
- `05-Setup-Guide.md` - دليل الإعداد
- `06-Backend-Documentation.md` - توثيق Backend
- `07-Frontend-Documentation.md` - توثيق Frontend
- `08-Improvements-Recommendations.md` - التحسينات والتوصيات
- `09-Key-Folders-Files.md` - هذا الملف

---

## ملخص الملفات الأكثر أهمية

### Backend

1. **`routes/api.php`** - جميع مسارات API
2. **`app/Http/Controllers/AuthController.php`** - المصادقة
3. **`app/Services/ProjectService.php`** - منطق المشاريع
4. **`app/Models/User.php`** - نموذج المستخدمين
5. **`app/Models/Project.php`** - نموذج المشاريع
6. **`config/database.php`** - إعدادات قاعدة البيانات
7. **`.env`** - متغيرات البيئة

### Frontend

1. **`src/routes/index.tsx`** - التوجيه الرئيسي
2. **`src/lib/axios.ts`** - إعداد API Client
3. **`src/stores/auth.store.ts`** - حالة المصادقة
4. **`src/App.tsx`** - مكون التطبيق الرئيسي
5. **`src/main.tsx`** - نقطة الدخول
6. **`.env`** - متغيرات البيئة

---

## الخلاصة

هذا التنظيم يساعد على:
- **سهولة التنقل** - العثور على الملفات بسرعة
- **فهم البنية** - معرفة أين يجب وضع الكود الجديد
- **الصيانة** - تنظيم الكود يسهل الصيانة
- **التعاون** - فهم مشترك بين المطورين

---

**نهاية الملف**
