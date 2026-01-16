import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { userService } from '../users/api/user.service'
import { apiClient } from '@/lib/axios'
import type { Project } from '@/types/project.types'
import type { Proposal } from '@/types/project.types'
import type { TableResponse } from '@/types/table.types'

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  totalProposals: number
  systemHealth: string
}

export interface DashboardData {
  stats: DashboardStats
}

/**
 * Hook to fetch all dashboard data for Admin Dashboard
 */
export function useAdminDashboard() {
  // Fetch users count (using paginated call to get total)
  const { data: usersData, isLoading: usersLoading, error: usersError, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-dashboard', 'users-count'],
    queryFn: async () => {
      const result = await userService.getTableData({ page: 1, pageSize: 1 })
      return {
        total: result.totalCount,
        // We'll need to fetch all users or use a filter to get active users count
        // For now, we'll fetch a second query for active users
      }
    },
  })

  // Fetch active users count
  const { data: activeUsersData, isLoading: activeUsersLoading, error: activeUsersError, refetch: refetchActiveUsers } = useQuery({
    queryKey: ['admin-dashboard', 'active-users-count'],
    queryFn: async () => {
      const result = await userService.getTableData({
        page: 1,
        pageSize: 1,
        filters: { status: 'active' },
      })
      return result.totalCount
    },
  })

  // Fetch all users to compute active count if filter doesn't work
  const { data: allUsers, isLoading: allUsersLoading } = useQuery({
    queryKey: ['admin-dashboard', 'all-users'],
    queryFn: () => userService.getAll(),
  })

  // Fetch projects count (using committee endpoint since there's no admin-specific one)
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['admin-dashboard', 'projects-count'],
    queryFn: async () => {
      try {
        // Try admin endpoint first
        const response = await apiClient.get<{ data: Project[], pagination?: any }>(
          '/admin/projects?pageSize=1'
        )
        if (response.pagination?.total !== undefined) {
          return response.pagination.total
        }
        // Fallback to committee endpoint
        const committeeResponse = await apiClient.get<{ data: Project[], pagination?: any }>(
          '/projects-committee/projects?pageSize=1'
        )
        return committeeResponse.pagination?.total || (Array.isArray(committeeResponse.data) ? committeeResponse.data.length : 0)
      } catch {
        // Fallback: try committee endpoint
        try {
          const response = await apiClient.get<{ data: Project[], pagination?: any }>(
            '/projects-committee/projects?pageSize=1'
          )
          return response.pagination?.total || (Array.isArray(response.data) ? response.data.length : 0)
        } catch {
          return 0
        }
      }
    },
  })

  // Fetch proposals count (using committee endpoint)
  const { data: proposalsData, isLoading: proposalsLoading, error: proposalsError, refetch: refetchProposals } = useQuery({
    queryKey: ['admin-dashboard', 'proposals-count'],
    queryFn: async () => {
      try {
        // Try admin endpoint first
        const response = await apiClient.get<{ data: Proposal[], pagination?: any }>(
          '/admin/proposals?pageSize=1'
        )
        if (response.pagination?.total !== undefined) {
          return response.pagination.total
        }
        // Fallback to committee endpoint
        const committeeResponse = await apiClient.get<{ data: Proposal[], pagination?: any }>(
          '/projects-committee/proposals?pageSize=1'
        )
        return committeeResponse.pagination?.total || (Array.isArray(committeeResponse.data) ? committeeResponse.data.length : 0)
      } catch {
        // Fallback: try committee endpoint
        try {
          const response = await apiClient.get<{ data: Proposal[], pagination?: any }>(
            '/projects-committee/proposals?pageSize=1'
          )
          return response.pagination?.total || (Array.isArray(response.data) ? response.data.length : 0)
        } catch {
          return 0
        }
      }
    },
  })

  // Compute aggregated states
  const isLoading = usersLoading || activeUsersLoading || allUsersLoading || projectsLoading || proposalsLoading
  
  const error = usersError || activeUsersError || projectsError || proposalsError

  // Compute active users count
  const activeUsersCount = useMemo(() => {
    if (activeUsersData !== undefined) {
      return activeUsersData
    }
    // Fallback: count active users from allUsers
    if (allUsers) {
      return allUsers.filter(user => user.status === 'active').length
    }
    return 0
  }, [activeUsersData, allUsers])

  // Compute stats
  const stats: DashboardStats = useMemo(() => {
    const totalUsers = usersData?.total || allUsers?.length || 0
    const totalProjects = projectsData ?? 0
    const totalProposals = proposalsData ?? 0

    // System health - placeholder for now (could be fetched from a dedicated endpoint)
    // In a real app, this would come from a health check endpoint
    const systemHealth = 'Good' // This could be fetched from /admin/system/health

    return {
      totalUsers,
      activeUsers: activeUsersCount,
      totalProjects,
      totalProposals,
      systemHealth,
    }
  }, [usersData, allUsers, activeUsersCount, projectsData, proposalsData])

  // Refetch all queries
  const refetch = () => {
    refetchUsers()
    refetchActiveUsers()
    refetchProjects()
    refetchProposals()
  }

  const data: DashboardData = {
    stats,
  }

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  }
}