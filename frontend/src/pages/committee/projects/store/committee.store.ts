import { create } from "zustand";
import type { Project, Proposal } from "@/types/project.types";

interface ProjectsCommitteeState {
  currentProject: Project | null;
  currentProposal: Proposal | null;
  setCurrentProject: (project: Project | null) => void;
  setCurrentProposal: (proposal: Proposal | null) => void;
}

export const useProjectsCommitteeStore = create<ProjectsCommitteeState>(
  (set) => ({
    currentProject: null,
    currentProposal: null,
    setCurrentProject: (project) => set({ currentProject: project }),
    setCurrentProposal: (proposal) => set({ currentProposal: proposal }),
  })
);
