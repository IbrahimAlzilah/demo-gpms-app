import { useQuery } from '@tanstack/react-query'
import { documentService } from '@/features/student/api/document.service'

/**
 * Fetch all documents for a project
 */
export function useDocuments(projectId?: string) {
  return useQuery({
    queryKey: ['documents', projectId],
    queryFn: () => documentService.getAll(projectId),
  })
}

/**
 * Fetch a single document by ID
 */
export function useDocument(id: string) {
  return useQuery({
    queryKey: ['documents', id],
    queryFn: () => documentService.getById(id),
    enabled: !!id,
  })
}
