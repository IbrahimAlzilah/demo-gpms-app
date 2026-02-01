# الواجهة الخلفية (Backend)

## نظرة عامة على الـ Backend

الـ Backend مبني باستخدام **Laravel**، ومسؤول عن:

- استقبال طلبات الـ API والتحقق منها
- المصادقة والتفويض (من يمكنه الوصول لماذا)
- تنفيذ منطق الأعمال (مثل الموافقة على مقترح، إنشاء مشروع)
- القراءة والكتابة في قاعدة البيانات
- إرجاع الاستجابات بصيغة JSON

---

## التقنيات المستخدمة

| التقنية             | الإصدار | الاستخدام                        |
| ------------------- | ------- | -------------------------------- |
| **PHP**             | 8.2+    | لغة البرمجة                      |
| **Laravel**         | 12      | إطار العمل                       |
| **Laravel Sanctum** | \*      | المصادقة بالتوكن (Token) للـ API |
| **MySQL**           | -       | قاعدة البيانات                   |
| **Vite**            | 7       | تجميع أصول الـ Backend (اختياري) |

---

## نمط تنظيم المشروع

المشروع يتبع نمط **MVC + Services**:

| الطبقة          | المجلد                  | الوظيفة                                            |
| --------------- | ----------------------- | -------------------------------------------------- |
| **Controllers** | `app/Http/Controllers/` | استقبال الطلبات، استدعاء Services، إرجاع الاستجابة |
| **Models**      | `app/Models/`           | تمثيل الجداول والعلاقات                            |
| **Services**    | `app/Services/`         | منطق الأعمال (قواعد العمل، حسابات)                 |
| **Policies**    | `app/Policies/`         | التحقق من صلاحية الوصول لمورد معين                 |
| **Resources**   | `app/Http/Resources/`   | تشكيل الاستجابات بصيغة JSON                        |
| **Middleware**  | `app/Http/Middleware/`  | فحص الطلب قبل الوصول للـ Controller                |

---

## شرح أهم المجلدات والملفات

### `app/`

| المجلد/الملف        | الوظيفة                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `Http/Controllers/` | Controllers مقسمة حسب الدور (Admin, Student, Supervisor, ProjectsCommittee, DiscussionCommittee) |
| `Http/Middleware/`  | `RoleMiddleware` للتحقق من الدور، `CheckTimeWindow` للتحقق من النافذة الزمنية                    |
| `Models/`           | User, Project, Proposal, Student, Supervisor, Document, Grade، إلخ                               |
| `Services/`         | ProposalService, ProjectService, EvaluationService, TimeWindowService، إلخ                       |
| `Policies/`         | تحكم الوصول للموارد (Proposal, Project, Document، إلخ)                                           |
| `Enums/`            | قيم ثابتة مثل ProjectStatus, ProposalStatus                                                      |
| `Console/Commands/` | أوامر artisan: ActivateTimePeriods, SendDeadlineReminders                                        |

### `config/`

| الملف             | الوظيفة                                   |
| ----------------- | ----------------------------------------- |
| `database.php`    | إعداد الاتصال بقاعدة البيانات             |
| `auth.php`        | إعداد المصادقة (Guards, Sanctum)          |
| `cors.php`        | إعداد CORS (من يسمح له بالاتصال بالـ API) |
| `sanctum.php`     | إعداد Laravel Sanctum                     |
| `filesystems.php` | إعداد تخزين الملفات                       |

### `routes/api.php`

يحتوي على جميع مسارات الـ API، مقسمة حسب الدور:

- `auth` — تسجيل الدخول، التسجيل، استعادة كلمة المرور
- `student/*` — مسارات الطالب
- `supervisor/*` — مسارات المشرف
- `projects-committee/*` — مسارات لجنة المشاريع
- `discussion-committee/*` — مسارات لجنة المناقشة
- `admin/*` — مسارات المدير
- `notifications` — للإشعارات (لجميع المسجلين)

---

## توثيق الـ API

### مسارات عامة (بدون مصادقة)

