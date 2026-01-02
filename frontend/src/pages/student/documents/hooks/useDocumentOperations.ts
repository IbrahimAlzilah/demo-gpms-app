import { useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../api/document.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { DocumentType } from '@/types/request.types'

/**
 * Hook for uploading a document
 */
export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: ({
      projectId,
      file,
      type,
    }: {
      projectId: string
      file: File
      type: DocumentType
    }) => {
      if (!user) throw new Error('User not authenticated')
      return documentService.upload(projectId, file, type, user.id)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.projectId] })
      queryClient.invalidateQueries({ queryKey: ['student-documents-table'] })
    },
  })
}

/**
 * Hook for deleting a document
 */
export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => documentService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['student-documents-table'] })
    },
  })
}
