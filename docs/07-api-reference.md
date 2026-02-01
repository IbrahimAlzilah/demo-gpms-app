# مرجع واجهة الـ API

هذا الملف يوثق **جميع** مسارات الـ API في المشروع.  
الـ Base URL للـ API هو: `{BASE}/api` (مثلاً `http://localhost:8000/api`).

---

## اصطلاحات

| الرمز      | المعنى                                       |
| ---------- | -------------------------------------------- |
| **Auth**   | يحتاج مصادقة (Bearer Token)                  |
| **Role**   | مقتصر على دور معين                           |
| **Window** | يحتاج نافذة زمنية نشطة (يُذكر نوعها إن وُجد) |

---

## مسارات عامة (بدون مصادقة)

| Method | Path                         | الوظيفة                                          | Auth |
| ------ | ---------------------------- | ------------------------------------------------ | ---- |
| GET    | `/api/health`                | التحقق من صحة الخادم وقاعدة البيانات             | لا   |
| POST   | `/api/auth/login`            | تسجيل الدخول (identifier, password)              | لا   |
| POST   | `/api/auth/register`         | التسجيل كمستخدم جديد                             | لا   |
| POST   | `/api/auth/recover-password` | طلب استعادة كلمة المرور (email)                  | لا   |
| POST   | `/api/auth/reset-password`   | إعادة تعيين كلمة المرور (token, email, password) | لا   |

---

## مسارات المصادقة والإعدادات (لأي مستخدم مسجل)

| Method | Path                              | الوظيفة                           | Auth |
| ------ | --------------------------------- | --------------------------------- | ---- |
| GET    | `/api/auth/me`                    | بيانات المستخدم الحالي والصلاحيات | نعم  |
| POST   | `/api/auth/logout`                | تسجيل الخروج                      | نعم  |
| GET    | `/api/settings`                   | إعدادات النظام (قراءة فقط)        | نعم  |
| GET    | `/api/time-windows/active`        | النوافذ الزمنية النشطة            | نعم  |
| GET    | `/api/time-windows/upcoming`      | النوافذ القادمة                   | نعم  |
| POST   | `/api/time-windows/check`         | التحقق من نافذة معينة             | نعم  |
| POST   | `/api/time-windows/status`        | حالة النوافذ                      | نعم  |
| GET    | `/api/time-windows/types`         | أنواع النوافذ                     | نعم  |
| GET    | `/api/notifications`              | قائمة الإشعارات                   | نعم  |
| GET    | `/api/notifications/unread-count` | عدد غير المقروءة                  | نعم  |
| POST   | `/api/notifications/{id}/read`    | تعليم كمقروء                      | نعم  |
| POST   | `/api/notifications/read-all`     | تعليم الكل كمقروء                 | نعم  |
| DELETE | `/api/notifications`              | حذف كل الإشعارات                  | نعم  |
| DELETE | `/api/notifications/{id}`         | حذف إشعار                         | نعم  |

---

## مسارات الطالب (role: student)

