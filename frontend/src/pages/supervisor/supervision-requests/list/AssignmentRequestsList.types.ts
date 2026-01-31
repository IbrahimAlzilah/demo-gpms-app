import type { SupervisorAssignmentRequest } from "../types/SupervisionRequests.types";

export type AssignmentRequestStatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "rejected"
  | "canceled";

export interface AssignmentRequestsListState {
  statusFilter: AssignmentRequestStatusFilter;
  selectedRequest: SupervisorAssignmentRequest | null;
  action: "approve" | "reject" | null;
  showConfirmDialog: boolean;
  response: string;
}

export interface AssignmentRequestsListData {
  requests: SupervisorAssignmentRequest[];
  isLoading: boolean;
  error: Error | null;
  pageCount: number;
}
