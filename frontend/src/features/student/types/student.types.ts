// Re-export types from domain types
export type {
  Project,
  ProjectStatus,
  Proposal,
  ProjectGroup,
  Request,
  RequestType,
  RequestStatus,
  Document,
  DocumentType,
  Grade,
} from '../../../types/project.types'
export type {
  Request as RequestType,
  Document as DocumentType,
} from '../../../types/request.types'
export type { Grade as GradeType } from '../../../types/evaluation.types'

