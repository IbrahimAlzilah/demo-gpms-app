// Public API Facade - Barrel exports only (no components for Fast Refresh)

// Components
export { CommitteeDistribution } from './components/CommitteeDistribution'
export { ProjectAnnouncement } from './components/ProjectAnnouncement'
export { ProposalReviewPanel } from './components/ProposalReviewPanel'
export { ProposalReviewDialog } from './components/ProposalReviewDialog'
export { TimePeriodManager } from './components/TimePeriodManager'
export { SupervisorAssignment } from './components/SupervisorAssignment'
export { RequestProcessingPanel } from './components/RequestProcessingPanel'
export { RegistrationManagementPanel } from './components/RegistrationManagementPanel'
export { ReportGenerator } from './components/ReportGenerator'
export { createProposalColumns } from './components/ProposalTableColumns'
export { createPeriodColumns } from './components/PeriodTableColumns'
export { createProjectAnnouncementColumns } from './components/ProjectAnnouncementTableColumns'
export { createRequestProcessingColumns } from './components/RequestProcessingTableColumns'

// Hooks
export {
  useProjectsReadyForDiscussion,
  useDiscussionCommitteeMembers,
  useDistributeProjects,
} from './hooks/useCommitteeDistribution'
export {
  usePeriods,
  useCreatePeriod,
  useUpdatePeriod,
  useDeletePeriod,
} from './hooks/usePeriods'
export {
  useApprovedProjects,
  useAnnounceProjects,
} from './hooks/useProjectAnnouncement'
export {
  usePendingProposals,
  useAllProposals,
  useProposal,
  useApproveProposal,
  useRejectProposal,
  useRequestModification,
} from './hooks/useProposalManagement'
export {
  useRegistrations,
  useRegistration,
  useApproveRegistration,
  useRejectRegistration,
} from './hooks/useRegistrationManagement'
export { useProjectsReport } from './hooks/useReports'
export {
  usePendingRequests,
  useRequest,
  useApproveRequest,
  useRejectRequest,
} from './hooks/useRequestProcessing'
export {
  useProjectsWithoutSupervisor,
  useAvailableSupervisors,
  useAssignSupervisor,
} from './hooks/useSupervisorAssignment'

// Types
export type * from './types'

// Schemas
export {
  timePeriodSchema,
  proposalReviewSchema,
} from './schema'
export type {
  TimePeriodSchema,
  ProposalReviewSchema,
} from './schema'

// Store
export { useProjectsCommitteeStore } from './store/committee.store'

// API Services (for internal use, but exported for flexibility)
export { committeeDistributionService } from './api/committee.service'
export { committeeProjectService } from './api/project.service'
export { periodService } from './api/period.service'
export { committeeProposalService } from './api/proposal.service'
export { registrationService } from './api/registration.service'
export { committeeReportService } from './api/report.service'
export { committeeRequestService } from './api/request.service'
export { supervisorAssignmentService } from './api/supervisor.service'
