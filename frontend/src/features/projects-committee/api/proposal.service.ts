import { mockProposalService, mockProposals } from '../../../lib/mock/project.mock'
import type { Proposal } from '../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

function applyProposalFilters(proposals: Proposal[], filters?: Record<string, unknown>): Proposal[] {
  if (!filters || Object.keys(filters).length === 0) return proposals
  
  return proposals.filter((proposal) => {
    if (filters.status && proposal.status !== filters.status) return false
    return true
  })
}

function applyProposalSearch(proposals: Proposal[], search?: string): Proposal[] {
  if (!search) return proposals
  
  const searchLower = search.toLowerCase()
  return proposals.filter((proposal) => 
    proposal.title.toLowerCase().includes(searchLower) ||
    proposal.description?.toLowerCase().includes(searchLower) ||
    proposal.objectives?.toLowerCase().includes(searchLower)
  )
}

function applyProposalSorting(proposals: Proposal[], sortBy?: string, sortOrder?: "asc" | "desc"): Proposal[] {
  if (!sortBy) return proposals
  
  const sorted = [...proposals].sort((a, b) => {
    let aValue: string | Date = ""
    let bValue: string | Date = ""
    
    switch (sortBy) {
      case "title":
        aValue = a.title
        bValue = b.title
        break
      case "createdAt":
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
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

export const committeeProposalService = {
  getAll: async (): Promise<Proposal[]> => {
    return mockProposalService.getAll()
  },

  getPending: async (): Promise<Proposal[]> => {
    const all = await mockProposalService.getAll()
    return all.filter((p) => p.status === 'pending_review')
  },

  getTableData: async (params?: TableQueryParams, status?: string): Promise<TableResponse<Proposal>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let proposals = await mockProposalService.getAll()
    
    // Filter by status if specified
    if (status) {
      proposals = proposals.filter((p) => p.status === status)
    }
    
    // Apply search
    if (params?.search) {
      proposals = applyProposalSearch(proposals, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      proposals = applyProposalFilters(proposals, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      proposals = applyProposalSorting(proposals, params.sortBy, params.sortOrder)
    }
    
    const totalCount = proposals.length
    const page = (params?.page ?? 1) - 1
    const pageSize = params?.pageSize ?? 10
    const start = page * pageSize
    const end = start + pageSize
    
    const paginatedProposals = proposals.slice(start, end)
    const totalPages = Math.ceil(totalCount / pageSize)
    
    return {
      data: paginatedProposals,
      totalCount,
      page: page + 1,
      pageSize,
      totalPages,
    }
  },

  getById: async (id: string): Promise<Proposal | null> => {
    return mockProposalService.getById(id)
  },

  approve: async (id: string, reviewedBy: string, projectId?: string): Promise<Proposal> => {
    return mockProposalService.update(id, {
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      projectId,
    })
  },

  reject: async (id: string, reviewedBy: string, reviewNotes?: string): Promise<Proposal> => {
    return mockProposalService.update(id, {
      status: 'rejected',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
    })
  },

  requestModification: async (
    id: string,
    reviewedBy: string,
    reviewNotes: string
  ): Promise<Proposal> => {
    return mockProposalService.update(id, {
      status: 'requires_modification',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
    })
  },
}

