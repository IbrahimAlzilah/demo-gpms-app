export interface ProgressListState {
  notes: string
}

export interface ProgressListData {
  supervisorNotes: any[] | undefined
  grades: any[] | undefined
  isLoading: boolean
  notesLoading: boolean
}
