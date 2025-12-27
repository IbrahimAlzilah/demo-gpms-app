import { mockRequestService } from '../../../lib/mock/request.mock'
import type { Request } from '../../../types/request.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

function applyRequestFilters(requests: Request[], filters?: Record<string, unknown>): Request[] {
  if (!filters || Object.keys(filters).length === 0) return requests
  
  return requests.filter((request) => {
    if (filters.status && request.status !== filters.status) return false
    if (filters.type && request.type !== filters.type) return false
    return true
  })
}

function applyRequestSearch(requests: Request[], search?: string): Request[] {
  if (!search) return requests
  
  const searchLower = search.toLowerCase()
  return requests.filter((request) => 
    request.reason?.toLowerCase().includes(searchLower) ||
    request.type.toLowerCase().includes(searchLower)
  )
}

function applyRequestSorting(requests: Request[], sortBy?: string, sortOrder?: "asc" | "desc"): Request[] {
  if (!sortBy) return requests
  
  const sorted = [...requests].sort((a, b) => {
    let aValue: string | number | Date = ""
    let bValue: string | number | Date = ""
    
    switch (sortBy) {
      case "createdAt":
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case "type":
        aValue = a.type
        bValue = b.type
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

export const requestService = {
  getAll: async (studentId?: string): Promise<Request[]> => {
    return mockRequestService.getAll(studentId)
  },

  getTableData: async (params?: TableQueryParams, studentId?: string): Promise<TableResponse<Request>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let requests = await mockRequestService.getAll(studentId)
    
    // Apply search
    if (params?.search) {
      requests = applyRequestSearch(requests, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      requests = applyRequestFilters(requests, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      requests = applyRequestSorting(requests, params.sortBy, params.sortOrder)
    }
    
    const totalCount = requests.length
    const page = (params?.page ?? 1) - 1
    const pageSize = params?.pageSize ?? 10
    const start = page * pageSize
    const end = start + pageSize
    
    const paginatedRequests = requests.slice(start, end)
    const totalPages = Math.ceil(totalCount / pageSize)
    
    return {
      data: paginatedRequests,
      totalCount,
      page: page + 1,
      pageSize,
      totalPages,
    }
  },

  getById: async (id: string): Promise<Request | null> => {
    return mockRequestService.getById(id)
  },

  create: async (
    data: Omit<Request, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Request> => {
    return mockRequestService.create({
      ...data,
      status: 'pending',
    })
  },

  cancel: async (id: string): Promise<Request> => {
    return mockRequestService.update(id, { status: 'cancelled' })
  },
}

