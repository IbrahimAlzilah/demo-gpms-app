import type { Request } from "@/types/request.types";

/**
 * Request filter options
 */
export interface RequestFilters {
  type?: Request["type"];
  status?: Request["status"];
  search?: string;
}

/**
 * Request table column definition props
 */
const LEADER_ONLY_REQUEST_TYPES = [
  "change_supervisor",
  "change_project",
  "change_project_title",
] as const;

export interface RequestTableColumnsProps {
  onView: (request: Request) => void;
  onCancel?: (request: Request) => void;
  onEdit?: (request: Request) => void;
  onDelete?: (request: Request) => void;
  t: (key: string) => string;
  isGroupLeader?: boolean;
}

export function isLeaderOnlyRequestType(type: string): boolean {
  return LEADER_ONLY_REQUEST_TYPES.includes(
    type as (typeof LEADER_ONLY_REQUEST_TYPES)[number],
  );
}

/**
 * Request statistics
 */
export interface RequestStatistics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Request list screen props
 */
export interface RequestsListScreenProps {
  // No props needed - uses route context
}

/**
 * Request view screen props
 */
export interface RequestsViewScreenProps {
  requestId: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Request new screen props
 */
export interface RequestsNewScreenProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}
