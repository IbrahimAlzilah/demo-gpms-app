import type { SupervisorEvaluationProjectItem } from "../api/evaluation.service";

export interface SupervisorEvaluationListState {
  selectedProjectId: string | null;
  showEvaluationModal: boolean;
}

export interface SupervisorEvaluationListData {
  items: SupervisorEvaluationProjectItem[];
  isLoading: boolean;
  error: Error | null;
}

export type { SupervisorEvaluationProjectItem };
