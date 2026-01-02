import { apiClient } from '../../../../lib/axios'
import type { User, UserRole } from '../../../../types/user.types'
import type { TableQueryParams, TableResponse } from '../../../../types/table.types'

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<any[]>('/admin/users')
    // Map backend field names to frontend format
    return (Array.isArray(response.data) ? response.data : []).map(user => ({
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
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

    const response = await apiClient.get<{ data: User[], pagination: any }>(
      `/admin/users?${queryParams.toString()}`
    )
    
    // Map backend field names to frontend format
    const users = (response.data || []).map((user: any) => ({
      ...user,
      studentId: user.student_id,
      empId: user.emp_id,
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
      } as User
    } catch {
      return null
    }
  },

  create: async (
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password?: string }
  ): Promise<User> => {
    const response = await apiClient.post<User>('/admin/users', {
      name: data.name,
      email: data.email,
      password: data.password || 'password',
      role: data.role,
      student_id: data.studentId,
      emp_id: (data as any).empId,
      department: data.department,
      phone: data.phone,
      status: data.status,
    })
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
    if (data.email !== undefined) updateData.email = data.email
    if (data.password !== undefined) updateData.password = data.password
    if (data.role !== undefined) updateData.role = data.role
    if (data.studentId !== undefined) updateData.student_id = data.studentId
    if ((data as any).empId !== undefined) updateData.emp_id = (data as any).empId
    if (data.department !== undefined) updateData.department = data.department
    if (data.phone !== undefined) updateData.phone = data.phone
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
