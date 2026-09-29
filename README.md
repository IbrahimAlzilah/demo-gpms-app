# 🎓 GPMS — Graduate Project Management System

A full-stack web system for managing the complete lifecycle of university graduation projects — from proposal submission and approval, through registration and evaluation, to final grade publication.

## 🎯 Problem It Solves

Graduation project management in universities is often handled manually via Excel, email, and paper — leading to scattered information, unclear project status, and no transparency across roles. GPMS unifies this into a single platform.

## ✨ Key Features

- 👥 **Role-based access:** Student, Supervisor, Projects Committee, Discussion Committee, Admin
- 📝 **Proposal submission & review** within defined time windows
- 👨‍👩‍👧 **Student groups** with invitations and join requests
- ✅ **Approval workflows** for proposals, registrations, and requests
- 🧑‍⚖️ **Committee distribution** for final discussion evaluation
- 📊 **Grading system** with supervisor evaluation and committee final grades
- 📁 **Document management** (chapters, final report, presentation) with upload windows
- 📈 **Reports & analytics** with PDF/Excel export
- 🔔 **Real-time notifications** for key events

## 🛠️ Tech Stack

**Frontend**
- React 19, TypeScript, Vite
- Zustand (state management)
- React Query, React Hook Form + Zod
- Tailwind CSS, Radix UI
- i18next (multi-language support)

**Backend**
- Laravel 12 (PHP 8.2)
- Laravel Sanctum (authentication)
- Pest (testing)

## 📁 Project Structure

```
frontend/    → React + Vite SPA
backend/     → Laravel REST API
docs/        → Architecture, database, API & role documentation
```

## 🚀 Getting Started

**Backend:**
```bash
cd backend
composer install
composer run setup
composer run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 📚 Documentation

Full project documentation is available in [`/docs`](./docs), including:
- System architecture
- Database schema
- API reference
- User roles & permissions
