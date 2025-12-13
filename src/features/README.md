# Features Directory

Feature modules following a feature-based architecture. Each feature is self-contained with its own components, hooks, store, types, and API services.

## Structure

Each feature folder contains:
- **components/**: Feature-specific React components
- **hooks/**: Feature-specific custom hooks (useName.ts pattern)
- **store/**: Feature-specific Zustand stores (name.store.ts pattern)
- **types/**: Feature-specific TypeScript types (name.types.ts pattern)
- **api/**: Feature-specific API service files (name.service.ts pattern)

## Example

```
auth/
├── components/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
├── hooks/
│   └── useAuth.ts
├── store/
│   └── auth.store.ts
├── types/
│   └── auth.types.ts
└── api/
    └── auth.service.ts
```