| Method | Path                                             | الوظيفة                       | Window                                                                                    |
| ------ | ------------------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------- |
| GET    | `/api/student/dashboard`                         | لوحة تحكم الطالب              | -                                                                                         |
| GET    | `/api/student/proposals`                         | قائمة المقترحات               | -                                                                                         |
| GET    | `/api/student/proposals/submission`              | سياق التقديم (نوافذ، مجموعات) | -                                                                                         |
| GET    | `/api/student/proposals/{id}`                    | عرض مقترح                     | -                                                                                         |
| POST   | `/api/student/proposals`                         | إنشاء مقترح                   | حسب Controller                                                                            |
| POST   | `/api/student/proposals/batch`                   | تقديم دفعة مقترحات            | حسب Controller                                                                            |
| PUT    | `/api/student/proposals/{id}`                    | تعديل مقترح                   | -                                                                                         |
| PUT    | `/api/student/proposals/batch`                   | تحديث دفعة                    | -                                                                                         |
| DELETE | `/api/student/proposals/{id}`                    | حذف مقترح                     | -                                                                                         |
| GET    | `/api/student/supervisors`                       | قائمة المشرفين                | -                                                                                         |
| GET    | `/api/student/projects`                          | قائمة المشاريع                | -                                                                                         |
| GET    | `/api/student/projects/registrations`            | تسجيلات الطالب                | -                                                                                         |
| GET    | `/api/student/projects/registration-request`     | طلب تسجيل المجموعة            | -                                                                                         |
| POST   | `/api/student/projects/batch-register`           | تسجيل مجموعة على مشروع        | project_registration                                                                      |
| POST   | `/api/student/projects/{id}/register`            | تسجيل على مشروع واحد          | project_registration                                                                      |
| DELETE | `/api/student/projects/registrations/{id}`       | إلغاء تسجيل                   | -                                                                                         |
| GET    | `/api/student/projects/{id}`                     | تفاصيل مشروع                  | -                                                                                         |
| GET    | `/api/student/projects/{id}/notes`               | ملاحظات المشرف                | -                                                                                         |
| POST   | `/api/student/projects/{id}/notes/{note}/reply`  | الرد على ملاحظة               | -                                                                                         |
| GET    | `/api/student/projects/{id}/milestones`          | معالم المشروع                 | -                                                                                         |
| GET    | `/api/student/projects/{id}/meetings`            | اجتماعات المشروع              | -                                                                                         |
| GET    | `/api/student/projects/{id}/progress`            | تقدم المشروع                  | -                                                                                         |
| GET    | `/api/student/groups`                            | المجموعة الخاصة بالطالب       | -                                                                                         |
| GET    | `/api/student/groups/lookup`                     | البحث بالكود                  | -                                                                                         |
| GET    | `/api/student/groups/students/search`            | بحث طلاب للدعوة               | -                                                                                         |
| POST   | `/api/student/groups`                            | إنشاء مجموعة                  | -                                                                                         |
| POST   | `/api/student/groups/invite`                     | دعوة أعضاء                    | -                                                                                         |
| GET    | `/api/student/groups/invitations`                | دعواتي                        | -                                                                                         |
| POST   | `/api/student/groups/invitations/{id}/accept`    | قبول دعوة                     | -                                                                                         |
| POST   | `/api/student/groups/invitations/{id}/reject`    | رفض دعوة                      | -                                                                                         |
| PUT    | `/api/student/groups/{id}/leader`                | تغيير القائد                  | -                                                                                         |
| POST   | `/api/student/groups/{id}/members`               | إضافة عضو                     | -                                                                                         |
| DELETE | `/api/student/groups/{id}/members/{member}`      | إزالة عضو                     | -                                                                                         |
| DELETE | `/api/student/groups/{id}/leave`                 | مغادرة المجموعة               | -                                                                                         |
| DELETE | `/api/student/groups/{id}`                       | حذف مجموعة                    | -                                                                                         |
| POST   | `/api/student/groups/join-request`               | طلب انضمام لمجموعة            | -                                                                                         |
| GET    | `/api/student/groups/join-requests/my`           | طلبات انضمامي                 | -                                                                                         |
| GET    | `/api/student/groups/{id}/join-requests`         | طلبات انضمام للمجموعة         | -                                                                                         |
| POST   | `/api/student/groups/join-requests/{id}/approve` | الموافقة على طلب انضمام       | -                                                                                         |
| POST   | `/api/student/groups/join-requests/{id}/reject`  | رفض طلب انضمام                | -                                                                                         |
| DELETE | `/api/student/groups/join-requests/{id}/cancel`  | إلغاء طلب انضمام              | -                                                                                         |
| GET    | `/api/student/documents`                         | قائمة المستندات               | -                                                                                         |
| GET    | `/api/student/documents/{id}`                    | تفاصيل مستند                  | -                                                                                         |
| GET    | `/api/student/documents/{id}/download`           | تحميل مستند                   | -                                                                                         |
| POST   | `/api/student/documents`                         | رفع مستند                     | chapter_submission_phase_1, chapter_submission_phase_2, final_project_document_submission |
| DELETE | `/api/student/documents/{id}`                    | حذف مستند                     | -                                                                                         |
| GET    | `/api/student/requests`                          | قائمة الطلبات                 | -                                                                                         |
| POST   | `/api/student/requests`                          | إنشاء طلب                     | -                                                                                         |
| GET    | `/api/student/requests/{id}`                     | تفاصيل طلب                    | -                                                                                         |
| PUT    | `/api/student/requests/{id}`                     | تعديل طلب                     | -                                                                                         |
| DELETE | `/api/student/requests/{id}`                     | حذف طلب                       | -                                                                                         |
| POST   | `/api/student/requests/{id}/cancel`              | إلغاء طلب                     | -                                                                                         |
| GET    | `/api/student/grades`                            | قائمة الدرجات                 | -                                                                                         |
| GET    | `/api/student/grades/{id}`                       | تفاصيل درجة                   | -                                                                                         |

