import type { Proposal } from "@/types/project.types";
import type { Submission } from "../types/GroupedSubmissions.types";
import type { UnifiedGroup } from "../../registrations/api/registration.service";

export type ProposalStatusFilter =
  | "all"
  | "pending_review"
  | "approved"
  | "rejected"
  | "requires_modification";
export type ViewMode = "grouped" | "individual";

export interface ProposalsListState {
  selectedProposal: Proposal | null;
  action: "approve" | "reject" | "modify" | null;
  statusFilter: ProposalStatusFilter;
  proposalToEditId: string | null;
  proposalToDelete: Proposal | null;
  proposalToViewId: string | null;
  viewMode: ViewMode;
  registrationDetails?: Array<{
    type: string;
    project_id?: number;
    project_title?: string;
    group_id?: number;
    group_name?: string;
    count?: number;
  }>;
  showRegistrationWarning?: boolean;
  registrationToViewId?: string | null;
}

export interface ProposalsListData {
  proposals: Proposal[];
  submissions: Submission[]; // Supervisor submissions only
  unifiedGroups: UnifiedGroup[]; // Student groups with proposals + registrations
  isLoading: boolean;
  error: Error | null;
  pageCount: number;
}
