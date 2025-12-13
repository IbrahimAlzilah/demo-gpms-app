import { mockProposalService } from '../../../lib/mock/project.mock'
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
    proposal.description?.toLowerCase().includes(searchLower)
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

export const proposalService = {
  getAll: async (): Promise<Proposal[]> => {
    return mockProposalService.getAll()
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<Proposal>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let proposals = await mockProposalService.getAll()
    
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

  create: async (
    data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Proposal> => {
    return mockProposalService.create({
      ...data,
      status: 'pending_review',
    })
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    return mockProposalService.update(id, data)
  },
}

