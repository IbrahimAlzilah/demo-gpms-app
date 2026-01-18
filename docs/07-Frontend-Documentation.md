# توثيق الواجهة الأمامية (Frontend)

## نظرة عامة

الواجهة الأمامية (Frontend) مبنية باستخدام **React 19** و **TypeScript** مع **Vite** كأداة بناء. توفر واجهة مستخدم حديثة وسهلة الاستخدام لجميع مستخدمي النظام.

## التقنيات المستخدمة

- **React 19**: مكتبة JavaScript لبناء واجهات المستخدم
- **TypeScript**: لغة برمجة توفر أمان الأنواع
- **Vite**: أداة بناء سريعة
- **React Router DOM**: للتوجيه (Routing)
- **TailwindCSS**: إطار عمل CSS
- **Radix UI**: مكونات واجهة المستخدم
- **React Query**: لإدارة البيانات والطلبات
- **Zustand**: لإدارة الحالة
- **React Hook Form + Zod**: لإدارة النماذج والتحقق

---

## البنية الأساسية

### 1. نقطة الدخول

#### `src/main.tsx`

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### `src/App.tsx`

```typescript
import { RootRouter } from './routes'
import { ThemeProvider } from './context/theme-provider'
import { DirectionProvider } from './context/direction-provider'

function App() {
  return (
    <ThemeProvider>
      <DirectionProvider>
        <RootRouter />
      </DirectionProvider>
    </ThemeProvider>
  )
}
```

---

### 2. التوجيه (Routing)

#### الموقع: `src/routes/`

**هيكل Routing:**

```typescript
// routes/index.tsx
export function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<IndexRedirect />} />
        {publicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={<route.element />} />
        ))}
        <Route
          path="*"
          element={
            <ProtectedRouteWrapper>
              <RoleBasedRoutesWrapper />
            </ProtectedRouteWrapper>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
```

**حماية المسارات:**

```typescript
// routes/guards.tsx
export function ProtectedRouteWrapper({ children }) {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}
```

**التوجيه حسب الدور:**

```typescript
// routes/config.tsx
export const roleRouteMap = {
  student: {
    routes: studentRoutes,
    defaultPath: '/student/dashboard',
  },
  supervisor: {
    routes: supervisorRoutes,
    defaultPath: '/supervisor/dashboard',
  },
  // ...
}
```

---

### 3. الصفحات (Pages)

#### الموقع: `src/pages/`

**هيكل صفحة نموذجية:**

```
pages/student/projects/
├── ProjectsPage.tsx          # مكون الصفحة الرئيسي
├── components/               # مكونات خاصة بالصفحة
│   ├── ProjectCard.tsx
│   └── ProjectFilters.tsx
├── hooks/                    # Custom hooks
│   ├── useProjects.ts
│   └── useProjectMutations.ts
├── api/                      # استدعاءات API
│   └── projects.api.ts
├── types/                    # أنواع TypeScript
│   └── project.types.ts
├── schema/                   # مخططات التحقق (Zod)
│   └── project.schema.ts
└── index.ts                  # تصدير الصفحة
```

**مثال: صفحة المشاريع**

```typescript
// pages/student/projects/ProjectsPage.tsx
import { useProjects } from './hooks/useProjects'
import { ProjectCard } from './components/ProjectCard'

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  
  if (isLoading) return <LoadingSpinner />
  
  return (
    <div>
      <h1>المشاريع المتاحة</h1>
      {projects?.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

---

### 4. المكونات (Components)

#### الموقع: `src/components/`

**المكونات المشتركة (`components/common/`):**
- `Button` - أزرار
- `Card` - بطاقات
- `Table` - جداول
- `Form` - نماذج
- `Modal` - نوافذ منبثقة
- `LoadingSpinner` - مؤشر التحميل

**مكونات التخطيط (`components/layout/`):**
- `Header` - رأس الصفحة
- `Sidebar` - الشريط الجانبي
- `Breadcrumbs` - مسار التنقل
- `Layout` - تخطيط الصفحة

**مثال: مكون Button**

```typescript
// components/common/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-lg font-medium transition-colors',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
```

---

### 5. إدارة الحالة (State Management)

#### Zustand - للمصادقة

```typescript
// stores/auth.store.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  setUser: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },
  
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
```

#### React Query - لإدارة البيانات

```typescript
// hooks/useProjects.ts
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '../api/projects.api'

export function useProjects(filters?: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getAll(filters),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  })
}
```

---

### 6. API Service

#### الموقع: `src/services/` و `src/lib/axios.ts`

**إعداد Axios:**

```typescript
// lib/axios.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// إضافة Token للطلبات
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// معالجة الأخطاء
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // تسجيل خروج تلقائي
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**API Service:**

