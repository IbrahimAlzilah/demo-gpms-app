import { useTranslation } from 'react-i18next'
import { useFollowUp } from '../hooks/useFollowUp'
import type { FollowUpListState, FollowUpListData } from './FollowUpList.types'

export function useFollowUpList() {
  const { t } = useTranslation()
  const { project, isLoading, error } = useFollowUp()

  // State management (currently minimal, but follows pattern for future extensibility)
  const state: FollowUpListState = {}

  const data: FollowUpListData = {
    project,
    isLoading,
    error,
  }

  return {
    data,
    state,
    t,
  }
}
