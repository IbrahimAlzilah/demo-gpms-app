import type { ProposalFilters } from '../../types/Proposals.types'

/**
 * Filter utilities and types for proposal table
 */

export type ProposalTableFilter = ProposalFilters

/**
 * Build filter object from route and user context
 */
export function buildProposalFilters(
  routePath: string,
  userId?: string
): ProposalFilters {
  const filters: ProposalFilters = {}

  if (routePath.includes('/my')) {
    filters.submitterId = userId
  } else if (routePath.includes('/approved')) {
    filters.status = 'approved'
  }

  return filters
}
