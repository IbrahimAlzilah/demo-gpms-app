import { ROUTES } from '@/lib/constants'
import type { NotificationDto } from '@/types/notification.types'

export interface NotificationNavigationResult {
  path: string
  label: string
}

/**
 * Determine navigation target based on notification type and related entity
 */
export function getNotificationTarget(
  notification: NotificationDto,
  userRole: string
): NotificationNavigationResult {
  const { type, relatedEntityType, relatedEntityId } = notification

  // Handle deadline notifications
  if (type?.startsWith('deadline_')) {
    // For deadline reminders, navigate to relevant section based on period type
    if (type.includes('proposal_submission')) {
      return {
        path: ROUTES.STUDENT.PROPOSALS,
        label: 'عرض المقترحات',
      }
    }
    if (type.includes('project_registration')) {
      return {
        path: ROUTES.STUDENT.PROJECTS,
        label: 'عرض المشاريع',
      }
    }
    if (type.includes('document_submission')) {
      return {
        path: ROUTES.STUDENT.DOCUMENTS,
        label: 'عرض الوثائق',
      }
    }
  }

  // Handle proposal-related notifications
  if (type === 'proposal_approved' || type === 'proposal_rejected' || type === 'proposal_modification_required') {
    if (relatedEntityType === 'proposal' && relatedEntityId) {
      // Navigate to proposal detail if route exists, otherwise list
      return {
        path: ROUTES.STUDENT.MY_PROPOSALS,
        label: 'عرض المقترح',
      }
    }
    return {
      path: ROUTES.STUDENT.MY_PROPOSALS,
      label: 'عرض المقترحات',
    }
  }

  // Handle request-related notifications
  if (type === 'request_approved' || type === 'request_rejected' || type === 'request_submitted') {
    if (relatedEntityType === 'request' && relatedEntityId) {
      return {
        path: ROUTES.STUDENT.REQUESTS,
        label: 'عرض الطلب',
      }
    }
    return {
      path: ROUTES.STUDENT.REQUESTS,
      label: 'عرض الطلبات',
    }
  }

  // Handle project/registration notifications
  if (type === 'registration_approved' || type === 'registration_rejected' || type === 'registration_submitted') {
    return {
      path: ROUTES.STUDENT.PROJECTS,
      label: 'عرض المشروع',
    }
  }

  if (type === 'projects_announced' || type === 'projects_unannounced') {
    return {
      path: ROUTES.STUDENT.PROJECTS,
      label: 'عرض المشاريع',
    }
  }

  // Handle grade notifications
  if (type === 'grade_approved') {
    return {
      path: ROUTES.STUDENT.GRADES,
      label: 'عرض الدرجات',
    }
  }

  // Default: navigate to dashboard
  const dashboardRoute = getDashboardRoute(userRole)
  return {
    path: dashboardRoute,
    label: 'عرض التفاصيل',
  }
}

function getDashboardRoute(role: string): string {
  switch (role) {
    case 'student':
      return ROUTES.STUDENT.DASHBOARD
    case 'supervisor':
      return ROUTES.SUPERVISOR.DASHBOARD
    case 'projects_committee':
      return ROUTES.PROJECTS_COMMITTEE.DASHBOARD
    case 'discussion_committee':
      return ROUTES.DISCUSSION_COMMITTEE.DASHBOARD
    case 'admin':
      return ROUTES.ADMIN.DASHBOARD
    default:
      return ROUTES.LOGIN
  }
}

/**
 * Get notification icon type based on notification type
 */
export function getNotificationIconType(notification: NotificationDto): 'success' | 'info' | 'warning' | 'error' {
  const { type } = notification

  if (!type) return 'info'

  // Success types
  if (
    type.includes('approved') ||
    type === 'proposal_approved' ||
    type === 'request_approved' ||
    type === 'registration_approved' ||
    type === 'grade_approved'
  ) {
    return 'success'
  }

  // Error/rejection types
  if (
    type.includes('rejected') ||
    type === 'proposal_rejected' ||
    type === 'request_rejected' ||
    type === 'registration_rejected'
  ) {
    return 'error'
  }

  // Warning types (deadlines, modifications)
  if (type.includes('deadline') || type.includes('modification') || type.includes('requires')) {
    return 'warning'
  }

  // Default: info
  return 'info'
}

/**
 * Format relative time in Arabic
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat('ar', { numeric: 'auto' })

  if (diffInSeconds < 60) {
    return 'منذ لحظات'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute')
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour')
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day')
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  return rtf.format(-diffInMonths, 'month')
}
