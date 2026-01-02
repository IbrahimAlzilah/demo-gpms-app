import { useUploadDocument } from '../hooks/useDocumentOperations'

export function useDocumentsNew() {
  const uploadDocument = useUploadDocument()

  return {
    uploadDocument,
    isSubmitting: uploadDocument.isPending,
  }
}
