import { apiClient } from '../../../../lib/axios'
import type { User } from '../../../../types/user.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<any[]>('/admin/users')
    // Map backend field names to frontend format
    return (Array.isArray(response.data) ? response.data : []).map((user: any) => ({
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
      username: user.username,
    })) as User[]
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<User>> => {
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

    const response = await apiClient.get<User[]>(
      `/admin/users?${queryParams.toString()}`
    )
    
    // Map backend field names to frontend format
    const users = (Array.isArray(response.data) ? response.data : []).map((user: any) => ({
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
      username: user.username,
    })) as User[]

    return {
      data: users,
      totalCount: response.pagination?.total || 0,
      page: response.pagination?.page || 1,
      pageSize: response.pagination?.pageSize || 10,
      totalPages: response.pagination?.totalPages || 0,
    }
  },

  getById: async (id: string): Promise<User | null> => {
    try {
      const response = await apiClient.get<any>(`/admin/users/${id}`)
      const user = response.data
      return {
        ...user,
        studentId: user.student_id,
        empId: user.emp_id,
        username: user.username,
      } as User
    } catch {
      return null
    }
  },

  create: async (
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }
  ): Promise<User> => {
    const payload: any = {
      name: data.name,
      password: data.password || 'password',
      role: data.role,
      department: data.department,
      status: data.status,
    }
    // Include student_id or emp_id based on role
    if (data.studentId) {
      payload.student_id = data.studentId
    }
    if ((data as any).empId) {
      payload.emp_id = (data as any).empId
    }
    // Only include email if provided
    if (data.email) {
      payload.email = data.email
    }
    
    const response = await apiClient.post<User>('/admin/users', payload)
    // Map backend response to frontend format
    const user = response.data as any
    return {
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
    } as User
  },

  update: async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    // Only include email if provided (can be empty string to clear it)
    if (data.email !== undefined) {
      updateData.email = data.email || null
    }
    if (data.password !== undefined) updateData.password = data.password
    if (data.role !== undefined) updateData.role = data.role
    if (data.studentId !== undefined) {
      updateData.student_id = data.studentId || null
    }
    if ((data as any).empId !== undefined) {
      updateData.emp_id = (data as any).empId || null
    }
    if (data.department !== undefined) updateData.department = data.department
    if (data.status !== undefined) updateData.status = data.status

    const response = await apiClient.put<User>(`/admin/users/${id}`, updateData)
    // Map backend response to frontend format
    const user = response.data as any
    return {
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
    } as User
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`)
  },
}
