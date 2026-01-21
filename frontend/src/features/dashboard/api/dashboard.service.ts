import { apiClient } from '@/lib/axios'

// Student Dashboard Types
export interface StudentDashboardData {
  stats: {
    myProjectStatus: string | null
    progressPercentage: number
    pendingProposals: number
    pendingRequests: number
    documentsSubmittedCount: number
    unreadNotifications: number
  }
  myProject: {
    id: string
    title: string
    status: string
    supervisor: {
      id: string
      name: string
    } | null
  } | null
  activeTimeWindows: Array<{
    id: number
    name: string
    type: string
    startDate: string
    endDate: string
    daysRemaining: number
    description: string | null
  }>
  timeline: {
    upcomingMilestones: Array<{
      id: string
      title: string
      description: string | null
      dueDate: string
      type: string
      daysUntil: number
      isOverdue: boolean
    }>
    upcomingMeetings: Array<{
      id: string
      scheduledDate: string
      duration: number | null
      location: string | null
      agenda: string | null
      scheduledBy: {
        id: string
        name: string
      } | null
    }>
  }
}

// Supervisor Dashboard Types
export interface SupervisorDashboardData {
  stats: {
    supervisedProjectsCount: number
    pendingSupervisionRequests: number
    pendingEvaluations: number
    upcomingMeetingsCount: number
    overdueMilestonesCount: number
  }
  upcomingMeetings: Array<{
    id: string
    projectId: string
    projectTitle: string
    scheduledDate: string
    duration: number | null
    location: string | null
    agenda: string | null
    scheduledBy: {
      id: string
      name: string
    } | null
  }>
  overdueMilestones: Array<{
    id: string
    projectId: string
    projectTitle: string
    title: string
    dueDate: string
    daysOverdue: number
  }>
  soonMilestones: Array<{
    id: string
    projectId: string
    projectTitle: string
    title: string
    dueDate: string
    daysUntil: number
  }>
  projectsNeedingAttention: Array<{
    id: string
    title: string
    ungradedStudentsCount: number
  }>
}

// Projects Committee Dashboard Types
export interface ProjectsCommitteeDashboardData {
  stats: {
    pendingProposals: number
    pendingRequests: number
    draftProjectsToAnnounce: number
    projectsWithoutSupervisor: number
    pendingRegistrations: number
    gradesPendingApproval: number
  }
  currentPhase: {
    period: {
      id: number
      name: string
      type: string
      startDate: string
      endDate: string
      isActive: boolean
    } | null
    progressPercent: number
    endsInDays: number | null
    nextPeriod: {
      id: number
      name: string
      type: string
      startDate: string
      endDate: string
    } | null
  }
}

// Discussion Committee Dashboard Types
export interface DiscussionCommitteeDashboardData {
  stats: {
    assignedProjectsCount: number
    pendingEvaluations: number
    completedEvaluations: number
    upcomingScheduleCount: number
  }
  pendingEvaluations: Array<{
    projectId: string
    projectTitle: string
    createdAt: string
  }>
  defenseSchedule: Array<{
    projectId: string
    projectTitle: string
    scheduledDate: string
    location: string | null
    type?: string
    title?: string
  }>
}

// Admin Dashboard Types
export interface AdminDashboardData {
  stats: {
    usersTotal: number
    usersActive: number
    usersByRole: Record<string, number>
    projectsTotal: number
    projectsByStatus: Record<string, number>
    proposalsTotal: number
    proposalsByStatus: Record<string, number>
    requestsTotal: number
    requestsByStatus: Record<string, number>
  }
  systemHealth: {
    status: string
    databaseConnected: boolean
    timestamp: string
  }
}

export const dashboardService = {
  // Student Dashboard
  getStudentDashboard: async (): Promise<StudentDashboardData> => {
    const response = await apiClient.get<StudentDashboardData>('/student/dashboard')
    return response.data
  },

  // Supervisor Dashboard
  getSupervisorDashboard: async (): Promise<SupervisorDashboardData> => {
    const response = await apiClient.get<SupervisorDashboardData>('/supervisor/dashboard')
    return response.data
  },

  // Projects Committee Dashboard
  getProjectsCommitteeDashboard: async (): Promise<ProjectsCommitteeDashboardData> => {
    const response = await apiClient.get<ProjectsCommitteeDashboardData>(
      '/projects-committee/dashboard'
    )
    return response.data
  },

  // Discussion Committee Dashboard
  getDiscussionCommitteeDashboard: async (): Promise<DiscussionCommitteeDashboardData> => {
    const response = await apiClient.get<DiscussionCommitteeDashboardData>(
      '/discussion-committee/dashboard'
    )
    return response.data
  },

  // Admin Dashboard
  getAdminDashboard: async (): Promise<AdminDashboardData> => {
    const response = await apiClient.get<AdminDashboardData>('/admin/dashboard')
    return response.data
  },
}
