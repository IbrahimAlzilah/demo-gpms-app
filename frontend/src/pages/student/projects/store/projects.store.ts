import { create } from 'zustand'
import type { Project, ProjectGroup } from '@/types/project.types'

/**
 * Zustand store for Student module UI state only.
 * 
 * IMPORTANT: This store is for UI state management only (e.g., selected project/group in UI).
 * All data fetching should be done through TanStack Query hooks, not through this store.
 * 
 * Data synchronization is handled by TanStack Query's query invalidation system.
 */
interface StudentState {
  currentProject: Project | null
  currentGroup: ProjectGroup | null
  setCurrentProject: (project: Project | null) => void
  setCurrentGroup: (group: ProjectGroup | null) => void
}

export const useStudentStore = create<StudentState>((set) => ({
  currentProject: null,
  currentGroup: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  setCurrentGroup: (group) => set({ currentGroup: group }),
}))
