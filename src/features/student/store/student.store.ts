import { create } from 'zustand'
import type { Project, ProjectGroup } from '../../../types/project.types'

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

