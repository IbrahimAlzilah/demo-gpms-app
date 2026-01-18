import type { AxiosResponse } from 'axios'

declare module 'axios' {
  export interface AxiosResponse<T = any> {
    pagination?: {
      total?: number
      page?: number
      pageSize?: number
      totalPages?: number
      current_page?: number
      per_page?: number
      last_page?: number
    }
    message?: string
  }
}
