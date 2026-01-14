# توثيق منطق المشروع الجماعي المشترك
## Group Project Shared Logic Documentation

**التاريخ:** 2026-01-10  
**الإصدار:** 1.0  
**الحالة:** ✅ مكتمل ومُختبر

---

## 📋 نظرة عامة (Overview)

تم إصلاح وتحسين منطق المشروع الجماعي في نظام إدارة مشاريع التخرج بحيث يعمل كـ **مشروع واحد مشترك** بين جميع أعضاء المجموعة، مع توحيد كامل للحالة، التقدم، الملفات، والتسليمات.

---

## 🎯 المشكلة الأصلية

### قبل التعديلات:
- ❌ الطلاب في نفس المجموعة لا يرتبطون بمشروع واحد فعلياً
- ❌ حالة المشروع والتقدم والملفات غير موحدة بين الأعضاء
- ❌ كل طالب يظهر له المشروع وكأنه مشروع مستقل
- ❌ الملفات المرفوعة من طالب لا يراها باقي الأعضاء
- ❌ عدم وجود ضمانات على مستوى قاعدة البيانات لمنع التكرار

---

## ✅ الحل المطبق

### المبدأ الأساسي:
**"One Project, One Group, Multiple Students"**

```
Project (1) ←→ (1) Group (1) ←→ (N) Members
    ↓
Students (N) - All linked to the same project_id
```

---

## 🗄️ التغييرات في قاعدة البيانات (Database Schema)

### 1. العلاقات الأساسية

#### جدول `projects`
```sql
- id (Primary Key)
- title
- description
- status (shared by all group members)
- supervisor_id
- max_students
- current_students (auto-updated)
- specialization
- keywords
```

#### جدول `project_groups`
```sql
- id (Primary Key)
- project_id (Foreign Key → projects.id) [UNIQUE] ✨ NEW
- leader_id (Foreign Key → users.id)
- max_members
```

**✨ إضافة جديدة:** Unique constraint على `project_id` لضمان مجموعة واحدة فقط لكل مشروع.

#### جدول `project_student` (Pivot)
```sql
- project_id (Foreign Key → projects.id)
- student_id (Foreign Key → users.id)
- UNIQUE(project_id, student_id)
```

**الغرض:** ربط جميع أعضاء المجموعة بنفس `project_id`.

#### جدول `project_group_member` (Pivot)
```sql
- group_id (Foreign Key → project_groups.id)
- member_id (Foreign Key → users.id)
- UNIQUE(group_id, member_id)
```

**الغرض:** تحديد عضوية المجموعة.

### 2. الجداول المرتبطة بالمشروع (Shared Data)

جميع هذه الجداول مرتبطة بـ `project_id` وليس بـ `student_id`:

#### `documents`
```sql
- project_id (Foreign Key) ← مشترك بين جميع الأعضاء
- submitted_by (من رفع الملف)
- file_name, file_path, etc.
```

#### `project_milestones`
```sql
- project_id (Foreign Key) ← مشترك بين جميع الأعضاء
- title, description
- completed (حالة مشتركة)
```

#### `grades`
```sql
- project_id (Foreign Key)
- student_id (Foreign Key) ← كل طالب له درجة خاصة
- supervisor_grade, committee_grade, final_grade
```

---

## 🔧 التغييرات في Backend

### 1. GroupService.php

#### أ. `create()` - إنشاء مجموعة
**التعديلات:**
```php
// ✅ يضيف القائد إلى project.students تلقائياً
if (!$project->students()->where('users.id', $leader->id)->exists()) {
    $project->students()->attach($leader->id);
    $project->increment('current_students');
}

// ✅ يضيف جميع الأعضاء الأوليين إلى project.students
foreach ($memberIds as $memberId) {
    if (!$project->students()->where('users.id', $member->id)->exists()) {
        $project->students()->attach($member->id);
        $project->increment('current_students');
    }
}
```

#### ب. `acceptInvitation()` - قبول دعوة
**التعديلات:**
```php
// ✅ إزالة التحقق من التسجيل المسبق
// ❌ OLD: if (!$this->hasApprovedRegistration($invitee, $project))

// ✅ NEW: إضافة تلقائية إلى المشروع عند قبول الدعوة
$group->members()->attach($invitation->invitee_id);
$project->students()->attach($invitee->id);
$project->increment('current_students');

// ✅ إنشاء سجل تسجيل معتمد تلقائياً
ProjectRegistration::updateOrCreate([
    'project_id' => $project->id,
    'student_id' => $invitee->id,
], [
    'status' => 'approved',
    'submitted_at' => now(),
    'reviewed_at' => now(),
    'reviewed_by' => $invitation->inviter_id,
    'review_comments' => 'Auto-approved via group invitation',
]);
```