---

## مسارات المشرف (role: supervisor)

| Method | Path                                                     | الوظيفة                | Window              |
| ------ | -------------------------------------------------------- | ---------------------- | ------------------- |
| GET    | `/api/supervisor/dashboard`                              | لوحة تحكم المشرف       | -                   |
| GET    | `/api/supervisor/proposals`                              | قائمة المقترحات        | -                   |
| GET    | `/api/supervisor/proposals/submission`                   | سياق التقديم           | -                   |
| GET    | `/api/supervisor/proposals/student-groups`               | المجموعات الطلابية     | -                   |
| GET    | `/api/supervisor/proposals/{id}`                         | عرض مقترح              | -                   |
| POST   | `/api/supervisor/proposals`                              | إنشاء مقترح            | proposal_submission |
| POST   | `/api/supervisor/proposals/batch`                        | تقديم دفعة             | proposal_submission |
| PUT    | `/api/supervisor/proposals/{id}`                         | تعديل مقترح            | proposal_submission |
| PUT    | `/api/supervisor/proposals/batch`                        | تحديث دفعة             | -                   |
| DELETE | `/api/supervisor/proposals/{id}`                         | حذف مقترح              | -                   |
| POST   | `/api/supervisor/proposals/{id}/assign`                  | تعيين مجموعة           | -                   |
| POST   | `/api/supervisor/proposals/{id}/request-assignment`      | طلب تعيين              | -                   |
| GET    | `/api/supervisor/supervisors`                            | قائمة المشرفين         | -                   |
| GET    | `/api/supervisor/projects`                               | مشاريعي                | -                   |
| GET    | `/api/supervisor/projects/{id}`                          | تفاصيل مشروع           | -                   |
| GET    | `/api/supervisor/projects/{id}/progress`                 | تقدم المشروع           | -                   |
| GET    | `/api/supervisor/projects/{id}/grades`                   | درجات المشروع          | -                   |
| GET    | `/api/supervisor/projects/{id}/documents/{doc}/download` | تحميل مستند            | -                   |
| POST   | `/api/supervisor/projects/{id}/documents/{doc}/review`   | مراجعة مستند           | -                   |
| GET    | `/api/supervisor/supervision-requests`                   | طلبات الإشراف          | -                   |
| POST   | `/api/supervisor/supervision-requests/{project}/approve` | الموافقة على طلب إشراف | -                   |
| POST   | `/api/supervisor/supervision-requests/{project}/reject`  | رفض طلب إشراف          | -                   |
| GET    | `/api/supervisor/assignment-requests`                    | طلبات التعيين          | -                   |
| POST   | `/api/supervisor/assignment-requests/{id}/approve`       | الموافقة على طلب تعيين | -                   |
| POST   | `/api/supervisor/assignment-requests/{id}/reject`        | رفض طلب تعيين          | -                   |
| GET    | `/api/supervisor/evaluations`                            | قائمة التقييمات        | -                   |
| POST   | `/api/supervisor/evaluations`                            | رفع تقييم              | -                   |
| POST   | `/api/supervisor/evaluations/batch`                      | رفع دفعة تقييمات       | -                   |
| GET    | `/api/supervisor/evaluations/locked/{project}`           | هل التقييم مقفل        | -                   |
| GET    | `/api/supervisor/projects/{id}/notes`                    | ملاحظات المشروع        | -                   |
| POST   | `/api/supervisor/projects/{id}/notes`                    | إضافة ملاحظة           | -                   |
| POST   | `/api/supervisor/notes/{note}/reply`                     | الرد على ملاحظة        | -                   |
| GET    | `/api/supervisor/projects/{id}/milestones`               | معالم المشروع          | -                   |
| POST   | `/api/supervisor/projects/{id}/milestones`               | إضافة معلم             | -                   |
| PUT    | `/api/supervisor/milestones/{id}`                        | تعديل معلم             | -                   |
| DELETE | `/api/supervisor/milestones/{id}`                        | حذف معلم               | -                   |
| POST   | `/api/supervisor/milestones/{id}/complete`               | إكمال معلم             | -                   |
| GET    | `/api/supervisor/projects/{id}/meetings`                 | اجتماعات المشروع       | -                   |
| POST   | `/api/supervisor/projects/{id}/meetings`                 | إضافة اجتماع           | -                   |
| PUT    | `/api/supervisor/meetings/{id}`                          | تعديل اجتماع           | -                   |
| DELETE | `/api/supervisor/meetings/{id}`                          | حذف اجتماع             | -                   |

