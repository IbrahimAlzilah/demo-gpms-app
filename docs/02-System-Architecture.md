# هندسة النظام

## نظرة عامة

نظام إدارة مشاريع التخرج (GPMS) مبني على بنية معمارية **متعددة الطبقات** (Multi-tier Architecture) تتكون من ثلاثة مكونات رئيسية:

1. **الواجهة الأمامية (Frontend)** - واجهة المستخدم
2. **الواجهة الخلفية (Backend)** - منطق العمل والخادم
3. **قاعدة البيانات (Database)** - تخزين البيانات

```
┌─────────────────┐
│   Frontend      │  React + TypeScript
│   (المتصفح)     │
└────────┬────────┘
         │ HTTP/HTTPS
         │ (API Calls)
┌────────▼────────┐
│   Backend       │  Laravel (PHP)
│   (الخادم)      │
└────────┬────────┘
         │
         │ SQL Queries
┌────────▼────────┐
│   Database      │  SQLite/MySQL
│   (قاعدة البيانات)│
└─────────────────┘
```

## بنية الواجهة الخلفية (Backend Architecture)

### التقنيات الأساسية

- **إطار العمل**: Laravel 12
- **لغة البرمجة**: PHP 8.2+
- **نظام المصادقة**: Laravel Sanctum
- **قاعدة البيانات**: SQLite (قابلة للتغيير)

### البنية المعمارية للواجهة الخلفية

يتبع Backend نمط **MVC** (Model-View-Controller) مع استخدام **Service Layer**:

```
┌─────────────────────────────────────────────────┐
│              API Routes (api.php)               │
│         توجيه الطلبات إلى Controllers           │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Controllers                          │
│  (معالجة الطلبات، التحقق، استدعاء Services)    │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Services Layer                       │
│  (منطق العمل، العمليات المعقدة)                │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Models                               │
│  (التعامل مع قاعدة البيانات، العلاقات)          │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Database                             │
│  (SQLite/MySQL)                                 │
└─────────────────────────────────────────────────┘
```

### مكونات الواجهة الخلفية

#### 1. Routes (المسارات)
```
backend/routes/api.php
```
- تحديد جميع نقاط النهاية (Endpoints) للـ API
- تنظيم المسارات حسب الأدوار (Student, Supervisor, Committee, etc.)
- تطبيق Middleware للتحقق من الصلاحيات

