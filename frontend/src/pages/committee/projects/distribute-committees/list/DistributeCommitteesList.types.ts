import type {
  CommitteeMemberProfile,
  ProjectForDiscussion,
  ProjectFilterStatus,
  DefensePhaseFilter,
} from "../api/committee.service";

export interface DistributeCommitteesListState {
  assignments: Map<string, string[]>;
  filterStatus: ProjectFilterStatus;
  defensePhase: DefensePhaseFilter;
  searchQuery: string;
  selectedMemberForDetails: CommitteeMemberProfile | null;
  showMemberDetailsDialog: boolean;
}

export interface DistributeCommitteesListData {
  projects: ProjectForDiscussion[];
  members: CommitteeMemberProfile[];
  isLoading: boolean;
  error: Error | null;
}