---

## مسارات لجنة المشاريع (role: projects_committee)

| Method | Path                                                           | الوظيفة             | Window         |
| ------ | -------------------------------------------------------------- | ------------------- | -------------- |
| GET    | `/api/projects-committee/dashboard`                            | لوحة تحكم اللجنة    | -              |
| GET    | `/api/projects-committee/proposals/submissions`                | المقترحات المقدمة   | -              |
| GET    | `/api/projects-committee/proposals`                            | قائمة المقترحات     | -              |
| GET    | `/api/projects-committee/proposals/{id}`                       | عرض مقترح           | -              |
| POST   | `/api/projects-committee/proposals`                            | إنشاء مقترح         | -              |
| POST   | `/api/projects-committee/proposals/{id}/approve`               | الموافقة على مقترح  | -              |
| POST   | `/api/projects-committee/proposals/{id}/reject`                | رفض مقترح           | -              |
| POST   | `/api/projects-committee/proposals/{id}/request-modification`  | طلب تعديل           | -              |
| GET    | `/api/projects-committee/projects/statistics`                  | إحصائيات المشاريع   | -              |
| GET    | `/api/projects-committee/projects`                             | قائمة المشاريع      | -              |
| GET    | `/api/projects-committee/projects/{id}`                        | تفاصيل مشروع        | -              |
| GET    | `/api/projects-committee/projects/{id}/workflow`               | سير عمل المشروع     | -              |
| PUT    | `/api/projects-committee/projects/{id}/status`                 | تحديث حالة المشروع  | -              |
| POST   | `/api/projects-committee/projects/announce`                    | إعلان مشاريع        | -              |
| POST   | `/api/projects-committee/projects/unannounce`                  | إلغاء إعلان         | -              |
| DELETE | `/api/projects-committee/projects/{id}/supervisor`             | إلغاء تعيين مشرف    | -              |
| GET    | `/api/projects-committee/periods`                              | قائمة الفترات       | -              |
| POST   | `/api/projects-committee/periods`                              | إنشاء فترة          | -              |
| GET    | `/api/projects-committee/periods/{id}`                         | عرض فترة            | -              |
| PUT    | `/api/projects-committee/periods/{id}`                         | تعديل فترة          | -              |
| DELETE | `/api/projects-committee/periods/{id}`                         | حذف فترة            | -              |
| GET    | `/api/projects-committee/supervisors`                          | قائمة المشرفين      | -              |
| GET    | `/api/projects-committee/supervisors/assignment-table`         | جدول التعيينات      | -              |
| POST   | `/api/projects-committee/supervisors/assign`                   | تعيين مشرف          | -              |
| POST   | `/api/projects-committee/supervisors/request-assignment`       | طلب تعيين           | -              |
| GET    | `/api/projects-committee/supervisors/assignment-requests`      | طلبات التعيين       | -              |
| GET    | `/api/projects-committee/supervisors/assignment-requests/{id}` | تفاصيل طلب          | -              |
| DELETE | `/api/projects-committee/supervisors/assignment-requests/{id}` | إلغاء طلب           | -              |
| GET    | `/api/projects-committee/requests`                             | قائمة الطلبات       | -              |
| POST   | `/api/projects-committee/requests/{id}/approve`                | الموافقة على طلب    | -              |
| POST   | `/api/projects-committee/requests/{id}/reject`                 | رفض طلب             | -              |
| GET    | `/api/projects-committee/registrations`                        | التسجيلات           | -              |
| GET    | `/api/projects-committee/registrations/unified-groups`         | المجموعات الموحدة   | -              |
| GET    | `/api/projects-committee/registrations/groups`                 | مجموعات التسجيل     | -              |
| GET    | `/api/projects-committee/registrations/{id}`                   | تفاصيل تسجيل        | -              |
| POST   | `/api/projects-committee/registrations`                        | إنشاء تسجيل         | -              |
| POST   | `/api/projects-committee/registrations/{id}/approve`           | الموافقة على تسجيل  | -              |
| POST   | `/api/projects-committee/registrations/{id}/reject`            | رفض تسجيل           | -              |
| POST   | `/api/projects-committee/committees/distribute`                | توزيع لجان المناقشة | -              |
| GET    | `/api/projects-committee/committees/members`                   | أعضاء اللجان        | -              |
| GET    | `/api/projects-committee/committees/projects`                  | مشاريع للمناقشة     | -              |
| DELETE | `/api/projects-committee/committees/projects/{id}/assignment`  | إزالة تعيين لجنة    | -              |
| GET    | `/api/projects-committee/grades`                               | قائمة الدرجات       | -              |
| GET    | `/api/projects-committee/grades/{id}`                          | تفاصيل درجة         | -              |
| POST   | `/api/projects-committee/grades/{id}/approve`                  | الموافقة على درجة   | grade_approval |
| POST   | `/api/projects-committee/grades/publish`                       | نشر الدرجات         | -              |
| GET    | `/api/projects-committee/reports`                              | التقارير            | -              |
| GET    | `/api/projects-committee/reports/overview`                     | نظرة عامة           | -              |
| GET    | `/api/projects-committee/reports/projects`                     | تقرير المشاريع      | -              |
| GET    | `/api/projects-committee/reports/supervisors`                  | تقرير المشرفين      | -              |
| GET    | `/api/projects-committee/reports/students`                     | تقرير الطلاب        | -              |
| GET    | `/api/projects-committee/reports/requests`                     | تقرير الطلبات       | -              |
| GET    | `/api/projects-committee/reports/deadlines`                    | تقرير المواعيد      | -              |
| GET    | `/api/projects-committee/reports/history`                      | السجل               | -              |
| GET    | `/api/projects-committee/reports/export/pdf`                   | تصدير PDF           | -              |
| GET    | `/api/projects-committee/reports/export/excel`                 | تصدير Excel         | -              |

