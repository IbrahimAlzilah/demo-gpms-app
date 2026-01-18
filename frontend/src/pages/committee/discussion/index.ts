// Public API Facade - Barrel exports only (no components for Fast Refresh)
// Re-export from feature folders

// Projects
export * from './projects'

// Evaluation
export * from './evaluation'

// Page Components
export { DiscussionProjectsPage } from './projects/ProjectsPage'
export { DiscussionEvaluationPage } from './evaluation/EvaluationPage'
