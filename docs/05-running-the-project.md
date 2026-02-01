# دليل التشغيل والتطوير خطوة بخطوة

هذا المستند يشرح **كيفية تشغيل المشروع محلياً** بشكل تدريجي ومناسب للمبتدئين.

---

## 1. المتطلبات الأساسية (Required Tools)

يجب تثبيت الأدوات التالية على جهازك قبل البدء:

| المتطلب      | الإصدار     | الغرض                                  | رابط التثبيت                                 |
| ------------ | ----------- | -------------------------------------- | -------------------------------------------- |
| **PHP**      | 8.2 أو أحدث | تشغيل الـ Backend                      | [php.net](https://php.net)                   |
| **Composer** | 2.x         | إدارة حزم PHP                          | [getcomposer.org](https://getcomposer.org)   |
| **Node.js**  | 18+         | تشغيل الـ Frontend                     | [nodejs.org](https://nodejs.org)             |
| **npm**      | أحدث        | إدارة حزم JavaScript (يأتي مع Node.js) | -                                            |
| **MySQL**    | 5.7+ أو 8.x | قاعدة البيانات                         | [mysql.com](https://mysql.com) أو XAMPP/WAMP |
| **Git**      | -           | نسخ المشروع                            | [git-scm.com](https://git-scm.com)           |

**ملاحظة للمبتدئين:** إذا كنت تستخدم Windows، يمكنك استخدام **XAMPP** أو **Laragon** الذي يوفر PHP و MySQL معاً.

---

## 2. إعداد البيئة خطوة بخطوة

### الخطوة 1: نسخ المشروع

افتح الطرفية (Terminal) واكتب:

```bash
git clone <رابط-المستودع>
cd demo-gpms-app
```

(استبدل `<رابط-المستودع>` بالرابط الفعلي من Git.)

---

### الخطوة 2: إعداد الـ Backend

1. انتقل إلى مجلد الـ Backend:

```bash
cd backend
```

2. ثبّت حزم PHP:

```bash
composer install
```

3. أنشئ ملف البيئة من المثال:

```bash
# في Windows (PowerShell أو CMD):
copy .env.example .env

# في Linux/Mac:
cp .env.example .env
```

4. أنشئ مفتاح التشفير للتطبيق:

```bash
php artisan key:generate
```

---

### الخطوة 3: إعداد قاعدة البيانات

1. **شغّل MySQL** (إذا كنت تستخدم XAMPP، شغّل Apache و MySQL).

2. **أنشئ قاعدة بيانات جديدة** عبر phpMyAdmin أو الطرفية:

```sql
CREATE DATABASE backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **عدّل ملف `backend/.env`** وحدّث إعدادات قاعدة البيانات:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=
```

(إذا كان لديك كلمة مرور لـ MySQL، ضعها في `DB_PASSWORD`.)

4. **نفّذ الـ migrations والـ seeders** لإنشاء الجداول وملءها ببيانات تجريبية:

```bash
cd backend
php artisan migrate --seed
```

أو لإعادة بناء كل شيء من الصفر:

```bash
php artisan migrate:fresh --seed
```

---

### الخطوة 4: إعداد الـ Frontend

1. انتقل إلى مجلد الـ Frontend:

```bash
cd frontend
```

2. ثبّت حزم JavaScript:

```bash
npm install
```

3. أنشئ ملف البيئة:

```bash
# في Windows:
copy .env.example .env

# في Linux/Mac:
cp .env.example .env
```

4. **عدّل ملف `frontend/.env`** وأضف رابط الـ API:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## شرح ملفات .env

### Backend (`backend/.env`)

| المتغير         | الوظيفة                   | مثال                    |
| --------------- | ------------------------- | ----------------------- |
| `APP_NAME`      | اسم التطبيق               | `Laravel`               |
| `APP_ENV`       | البيئة (local/production) | `local`                 |
| `APP_DEBUG`     | عرض تفاصيل الأخطاء        | `true`                  |
| `APP_URL`       | رابط الخادم               | `http://localhost:8000` |
| `DB_CONNECTION` | نوع قاعدة البيانات        | `mysql`                 |
| `DB_HOST`       | عنوان خادم قاعدة البيانات | `127.0.0.1`             |
| `DB_PORT`       | منفذ MySQL                | `3306`                  |
| `DB_DATABASE`   | اسم قاعدة البيانات        | `backend`               |
| `DB_USERNAME`   | مستخدم MySQL              | `root`                  |
| `DB_PASSWORD`   | كلمة مرور MySQL           | فارغ أو الكلمة          |
| `FRONTEND_URL`  | رابط الواجهة الأمامية     | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| المتغير             | الوظيفة                  | مثال                        |
| ------------------- | ------------------------ | --------------------------- |
| `VITE_API_BASE_URL` | رابط الـ API             | `http://localhost:8000/api` |
| `APP_PORT`          | منفذ الواجهة عند التطوير | `3000`                      |

**ملاحظة**: إذا لم يُعيّن `VITE_API_BASE_URL`، سيُستخدم افتراضياً `/api` (يعمل إذا كانت الواجهة تُشغّل عبر نفس الدومين).

---

## 3. خطوات التشغيل محلياً (How to Run Locally)

يجب تشغيل **الـ Backend أولاً** ثم **الـ Frontend** لأن الواجهة تتصل بالـ API.

---

### تشغيل الـ Backend (الخادم)

1. افتح **طرفية جديدة** (Terminal).

2. انتقل إلى مجلد الـ Backend:

```bash
cd demo-gpms-app/backend
```

3. شغّل خادم Laravel:

```bash
php artisan serve
```

4. عند ظهور رسالة مثل: `Server running on [http://127.0.0.1:8000]`، يعني أن الـ Backend يعمل على: **http://localhost:8000**

5. **اختياري** — لتفعيل الإشعارات والمهام المؤجلة، افتح طرفية ثانية ونفّذ:

```bash
cd demo-gpms-app/backend
php artisan queue:listen --tries=1
```

---

### تشغيل الـ Frontend (الواجهة)

1. افتح **طرفية جديدة** (يُفضّل ترك الـ Backend يعمل في الطرفية الأولى).

2. انتقل إلى مجلد الـ Frontend:

```bash
cd demo-gpms-app/frontend
```

3. شغّل واجهة التطوير:

```bash
npm run dev
```

4. عند ظهور رسالة مثل: `Local: http://localhost:5173/`، افتح المتصفح وانتقل إلى: **http://localhost:5173**

5. تأكد أن `VITE_API_BASE_URL=http://localhost:8000/api` في ملف `frontend/.env` حتى تتصل الواجهة بالـ Backend بشكل صحيح.

---

### ملخص الترتيب

| الخطوة | الأمر                             | المنفذ | الرابط                |
| ------ | --------------------------------- | ------ | --------------------- |
| 1      | `cd backend && php artisan serve` | 8000   | http://localhost:8000 |
| 2      | `cd frontend && npm run dev`      | 5173   | http://localhost:5173 |

**ملاحظة:** يمكنك استخدام `composer run dev` من مجلد `backend` إذا كان مهيأ ليشغّل الخادم و Queue و Vite معاً.

---

## إعداد قاعدة البيانات (migrations/seeding)

### Migrations

```bash
cd backend
php artisan migrate
```

### Seeders

```bash
php artisan db:seed
```

### إعادة بناء كاملة مع بيانات تجريبية

```bash
php artisan migrate:fresh --seed
```

---

## أوامر التشغيل

| الأمر                                    | الوظيفة                     |
| ---------------------------------------- | --------------------------- |
| `cd backend && php artisan serve`        | تشغيل خادم Laravel          |
| `cd backend && php artisan queue:listen` | تشغيل معالج قائمة الانتظار  |
| `cd frontend && npm run dev`             | تشغيل واجهة التطوير         |
| `cd frontend && npm run build`           | بناء نسخة الإنتاج           |
| `cd frontend && npm run preview`         | معاينة نسخة الإنتاج         |
| `cd backend && composer run dev`         | تشغيل Backend (إن كان مهيأ) |

---

## مشاكل شائعة وحلولها

### 1. خطأ في الاتصال بقاعدة البيانات

**المشكلة**: `SQLSTATE[HY000] [2002] Connection refused` أو ما شابه

**الحل**:

- تأكد أن MySQL يعمل
- تحقق من `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` في `.env`
- تأكد أن قاعدة البيانات `backend` موجودة

### 2. CORS

**المشكلة**: `Access-Control-Allow-Origin` أو أخطاء CORS في المتصفح

**الحل**:

- تأكد أن `FRONTEND_URL` في `backend/.env` يطابق عنوان الواجهة (مثلاً `http://localhost:5173`)
- راجع `backend/config/cors.php` ووجود `http://localhost:3000`, `http://localhost:5173` ضمن `allowed_origins`

### 3. المنفذ مشغول

**المشكلة**: `Address already in use`

**الحل**:

- تشغيل على منفذ آخر: `php artisan serve --port=8001`
- أو إيقاف التطبيق الذي يستخدم نفس المنفذ

### 4. ملف .env غير موجود أو غير مكتمل

**المشكلة**: أخطاء في التهيئة

**الحل**:

```bash
cp .env.example .env
php artisan key:generate
```

### 5. خطأ APP_KEY

**المشكلة**: `No application encryption key has been specified`

**الحل**:

```bash
php artisan key:generate
```

### 6. خطأ 404 على مسارات الـ API

**المشكلة**: `/api/...` يرجع 404

**الحل**:

- تأكد أن الطلبات تذهب إلى `http://localhost:8000/api/...` (أو عنوان الخادم الصحيح)
- تحقق أن `routes/api.php` محمّل في `bootstrap/app.php`

### 7. خطأ Vite

**المشكلة**: أخطاء عند تشغيل `npm run dev` في الواجهة

**الحل**:

```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## تشغيل الاختبارات

```bash
cd backend
php artisan test
```

أو مع Pest:

```bash
./vendor/bin/pest
```
