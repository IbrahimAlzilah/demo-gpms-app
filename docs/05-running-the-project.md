# تشغيل المشروع محلياً

## المتطلبات الأساسية (Prerequisites)

| المتطلب             | الإصدار     | ملاحظات                   |
| ------------------- | ----------- | ------------------------- |
| **PHP**             | 8.2 أو أحدث | للتشغيل على الخادم المحلي |
| **Composer**        | 2.x         | إدارة حزم PHP             |
| **Node.js**         | 18+         | لتشغيل الواجهة الأمامية   |
| **npm** أو **pnpm** | أحدث        | إدارة حزم JavaScript      |
| **MySQL**           | 5.7+ أو 8.x | قاعدة البيانات            |
| **Git**             | -           | لنسخ المشروع              |

---

## إعداد البيئة

### 1. نسخ المشروع

```bash
git clone <رابط-المستودع>
cd demo-gpms-app
```

### 2. إعداد الـ Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

### 3. إعداد قاعدة البيانات

1. إنشاء قاعدة بيانات في MySQL:

```sql
CREATE DATABASE backend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. تحديث ملف `backend/.env`:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=backend
DB_USERNAME=root
DB_PASSWORD=كلمة_مرور_MySQL
```

3. تشغيل الـ migrations والـ seeders:

```bash
cd backend
php artisan migrate --seed
```

أو إعادة إنشاء كل شيء مع البيانات التجريبية:

```bash
php artisan migrate:fresh --seed
```

### 4. إعداد الـ Frontend

```bash
cd frontend
npm install
cp .env.example .env
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

## خطوات التشغيل محلياً

### الطريقة 1: تشغيل Backend و Frontend بشكل منفصل

**1. تشغيل الـ Backend**

```bash
cd backend
php artisan serve
```

يعمل عادةً على: `http://localhost:8000`

**2. تشغيل قائمة الانتظار (Queue) — اختياري للإشعارات والمهام المؤجلة**

```bash
cd backend
php artisan queue:listen --tries=1
```

**3. تشغيل الـ Frontend**

```bash
cd frontend
npm run dev
```

يعمل عادةً على: `http://localhost:5173` أو `http://localhost:3000`

**4. ضبط رابط الـ API في الواجهة**

في `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8000/api
```

ثم أعد تشغيل `npm run dev`.

### الطريقة 2: تشغيل Backend فقط (باستخدام السكربت المدمج)

من مجلد `backend`:

```bash
composer run dev
```

هذا يشغّل الخادم، Queue، و Vite للـ Backend معاً (إذا كان مهيأ في `composer.json`).

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
