import type {
  SupervisorEvaluationProjectItem,
  SupervisorDefenseEvaluationItem,
} from "../api/evaluation.service";

export type DefenseStage = 'fd1' | 'fd2';

export interface SupervisorEvaluationListState {
  selectedProjectId: string | null;
  selectedStage: DefenseStage | null;
  showEvaluationModal: boolean;
}

export interface SupervisorEvaluationListData {
  items: SupervisorDefenseEvaluationItem[];
  isLoading: boolean;
  error: Error | null;
}

export type { SupervisorEvaluationProjectItem, SupervisorDefenseEvaluationItem };
