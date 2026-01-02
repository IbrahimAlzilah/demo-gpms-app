import { z } from 'zod'

/**
 * Additional proposal validation schemas
 * Can be extended for other validation needs
 */

/**
 * Proposal ID validation
 */
export const proposalIdSchema = z.string().uuid('Invalid proposal ID')

/**
 * Proposal status validation
 */
export const proposalStatusSchema = z.enum([
  'pending_review',
  'approved',
  'rejected',
  'requires_modification',
])
