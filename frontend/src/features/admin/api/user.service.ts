import { v4 as uuidv4 } from 'uuid'
import { mockUsers } from '../../../lib/mock/auth.mock'
import type { User, UserRole } from '../../../types/user.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

// Clone mock users for admin operations
const adminUsers: User[] = [...mockUsers]

function applyFilters(users: User[], filters?: Record<string, unknown>): User[] {
  if (!filters || Object.keys(filters).length === 0) return users
  
  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false
    if (filters.status && user.status !== filters.status) return false
    return true
  })
}

function applySearch(users: User[], search?: string): User[] {
  if (!search) return users
  
  const searchLower = search.toLowerCase()
  return users.filter((user) => 
    user.name.toLowerCase().includes(searchLower) ||
    user.email.toLowerCase().includes(searchLower)
  )
}

function applySorting(users: User[], sortBy?: string, sortOrder?: "asc" | "desc"): User[] {
  if (!sortBy) return users
  
  const sorted = [...users].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""
    
    switch (sortBy) {
      case "name":
        aValue = a.name
        bValue = b.name
        break
      case "email":
        aValue = a.email
        bValue = b.email
        break
      case "role":
        aValue = a.role
        bValue = b.role
        break
      default:
        return 0
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
    return 0
  })
  
  return sorted
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...adminUsers]
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<User>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let filteredUsers = [...adminUsers]
    
    // Apply search
    if (params?.search) {
      filteredUsers = applySearch(filteredUsers, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      filteredUsers = applyFilters(filteredUsers, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      filteredUsers = applySorting(filteredUsers, params.sortBy, params.sortOrder)
    }
    
    const totalCount = filteredUsers.length
    const page = (params?.page ?? 1) - 1 // Convert 1-based to 0-based
    const pageSize = params?.pageSize ?? 10
    const start = page * pageSize
    const end = start + pageSize
    
    const paginatedUsers = filteredUsers.slice(start, end)
    const totalPages = Math.ceil(totalCount / pageSize)
    
    return {
      data: paginatedUsers,
      totalCount,
      page: page + 1, // Return 1-based for API
      pageSize,
      totalPages,
    }
  },

  getById: async (id: string): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return adminUsers.find((u) => u.id === id) || null
  },

  create: async (
    data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const user: User = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    adminUsers.push(user)
    return user
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = adminUsers.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('User not found')
    adminUsers[index] = {
      ...adminUsers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return adminUsers[index]
  },

  delete: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = adminUsers.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('User not found')
    adminUsers.splice(index, 1)
  },
}