---

## مسارات لجنة المناقشة (role: discussion_committee)

| Method | Path                                                               | الوظيفة          | Window                                       |
| ------ | ------------------------------------------------------------------ | ---------------- | -------------------------------------------- |
| GET    | `/api/discussion-committee/dashboard`                              | لوحة تحكم اللجنة | -                                            |
| GET    | `/api/discussion-committee/projects`                               | المشاريع المعينة | -                                            |
| GET    | `/api/discussion-committee/projects/{id}`                          | تفاصيل مشروع     | -                                            |
| GET    | `/api/discussion-committee/projects/{id}/documents/{doc}/download` | تحميل مستند      | -                                            |
| GET    | `/api/discussion-committee/evaluations`                            | قائمة التقييمات  | -                                            |
| GET    | `/api/discussion-committee/evaluations/projects`                   | مشاريع للتقييم   | -                                            |
| POST   | `/api/discussion-committee/evaluations`                            | رفع تقييم        | final_defense_phase_1, final_defense_phase_2 |
| POST   | `/api/discussion-committee/evaluations/batch`                      | رفع دفعة تقييمات | final_defense_phase_1, final_defense_phase_2 |
| GET    | `/api/discussion-committee/evaluations/locked/{project}`           | هل التقييم مقفل  | -                                            |

