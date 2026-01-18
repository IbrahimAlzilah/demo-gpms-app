import { apiService } from './api.service'
import type { NotificationDto, UnreadCountDto, NotificationListResponse } from '@/types/notification.types'

export const notificationsService = {
  /**
   * Get all notifications for the authenticated user
   */
  getNotifications: async (page = 1, perPage = 15): Promise<NotificationListResponse> => {
    const response = await apiService.get<any>(
      `/notifications?page=${page}&per_page=${perPage}`
    )
    // Axios interceptor extracts data and pagination to response.data and response.pagination
    const pagination = response.pagination
    return {
      data: response.data || [],
      pagination: {
        page: pagination?.page || pagination?.current_page || 1,
        per_page: pagination?.per_page || pagination?.pageSize || perPage,
        total: pagination?.total || 0,
        total_pages: pagination?.totalPages || pagination?.last_page || Math.ceil((pagination?.total || 0) / (pagination?.per_page || pagination?.pageSize || perPage)),
      },
    }
  },

  /**
   * Get unread notifications count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await apiService.get<UnreadCountDto>('/notifications/unread-count')
    // Axios interceptor extracts data, so response.data is { count: number }
    return response.data.count || 0
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: string): Promise<NotificationDto> => {
    const response = await apiService.post<{ data: NotificationDto }>(`/notifications/${id}/read`)
    return response.data.data
  },

  /**
   * Mark all notifications as read
   */
  markAllAsRead: async (): Promise<number> => {
    const response = await apiService.post<{ data: { count: number } }>('/notifications/read-all')
    return response.data.data.count
  },

  /**
   * Delete all notifications
   */
  deleteAll: async (): Promise<number> => {
    const response = await apiService.delete<{ data: { count: number } }>('/notifications')
    return response.data.data.count
  },

  /**
   * Delete a single notification
   */
  delete: async (id: string): Promise<void> => {
    await apiService.delete(`/notifications/${id}`)
  },
}