```typescript
// services/api.service.ts
import { apiClient } from '@/lib/axios'

export const apiService = {
  get: <T>(url: string) => apiClient.get<T>(url),
  post: <T>(url: string, data?: unknown) => apiClient.post<T>(url, data),
  put: <T>(url: string, data?: unknown) => apiClient.put<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
}
```

**مثال: API Functions**

```typescript
// pages/student/projects/api/projects.api.ts
import { apiService } from '@/services/api.service'
import type { Project } from '../types'

export const projectsApi = {
  getAll: (filters?: ProjectFilters) =>
    apiService.get<{ data: Project[] }>('/student/projects', { params: filters }),
  
  getById: (id: string) =>
    apiService.get<{ data: Project }>(`/student/projects/${id}`),
  
  register: (id: string) =>
    apiService.post<{ data: ProjectRegistration }>(`/student/projects/${id}/register`),
}
```

---

### 7. النماذج (Forms)

#### React Hook Form + Zod

```typescript
// schema/project.schema.ts
import { z } from 'zod'

export const projectRegistrationSchema = z.object({
  projectId: z.string().min(1, 'يرجى اختيار مشروع'),
  motivation: z.string().min(10, 'يجب أن يكون النص 10 أحرف على الأقل'),
})

// في المكون
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export function ProjectRegistrationForm() {
  const form = useForm({
    resolver: zodResolver(projectRegistrationSchema),
    defaultValues: {
      projectId: '',
      motivation: '',
    },
  })
  
  const onSubmit = async (data) => {
    await projectsApi.register(data.projectId, data.motivation)
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* حقول النموذج */}
    </form>
  )
}
```

---

### 8. الأنواع (Types)

#### الموقع: `src/types/`

```typescript
// types/project.types.ts
import type { BaseEntity } from './common.types'

export type ProjectStatus =
  | 'draft'
  | 'announced'
  | 'available_for_registration'
  | 'in_progress'
  | 'completed'

export interface Project extends BaseEntity {
  title: string
  description: string
  status: ProjectStatus
  supervisorId?: string
  supervisor?: User
  students?: User[]
  maxStudents: number
  currentStudents: number
}
```

---

### 9. الترجمة (i18n)

#### الموقع: `src/lib/i18n/`

```typescript
// lib/i18n/index.ts
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar/ar.json'
import en from './locales/en/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'ar',
    fallbackLng: 'ar',
  })

// الاستخدام
import { useTranslation } from 'react-i18next'

function Component() {
  const { t } = useTranslation()
  return <h1>{t('common.welcome')}</h1>
}
```

---

### 10. التصميم (Styling)

#### TailwindCSS

```typescript
// استخدام TailwindCSS
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">العنوان</h2>
  <Button variant="primary">إجراء</Button>
</div>
```

#### Radix UI Components

```typescript
import * as Dialog from '@radix-ui/react-dialog'

<Dialog.Root>
  <Dialog.Trigger>فتح</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      {/* المحتوى */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## الأوامر المفيدة

```bash
# تشغيل خادم التطوير
npm run dev

# بناء للإنتاج
npm run build

# معاينة الإنتاج
npm run preview

# فحص الأخطاء
npm run lint

# إصلاح الأخطاء تلقائياً
npm run lint -- --fix
```

---

## أفضل الممارسات

### 1. تقسيم الكود

- استخدم Feature-based organization
- اجمع الملفات المتعلقة معاً
- استخدم `index.ts` للتصدير

### 2. إعادة الاستخدام

- أنشئ مكونات قابلة لإعادة الاستخدام
- استخدم Custom Hooks للمنطق المشترك
- استخدم Utilities للدوال المساعدة

### 3. الأداء

- استخدم Lazy Loading للصفحات
- استخدم React.memo للمكونات الثقيلة
- استخدم useMemo و useCallback عند الحاجة

### 4. TypeScript

- حدد أنواعاً واضحة للبيانات
- استخدم Interfaces للكائنات
- تجنب استخدام `any`

### 5. إدارة الأخطاء

```typescript
// Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // تسجيل الخطأ
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

---

## الخلاصة

الواجهة الأمامية توفر:
- **تجربة مستخدم ممتازة** مع واجهة حديثة
- **كود منظم** مع TypeScript
- **أداء عالي** مع Vite و React Query
- **قابلية الصيانة** مع بنية واضحة

---

**التالي**: [التحسينات والتوصيات](./08-Improvements-Recommendations.md)
