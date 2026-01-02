import { useTranslation } from 'react-i18next'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { EvaluationListState, EvaluationListData } from './EvaluationList.types'

export function useEvaluationList() {
  const { t } = useTranslation()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('supervisor_evaluation')

  const state: EvaluationListState = {}

  const data: EvaluationListData = {
    isPeriodActive,
    periodLoading,
  }

  return {
    data,
    state,
    t,
  }
}