#### ج. `addMember()` - إضافة عضو
**التعديلات:**
```php
// ✅ إضافة تلقائية إلى المشروع
$group->members()->attach($member->id);
$project->students()->attach($member->id);
$project->increment('current_students');

// ✅ إنشاء سجل تسجيل معتمد
ProjectRegistration::updateOrCreate(...);
```

#### د. `removeMember()` - إزالة عضو
**التعديلات:**
```php
// ✅ إزالة من المجموعة والمشروع معاً
$group->members()->detach($member->id);
$project->students()->detach($member->id);
$project->decrement('current_students');

// ✅ تحديث سجل التسجيل
ProjectRegistration::where('project_id', $project->id)
    ->where('student_id', $member->id)
    ->update(['status' => 'cancelled']);
```

#### ه. `inviteMember()` - إرسال دعوة
**التعديلات:**
```php
// ✅ التحقق من عدم وجود مشروع آخر
$hasOtherProject = Project::whereHas('students', function ($query) use ($invitee) {
    $query->where('users.id', $invitee->id);
})->where('id', '!=', $group->project_id)->exists();

if ($hasOtherProject) {
    throw new \Exception('Student is already registered in another project');
}
```

### 2. ProjectController.php (Student)

#### أ. `index()` - جلب المشاريع
**التعديلات:**
```php
// ✅ إضافة group.members و group.leader
$query = Project::with(['supervisor', 'students', 'group.members', 'group.leader']);

// ✅ جلب المشاريع حيث الطالب موجود في project.students
$query->whereHas('students', function ($q) use ($request) {
    $q->where('users.id', $request->user()->id);
});
```

### 3. DocumentController.php (Student)

#### أ. `index()` - جلب الملفات
**التعديلات:**
```php
// ❌ OLD: Document::where('submitted_by', $request->user()->id)

// ✅ NEW: جلب جميع ملفات المشاريع المسجل فيها الطالب
$studentProjects = Project::whereHas('students', function ($q) use ($request) {
    $q->where('users.id', $request->user()->id);
})->pluck('id');

$query = Document::whereIn('project_id', $studentProjects)
    ->with(['project', 'submitter', 'reviewer']);
```

### 4. DocumentPolicy.php

#### أ. `view()` - عرض الملف
**التعديلات:**
```php
// ❌ OLD: if ($document->submitted_by === $user->id)

// ✅ NEW: جميع أعضاء المجموعة يمكنهم رؤية الملفات
if ($user->isStudent() && $document->project) {
    if ($document->project->students()->where('users.id', $user->id)->exists()) {
        return true;
    }
}
```

#### ب. `delete()` - حذف الملف
**التعديلات:**
```php
// ❌ OLD: return $document->submitted_by === $user->id;

// ✅ NEW: جميع أعضاء المجموعة يمكنهم حذف الملفات
if ($user->isStudent() && $document->project) {
    return $document->project->students()->where('users.id', $user->id)->exists();
}
```

### 5. ProjectPolicy.php

**لا تغييرات مطلوبة** - المنطق الحالي صحيح:
```php
// ✅ الطالب يمكنه رؤية المشروع إذا كان مسجلاً فيه
if ($project->students()->where('users.id', $user->id)->exists()) {
    return true;
}
```

---

## 🎨 التغييرات في Frontend

### 1. GroupsList.screen.tsx

#### التحقق من التسجيل المعتمد
**التعديلات:**
```typescript
// ✅ البحث في قائمة registrations الكاملة
const groupProjectRegistration = data.group.projectId 
  ? registrations?.find(r => r.projectId === data.group.projectId && r.status === 'approved')
  : null;

const hasApprovedRegistration =
  groupProjectRegistration ||
  (data.group.project?.students && data.group.project.students.some(s => s.id === user?.id));
```

### 2. group.service.ts

#### معالجة الأخطاء
**التعديلات:**
```typescript
// ✅ إضافة دالة لاستخراج رسائل الخطأ
const getErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// ✅ جميع الدوال تستخدم try-catch وترمي أخطاء واضحة
try {
  const response = await apiClient.get<ProjectGroup>('/student/groups');
  return response.data; // قد يكون null - هذا صحيح
} catch (error) {
  throw new Error(getErrorMessage(error));
}
```

### 3. useGroups.ts & useGroupOperations.ts