| Method | Path                         | الوظيفة                              |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/health`                | التحقق من صحة الخادم وقاعدة البيانات |
| POST   | `/api/auth/login`            | تسجيل الدخول (identifier, password)  |
| POST   | `/api/auth/register`         | التسجيل كمستخدم جديد                 |
| POST   | `/api/auth/recover-password` | طلب استعادة كلمة المرور              |
| POST   | `/api/auth/reset-password`   | إعادة تعيين كلمة المرور              |

### مسارات المصادقة والمسجلين

| Method | Path                       | الوظيفة                    |
| ------ | -------------------------- | -------------------------- |
| GET    | `/api/auth/me`             | بيانات المستخدم الحالي     |
| POST   | `/api/auth/logout`         | تسجيل الخروج               |
| GET    | `/api/settings`            | إعدادات النظام (قراءة فقط) |
| GET    | `/api/time-windows/active` | النوافذ الزمنية النشطة     |
| GET    | `/api/notifications`       | قائمة الإشعارات            |

### مسارات الطالب (role: student)

| Method     | Path                                   | الوظيفة                 |
| ---------- | -------------------------------------- | ----------------------- |
| GET        | `/api/student/dashboard`               | لوحة تحكم الطالب        |
| GET/POST   | `/api/student/proposals`               | قائمة وإضافة مقترحات    |
| GET/PUT    | `/api/student/proposals/{id}`          | عرض وتعديل مقترح        |
| POST       | `/api/student/projects/batch-register` | تسجيل مجموعة على مشروع  |
| GET        | `/api/student/groups`                  | المجموعة الخاصة بالطالب |
| POST       | `/api/student/groups`                  | إنشاء مجموعة            |
| GET        | `/api/student/groups/invitations`      | دعوات الانضمام          |
| POST       | `/api/student/documents`               | رفع مستند               |
| GET/DELETE | `/api/student/documents/{id}`          | عرض وحذف مستند          |
| GET        | `/api/student/grades`                  | عرض الدرجات             |

(باقي المسارات موثقة في `routes/api.php`)

### مسارات المشرف (role: supervisor)

| Method   | Path                                       | الوظيفة             |
| -------- | ------------------------------------------ | ------------------- |
| GET      | `/api/supervisor/dashboard`                | لوحة تحكم المشرف    |
| GET/POST | `/api/supervisor/proposals`                | مقترحات المشرف      |
| GET      | `/api/supervisor/projects`                 | المشاريع المعينة له |
| POST     | `/api/supervisor/evaluations`              | رفع تقييم           |
| GET      | `/api/supervisor/supervision-requests`     | طلبات الإشراف       |
| POST     | `/api/supervisor/projects/{id}/notes`      | إضافة ملاحظة        |
| GET/POST | `/api/supervisor/projects/{id}/milestones` | معالم المشروع       |

### مسارات لجنة المشاريع (role: projects_committee)

| Method | Path                                             | الوظيفة               |
| ------ | ------------------------------------------------ | --------------------- |
| GET    | `/api/projects-committee/dashboard`              | لوحة تحكم اللجنة      |
| GET    | `/api/projects-committee/proposals/submissions`  | المقترحات المقدمة     |
| POST   | `/api/projects-committee/proposals/{id}/approve` | الموافقة على مقترح    |
| POST   | `/api/projects-committee/projects/announce`      | إعلان المشاريع        |
| GET    | `/api/projects-committee/periods`                | إدارة النوافذ الزمنية |
| GET    | `/api/projects-committee/registrations`          | التسجيلات             |
| POST   | `/api/projects-committee/committees/distribute`  | توزيع لجان المناقشة   |
| GET    | `/api/projects-committee/reports/*`              | التقارير              |

### مسارات لجنة المناقشة (role: discussion_committee)

| Method | Path                                    | الوظيفة              |
| ------ | --------------------------------------- | -------------------- |
| GET    | `/api/discussion-committee/dashboard`   | لوحة تحكم اللجنة     |
| GET    | `/api/discussion-committee/projects`    | المشاريع المعينة لها |
| POST   | `/api/discussion-committee/evaluations` | رفع التقييم النهائي  |

### مسارات المدير (role: admin)

| Method   | Path                   | الوظيفة          |
| -------- | ---------------------- | ---------------- |
| GET      | `/api/admin/dashboard` | لوحة تحكم المدير |
| GET/POST | `/api/admin/users`     | إدارة المستخدمين |
| GET/PUT  | `/api/admin/settings`  | إعدادات النظام   |
| GET      | `/api/admin/reports/*` | التقارير الشاملة |

---

## المصادقة والتفويض

### طريقة المصادقة

- استخدام **Laravel Sanctum** مع **Personal Access Tokens**.
- عند تسجيل الدخول الناجح، يُرجع الـ Backend توكنًا يُرسل مع كل طلب في الرأس:
  ```
  Authorization: Bearer <token>
  ```
- التوكن يُخزن في `localStorage` في الواجهة الأمامية.

### Middleware و Guards

- `auth:sanctum`: يتحقق من وجود توكن صحيح.
- `role:student|supervisor|...`: يتحقق من أن المستخدم له الدور المطلوب.
- `window:proposal_submission|project_registration|...`: يتحقق من أن النافذة الزمنية المطلوبة نشطة.

---

## الأدوار والصلاحيات

| الدور                    | ما يستطيع                                                         | ما لا يستطيع                               |
| ------------------------ | ----------------------------------------------------------------- | ------------------------------------------ |
| **student**              | مقترحات، مجموعات، تسجيل، مستندات، طلبات، عرض درجات                | الوصول لمسارات المشرف أو اللجان            |
| **supervisor**           | مقترحات، مشاريعه، تقييم، ملاحظات، معالم، اجتماعات                 | إعلان مشاريع، معالجة التسجيلات، توزيع لجان |
| **projects_committee**   | مقترحات، إعلان، تعيين مشرفين، تسجيلات، طلبات، فترات، لجان، تقارير | الوصول لمسارات الطالب أو المشرف العادي     |
| **discussion_committee** | مشاريعه المعينة، التقييم النهائي                                  | إدارة المقترحات أو التسجيلات               |
| **admin**                | كل شيء (مستخدمون، إعدادات، تقارير)                                | -                                          |
