import { apiClient } from '../../../../../lib/axios'
import type { Grade } from '@/types/evaluation.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'

export interface GradeListParams {
  is_approved?: boolean
  project_id?: string
  page?: number
  pageSize?: number
  search?: string
}

export interface ApproveGradeParams {
  comments?: string
}

export const committeeGradeService = {
  getAll: async (params?: GradeListParams): Promise<{
    data: Grade[]
    pagination?: {
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
  }> => {
    const queryParams = new URLSearchParams()
    if (params?.is_approved !== undefined) queryParams.append('is_approved', String(params.is_approved))
    if (params?.project_id) queryParams.append('project_id', params.project_id)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.search) queryParams.append('search', params.search)

    const response = await apiClient.get<{
      data: Grade[]
      pagination?: {
        page: number
        pageSize: number
        total: number
        totalPages: number
      }
    }>(`/projects-committee/grades?${queryParams.toString()}`)
    return response.data
  },

  getTableData: async (params?: TableQueryParams, isApproved?: boolean): Promise<TableResponse<Grade>> => {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    if (isApproved !== undefined) queryParams.append('is_approved', String(isApproved))
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(`filters[${key}]`, String(value))
        }
      })
    }

    const response = await apiClient.get<{ data: Grade[], pagination: any }>(
      `/projects-committee/grades?${queryParams.toString()}`
    )
    
    return {
      data: response.data || [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<Grade> => {
    const response = await apiClient.get<Grade>(`/projects-committee/grades/${id}`)
    return response.data
  },

  approve: async (gradeId: string, params?: ApproveGradeParams): Promise<Grade> => {
    const response = await apiClient.post<Grade>(
      `/projects-committee/grades/${gradeId}/approve`,
      params
    )
    return response.data
  },
}