#### إبطال الـ Cache
**التعديلات:**
```typescript
// ✅ إبطال شامل لجميع الـ queries ذات الصلة
onSuccess: (data) => {
  queryClient.invalidateQueries({ queryKey: ['groups'] });
  if (user) {
    queryClient.invalidateQueries({ queryKey: ['groups', 'student', user.id] });
  }
  if (data?.projectId) {
    queryClient.invalidateQueries({ queryKey: ['groups', 'project', data.projectId] });
  }
  queryClient.invalidateQueries({ queryKey: ['group-invitations'] });
}
```

---

## 🔒 Validations والضمانات

### 1. Database Level

#### Unique Constraints
```sql
-- ✅ مجموعة واحدة فقط لكل مشروع
ALTER TABLE project_groups ADD UNIQUE (project_id);

-- ✅ طالب واحد فقط لكل مشروع (لا تكرار)
ALTER TABLE project_student ADD UNIQUE (project_id, student_id);

-- ✅ عضو واحد فقط في كل مجموعة (لا تكرار)
ALTER TABLE project_group_member ADD UNIQUE (group_id, member_id);
```

### 2. Application Level

#### في GroupService
```php
// ✅ منع إنشاء مجموعة ثانية لنفس المشروع
if ($project->group) {
    throw new \Exception('Project already has a group');
}

// ✅ منع الطالب من الانضمام لأكثر من مشروع
$hasOtherProject = Project::whereHas('students', function ($query) use ($student) {
    $query->where('users.id', $student->id);
})->where('id', '!=', $project->id)->exists();

if ($hasOtherProject) {
    throw new \Exception('Student is already registered in another project');
}
```

#### في ProjectPolicy
```php
// ✅ منع التسجيل في أكثر من مشروع
$hasProject = Project::whereHas('students', function ($query) use ($user) {
    $query->where('users.id', $user->id);
})->exists();

return !$hasProject;
```

---

## 📊 تدفق البيانات (Data Flow)

### سيناريو كامل: من التسجيل إلى العمل الجماعي

```
1. الطالب A يسجل في مشروع
   ↓
   project_student: (project_id: 1, student_id: A)
   project_registrations: (status: approved)

2. الطالب A ينشئ مجموعة
   ↓
   project_groups: (project_id: 1, leader_id: A)
   project_group_member: (group_id: 1, member_id: A)
   ✅ A موجود في project.students

3. الطالب A يدعو الطالب B
   ↓
   group_invitations: (group_id: 1, invitee_id: B, status: pending)

4. الطالب B يقبل الدعوة
   ↓
   project_group_member: (group_id: 1, member_id: B)
   project_student: (project_id: 1, student_id: B) ✅ إضافة تلقائية
   project_registrations: (status: approved) ✅ إنشاء تلقائي
   group_invitations: (status: accepted)

5. كلا الطالبين يرفعون ملفات
   ↓
   documents: (project_id: 1, submitted_by: A)
   documents: (project_id: 1, submitted_by: B)
   ✅ كلاهما يرى جميع الملفات

6. المشرف يحدّث milestone
   ↓
   project_milestones: (project_id: 1, completed: true)
   ✅ كلا الطالبين يرى نفس التقدم

7. عرض المشروع
   ↓
   SELECT * FROM projects WHERE id = 1
   ✅ كلا الطالبين يرى:
      - نفس الحالة (status)
      - نفس التقدم (progress %)
      - نفس الملفات (documents)
      - نفس المهام (milestones)
```

---

## ✅ الميزات المضمونة

### 1. مشروع واحد مشترك
- ✅ جميع أعضاء المجموعة مرتبطون بنفس `project_id`
- ✅ لا يمكن إنشاء أكثر من مجموعة لنفس المشروع
- ✅ لا يمكن للطالب الانضمام لأكثر من مشروع

### 2. حالة موحدة
- ✅ `project.status` مشترك بين جميع الأعضاء
- ✅ أي تغيير في الحالة يظهر للجميع فوراً

### 3. تقدم موحد
- ✅ نسبة التقدم محسوبة من `project_milestones`
- ✅ جميع الأعضاء يرون نفس النسبة المئوية

### 4. ملفات مشتركة
- ✅ جميع الملفات مرتبطة بـ `project_id`
- ✅ أي عضو يمكنه رؤية وتحميل جميع الملفات
- ✅ أي عضو يمكنه رفع ملفات جديدة
- ✅ أي عضو يمكنه حذف الملفات (مشترك)

### 5. مهام مشتركة (Milestones)
- ✅ جميع المهام مرتبطة بـ `project_id`
- ✅ حالة إكمال المهام مشتركة

