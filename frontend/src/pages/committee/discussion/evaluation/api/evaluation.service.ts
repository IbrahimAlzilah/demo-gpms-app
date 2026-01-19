import { apiClient } from '../../../../../lib/axios'
import type { Grade } from '@/types/evaluation.types'
import type { TableQueryParams, TableResponse } from '../../../../../types/table.types'
import type { EvaluationListItem } from '../list/EvaluationList.types'

export const committeeEvaluationService = {
  submitFinalGrade: async (data: {
    projectId: string
    studentId: string
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, unknown>
      comments?: string
    }
  }): Promise<void> => {
    // Send snake_case format matching backend expectations
    // Backend will derive committee members from DB assignments
    await apiClient.post('/discussion-committee/evaluations', {
      project_id: data.projectId,
      student_id: data.studentId,
      score: data.grade.score,
      max_score: data.grade.maxScore,
      criteria: data.grade.criteria,
      comments: data.grade.comments,
    })
  },

  getEvaluationsByProject: async (projectId: string): Promise<Grade[]> => {
    const response = await apiClient.get<Grade[]>(
      `/discussion-committee/evaluations?project_id=${projectId}`
    )
    return Array.isArray(response.data) ? response.data : []
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<EvaluationListItem>> => {
    const queryParams = new URLSearchParams()
    
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString())
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)
    if (params?.search) queryParams.append('search', params.search)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(`filters[${key}]`, String(value))
        }
      })
    }

    const response = await apiClient.get<EvaluationListItem[]>(
      `/discussion-committee/evaluations?${queryParams.toString()}`
    )
    
    return {
      data: Array.isArray(response.data) ? response.data : [],
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },
}
