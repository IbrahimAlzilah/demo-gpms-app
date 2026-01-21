import { useTranslation } from 'react-i18next'
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ModalDialog, LoadingSpinner, useToast } from '@/components/common'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useProposalsNew } from './ProposalsNew.hook'

interface ProposalsNewProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ProposalsNew({ open, onClose, onSuccess }: ProposalsNewProps) {
  const { t } = useTranslation()
  const { toastError } = useToast()
  const {
    form,
    students,
    loadingStudents,
    studentSearch,
    handleSearchChange,
    handleSubmit,
    isSubmitting,
    resetForm,
  } = useProposalsNew(() => {
    resetForm()
    onSuccess?.()
    onClose()
  })

  const { register, formState: { errors }, watch, setValue } = form
  const submitterId = watch('submitterId')

  return (
    <ModalDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          resetForm()
          onClose()
        }
      }}
      title={t('committee.proposal.createTitle')}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Selection */}
        <div className="space-y-2">
          <Label htmlFor="submitterId">
            {t('committee.proposal.studentSearch')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={submitterId}
            onValueChange={(value) => setValue('submitterId', value, { shouldValidate: true })}
          >
            <SelectTrigger
              id="submitterId"
              className={errors.submitterId ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={t('committee.proposal.searchStudentPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <div className="p-2">
                <Input
                  placeholder={t('common.search')}
                  value={studentSearch}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="mb-2"
                />
              </div>
              {loadingStudents ? (
                <div className="p-2 flex justify-center">
                  <LoadingSpinner size="sm" />
                </div>
              ) : students?.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground text-sm">
                  {t('common.noResults')}
                </div>
              ) : (
                students?.map((student) => (
                  <SelectItem key={student.id} value={String(student.id)}>
                    {student.name} ({student.university_id})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.submitterId && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.submitterId.message}
            </p>
          )}
        </div>

        {/* Title */}
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

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">
            {t('proposal.description')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            {...register('description')}
            placeholder={t('proposal.descriptionPlaceholder')}
            rows={4}
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

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              resetForm()
              onClose()
            }}
            disabled={isSubmitting}
          >
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.creating')}
              </>
            ) : (
              t('common.create')
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
