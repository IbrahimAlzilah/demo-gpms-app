import type { User } from "@/types/user.types";
import type { Project } from "@/types/project.types";
import type {
  SupervisorAssignmentRow,
  SupervisorAssignmentStatus,
} from "../api/supervisor.service";

export type SupervisorAssignmentViewStatus = SupervisorAssignmentStatus | "all";

export interface SupervisorsListState {
  selectedProject: Project | null;
  viewStatus: SupervisorAssignmentViewStatus;
}

export interface SupervisorsListData {
  rows: SupervisorAssignmentRow[];
  supervisors: User[];
  isLoading: boolean;
  error: Error | null;
}
