demo-gpms-app/
├── .agent/workflows/
├── backend/
│   ├── app/
│   │   ├── Console/Commands/
│   │   ├── Enums/
│   │   ├── Http/
│   │   │   ├── Controllers/ (Admin, DiscussionCommittee, ProjectsCommittee, Student, Supervisor)
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Traits/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Providers/
│   │   └── Services/
│   ├── config/
│   ├── database/ (migrations, seeders, factories)
│   ├── public/
│   ├── routes/ (api.php, web.php, console.php)
│   ├── .env.example, composer.json
│   └── artisan
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── lib/
│   │   ├── pages/ (admin, auth, committee, student, supervisor)
│   │   ├── routes/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   ├── .env.example, package.json
│   ├── index.html, main.tsx
│   └── vite.config.ts
├── docs/
│   ├── 00-overview.md
│   ├── 01-system-architecture.md
│   ├── 02-database.md
│   ├── 03-backend.md
│   ├── 04-frontend.md
│   ├── 05-running-the-project.md
│   └── 06-improvements.md
└── README.md