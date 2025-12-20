import { mockRequestService } from "../../../lib/mock/request.mock";
import type { Request } from "../../../types/request.types";
import type { TableQueryParams, TableResponse } from "../../../types/table.types";

function applySupervisionRequestFilters(requests: Request[], filters?: Record<string, unknown>): Request[] {
  if (!filters || Object.keys(filters).length === 0) return requests
  
  return requests.filter((request) => {
    if (filters.status && request.status !== filters.status) return false
    if (filters.type && request.type !== filters.type) return false
    return true
  })
}

function applySupervisionRequestSearch(requests: Request[], search?: string): Request[] {
  if (!search) return requests
  
  const searchLower = search.toLowerCase()
  return requests.filter((request) => 
    request.reason?.toLowerCase().includes(searchLower) ||
    request.student?.name.toLowerCase().includes(searchLower) ||
    request.project?.title.toLowerCase().includes(searchLower)
  )
}

function applySupervisionRequestSorting(requests: Request[], sortBy?: string, sortOrder?: "asc" | "desc"): Request[] {
  if (!sortBy) return requests
  
  const sorted = [...requests].sort((a, b) => {
    let aValue: string | Date = ""
    let bValue: string | Date = ""
    
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

export const supervisionService = {
  getRequests: async (supervisorId: string): Promise<Request[]> => {
    return mockRequestService.getPendingForSupervisor(supervisorId);
  },

  getTableData: async (params?: TableQueryParams, supervisorId?: string): Promise<TableResponse<Request>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let requests = supervisorId 
      ? await mockRequestService.getPendingForSupervisor(supervisorId)
      : []
    
    // Apply search
    if (params?.search) {
      requests = applySupervisionRequestSearch(requests, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      requests = applySupervisionRequestFilters(requests, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      requests = applySupervisionRequestSorting(requests, params.sortBy, params.sortOrder)
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

  approveRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.approveBySupervisor(
      requestId,
      supervisorId,
      comments
    );
  },

  rejectRequest: async (
    requestId: string,
    supervisorId: string,
    comments?: string
  ): Promise<Request> => {
    return mockRequestService.rejectBySupervisor(
      requestId,
      supervisorId,
      comments
    );
  },
};
