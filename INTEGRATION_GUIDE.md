# Quick Integration Guide - Registration Status Page

## Adding to Student Navigation

To integrate the new Registration Status page into your application, follow these steps:

### 1. Add Route

Add the route to your student routes configuration:

**File**: `frontend/src/routes/student.routes.tsx` (or similar)

```tsx
import { RegistrationStatusPage } from '@/pages/student/projects/status'

// Add to your routes array:
{
  path: 'projects/registration-status',
  element: <RegistrationStatusPage />,
}
```

### 2. Add Navigation Link

Add a link to the student navigation menu:

**Option A: In Projects Dropdown**
```tsx
{
  label: t('registration.status'),
  href: '/student/projects/registration-status',
  icon: <FileText className="h-4 w-4" />,
}
```

**Option B: As Main Nav Item**
```tsx
{
  label: t('registration.status'),
  href: '/student/projects/registration-status',
  icon: <ClipboardCheck className="h-4 w-4" />,
}
```

### 3. Add Dashboard Widget (Optional)

Add a widget to the student dashboard showing registration status:

```tsx
import { useGroupRegistrationRequest } from '@/pages/student/projects/hooks/useGroupRegistrationRequest'

function RegistrationStatusWidget() {
  const { data: request } = useGroupRegistrationRequest()
  
  if (!request) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('registration.status')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <StatusBadge status={request.status} />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/student/projects/registration-status')}
          >
            {t('common.viewDetails')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4. Add Notification Navigation

Update notification navigation to link to registration status:

**File**: `frontend/src/utils/notification-navigation.ts`

```tsx
case 'registration_approved':
case 'registration_rejected':
  return '/student/projects/registration-status'
```

### 5. Update Project List

Add a link from the project list to registration status:

```tsx
// In ProjectsList or ProjectBrowser component
{hasRegistrationRequest && (
  <Button 
    variant="outline"
    onClick={() => navigate('/student/projects/registration-status')}
  >
    <ClipboardCheck className="h-4 w-4 mr-2" />
    {t('registration.viewStatus')}
  </Button>
)}
```

## Complete Example

Here's a complete example of integrating the page:

### routes/student.routes.tsx
```tsx
import { RegistrationStatusPage } from '@/pages/student/projects/status'

export const studentRoutes = [
  // ... other routes
  {
    path: 'projects',
    children: [
      {
        index: true,
        element: <ProjectsList />,
      },
      {
        path: 'registration-status',
        element: <RegistrationStatusPage />,
      },
      // ... other project routes
    ],
  },
]
```

### components/StudentNavigation.tsx
```tsx
const projectsMenuItems = [
  {
    label: t('nav.projects'),
    href: '/student/projects',
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    label: t('registration.status'),
    href: '/student/projects/registration-status',
    icon: <ClipboardCheck className="h-4 w-4" />,
  },
  // ... other items
]
```

### pages/student/StudentDashboardPage.tsx
```tsx
import { useGroupRegistrationRequest } from '@/pages/student/projects/hooks/useGroupRegistrationRequest'

function StudentDashboard() {
  const { data: registrationRequest } = useGroupRegistrationRequest()
  
  return (
    <div className="space-y-6">
      {/* Other dashboard widgets */}
      
      {registrationRequest && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {t('registration.status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('registration.currentStatus')}
                </span>
                <StatusBadge status={registrationRequest.status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t('registration.projects')}
                </span>
                <span className="text-sm font-medium">
                  {registrationRequest.projectRegistrations?.length || 0}
                </span>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => navigate('/student/projects/registration-status')}
              >
                {t('registration.viewDetails')}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

## Translation Keys Needed

Make sure these translation keys are available:

```json
{
  "registration": {
    "status": "Registration Status",
    "viewStatus": "View Registration Status",
    "currentStatus": "Current Status",
    "viewDetails": "View Details"
  }
}
```

## Testing Checklist

After integration, test:
- [ ] Navigation link appears in student menu
- [ ] Route is accessible at `/student/projects/registration-status`
- [ ] Page loads correctly with no registration
- [ ] Page displays registration request correctly
- [ ] Status badges show correct colors
- [ ] Action buttons work (cancel, navigate)
- [ ] Dashboard widget displays (if added)
- [ ] Notifications link to the page (if configured)
- [ ] Mobile responsive design works
- [ ] RTL layout works (for Arabic)

## Troubleshooting

### Page Not Found
- Check route is registered in router configuration
- Verify import path is correct
- Ensure component is exported from index.ts

### Data Not Loading
- Check API endpoint is accessible
- Verify authentication token is valid
- Check network tab for errors
- Ensure backend route is registered

### Styling Issues
- Verify all UI components are imported correctly
- Check Tailwind classes are available
- Ensure theme provider is configured

## Next Steps

1. Add the route to your router configuration
2. Add navigation link to student menu
3. Test the page thoroughly
4. Consider adding dashboard widget
5. Update notification navigation
6. Deploy and monitor

For more details, see:
- `REGISTRATION_WORKFLOW.md` - Complete workflow documentation
- `IMPLEMENTATION_SUMMARY.md` - Summary of all changes
- Component source code with inline comments
