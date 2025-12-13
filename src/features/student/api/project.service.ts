import { mockProjectService } from '../../../lib/mock/project.mock'
import type {
  Project,
  ProjectRegistration,
  SupervisorNote,
  ProjectMilestone,
  ProjectMeeting,
} from '../../../types/project.types'
import type { TableQueryParams, TableResponse } from '../../../types/table.types'

function applyProjectFilters(projects: Project[], filters?: Record<string, unknown>): Project[] {
  if (!filters || Object.keys(filters).length === 0) return projects
  
  return projects.filter((project) => {
    if (filters.status && project.status !== filters.status) return false
    return true
  })
}

function applyProjectSearch(projects: Project[], search?: string): Project[] {
  if (!search) return projects
  
  const searchLower = search.toLowerCase()
  return projects.filter((project) => 
    project.title.toLowerCase().includes(searchLower) ||
    project.description?.toLowerCase().includes(searchLower)
  )
}

function applyProjectSorting(projects: Project[], sortBy?: string, sortOrder?: "asc" | "desc"): Project[] {
  if (!sortBy) return projects
  
  const sorted = [...projects].sort((a, b) => {
    let aValue: string | number = ""
    let bValue: string | number = ""
    
    switch (sortBy) {
      case "title":
        aValue = a.title
        bValue = b.title
        break
      case "currentStudents":
        aValue = a.currentStudents
        bValue = b.currentStudents
        break
      case "maxStudents":
        aValue = a.maxStudents
        bValue = b.maxStudents
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

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    return mockProjectService.getAll()
  },

  getTableData: async (params?: TableQueryParams): Promise<TableResponse<Project>> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    
    let projects = await mockProjectService.getAll()
    
    // Apply search
    if (params?.search) {
      projects = applyProjectSearch(projects, params.search)
    }
    
    // Apply filters
    if (params?.filters) {
      projects = applyProjectFilters(projects, params.filters)
    }
    
    // Apply sorting
    if (params?.sortBy) {
      projects = applyProjectSorting(projects, params.sortBy, params.sortOrder)
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

  getAvailable: async (): Promise<Project[]> => {
    return mockProjectService.getAvailable()
  },

  getStudentRegistrations: async (studentId: string): Promise<ProjectRegistration[]> => {
    return mockProjectService.getStudentRegistrations(studentId)
  },

  getRegistrationByProject: async (
    projectId: string,
    studentId: string
  ): Promise<ProjectRegistration | null> => {
    return mockProjectService.getRegistrationByProject(projectId, studentId)
  },

  register: async (projectId: string, studentId: string): Promise<ProjectRegistration> => {
    return mockProjectService.register(projectId, studentId)
  },

  cancelRegistration: async (registrationId: string, studentId: string): Promise<void> => {
    return mockProjectService.cancelRegistration(registrationId, studentId)
  },

  getSupervisorNotes: async (projectId: string): Promise<SupervisorNote[]> => {
    return mockProjectService.getSupervisorNotes(projectId)
  },

  addSupervisorNote: async (projectId: string, content: string): Promise<SupervisorNote> => {
    // This would call the API to add a supervisor note
    // For now, we'll use the mock service if it exists
    if (mockProjectService.addSupervisorNote) {
      return mockProjectService.addSupervisorNote(projectId, content)
    }
    // Fallback: create a simple note object
    return {
      id: `note-${Date.now()}`,
      projectId,
      supervisorId: '',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  getMilestones: async (projectId: string): Promise<ProjectMilestone[]> => {
    return mockProjectService.getMilestones(projectId)
  },

  getMeetings: async (projectId: string): Promise<ProjectMeeting[]> => {
    return mockProjectService.getMeetings(projectId)
  },

  getProgressPercentage: async (projectId: string): Promise<number> => {
    return mockProjectService.getProgressPercentage(projectId)
  },

  replyToNote: async (noteId: string, content: string): Promise<void> => {
    // This would call the API to reply to a supervisor note
    // For now, we'll use the mock service if it exists, otherwise just return
    return Promise.resolve()
  },
}

