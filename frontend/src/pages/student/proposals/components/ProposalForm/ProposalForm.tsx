import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { LoadingSpinner, FileUpload } from '@/components/common'
import { AlertCircle, Loader2, Calendar, X, Save } from 'lucide-react'
import type { UseProposalFormReturn } from '../../hooks/useProposalForm'
import { useSupervisors } from '../../hooks/useSupervisors'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'

interface ProposalFormProps {
  form: UseProposalFormReturn['form']
  attachedFiles: UseProposalFormReturn['attachedFiles']
  isPeriodActive: UseProposalFormReturn['isPeriodActive']
  periodLoading: UseProposalFormReturn['periodLoading']
  isRegistrationWindow: UseProposalFormReturn['isRegistrationWindow']
  handleSubmit: UseProposalFormReturn['handleSubmit']
  handleFileChange: UseProposalFormReturn['handleFileChange']
  isSubmitting?: boolean
  isEditMode?: boolean
  onCancel?: () => void
}

export function ProposalForm({
  form,
  attachedFiles,
  isPeriodActive,
  periodLoading,
  isRegistrationWindow,
  handleSubmit,
  handleFileChange,
  isSubmitting = false,
  isEditMode = false,
  onCancel,
}: ProposalFormProps) {
  const { t } = useTranslation()
  const { register, formState: { errors }, watch } = form
  const { data: supervisors = [], isLoading: supervisorsLoading, error: supervisorsError } = useSupervisors()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const selectedGroupId = watch('studentGroupId')


  // Auto-select group if student is a member of one
  useEffect(() => {
    if (studentGroup) {
      form.setValue('studentGroupId', String(studentGroup.id), { shouldValidate: true })
    }
  }, [studentGroup, form])

  if (periodLoading || groupLoading) {
    return <LoadingSpinner />
  }

  // Note: Project Committee members can bypass time window restrictions
  // This check is enforced on the backend, but we show the warning on frontend for students
  if (!isPeriodActive) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <Calendar className="h-5 w-5 text-warning mt-0.5" />
        <div>
          <p className="text-sm font-medium text-warning-foreground">
            {t('proposal.periodClosedMessage')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {t('proposal.periodClosedDescription')}
          </p>
        </div>
      </div>
    )
  }

  // During registration window, group is required - prevent form submission if no group
  if (isRegistrationWindow && !studentGroup) {
    return (
      <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <AlertCircle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-warning-foreground">
            {t('proposal.noGroupRequired')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Error block removed */}

      {/* Basic Information Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-semibold">{t('proposal.basicInfo')}</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">
            {t('proposal.title')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            {...register('title')}
            placeholder={t('proposal.titlePlaceholder')}
            className={errors.title ? 'border-destructive' : ''}
            aria-invalid={!!errors.title}
          />
          {errors.title && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {t('proposal.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('proposal.descriptionPlaceholder')}
            rows={5}
            className={errors.description ? 'border-destructive' : ''}
            aria-invalid={!!errors.description}
          />
          {errors.description && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Proposed Supervisor Section */}
        <div className="space-y-2">
          <Label htmlFor="proposedSupervisorId">
            {t('proposal.proposedSupervisor')}
          </Label>
          {supervisorsLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{t('common.loading')}</span>
            </div>
          ) : supervisorsError ? (
            <div className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              <span>{t('proposal.supervisorsLoadError') || 'Failed to load supervisors'}</span>
            </div>
          ) : (
            <Select
              value={watch('proposedSupervisorId') ? String(watch('proposedSupervisorId')) : ''}
              onValueChange={(value) => form.setValue('proposedSupervisorId', value)}
            >
              <SelectTrigger id="proposedSupervisorId" className={errors.proposedSupervisorId ? 'border-destructive' : ''}>
                <SelectValue placeholder={t('proposal.selectSupervisor')} />
              </SelectTrigger>
              <SelectContent>
                {supervisors.length === 0 ? (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t('proposal.noSupervisorsAvailable') || 'No supervisors available'}
                  </div>
                ) : (
                  supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={String(supervisor.id)}>
                      {supervisor.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
          {errors.proposedSupervisorId && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.proposedSupervisorId.message}
            </p>
          )}
        </div>

        {/* Group Selection - Required during registration window OR if user is in a group */}
        {(isRegistrationWindow || studentGroup) && (
          <div className="space-y-2">
            <Label htmlFor="studentGroupId">
              {t('proposal.group')} <span className="text-destructive">*</span>
            </Label>
            {groupLoading ? (
              <LoadingSpinner />
            ) : !studentGroup ? (
              <div className="flex items-start gap-2 p-3 text-sm text-warning bg-warning/10 border border-warning/20 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{t('proposal.noGroupRequired')}</span>
              </div>
            ) : (
              <Select
                value={selectedGroupId ? String(selectedGroupId) : ''}
                onValueChange={(value) => form.setValue('studentGroupId', value)}
                disabled={!!studentGroup} // Disable selection if user is already in a group
              >
                <SelectTrigger className={errors.studentGroupId && !(studentGroup && selectedGroupId) ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('proposal.selectGroupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(studentGroup.id)}>
                    {studentGroup.name || `${t('proposal.group')} #${studentGroup.id}`}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.studentGroupId && !(studentGroup && selectedGroupId) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.studentGroupId.message}
              </p>
            )}
            {studentGroup && (() => {
              // Calculate total member count (members + leader)
              const totalMembers = (studentGroup.members?.length || 0) + 1
              const minMembers = studentGroup.minMembers ?? 2
              const maxMembers = studentGroup.maxMembers ?? 5
              const isValidSize = totalMembers >= minMembers && totalMembers <= maxMembers

              return (
                <>
                  {!isValidSize && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {t('proposal.validation.groupSizeInvalid')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {t('proposal.groupSubmissionAutoSelected') || 'You are submitting on behalf of your group.'}
                  </p>
                </>
              )
            })()}
            {!studentGroup && isRegistrationWindow && (
              <p className="text-xs text-muted-foreground">
                {t('proposal.groupSubmissionNote')}
              </p>
            )}
          </div>
        )}
      </div>


      {/* Attachments Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold">{t('proposal.attachments')}</h3>
        </div>
        <FileUpload
          value={attachedFiles}
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt"
          maxSize={10 * 1024 * 1024}
          multiple={true}
        />
        <p className="text-xs text-muted-foreground">
          {t('proposal.fileUploadHint')}
        </p>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-between pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 mr-2" />
            {t('common.cancel')}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !isPeriodActive}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? t('proposal.updating') : t('proposal.submitting')}
            </>
          ) : (
            <>
              <Save className="size-4" />
              {isEditMode ? t('proposal.update') : t('proposal.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
