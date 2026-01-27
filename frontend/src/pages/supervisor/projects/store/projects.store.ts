import { create } from "zustand";
import type { Project } from "@/types/project.types";

/**
 * Zustand store for Supervisor module UI state only.
 *
 * IMPORTANT: This store is for UI state management only (e.g., selected project in UI).
 * All data fetching should be done through TanStack Query hooks, not through this store.
 *
 * Data synchronization is handled by TanStack Query's query invalidation system.
 */
interface SupervisorState {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

export const useSupervisorStore = create<SupervisorState>((set) => ({
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
}));
