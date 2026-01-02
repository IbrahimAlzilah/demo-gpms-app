import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useCreateSupervisorProposal } from '../hooks/useProposals'
import { useAuthStore } from '../../auth/store/auth.store'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { LoadingSpinner, FileUpload } from '@/components/common'
import { AlertCircle, FileText, Loader2, Calendar } from 'lucide-react'
import { proposalSchema, type ProposalSchema } from '../../student/schema'

interface ProposalFormProps {
  onSuccess?: () => void
}

export function SupervisorProposalForm({ onSuccess }: ProposalFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const createProposal = useCreateSupervisorProposal()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('proposal_submission')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProposalSchema>({
    resolver: zodResolver(proposalSchema(t)),
    defaultValues: {
      title: '',
      description: '',
      objectives: '',
      methodology: '',
      expectedOutcomes: '',
    },
  })

  const title = watch('title')
  const description = watch('description')
  const objectives = watch('objectives')

  const onSubmit = async (data: ProposalSchema) => {
    if (!user) {
      setError(t('proposal.authRequired'))
      return
    }

    if (!isPeriodActive) {
      setError(t('proposal.periodClosed'))
      return
    }

    setError('')

    try {
      await createProposal.mutateAsync({
        title: data.title.trim(),
        description: data.description.trim(),
        objectives: data.objectives.trim(),
        methodology: data.methodology?.trim(),
        expectedOutcomes: data.expectedOutcomes?.trim(),
        submitterId: user.id,
      })

      // Reset form and files
      reset()
      setAttachedFiles([])
      setError('')
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('proposal.submitError')
      )
    }
  }

  const handleFileChange = (files: File[]) => {
    setAttachedFiles(files)
    setError('')
  }

  if (periodLoading) {
    return (<LoadingSpinner />)
  }

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className='grid grid-cols-2 gap-4'>
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
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.title.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {title?.length || 0} / 200 {t('common.characters')}
          </p>
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
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.description.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {description?.length || 0} {t('common.characters')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="objectives">
            {t('proposal.objectives')} <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="objectives"
            {...register('objectives')}
            placeholder={t('proposal.objectivesPlaceholder')}
            rows={4}
            className={errors.objectives ? 'border-destructive' : ''}
            aria-invalid={!!errors.objectives}
          />
          {errors.objectives && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.objectives.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            {objectives?.length || 0} {t('common.characters')}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="methodology">
            {t('proposal.methodology')} ({t('common.optional')})
          </Label>
          <Textarea
            id="methodology"
            {...register('methodology')}
            placeholder={t('proposal.methodologyPlaceholder')}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedOutcomes">
            {t('proposal.expectedOutcomes')} ({t('common.optional')})
          </Label>
          <Textarea
            id="expectedOutcomes"
            {...register('expectedOutcomes')}
            placeholder={t('proposal.expectedOutcomesPlaceholder')}
            rows={4}
          />
        </div>

        <div className="space-y-2 col-span-2">
          <Label>
            {t('proposal.attachments')} ({t('common.optional')})
          </Label>
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
      </div>
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset()
            setAttachedFiles([])
            setError('')
          }}
          disabled={createProposal.isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={createProposal.isPending || !isPeriodActive}
        >
          {createProposal.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('proposal.submitting')}
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {t('proposal.submit')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
