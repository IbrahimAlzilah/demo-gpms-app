import { useMutation, useQueryClient } from '@tanstack/react-query'
import { meetingService } from '../api/meeting.service'
import type { CreateMeetingData, UpdateMeetingData } from '../api/meeting.service'

export function useCreateMeeting(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateMeetingData) => meetingService.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-meetings', projectId] })
    },
  })
}

export function useUpdateMeeting(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateMeetingData }) =>
      meetingService.update(meetingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-meetings', projectId] })
    },
  })
}

export function useDeleteMeeting(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (meetingId: string) => meetingService.delete(meetingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-meetings', projectId] })
    },
  })
}
