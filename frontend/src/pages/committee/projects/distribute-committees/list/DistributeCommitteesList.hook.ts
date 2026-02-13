import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  useProjectsForDiscussion,
  useDiscussionCommitteeMembers,
} from "../hooks/useDistributeCommittees";
import type {
  DistributeCommitteesListState,
  DistributeCommitteesListData,
} from "./DistributeCommitteesList.types";
import type {
  ProjectFilterStatus,
  DefensePhaseFilter,
} from "../api/committee.service";

export function useDistributeCommitteesList() {
  const { t } = useTranslation();

  const [state, setState] = useState<DistributeCommitteesListState>({
    filterStatus: "all",
    defensePhase: "all",
    searchQuery: "",
    selectedMemberForDetails: null,
    showMemberDetailsDialog: false,
    selectedProjectForAssign: null,
    showAssignModal: false,
    projectToRemove: null,
  });

  // Use debouncedSearch for API calls to reduce requests
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(state.searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [state.searchQuery]);

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjectsForDiscussion(
    state.filterStatus,
    debouncedSearch,
    state.defensePhase,
  );
  const { data: members, isLoading: membersLoading } =
    useDiscussionCommitteeMembers();

  const data: DistributeCommitteesListData = {
    projects: projects || [],
    members: members || [],
    isLoading: projectsLoading || membersLoading,
    error: projectsError ? new Error(projectsError.message) : null,
  };

  // Filter status options for the UI
  const filterOptions: { value: ProjectFilterStatus; labelKey: string }[] = [
    { value: "all", labelKey: "common.all" },
    { value: "unassigned", labelKey: "committee.distribute.unassigned" },
    { value: "assigned", labelKey: "committee.distribute.assigned" },
    {
      value: "pending_evaluation",
      labelKey: "committee.distribute.pendingEvaluation",
    },
    { value: "evaluated", labelKey: "committee.distribute.evaluated" },
  ];

  const defensePhaseOptions: { value: DefensePhaseFilter; labelKey: string }[] =
    [
      { value: "all", labelKey: "committee.distribute.defensePhaseAll" },
      {
        value: "final_defense_1",
        labelKey: "committee.distribute.defensePhaseFD1",
      },
      {
        value: "final_defense_2",
        labelKey: "committee.distribute.defensePhaseFD2",
      },
    ];

  return {
    data,
    state,
    setState,
    filterOptions,
    defensePhaseOptions,
    t,
  };
}
