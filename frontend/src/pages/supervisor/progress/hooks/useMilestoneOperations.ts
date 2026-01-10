import { useMutation, useQueryClient } from '@tanstack/react-query'
import { milestoneService } from '../api/milestone.service'
import type { CreateMilestoneData, UpdateMilestoneData } from '../api/milestone.service'

export function useCreateMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMilestoneData) => milestoneService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
  })
}

export function useUpdateMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ milestoneId, data }: { milestoneId: string; data: UpdateMilestoneData }) =>
      milestoneService.update(milestoneId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
  })
}

export function useDeleteMilestone(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (milestoneId: string) => milestoneService.delete(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
  })
}

export function useMarkMilestoneCompleted(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (milestoneId: string) => milestoneService.markCompleted(milestoneId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-milestones', projectId] })
    },
  })
}
