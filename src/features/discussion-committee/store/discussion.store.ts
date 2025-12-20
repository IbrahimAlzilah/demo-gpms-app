import { create } from "zustand";
import type { Project } from "../../../types/project.types";

interface DiscussionCommitteeState {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

export const useDiscussionCommitteeStore = create<DiscussionCommitteeState>(
  (set) => ({
    currentProject: null,
    setCurrentProject: (project) => set({ currentProject: project }),
  })
);
