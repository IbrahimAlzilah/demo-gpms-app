import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentService } from '../api/document.service'
import { useAuthStore } from '../../auth/store/auth.store'
import type { DocumentType } from '../../../types/request.types'

export function useDocuments(projectId?: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => documentService.getAll(projectId),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  })
}

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

