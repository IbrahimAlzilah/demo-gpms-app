// Public API Facade - Barrel exports only (no components for Fast Refresh)
// Re-export from feature folders

// Proposals
export * from './proposals'

// Requests
export * from './requests'

// Registrations
export * from './registrations'

// Reports
export * from './reports'

// Periods
export * from './periods'

// Announce Projects
export * from './announce-projects'

// Distribute Committees
export * from './distribute-committees'

// Supervisors
export * from './supervisors'

// Page Components
export { ProposalsPage } from './proposals/ProposalsPage'
export { CommitteeRequestsPage } from './requests/RequestsPage'
export { RegistrationsPage } from './registrations/RegistrationsPage'
export { CommitteeReportsPage } from './reports/ReportsPage'
export { PeriodsPage } from './periods/PeriodsPage'
export { AnnounceProjectsPage } from './announce-projects/AnnounceProjectsPage'
export { DistributeCommitteesPage } from './distribute-committees/DistributeCommitteesPage'
export { SupervisorsPage } from './supervisors/SupervisorsPage'
