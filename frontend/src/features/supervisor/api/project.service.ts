import { mockProjectService } from '../../../lib/mock/project.mock'
import type { Project } from '../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

function applySupervisorProjectFilters(projects: Project[], filters?: Record<string, unknown>): Project[] {
  if (!filters || Object.keys(filters).length === 0) return projects
  
  return projects.filter((project) => {
    if (filters.status && project.status !== filters.status) return false
    return true
  })
}

function applySupervisorProjectSearch(projects: Project[], search?: string): Project[] {
  if (!search) return projects
  
  const searchLower = search.toLowerCase()
  return projects.filter((project) => 
    project.title.toLowerCase().includes(searchLower) ||
    project.description?.toLowerCase().includes(searchLower)
  )
}

function applySupervisorProjectSorting(projects: Project[], sortBy?: string, sortOrder?: "asc" | "desc"): Project[] {
  if (!sortBy) return projects
  
  const sorted = [...projects].sort((a, b) => {
    let aValue: string | number | Date = ""
    let bValue: string | number | Date = ""
    
    switch (sortBy) {
      case "title":
        aValue = a.title
        bValue = b.title
        break
      case "createdAt":
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case "currentStudents":
        aValue = a.currentStudents
        bValue = b.currentStudents
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

export const supervisorProjectService = {
  getAssignedProjects: async (supervisorId: string): Promise<Project[]> => {
    const allProjects = await mockProjectService.getAll()
    return allProjects.filter((p) => p.supervisorId === supervisorId)
  },

  getTableData: async (params?: TableQueryParams, supervisorId?: string): Promise<TableResponse<Project>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let projects = supervisorId
      ? await mockProjectService.getAll().then(all => all.filter((p) => p.supervisorId === supervisorId))
      : []
    
    // Apply search
    if (params?.search) {
      projects = applySupervisorProjectSearch(projects, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      projects = applySupervisorProjectFilters(projects, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      projects = applySupervisorProjectSorting(projects, params.sortBy, params.sortOrder)
    }
    
    const totalCount = projects.length
    const page = (params?.page ?? 1) - 1
    const pageSize = params?.pageSize ?? 10
    const start = page * pageSize
    const end = start + pageSize
    
    const paginatedProjects = projects.slice(start, end)
    const totalPages = Math.ceil(totalCount / pageSize)
    
    return {
      data: paginatedProjects,
      totalCount,
      page: page + 1,
      pageSize,
      totalPages,
    }
  },

  getById: async (id: string): Promise<Project | null> => {
    return mockProjectService.getById(id)
  },
}

