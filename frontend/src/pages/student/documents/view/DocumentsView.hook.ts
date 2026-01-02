import { useDocument } from '../hooks/useDocuments'

export function useDocumentsView(documentId: string) {
  const { data: document, isLoading, error } = useDocument(documentId)

  return {
    document,
    isLoading,
    error,
  }
}