### 6. اجتماعات مشتركة (Meetings)
- ✅ جميع الاجتماعات مرتبطة بـ `project_id`
- ✅ جميع الأعضاء يرون نفس الاجتماعات

### 7. ملاحظات المشرف مشتركة
- ✅ جميع الملاحظات مرتبطة بـ `project_id`
- ✅ جميع الأعضاء يرون نفس الملاحظات

### 8. درجات فردية
- ✅ كل طالب له درجة خاصة (`grades` table)
- ✅ الدرجات مرتبطة بـ `project_id` + `student_id`

---

## 🧪 سيناريوهات الاختبار

### Test Case 1: إنشاء مجموعة
```
Given: طالب مسجل في مشروع
When: ينشئ مجموعة
Then: 
  ✅ يُضاف إلى project.students (إن لم يكن موجوداً)
  ✅ يُضاف إلى group.members
  ✅ يصبح leader
```

### Test Case 2: قبول دعوة
```
Given: طالب يستقبل دعوة
When: يقبل الدعوة
Then:
  ✅ يُضاف إلى project.students
  ✅ يُضاف إلى group.members
  ✅ يُنشأ سجل تسجيل معتمد
  ✅ يرى نفس المشروع مثل القائد
```

### Test Case 3: رفع ملف
```
Given: عضو في مجموعة
When: يرفع ملف
Then:
  ✅ الملف مرتبط بـ project_id
  ✅ جميع الأعضاء يرون الملف
  ✅ جميع الأعضاء يمكنهم تحميله
```

### Test Case 4: تحديث milestone
```
Given: مشرف يحدّث milestone
When: يضع علامة "مكتمل"
Then:
  ✅ جميع الأعضاء يرون التحديث
  ✅ نسبة التقدم تتحدث للجميع
```

### Test Case 5: منع التسجيل المتعدد
```
Given: طالب مسجل في مشروع A
When: يحاول الانضمام لمشروع B
Then:
  ❌ يُرفض الطلب
  ✅ رسالة خطأ واضحة
```

---

## 📝 ملاحظات مهمة

### 1. التزامن (Synchronization)
- جميع التحديثات تتم في transactions
- استخدام `DB::transaction()` لضمان التناسق
- إبطال الـ cache فوراً بعد أي تغيير

### 2. الأداء (Performance)
- استخدام Eager Loading: `with(['project', 'group.members'])`
- Indexes على جميع Foreign Keys
- Unique constraints لمنع البيانات المكررة

### 3. الأمان (Security)
- التحقق من الصلاحيات في Policies
- التحقق من العضوية قبل أي عملية
- منع الوصول غير المصرح به

---

## 🔄 Migration Path

### للتطبيق على نظام موجود:

```bash
# 1. تشغيل الـ migration الجديد
php artisan migrate

# 2. تنظيف البيانات القديمة (إن وجدت)
# تأكد من أن جميع أعضاء المجموعات موجودين في project.students

# 3. اختبار النظام
php artisan test
```

---

## 📞 الدعم والصيانة

### في حالة وجود مشاكل:

1. **تحقق من العلاقات:**
   ```sql
   SELECT * FROM project_student WHERE project_id = ?;
   SELECT * FROM project_group_member WHERE group_id = ?;
   ```

2. **تحقق من التناسق:**
   ```sql
   -- جميع أعضاء المجموعة يجب أن يكونوا في project.students
   SELECT gm.member_id 
   FROM project_group_member gm
   LEFT JOIN project_student ps ON gm.member_id = ps.student_id
   WHERE ps.student_id IS NULL;
   ```

3. **إعادة المزامنة (إن لزم):**
   ```php
   // في Tinker أو Command
   $group = ProjectGroup::find($groupId);
   foreach ($group->members as $member) {
       if (!$group->project->students()->where('users.id', $member->id)->exists()) {
           $group->project->students()->attach($member->id);
       }
   }
   ```

---

## ✨ الخلاصة

تم إصلاح النظام بالكامل ليعمل كـ **مشروع جماعي مشترك** حقيقي، مع:

- ✅ توحيد كامل للبيانات بين جميع الأعضاء
- ✅ ضمانات على مستوى قاعدة البيانات
- ✅ منطق Backend محكم ومتسق
- ✅ Frontend يعرض البيانات المشتركة بشكل صحيح
- ✅ Validations شاملة لمنع الأخطاء
- ✅ توثيق كامل للنظام

**النظام الآن جاهز للإنتاج! 🎉**

---

**تم بواسطة:** AI Assistant  
**التاريخ:** 2026-01-10  
**الإصدار:** 1.0
