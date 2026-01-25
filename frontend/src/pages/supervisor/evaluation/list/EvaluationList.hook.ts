import { useTranslation } from 'react-i18next'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { EvaluationListState, EvaluationListData } from './EvaluationList.types'

export function useEvaluationList() {
  const { t } = useTranslation()
  // Supervisor evaluation can happen during final defense periods
  const { isPeriodActive: isPhase1Active } = usePeriodCheck('final_defense_phase_1')
  const { isPeriodActive: isPhase2Active, isLoading: periodLoading } = usePeriodCheck('final_defense_phase_2')
  const isPeriodActive = isPhase1Active || isPhase2Active

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
