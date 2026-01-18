import { useQuery } from '@tanstack/react-query'
import { useProjects } from '../projects/hooks/useProjects'
import { useSupervisionRequests } from '../supervision-requests/hooks/useSupervisionRequests'
import { meetingService } from '../progress/api/meeting.service'
import { evaluationService } from '../evaluation/api/evaluation.service'
import { useMemo } from 'react'
import type { ProjectMeeting } from '@/types/project.types'
import type { Grade } from '@/types/evaluation.types'

export interface DashboardStats {
  projects: number
  pendingRequests: number
  upcomingMeetings: number
  pendingEvaluations: number
}

export interface UpcomingMeeting {
  id: string
  projectTitle: string
  scheduledDate: string
  location?: string
  agenda?: string
}

export interface DashboardData {
  stats: DashboardStats
  upcomingMeetings: UpcomingMeeting[]
}

/**
 * Hook to fetch all dashboard data for Supervisor Dashboard
 */
export function useSupervisorDashboard() {

  // Fetch projects
  const { data: projects, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects()

  // Fetch supervision requests
  const { data: supervisionRequests, isLoading: supervisionRequestsLoading, error: supervisionRequestsError, refetch: refetchSupervisionRequests } = useSupervisionRequests()

  // Fetch meetings for all projects
  const projectsIds = useMemo(() => projects?.map(p => p.id) || [], [projects])
  
  const meetingsQueries = useQuery({
    queryKey: ['supervisor-dashboard', 'meetings', projectsIds],
    queryFn: async () => {
      if (!projects || projects.length === 0) return []
      
      const allMeetings: Array<{ meeting: ProjectMeeting, projectTitle: string }> = []
      
      // Fetch meetings for each project
      for (const project of projects) {
        try {
          const meetings = await meetingService.getAll(project.id)
          meetings.forEach(meeting => {
            allMeetings.push({ meeting, projectTitle: project.title })
          })
        } catch (error) {
          // Skip projects that fail to load meetings
          console.warn(`Failed to load meetings for project ${project.id}:`, error)
        }
      }
      
      return allMeetings
    },
    enabled: !!projects && projects.length > 0,
  })

  // Fetch evaluations for all projects to count pending
  const evaluationsQueries = useQuery({
    queryKey: ['supervisor-dashboard', 'evaluations', projectsIds],
    queryFn: async () => {
      if (!projects || projects.length === 0) return []
      
      const projectEvaluations: Array<{ projectId: string, grades: Grade[] }> = []
      
      // Fetch grades for each project
      for (const project of projects) {
        try {
          const grades = await evaluationService.getGrades(project.id)
          projectEvaluations.push({ projectId: project.id, grades })
        } catch (error) {
          // Skip projects that fail to load evaluations
          console.warn(`Failed to load evaluations for project ${project.id}:`, error)
        }
      }
      
      return projectEvaluations
    },
    enabled: !!projects && projects.length > 0,
  })

  // Compute aggregated states
  const isLoading = projectsLoading || supervisionRequestsLoading || 
                    meetingsQueries.isLoading || evaluationsQueries.isLoading
  
  const error = projectsError || supervisionRequestsError || 
                meetingsQueries.error || evaluationsQueries.error

  // Compute stats
  const stats: DashboardStats = useMemo(() => {
    // Projects count
    const projectsCount = projects?.length || 0

    // Pending supervision requests (requests that are pending approval)
    // Note: Assuming supervision requests have a status field or are all pending
    const pendingRequestsCount = supervisionRequests?.length || 0

    // Upcoming meetings (meetings scheduled in the future)
    const now = new Date()
    const upcomingMeetingsList = (meetingsQueries.data || [])
      .filter(({ meeting }) => {
        const meetingDate = new Date(meeting.scheduledDate)
        return meetingDate >= now
      })
      .sort((a, b) => 
        new Date(a.meeting.scheduledDate).getTime() - new Date(b.meeting.scheduledDate).getTime()
      )
    const upcomingMeetingsCount = upcomingMeetingsList.length

    // Pending evaluations (projects with students that haven't been evaluated)
    // Count projects where students exist but supervisor grades don't exist for all students
    let pendingEvaluationsCount = 0
    if (projects && evaluationsQueries.data) {
      projects.forEach(project => {
        const projectEval = evaluationsQueries.data.find(e => e.projectId === project.id)
        const grades = projectEval?.grades || []
        const studentsInProject = project.students || []
        
        // Check if all students have supervisor grades
        const studentsWithSupervisorGrades = new Set(
          grades.filter(g => g.supervisorGrade).map(g => g.studentId)
        )
        const hasUngradedStudents = studentsInProject.some(
          student => !studentsWithSupervisorGrades.has(student.id)
        )
        if (hasUngradedStudents && studentsInProject.length > 0) {
          pendingEvaluationsCount++
        }
      })
    }

    return {
      projects: projectsCount,
      pendingRequests: pendingRequestsCount,
      upcomingMeetings: upcomingMeetingsCount,
      pendingEvaluations: pendingEvaluationsCount,
    }
  }, [projects, supervisionRequests, meetingsQueries.data, evaluationsQueries.data])

  // Format upcoming meetings
  const upcomingMeetings: UpcomingMeeting[] = useMemo(() => {
    const now = new Date()
    return (meetingsQueries.data || [])
      .filter(({ meeting }) => {
        const meetingDate = new Date(meeting.scheduledDate)
        return meetingDate >= now
      })
      .sort((a, b) => 
        new Date(a.meeting.scheduledDate).getTime() - new Date(b.meeting.scheduledDate).getTime()
      )
      .slice(0, 5) // Limit to 5 most upcoming
      .map(({ meeting, projectTitle }) => ({
        id: meeting.id,
        projectTitle,
        scheduledDate: meeting.scheduledDate,
        location: meeting.location,
        agenda: meeting.agenda,
      }))
  }, [meetingsQueries.data])

  // Refetch all queries
  const refetch = () => {
    refetchProjects()
    refetchSupervisionRequests()
    meetingsQueries.refetch()
    evaluationsQueries.refetch()
  }

  const data: DashboardData = {
    stats,
    upcomingMeetings,
  }

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}