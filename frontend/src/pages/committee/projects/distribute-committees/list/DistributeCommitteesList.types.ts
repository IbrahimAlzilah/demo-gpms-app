import type {
  CommitteeMemberProfile,
  ProjectForDiscussion,
  ProjectFilterStatus,
  DefensePhaseFilter,
} from "../api/committee.service";

export interface DistributeCommitteesListState {
  filterStatus: ProjectFilterStatus;
  defensePhase: DefensePhaseFilter;
  searchQuery: string;
  selectedMemberForDetails: CommitteeMemberProfile | null;
  showMemberDetailsDialog: boolean;
  selectedProjectForAssign: ProjectForDiscussion | null;
  showAssignModal: boolean;
  projectToRemove: ProjectForDiscussion | null;
}

export interface DistributeCommitteesListData {
  projects: ProjectForDiscussion[];
  members: CommitteeMemberProfile[];
  isLoading: boolean;
  error: Error | null;
}
