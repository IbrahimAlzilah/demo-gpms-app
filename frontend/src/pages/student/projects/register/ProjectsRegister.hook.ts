import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useRegisterProject,
  useProjectRegistration,
  useCancelRegistration,
} from '../hooks/useProjectOperations'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import type { Project } from '@/types/project.types'

export function useProjectsRegister(project: Project) {
  const { t } = useTranslation()
  const registerProject = useRegisterProject()
  const cancelRegistration = useCancelRegistration()
  const { data: registration, isLoading: registrationLoading } = useProjectRegistration(project.id)
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('project_registration')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async () => {
    if (!isPeriodActive) {
      setError(t('project.periodClosed'))
      return
    }

    if (project.currentStudents >= project.maxStudents) {
      setError(t('project.fullCapacity'))
      return
    }

    setError('')
    setSuccess(false)
    try {
      await registerProject.mutateAsync(project.id)
      setSuccess(true)
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('project.registrationError')
      setError(errorMessage)
    }
  }

  const handleCancelRegistration = async () => {
    if (!registration) return
    setError('')
    try {
      await cancelRegistration.mutateAsync(registration.id)
    } catch (err: any) {
      // Extract error message from API response
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t('project.registrationError')
      setError(errorMessage)
    }
  }

  return {
    registration,
    registrationLoading,
    periodLoading,
    isPeriodActive,
    error,
    success,
    registerProject,
    cancelRegistration,
    handleSubmit,
    handleCancelRegistration,
    setError,
  }
}
