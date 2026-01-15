export interface NotificationDto {
  id: string
  message: string
  isRead: boolean
  type: string | null
  relatedEntityType: string | null
  relatedEntityId: string | null
  readAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UnreadCountDto {
  count: number
}

export interface NotificationListResponse {
  data: NotificationDto[]
  pagination: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export type NotificationIconType = 'success' | 'info' | 'warning' | 'error'

export interface NotificationIconConfig {
  type: NotificationIconType
  icon: string
  color: string
}
