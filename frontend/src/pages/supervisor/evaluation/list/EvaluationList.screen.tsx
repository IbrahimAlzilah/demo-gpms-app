import { EvaluationForm } from '../components/EvaluationForm'

interface EvaluationListProps {
  projectId: string
  studentId: string
}

export function EvaluationList({ projectId, studentId }: EvaluationListProps) {
  return (
    <EvaluationForm 
      projectId={projectId} 
      studentId={studentId} 
    />
  )
}
