export interface EvaluationNewState {
  isSubmitting: boolean
}

export interface EvaluationNewProps {
  projectId: string
  studentId: string
  onSuccess?: () => void
}