#### 2. Controllers (المتحكمات)
```
backend/app/Http/Controllers/
```
- **AuthController**: المصادقة وإدارة المستخدمين
- **Student/**: Controllers خاصة بالطلاب
- **Supervisor/**: Controllers خاصة بالمشرفين
- **ProjectsCommittee/**: Controllers خاصة بلجنة المشاريع
- **DiscussionCommittee/**: Controllers خاصة بلجنة المناقشة
- **Admin/**: Controllers خاصة بالمسؤولين

**المسؤوليات**:
- استقبال الطلبات من Routes
- التحقق من صحة البيانات
- استدعاء Services لتنفيذ العمليات
- إرجاع الاستجابات المناسبة

#### 3. Services (طبقة الخدمات)
```
backend/app/Services/
```
- **ProjectService**: منطق العمل المتعلق بالمشاريع
- **ProposalService**: منطق العمل المتعلق بالمقترحات
- **DocumentService**: إدارة الوثائق
- **NotificationService**: إرسال الإشعارات
- **TimeWindowService**: إدارة الفترات الزمنية
- **EvaluationService**: منطق التقييم
- **GroupService**: إدارة المجموعات
- **RequestService**: معالجة الطلبات
- **ReportService**: توليد التقارير

**المسؤوليات**:
- احتواء منطق العمل المعقد
- تنفيذ العمليات الحسابية
- التعامل مع العلاقات المعقدة بين Models
- ضمان تكامل البيانات (Data Integrity)

#### 4. Models (النماذج)
```
backend/app/Models/
```
تمثل كل Model جدولاً في قاعدة البيانات:
- **User**: المستخدمون
- **Project**: المشاريع
- **Proposal**: المقترحات
- **Document**: الوثائق
- **Grade**: الدرجات
- **Notification**: الإشعارات
- **TimePeriod**: الفترات الزمنية
- وغيرها...

**المسؤوليات**:
- تعريف العلاقات بين الجداول
- الحقول القابلة للتعبئة (Fillable)
- Casts للبيانات
- Scopes للاستعلامات الشائعة

#### 5. Middleware (البرمجيات الوسيطة)
```
backend/app/Http/Middleware/
```
- **RoleMiddleware**: التحقق من صلاحيات المستخدم
- **WindowMiddleware**: التحقق من الفترات الزمنية

#### 6. Policies (السياسات)
```
backend/app/Policies/
```
- تحديد الصلاحيات على مستوى النماذج (Models)
- التحقق من قدرة المستخدم على تنفيذ إجراء معين

#### 7. Enums (التعدادات)
```
backend/app/Enums/
```
- **ProjectStatus**: حالات المشاريع
- **ProposalStatus**: حالات المقترحات
- **RequestStatus**: حالات الطلبات
- **TimePeriodType**: أنواع الفترات الزمنية

#### 8. Migrations (الهجرات)
```
backend/database/migrations/
```
- تعريف بنية قاعدة البيانات
- إنشاء الجداول والعلاقات
- تعديل البنية عند الحاجة

## بنية الواجهة الأمامية (Frontend Architecture)

### التقنيات الأساسية

- **إطار العمل**: React 19
- **لغة البرمجة**: TypeScript
- **أداة البناء**: Vite
- **إدارة الحالة**: Zustand + React Query
- **التوجيه**: React Router DOM
- **التصميم**: TailwindCSS + Radix UI

### البنية المعمارية للواجهة الأمامية

يتبع Frontend نمط **Feature-based Architecture** مع فصل واضح للمكونات:

```
┌─────────────────────────────────────────────────┐
│              App.tsx                            │
│         نقطة الدخول الرئيسية                     │
└───────────────────┬─────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────┐
│            Routes                               │
│  (التوجيه حسب الدور والصلاحيات)                 │
└───────────────────┬─────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│   Pages        │    │   Components    │
│   (الصفحات)    │    │   (المكونات)    │
└───────┬────────┘    └────────┬────────┘
        │                      │
        └──────────┬───────────┘
                   │
┌──────────────────▼─────────────────────────────┐
│         Services & Hooks                       │
│  (استدعاء API، إدارة البيانات)                 │
└──────────────────┬─────────────────────────────┘
                   │
┌──────────────────▼─────────────────────────────┐
│         API Service                            │
│  (التواصل مع Backend)                          │
└─────────────────────────────────────────────────┘
```

### مكونات الواجهة الأمامية

#### 1. Pages (الصفحات)
```
frontend/src/pages/
```
تنظم الصفحات حسب الأدوار:
- **auth/**: صفحات المصادقة (تسجيل الدخول، استعادة كلمة المرور)
- **student/**: صفحات الطلاب
- **supervisor/**: صفحات المشرفين
- **committee/**: صفحات اللجان (projects, discussion)
- **admin/**: صفحات المسؤولين

كل صفحة تحتوي على:
- **components/**: مكونات خاصة بالصفحة
- **hooks/**: Custom hooks للصفحة
- **api/**: استدعاءات API
- **types/**: أنواع TypeScript
- **schema/**: مخططات التحقق (Zod)

#### 2. Components (المكونات)
```
frontend/src/components/
```
- **common/**: مكونات مشتركة (Buttons, Tables, Forms, etc.)
- **layout/**: مكونات التخطيط (Header, Sidebar, etc.)
- **ui/**: مكونات واجهة المستخدم الأساسية (من Radix UI)

#### 3. Services (الخدمات)
```
frontend/src/services/
```
- **api.service.ts**: خدمة API الأساسية (Axios configuration)
- إعدادات الاتصال بـ Backend

#### 4. Hooks (الخطافات)
```
frontend/src/hooks/
```
- Custom hooks قابلة لإعادة الاستخدام
- منطق مشترك بين المكونات

#### 5. Stores (المتاجر)
```
frontend/src/stores/
```
- **auth.store.ts**: إدارة حالة المصادقة (Zustand)
- تخزين بيانات المستخدم والـ Token

#### 6. Context (السياق)
```
frontend/src/context/
```
- **ThemeProvider**: إدارة المظهر (فاتح/داكن)
- **DirectionProvider**: إدارة الاتجاه (RTL/LTR)

#### 7. Types (الأنواع)
```
frontend/src/types/
```
- تعريفات TypeScript للكائنات
- أنواع البيانات المشتركة

#### 8. Utils (الأدوات المساعدة)
```
frontend/src/utils/
```
- دوال مساعدة
- معالجة البيانات

## قاعدة البيانات (Database Architecture)

### التقنية المستخدمة

- **قاعدة البيانات الافتراضية**: SQLite (للتطوير)
- **قاعدة البيانات الإنتاجية**: MySQL/PostgreSQL (قابلة للتكوين)

### بنية قاعدة البيانات

#### الجداول الرئيسية

1. **users** - المستخدمون
   - معلومات جميع المستخدمين (طلاب، مشرفين، لجان، مسؤولين)
   - الأدوار (roles) والصلاحيات

2. **projects** - المشاريع
   - معلومات المشاريع
   - العلاقة مع المشرفين (supervisor_id)
   - حالة المشروع (status)

3. **proposals** - المقترحات
   - مقترحات المشاريع من الطلاب والمشرفين
   - العلاقة مع المشاريع

4. **project_registrations** - تسجيلات المشاريع
   - طلبات تسجيل الطلاب في المشاريع
   - حالة الطلب (pending, approved, rejected)

5. **documents** - الوثائق
   - الوثائق المرفوعة من الطلاب
   - معلومات الملفات ومراجعتها

6. **grades** - الدرجات
   - تقييمات المشرفين ولجان المناقشة
   - الدرجات النهائية

7. **time_periods** - الفترات الزمنية
   - فترات التقديم والتسجيل والتقييم
   - التحكم في المواعيد النهائية

8. **notifications** - الإشعارات
   - إشعارات للمستخدمين
   - تتبع الإشعارات المقروءة

9. **project_groups** - مجموعات المشاريع
   - مجموعات الطلاب لكل مشروع
   - قائد المجموعة والأعضاء

10. **supervisor_notes** - ملاحظات المشرفين
    - ملاحظات من المشرفين للطلاب
    - ردود الطلاب

11. **project_milestones** - معالم المشاريع
    - المعالم الرئيسية لكل مشروع
    - حالة الإتمام

12. **project_meetings** - اجتماعات المشاريع
    - مواعيد اجتماعات المشرفين مع الطلاب
    - الحضور

13. **requests** - الطلبات
    - طلبات مختلفة (تغيير مشروع، مشرف، إلخ)
    - حالة الطلب

14. **committee_assignments** - تعيينات اللجان
    - تعيين أعضاء لجنة المناقشة للمشاريع

### العلاقات بين الجداول

```
users
  ├── 1:N proposals (submitter_id)
  ├── 1:N supervised_projects (supervisor_id)
  ├── 1:N project_registrations (student_id)
  ├── 1:N documents (submitted_by)
  ├── 1:N grades (student_id)
  ├── N:M projects (students)
  └── N:M project_groups (members)

projects
  ├── N:1 supervisor (supervisor_id)
  ├── N:M students (project_student pivot)
  ├── 1:1 project_group
  ├── 1:N documents
  ├── 1:N project_registrations
  ├── 1:N supervisor_notes
  ├── 1:N project_milestones
  ├── 1:N project_meetings
  └── N:M committee_members (committee_assignments)

proposals
  ├── N:1 submitter (submitter_id)
  └── N:1 project (project_id) [nullable]

project_groups
  ├── 1:1 project
  ├── N:1 leader (leader_id)
  └── N:M members (project_group_member pivot)
```

## تدفق البيانات (Data Flow)

### تدفق طلب نموذجي

```
1. المستخدم → Frontend
   │
   │ (نقر، إدخال بيانات)
   │
2. Frontend → API Service
   │
   │ (HTTP Request: POST /api/student/projects)
   │
3. API Service → Backend API
   │
   │ (HTTP Request with Token)
   │
4. Backend → Routes (api.php)
   │
   │ (Route matching)
   │
5. Routes → Middleware
   │
   │ (Authentication, Authorization)
   │
6. Middleware → Controller
   │
   │ (Request validation)
   │
7. Controller → Service
   │
   │ (Business logic)
   │
8. Service → Model
   │
   │ (Database operations)
   │
9. Model → Database
   │
   │ (SQL Query)
   │
10. Database → Model
    │
    │ (Data returned)
    │
11. Model → Service
    │
    │ (Processed data)
    │
12. Service → Controller
    │
    │ (Response data)
    │
13. Controller → Frontend
    │
    │ (JSON Response)
    │
14. Frontend → Component
    │
    │ (State update, UI refresh)
    │
15. Component → User
    │
    │ (Updated UI displayed)
```

### مثال: تسجيل طالب في مشروع

```
1. الطالب يفتح صفحة المشاريع المتاحة
   ↓
2. Frontend يطلب قائمة المشاريع: GET /api/student/projects
   ↓
3. Backend يعيد قائمة المشاريع المتاحة
   ↓
4. الطالب يختار مشروع ويلقي "تسجيل"
   ↓
5. Frontend يرسل طلب: POST /api/student/projects/{id}/register
   ↓
6. Backend يتحقق من:
   - المستخدم مسجل دخول (Middleware)
   - المستخدم لديه دور طالب (RoleMiddleware)
   - الفترة الزمنية للتسجيل نشطة (WindowMiddleware)
   ↓
7. Controller يستدعي ProjectService.registerStudent()
   ↓
8. Service يتحقق من:
   - المشروع متاح للتسجيل
   - الطالب ليس مسجل في مشروع آخر
   - لا يوجد طلب تسجيل قائم
   ↓
9. Service ينشئ ProjectRegistration في Database
   ↓
10. Service يرسل إشعارات للجنة المشاريع
    ↓
11. Backend يعيد استجابة نجاح
    ↓
12. Frontend يحدث الواجهة ويعرض رسالة نجاح
```

## الأمان (Security)

### المصادقة (Authentication)

- **Laravel Sanctum**: نظام مصادقة حديث وآمن
- **Token-based**: استخدام Personal Access Tokens
- **Session-based**: للواجهات المتصفحية

### التفويض (Authorization)

- **Role-based Access Control (RBAC)**: صلاحيات على أساس الأدوار
- **Policies**: صلاحيات على مستوى الموارد
- **Middleware**: فحص الصلاحيات على مستوى المسارات

### حماية البيانات

- **Password Hashing**: تشفير كلمات المرور باستخدام bcrypt
- **CSRF Protection**: حماية من هجمات CSRF
- **SQL Injection Protection**: Laravel Query Builder يحمي تلقائياً
- **XSS Protection**: React يمنع XSS تلقائياً

## الأداء (Performance)

### تحسينات Backend

- **Query Optimization**: استخدام Eager Loading لتقليل الاستعلامات
- **Caching**: إمكانية استخدام Cache للبيانات المتكررة
- **Indexing**: فهارس على الأعمدة المستخدمة بكثرة

### تحسينات Frontend

- **Code Splitting**: تقسيم الكود حسب الصفحات (Lazy Loading)
- **React Query**: Cache تلقائي للبيانات
- **Optimistic Updates**: تحديث الواجهة قبل استجابة الخادم

## الخلاصة

النظام مبني على بنية معمارية واضحة ومنظمة تسمح بـ:
- **قابلية التوسع**: سهولة إضافة ميزات جديدة
- **قابلية الصيانة**: كود منظم وسهل الفهم
- **الأمان**: حماية شاملة للبيانات والمستخدمين
- **الأداء**: استجابة سريعة وتجربة مستخدم جيدة

---

**التالي**: [بنية المشروع](./03-Project-Structure.md)
