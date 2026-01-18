import { create } from 'zustand'
import type { Project } from '@/types/project.types'

interface SupervisorState {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
}

export const useSupervisorStore = create<SupervisorState>((set) => ({
  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
}))
