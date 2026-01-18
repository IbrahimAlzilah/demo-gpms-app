# بنية المشروع ونمط التنظيم

## نظرة عامة

يتبع المشروع نمط **Monorepo** حيث يتم تنظيم الكود في مجلدين رئيسيين:
- **backend/**: الواجهة الخلفية (Laravel)
- **frontend/**: الواجهة الأمامية (React + TypeScript)
- **docs/**: التوثيق

## البنية العامة للمشروع

```
demo-gpms-app/
├── backend/                 # الواجهة الخلفية (Laravel)
├── frontend/               # الواجهة الأمامية (React)
├── docs/                   # التوثيق
└── README.md              # ملف README الرئيسي
```

## بنية الواجهة الخلفية (Backend Structure)

### النمط المعماري

يتبع Backend نمط **Laravel MVC** مع إضافة **Service Layer** لتحسين تنظيم الكود:

```
backend/
├── app/                    # الكود الرئيسي للتطبيق
│   ├── Console/           # أوامر Artisan
│   ├── Enums/             # التعدادات (Enums)
│   ├── Http/              # طبقة HTTP
│   │   ├── Controllers/   # المتحكمات
│   │   ├── Middleware/    # البرمجيات الوسيطة
│   │   ├── Requests/      # نماذج التحقق
│   │   ├── Resources/     # تحويل البيانات (API Resources)
│   │   └── Traits/        # الصفات (Traits)
│   ├── Models/            # نماذج البيانات
│   ├── Policies/          # سياسات الصلاحيات
│   ├── Providers/         # مزودات الخدمة
│   └── Services/          # طبقة الخدمات
├── bootstrap/             # ملفات التهيئة
├── config/                # ملفات الإعدادات
├── database/              # قاعدة البيانات
│   ├── factories/         # مصانع البيانات (Factories)
│   ├── migrations/        # هجرات قاعدة البيانات
│   └── seeders/           # بذور البيانات (Seeders)
├── public/                # المجلد العام (Web Server Root)
├── resources/             # الموارد
│   ├── css/              # ملفات CSS
│   ├── js/               # ملفات JavaScript
│   └── views/            # قوالب Blade (إذا استُخدمت)
├── routes/                # المسارات
│   ├── api.php           # مسارات API
│   ├── web.php           # مسارات الويب
│   └── console.php       # مسارات الأوامر
├── storage/               # التخزين
│   ├── app/              # ملفات التطبيق
│   ├── framework/        # ملفات الإطار
│   └── logs/             # ملفات السجلات
├── tests/                 # الاختبارات
├── vendor/                # المكتبات الخارجية (Composer)
├── artisan               # سطر أوامر Laravel
├── composer.json         # تبعيات PHP
└── phpunit.xml           # إعدادات الاختبار
```

### شرح المجلدات الرئيسية

#### 1. `app/` - الكود الرئيسي

هذا المجلد يحتوي على جميع كود التطبيق:

**`app/Console/Commands/`**
- أوامر Artisan المخصصة
- يمكن تشغيلها من سطر الأوامر

**`app/Enums/`**
- تعريفات التعدادات (Enums)
- مثل: ProjectStatus, ProposalStatus, RequestStatus

**`app/Http/Controllers/`**
تنظم Controllers حسب الأدوار:
```
Controllers/
├── AuthController.php           # المصادقة
├── NotificationController.php   # الإشعارات
├── TimeWindowController.php     # الفترات الزمنية
├── Admin/                       # Controllers خاصة بالمسؤولين
│   ├── UserController.php
│   └── ReportController.php
├── Student/                     # Controllers خاصة بالطلاب
│   ├── ProjectController.php
│   ├── ProposalController.php
│   ├── DocumentController.php
│   └── ...
├── Supervisor/                  # Controllers خاصة بالمشرفين
│   ├── ProjectController.php
│   ├── ProposalController.php
│   └── ...
├── ProjectsCommittee/           # Controllers خاصة بلجنة المشاريع
│   ├── ProposalController.php
│   ├── ProjectController.php
│   ├── RequestController.php
│   └── ...
└── DiscussionCommittee/         # Controllers خاصة بلجنة المناقشة
    ├── ProjectController.php
    └── EvaluationController.php
```

**`app/Http/Middleware/`**
- RoleMiddleware: التحقق من الأدوار
- WindowMiddleware: التحقق من الفترات الزمنية

**`app/Http/Resources/`**
- تحويل البيانات قبل إرسالها للواجهة الأمامية
- ضمان تنسيق موحد للاستجابات

**`app/Models/`**
- كل Model يمثل جدولاً في قاعدة البيانات
- تحتوي على العلاقات (Relationships)
- مثال: User, Project, Proposal, Document

**`app/Services/`**
- منطق العمل المعقد
- تفصل منطق العمل عن Controllers
- مثال: ProjectService, ProposalService, NotificationService

**`app/Policies/`**
- سياسات الصلاحيات
- تحديد من يمكنه تنفيذ إجراء معين

#### 2. `database/migrations/` - هجرات قاعدة البيانات

- كل ملف migration يحدد بنية جدول واحد
- تُستخدم لإنشاء وتعديل الجداول
- يمكن التراجع عنها (rollback)

#### 3. `routes/api.php` - مسارات API

- جميع نقاط النهاية (Endpoints) للـ API
- منظمة حسب الأدوار والصلاحيات
- تستخدم Middleware للتحقق

#### 4. `config/` - الإعدادات

- إعدادات قاعدة البيانات
- إعدادات المصادقة
- إعدادات التطبيق العامة

## بنية الواجهة الأمامية (Frontend Structure)

### النمط المعماري

يتبع Frontend نمط **Feature-based Architecture** مع فصل المكونات حسب الوظيفة:

```
frontend/
├── public/                # الملفات الثابتة
├── src/                   # الكود المصدر
│   ├── assets/           # الأصول (صور، خطوط)
│   ├── components/       # المكونات المشتركة
│   │   ├── common/      # مكونات مشتركة عامة
│   │   ├── layout/      # مكونات التخطيط
│   │   └── ui/          # مكونات واجهة المستخدم الأساسية
│   ├── context/          # React Context
│   ├── features/         # الميزات المشتركة
│   ├── hooks/            # Custom Hooks
│   ├── layouts/          # تخطيطات الصفحات
│   ├── lib/              # المكتبات والإعدادات
│   │   ├── constants/   # الثوابت
│   │   ├── i18n/        # الترجمة
│   │   └── utils/       # أدوات مساعدة
│   ├── pages/            # الصفحات (منظمة حسب الأدوار)
│   │   ├── auth/        # صفحات المصادقة
│   │   ├── student/     # صفحات الطلاب
│   │   ├── supervisor/  # صفحات المشرفين
│   │   ├── committee/   # صفحات اللجان
│   │   └── admin/       # صفحات المسؤولين
│   ├── routes/           # التوجيه (Routing)
│   ├── services/         # خدمات API
│   ├── stores/           # إدارة الحالة (Zustand)
│   ├── styles/           # ملفات الأنماط
│   ├── types/            # أنواع TypeScript
│   ├── utils/            # أدوات مساعدة
│   ├── App.tsx           # مكون التطبيق الرئيسي
│   └── main.tsx          # نقطة الدخول
├── dist/                 # الملفات المبنية (Build output)
├── node_modules/         # المكتبات الخارجية (npm)
├── index.html            # ملف HTML الرئيسي
├── package.json          # تبعيات Node.js
├── tsconfig.json         # إعدادات TypeScript
└── vite.config.ts        # إعدادات Vite
```

### شرح المجلدات الرئيسية

#### 1. `src/pages/` - الصفحات

تنظم الصفحات حسب الأدوار والوظائف:

```
pages/
├── auth/                      # صفحات المصادقة
│   ├── login/                # صفحة تسجيل الدخول
│   │   ├── LoginPage.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── store/
│   │   └── types/
│   └── password-recovery/    # استعادة كلمة المرور
├── student/                   # صفحات الطلاب
│   ├── StudentDashboardPage.tsx
│   ├── proposals/            # إدارة المقترحات
│   ├── projects/             # المشاريع
│   ├── groups/               # المجموعات
│   ├── requests/             # الطلبات
│   ├── documents/            # الوثائق
│   ├── followUp/             # المتابعة
│   └── grades/               # الدرجات
├── supervisor/                # صفحات المشرفين
│   ├── SupervisorDashboardPage.tsx
│   ├── proposals/            # المقترحات
│   ├── projects/             # المشاريع المشرفة عليها
│   ├── supervision-requests/ # طلبات الإشراف
│   ├── evaluation/           # التقييم
│   └── progress/             # متابعة التقدم
├── committee/                 # صفحات اللجان
│   ├── projects/             # لجنة المشاريع
│   │   ├── ProjectsCommitteeDashboardPage.tsx
│   │   ├── proposals/       # مراجعة المقترحات
│   │   ├── periods/         # إدارة الفترات
│   │   ├── announce-projects/ # إعلان المشاريع
│   │   ├── registrations/   # التسجيلات
│   │   ├── requests/        # الطلبات
│   │   ├── grades/          # الدرجات
│   │   └── reports/         # التقارير
│   └── discussion/           # لجنة المناقشة
│       ├── DiscussionCommitteeDashboardPage.tsx
│       ├── projects/        # المشاريع
│       └── evaluation/      # التقييم
└── admin/                     # صفحات المسؤولين
    ├── AdminDashboardPage.tsx
    ├── users/                # إدارة المستخدمين
    └── reports/              # التقارير
```

**هيكل صفحة نموذجية:**
```
page-name/
├── PageName.tsx              # مكون الصفحة الرئيسي
├── components/               # مكونات خاصة بالصفحة
├── hooks/                    # Custom hooks
├── api/                      # استدعاءات API
├── types/                    # أنواع TypeScript
├── schema/                   # مخططات التحقق (Zod)
└── index.ts                  # تصدير الصفحة
```

#### 2. `src/components/` - المكونات

**`components/common/`**
- مكونات مشتركة قابلة لإعادة الاستخدام
- مثل: Tables, Forms, Buttons, Cards

**`components/layout/`**
- مكونات التخطيط
- مثل: Header, Sidebar, Footer, Breadcrumbs

**`components/ui/`**
- مكونات واجهة المستخدم الأساسية
- من Radix UI مع تخصيصات

#### 3. `src/routes/` - التوجيه

```
routes/
├── index.tsx                 # Router الرئيسي
├── config.tsx                # إعدادات المسارات
├── guards.tsx                # حماية المسارات
├── lazy.tsx                  # Lazy loading للصفحات
└── types.ts                  # أنواع المسارات
```

#### 4. `src/lib/` - المكتبات والإعدادات

**`lib/constants/`**
- ثوابت التطبيق
- مثل: ROUTES, STATUS, etc.

**`lib/i18n/`**
- إعدادات الترجمة
- ملفات الترجمة (ar.json, en.json)

#### 5. `src/services/` - خدمات API

- **api.service.ts**: إعداد Axios والتواصل مع Backend
- إعدادات الـ Base URL والـ Headers

#### 6. `src/stores/` - إدارة الحالة

- **auth.store.ts**: حالة المصادقة والمستخدم (Zustand)
- تخزين Token وبيانات المستخدم

#### 7. `src/types/` - أنواع TypeScript

- تعريفات الأنواع المشتركة
- مثل: User, Project, Proposal, etc.

## لماذا هذا النمط؟

### مزايا بنية Backend

1. **فصل الاهتمامات (Separation of Concerns)**
   - Controllers: معالجة HTTP
   - Services: منطق العمل
   - Models: البيانات

2. **قابلية الصيانة**
   - كود منظم وواضح
   - سهولة العثور على الملفات

3. **قابلية الاختبار**
   - Services قابلة للاختبار بشكل مستقل
   - Models معزولة عن منطق العمل

4. **قابلية إعادة الاستخدام**
   - Services يمكن استخدامها من Controllers متعددة
   - Traits للمنطق المشترك

### مزايا بنية Frontend

1. **Feature-based Organization**
   - كل صفحة تحتوي على كل ما تحتاجه
   - سهولة العثور على الكود المتعلق

2. **Code Splitting**
   - Lazy Loading للصفحات
   - تحسين الأداء

3. **إعادة الاستخدام**
   - مكونات مشتركة في `components/`
   - Hooks قابلة لإعادة الاستخدام

4. **Type Safety**
   - TypeScript في كل مكان
   - أنواع محددة لكل صفحة

## الاتفاقيات (Conventions)

### تسمية الملفات

**Backend:**
- Controllers: `UserController.php` (PascalCase)
- Models: `User.php` (PascalCase)
- Services: `ProjectService.php` (PascalCase)
- Migrations: `2024_01_01_000001_create_users_table.php`

**Frontend:**
- Components: `UserCard.tsx` (PascalCase)
- Pages: `UserPage.tsx` (PascalCase)
- Hooks: `useUser.ts` (camelCase مع "use" prefix)
- Types: `user.types.ts` (kebab-case)
- Utils: `formatDate.ts` (camelCase)

### بنية المجلدات

- استخدم مجلدات فرعية لتنظيم الكود
- اجمع الملفات المتعلقة معاً
- استخدم `index.ts` للتصدير

### الاستيراد والتصدير

**Frontend:**
```typescript
// استخدم absolute imports
import { Button } from '@/components/ui'
import { useAuth } from '@/pages/auth/login'
```

**Backend:**
```php
// استخدم namespaces
use App\Models\User;
use App\Services\ProjectService;
```

## الملفات المهمة

### Backend

1. **`routes/api.php`**: جميع مسارات API
2. **`app/Providers/AppServiceProvider.php`**: تسجيل Policies
3. **`.env`**: متغيرات البيئة
4. **`config/database.php`**: إعدادات قاعدة البيانات

### Frontend

1. **`src/routes/index.tsx`**: التوجيه الرئيسي
2. **`src/services/api.service.ts`**: إعدادات API
3. **`src/stores/auth.store.ts`**: حالة المصادقة
4. **`.env`**: متغيرات البيئة

## الخلاصة

البنية المعتمدة في المشروع توفر:
- **تنظيم واضح**: سهولة العثور على الملفات
- **قابلية التوسع**: إضافة ميزات جديدة بسهولة
- **قابلية الصيانة**: كود منظم وسهل الفهم
- **قابلية الاختبار**: بنية تدعم الاختبارات

---

**التالي**: [الأدوار والصلاحيات](./04-User-Roles.md)
