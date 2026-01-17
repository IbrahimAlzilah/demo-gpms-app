import { useQuery } from '@tanstack/react-query'
import { committeeProposalService } from '../proposals/api/proposal.service'
import { committeeRequestService } from '../requests/api/request.service'
import { committeeProjectService } from '../announce-projects/api/project.service'
import { supervisorAssignmentService } from '../supervisors/api/supervisor.service'
import { periodService } from '../periods/api/period.service'
import type { TimePeriod } from '@/types/period.types'

export interface DashboardStats {
  pendingProposals: number
  pendingRequests: number
  projectsToAnnounce: number
  supervisorsToAssign: number
}

export interface CurrentPhase {
  period: TimePeriod | null
  progressPercent: number
  endsInDays: number | null
  nextPeriod: TimePeriod | null
}

export interface DashboardData {
  stats: DashboardStats
  currentPhase: CurrentPhase
}

/**
 * Hook to fetch all dashboard data for Projects Committee Dashboard
 */
export function useProjectsCommitteeDashboard() {
  // Fetch pending proposals count
  const { data: proposalsData, isLoading: proposalsLoading, error: proposalsError, refetch: refetchProposals } = useQuery({
    queryKey: ['committee-dashboard', 'proposals-count'],
    queryFn: async () => {
      const result = await committeeProposalService.getTableData(
        { page: 1, pageSize: 1 },
        'pending_review'
      )
      return result.totalCount
    },
  })

  // Fetch pending requests count (only pending - supervisor approval no longer used)
  const { data: pendingRequestsData, isLoading: pendingRequestsLoading, error: pendingRequestsError, refetch: refetchPendingRequests } = useQuery({
    queryKey: ['committee-dashboard', 'requests-count', 'pending'],
    queryFn: async () => {
      const result = await committeeRequestService.getTableData({
        page: 1,
        pageSize: 1,
        filters: { status: 'pending' },
      })
      return result.totalCount
    },
  })

  // Fetch draft projects count (projects to announce)
  const { data: projectsToAnnounceData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['committee-dashboard', 'projects-count'],
    queryFn: async () => {
      const result = await committeeProjectService.getTableData(
        { page: 1, pageSize: 1 },
        'draft'
      )
      return result.totalCount
    },
  })

  // Fetch projects without supervisor count
  const { data: supervisorsToAssignData, isLoading: supervisorsLoading, error: supervisorsError, refetch: refetchSupervisors } = useQuery({
    queryKey: ['committee-dashboard', 'supervisors-count'],
    queryFn: () => supervisorAssignmentService.getProjectsWithoutSupervisorCount(),
  })

  // Fetch all periods to determine current phase
  const { data: periods, isLoading: periodsLoading, error: periodsError, refetch: refetchPeriods } = useQuery({
    queryKey: ['committee-dashboard', 'periods'],
    queryFn: () => periodService.getAll(),
  })

  // Compute aggregated states
  const isLoading = proposalsLoading || pendingRequestsLoading || 
                    projectsLoading || supervisorsLoading || periodsLoading
  
  const error = proposalsError || pendingRequestsError || 
                projectsError || supervisorsError || periodsError

  // Compute stats
  const stats: DashboardStats = {
    pendingProposals: proposalsData ?? 0,
    pendingRequests: pendingRequestsData ?? 0,
    projectsToAnnounce: projectsToAnnounceData ?? 0,
    supervisorsToAssign: supervisorsToAssignData ?? 0,
  }

  // Compute current phase
  const computeCurrentPhase = (): CurrentPhase => {
    if (!periods || periods.length === 0) {
      return {
        period: null,
        progressPercent: 0,
        endsInDays: null,
        nextPeriod: null,
      }
    }

    const now = new Date()
    
    // Find active periods (prefer isActive === true)
    const activePeriods = periods.filter(p => p.isActive === true)
    let currentPeriod: TimePeriod | null = null

    if (activePeriods.length > 0) {
      // If multiple active periods, pick the one with closest endDate
      currentPeriod = activePeriods.reduce((closest, period) => {
        const closestEnd = new Date(closest.endDate).getTime()
        const periodEnd = new Date(period.endDate).getTime()
        const nowTime = now.getTime()
        const closestDiff = Math.abs(closestEnd - nowTime)
        const periodDiff = Math.abs(periodEnd - nowTime)
        return periodDiff < closestDiff ? period : closest
      })
    } else {
      // Fallback: find periods where now is within startDate..endDate
      const periodsInRange = periods.filter(p => {
        const start = new Date(p.startDate).getTime()
        const end = new Date(p.endDate).getTime()
        const nowTime = now.getTime()
        return nowTime >= start && nowTime <= end
      })

      if (periodsInRange.length > 0) {
        // Pick the one with closest endDate
        currentPeriod = periodsInRange.reduce((closest, period) => {
          const closestEnd = new Date(closest.endDate).getTime()
          const periodEnd = new Date(period.endDate).getTime()
          return periodEnd < closestEnd ? period : closest
        })
      }
    }

    // Compute progress and ends in days
    let progressPercent = 0
    let endsInDays: number | null = null

    if (currentPeriod) {
      const start = new Date(currentPeriod.startDate).getTime()
      const end = new Date(currentPeriod.endDate).getTime()
      const nowTime = now.getTime()
      const total = end - start
      
      if (total > 0) {
        const elapsed = Math.max(0, Math.min(nowTime - start, total))
        progressPercent = Math.round((elapsed / total) * 100)
      }

      const diffMs = end - nowTime
      if (diffMs > 0) {
        endsInDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      } else {
        endsInDays = 0
      }
    }

    // Find next period (soonest upcoming by startDate)
    const upcomingPeriods = periods.filter(p => {
      const start = new Date(p.startDate).getTime()
      return start > now.getTime()
    })

    const nextPeriod = upcomingPeriods.length > 0
      ? upcomingPeriods.reduce((soonest, period) => {
          const soonestStart = new Date(soonest.startDate).getTime()
          const periodStart = new Date(period.startDate).getTime()
          return periodStart < soonestStart ? period : soonest
        })
      : null

    return {
      period: currentPeriod,
      progressPercent,
      endsInDays,
      nextPeriod,
    }
  }

  const currentPhase = computeCurrentPhase()

  // Refetch all queries
  const refetch = () => {
    refetchProposals()
    refetchPendingRequests()
    refetchProjects()
    refetchSupervisors()
    refetchPeriods()
  }

  const data: DashboardData = {
    stats,
    currentPhase,
  }

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}