import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bell, CheckCircle2, Info, AlertTriangle, X, Trash2 } from 'lucide-react'
import { useNotifications, useUnreadCount, useMarkAllAsRead, useDeleteAllNotifications, useMarkAsRead, useDeleteNotification } from '@/hooks/use-notifications'
import { getNotificationTarget, getNotificationIconType, formatRelativeTime } from '@/utils/notification-navigation'
import type { NotificationDto } from '@/types/notification.types'
import { useAuthStore } from '@/pages/auth/login'
import { useDirection } from '@/hooks/use-direction'

interface NotificationsPopoverProps {
  className?: string
}

const notificationIcons = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: X,
}

const notificationColors = {
  success: 'text-green-600 dark:text-green-500',
  info: 'text-blue-600 dark:text-blue-500',
  warning: 'text-orange-600 dark:text-orange-500',
  error: 'text-red-600 dark:text-red-500',
}

const notificationBgColors = {
  success: 'bg-green-100 dark:bg-green-900/20',
  info: 'bg-blue-100 dark:bg-blue-900/20',
  warning: 'bg-orange-100 dark:bg-orange-900/20',
  error: 'bg-red-100 dark:bg-red-900/20',
}

export function NotificationsPopover({ className }: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [hoveredNotificationId, setHoveredNotificationId] = useState<string | null>(null)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isRtl = useDirection()
  const { data: notificationsData, isLoading } = useNotifications(1, 10)
  const { data: unreadCount = 0 } = useUnreadCount()
  const markAllAsRead = useMarkAllAsRead()
  const deleteAll = useDeleteAllNotifications()
  const markAsRead = useMarkAsRead()
  const deleteNotification = useDeleteNotification()

  const notifications = notificationsData?.data || []

  const handleNotificationClick = (notification: NotificationDto) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification.id)
    }
    const target = getNotificationTarget(notification, user?.role || '')
    navigate(target.path)
    setOpen(false)
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead.mutateAsync()
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleDeleteAll = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      try {
        await deleteAll.mutateAsync()
      } catch (error) {
        console.error('Failed to delete all notifications:', error)
      }
    }
  }

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    try {
      await markAsRead.mutateAsync(notificationId)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    try {
      await deleteNotification.mutateAsync(notificationId)
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('relative', className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={isRtl ? "end" : "end"}
        className="w-[400px] max-h-[600px] p-0 flex flex-col"
        dir={isRtl ? 'rtl' : 'ltr'}
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-bold text-lg">الإشعارات</h3>
          {notifications.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-full border-border hover:bg-muted text-foreground gap-2 text-xs font-medium"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
            >
              <span>تمييز الكل</span>
              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">لا توجد إشعارات</div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => {
                const iconType = getNotificationIconType(notification)
                const Icon = notificationIcons[iconType]
                const iconColor = notificationColors[iconType]
                const bgColor = notificationBgColors[iconType]
                const target = getNotificationTarget(notification, user?.role || '')

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      'group relative p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                      !notification.isRead && 'bg-muted/30'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                    onMouseEnter={() => setHoveredNotificationId(notification.id)}
                    onMouseLeave={() => setHoveredNotificationId(null)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', bgColor)}>
                        <Icon className={cn('h-5 w-5', iconColor)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className="font-bold text-sm text-foreground line-clamp-1 leading-tight mt-0.5">
                            {getNotificationTitle(notification)}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Action buttons - appear on hover */}
                            <div
                              className={cn(
                                'flex items-center gap-1 transition-opacity',
                                hoveredNotificationId === notification.id ? 'opacity-100' : 'opacity-0'
                              )}
                            >
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => handleMarkAsRead(e, notification.id)}
                                  className="flex h-6 w-6 items-center justify-center rounded-md border border-input bg-background hover:bg-accent text-muted-foreground hover:text-green-600 transition-colors"
                                  title="تمييز كمقروء"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleDelete(e, notification.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-md border border-input bg-background hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                title="حذف"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
                          {notification.message}
                        </p>
                        {target.label && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(notification)
                            }}
                            className="text-sm font-medium text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            {target.label}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteAll}
              disabled={deleteAll.isPending}
            >
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">حذف جميع الإشعارات</span>
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

function getNotificationTitle(notification: NotificationDto): string {
  const { type, message } = notification

  // Extract a title from common notification types
  if (type === 'proposal_approved') {
    return 'تم قبول مقترح المشروع'
  }
  if (type === 'proposal_rejected') {
    return 'تم رفض المقترح'
  }
  if (type === 'request_approved') {
    return 'تم قبول الطلب'
  }
  if (type === 'request_rejected') {
    return 'تم رفض الطلب'
  }
  if (type?.startsWith('deadline_')) {
    return 'موعد تسليم قريب'
  }
  if (type === 'registration_approved') {
    return 'تم قبول التسجيل'
  }
  if (type === 'registration_rejected') {
    return 'تم رفض التسجيل'
  }
  if (type === 'grade_approved') {
    return 'تم اعتماد الدرجة'
  }
  if (type === 'announcement_created') {
    return 'تم إعلان مشاريع جديدة متاحة'
  }

  // Fallback: extract first sentence from message
  const firstSentence = message.split('\n')[0]
  return firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence
}
