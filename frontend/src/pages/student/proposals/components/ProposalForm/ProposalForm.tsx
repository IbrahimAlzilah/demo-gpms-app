import { useTranslation } from 'react-i18next'
import { Button, Input, Textarea, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { LoadingSpinner, FileUpload } from '@/components/common'
import { AlertCircle, Loader2, Calendar, Plus, X, Save } from 'lucide-react'
import type { UseProposalFormReturn } from '../../hooks/useProposalForm'
import { useSupervisors } from '../../hooks/useSupervisors'
import { useMyGroup } from '@/pages/student/groups/hooks/useGroups'
import { useFieldArray } from 'react-hook-form'

interface ProposalFormProps {
  form: UseProposalFormReturn['form']
  attachedFiles: UseProposalFormReturn['attachedFiles']
  error: UseProposalFormReturn['error']
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
  error,
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
  const { register, formState: { errors }, control, watch } = form
  const { data: supervisors = [], isLoading: supervisorsLoading, error: supervisorsError } = useSupervisors()
  const { data: studentGroup, isLoading: groupLoading } = useMyGroup()
  const selectedGroupId = watch('studentGroupId')

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'teamMembers',
  })

  // Auto-select group if student is a member of one
  React.useEffect(() => {
    if (studentGroup) {
      form.setValue('studentGroupId', Number(studentGroup.id))
    }
  }, [studentGroup, form])

  if (periodLoading) {
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

  const handleAddMember = () => {
    append({ name: '', role: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

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

        <div className="space-y-2">
          <Label htmlFor="requirements">
            {t('proposal.requirements') || 'Requirements'}
          </Label>
          <Textarea
            id="requirements"
            {...register('requirements')}
            placeholder={t('proposal.requirementsPlaceholder') || 'Enter project requirements...'}
            rows={4}
            className={errors.requirements ? 'border-destructive' : ''}
            aria-invalid={!!errors.requirements}
          />
          {errors.requirements && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.requirements.message}
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
                onValueChange={(value) => form.setValue('studentGroupId', Number(value))}
                disabled={!!studentGroup} // Disable selection if user is already in a group
              >
                <SelectTrigger className={errors.studentGroupId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('proposal.selectGroupPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(studentGroup.id)}>
                    {studentGroup.name || `${t('proposal.group')} #${studentGroup.id}`}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
            {errors.studentGroupId && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.studentGroupId.message}
              </p>
            )}
            {studentGroup && (
              <p className="text-xs text-muted-foreground">
                {t('proposal.groupSubmissionAutoSelected') || 'You are submitting on behalf of your group.'}
              </p>
            )}
            {!studentGroup && isRegistrationWindow && (
              <p className="text-xs text-muted-foreground">
                {t('proposal.groupSubmissionNote')}
              </p>
            )}
          </div>
        )}

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
              onValueChange={(value) => form.setValue('proposedSupervisorId', Number(value))}
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
      </div>

      {/* Team Members Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-base font-semibold">{t('proposal.teamMembers')}</h3>
          </div>

          {!studentGroup && (
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMember}
              className="mb-4"
            >
              <Plus className="size-4" />
              {t('proposal.addMember')}
            </Button>
          )}
        </div>

        {studentGroup ? (
          <div className="p-4 border rounded-md bg-muted/20">
            <p className="text-sm font-medium mb-2">{t('proposal.groupMembers') || 'Group Members'}:</p>
            <ul className="list-disc list-inside space-y-1">
              {/* Display Leader */}
              {studentGroup.leader && (
                <li className="text-sm">
                  {studentGroup.leader.name} <span className="text-xs text-muted-foreground">({t('common.leader') || 'Leader'})</span>
                </li>
              )}
              {/* Display Members */}
              {studentGroup.members?.map((member) => (
                <li key={member.id} className="text-sm">
                  {member.name}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground mt-3">
              {t('proposal.groupSubmissionMessage') || 'This proposal will be submitted on behalf of all group members.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`teamMembers.${index}.name`}>
                    {t('proposal.memberName')}
                  </Label>
                  <Input
                    id={`teamMembers.${index}.name`}
                    {...register(`teamMembers.${index}.name`)}
                    placeholder={t('proposal.memberNamePlaceholder')}
                    className={errors.teamMembers?.[index]?.name ? 'border-destructive' : ''}
                  />
                  {errors.teamMembers?.[index]?.name && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.teamMembers[index]?.name?.message}
                    </p>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`teamMembers.${index}.role`}>
                    {t('proposal.role')}
                  </Label>
                  <Input
                    id={`teamMembers.${index}.role`}
                    {...register(`teamMembers.${index}.role`)}
                    placeholder={t('proposal.rolePlaceholder')}
                    className={errors.teamMembers?.[index]?.role ? 'border-destructive' : ''}
                  />
                  {errors.teamMembers?.[index]?.role && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.teamMembers[index]?.role?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => remove(index)}
                  className='text-destructive hover:text-destructive/80'
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                {t('proposal.noMembersAdded') || 'No team members added. You can add members if you are proposing a project individually.'}
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
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? t('proposal.update') : t('proposal.save')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