---

## مسارات المدير (role: admin)

| Method | Path                              | الوظيفة          | Auth |
| ------ | --------------------------------- | ---------------- | ---- |
| GET    | `/api/admin/dashboard`            | لوحة تحكم المدير | نعم  |
| GET    | `/api/admin/settings`             | إعدادات النظام   | نعم  |
| PUT    | `/api/admin/settings`             | تحديث الإعدادات  | نعم  |
| GET    | `/api/admin/users`                | قائمة المستخدمين | نعم  |
| GET    | `/api/admin/users/{id}`           | تفاصيل مستخدم    | نعم  |
| POST   | `/api/admin/users`                | إنشاء مستخدم     | نعم  |
| PUT    | `/api/admin/users/{id}`           | تعديل مستخدم     | نعم  |
| DELETE | `/api/admin/users/{id}`           | حذف مستخدم       | نعم  |
| GET    | `/api/admin/reports`              | التقارير         | نعم  |
| GET    | `/api/admin/reports/overview`     | نظرة عامة        | نعم  |
| GET    | `/api/admin/reports/users`        | تقرير المستخدمين | نعم  |
| GET    | `/api/admin/reports/system`       | تقرير النظام     | نعم  |
| GET    | `/api/admin/reports/projects`     | تقرير المشاريع   | نعم  |
| GET    | `/api/admin/reports/supervisors`  | تقرير المشرفين   | نعم  |
| GET    | `/api/admin/reports/students`     | تقرير الطلاب     | نعم  |
| GET    | `/api/admin/reports/requests`     | تقرير الطلبات    | نعم  |
| GET    | `/api/admin/reports/deadlines`    | تقرير المواعيد   | نعم  |
| GET    | `/api/admin/reports/history`      | السجل            | نعم  |
| GET    | `/api/admin/reports/export/pdf`   | تصدير PDF        | نعم  |
| GET    | `/api/admin/reports/export/excel` | تصدير Excel      | نعم  |

---

## هيكل الاستجابة النموذجي

الـ Backend يرجع عادةً بصيغة:

```json
{
  "success": true,
  "data": { ... },
  "message": "رسالة اختيارية",
  "pagination": { "current_page", "per_page", "total", ... }
}
```

في حالة الخطأ:

```json
{
  "success": false,
  "message": "وصف الخطأ",
  "errors": { "field": ["رسائل التحقق"] }
}
```

---

## المصادقة

جميع المسارات المحمية تتطلب رأس:

```
Authorization: Bearer <token>
```

التوكن يُمنح عند تسجيل الدخول الناجح من `/api/auth/login`.
