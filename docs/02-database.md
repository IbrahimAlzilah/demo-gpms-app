# قاعدة البيانات

## نوع قاعدة البيانات ومكان الإعداد

- **النوع**: MySQL
- **مكان الإعداد**: ملف `backend/config/database.php` ومتغيرات البيئة في `backend/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=
```

---

## مخطط قاعدة البيانات

### جداول المستخدمين والمصادقة

| الجدول                   | الوظيفة                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `users`                  | المستخدمون (جميع الأدوار)، يتضمن: name, username, password, role, status |
| `students`               | بيانات الطلاب (student_id, major, academic_level) — علاقة 1:1 مع users   |
| `supervisors`            | بيانات المشرفين (emp_id, department) — علاقة 1:1 مع users                |
| `personal_access_tokens` | توكنات Sanctum للمصادقة                                                  |

### جداول المشاريع والمقترحات

| الجدول      | الوظيفة                                                                                     |
| ----------- | ------------------------------------------------------------------------------------------- |
| `projects`  | المشاريع (title, description, status, supervisor_id, assigned_group_id, لجان...)            |
| `proposals` | المقترحات (submitter, student_group_id, target_project_id, status, project_id عند الموافقة) |

### جداول المجموعات الطلابية

| الجدول                        | الوظيفة                                            |
| ----------------------------- | -------------------------------------------------- |
| `student_groups`              | المجموعات الطلابية (leader_id, group_code, status) |
| `student_group_members`       | علاقة المجموعة بالأعضاء (عدا القائد)               |
| `student_group_invitations`   | دعوات الانضمام لمجموعة                             |
| `student_group_join_requests` | طلبات الانضمام لمجموعة                             |

### جداول اللجان

| الجدول                      | الوظيفة                                                          |
| --------------------------- | ---------------------------------------------------------------- |
| `project_committees`        | لجان المشاريع                                                    |
| `discussion_committees`     | لجان المناقشة                                                    |
| `project_committee_user`    | علاقة لجنة المشاريع بالأعضاء                                     |
| `discussion_committee_user` | علاقة لجنة المناقشة بالأعضاء                                     |
| `committee_assignments`     | تعيين أعضاء لجنة المناقشة على مشاريع محددة (2–3 أعضاء لكل مشروع) |

### جداول التسجيل والطلبات

| الجدول                           | الوظيفة                                           |
| -------------------------------- | ------------------------------------------------- |
| `project_registrations`          | سجلات تسجيل الطلاب على المشاريع (حالة كل تسجيل)   |
| `project_student`                | علاقة مباشرة بين المشاريع والطلاب المسجلين فعلياً |
| `requests`                       | طلبات الطلاب (تغيير مشرف، مجموعة، مشروع)          |
| `supervisor_assignment_requests` | طلبات تعيين مشرف على مشروع                        |
| `group_registration_requests`    | طلبات تسجيل مجموعة على مشروع                      |

### جداول المستندات والتقييم

| الجدول                     | الوظيفة                                                  |
| -------------------------- | -------------------------------------------------------- |
| `documents`                | المستندات المرفوعة (نوع، مسار، حالة المراجعة)            |
| `grades`                   | الدرجات (supervisor_grade, committee_grade, final_grade) |
| `supervisor_notes`         | ملاحظات المشرف                                           |
| `note_replies`             | ردود على الملاحظات                                       |
| `project_milestones`       | معالم المشروع                                            |
| `project_meetings`         | اجتماعات المشروع                                         |
| `project_meeting_attendee` | حضور الاجتماعات                                          |

### جداول مساعدة

| الجدول                | الوظيفة                                                  |
| --------------------- | -------------------------------------------------------- |
| `time_periods`        | النوافذ الزمنية (نوع، تاريخ البداية والنهاية، نشط أم لا) |
| `project_time_period` | ربط المشاريع بالنوافذ الزمنية                            |
| `notifications`       | إشعارات المستخدمين                                       |
| `settings`            | إعدادات النظام                                           |
| `cache`, `jobs`       | لدعم Laravel (Cache, Queue)                              |

---

## العلاقات بين الجداول

### علاقات 1:1

- `users` ↔ `students` (user_id)
- `users` ↔ `supervisors` (user_id)

### علاقات 1:N (واحد إلى كثير)

- `users` → `proposals` (submitter)
- `users` → `projects` (supervisor)
- `projects` → `documents`, `grades`, `proposals`, `project_registrations`
- `student_groups` → `proposals`, `project_registrations` (عبر المجموعة)

### علاقات N:M (كثير إلى كثير)

- `users` ↔ `projects` عبر `project_student` (الطلاب المسجلون)
- `users` ↔ `student_groups` عبر `student_group_members` (أعضاء المجموعة)
- `users` ↔ `project_committees` عبر `project_committee_user`
- `users` ↔ `discussion_committees` عبر `discussion_committee_user`
- `projects` ↔ `users` عبر `committee_assignments` (أعضاء لجنة المناقشة)
- `projects` ↔ `time_periods` عبر `project_time_period`

---

## Migrations و Seeders

### Migrations

- **الموقع**: `backend/database/migrations/`
- **الوظيفة**: تعريف إنشاء وتعديل الجداول بشكل متسلسل.
- **التشغيل**:
  - `php artisan migrate` — تنفيذ كل الـ migrations الجديدة
  - `php artisan migrate:fresh` — حذف كل الجداول وإعادة إنشائها
  - `php artisan migrate:rollback` — التراجع عن آخر migration

### Seeders

- **الموقع**: `backend/database/seeders/`
- **الوظيفة**: ملء قاعدة البيانات ببيانات أولية.
- **أهم Seeders**:
  - `UsersSeeder` — مستخدمون لكل الأدوار
  - `SettingsSeeder` — إعدادات النظام
  - `TimePeriodsSeeder` — نوافذ زمنية
  - `ProposalsSeeder` — مقترحات تجريبية
- **التشغيل**:
  - `php artisan db:seed` — تنفيذ كل الـ Seeders
  - `php artisan migrate:fresh --seed` — إعادة إنشاء الجداول ثم ملؤها
  - `php artisan db:seed --class=UsersSeeder` — تشغيل Seeder محدد

### Factories

- **الموقع**: `backend/database/factories/`
- **الوظيفة**: إنشاء بيانات وهمية للاختبار.
- أمثلة: `UserFactory`, `ProposalFactory`, `StudentFactory`, `SupervisorFactory`.
