import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useCreateProposal, useUpdateProposal } from '../../hooks/useProposalOperations'
import { useAuthStore } from '@/pages/auth/login'
import { usePeriodCheck } from '@/hooks/usePeriodCheck'
import { Button, Input, Textarea, Label } from '@/components/ui'
import { LoadingSpinner, FileUpload } from '@/components/common'
import { AlertCircle, Loader2, Calendar, X, Save } from 'lucide-react'
import { proposalFormSchema, type ProposalFormSchema } from '../../schema'
import { useToast } from '@/components/common'
import type { Proposal } from '@/types/project.types'

interface ProposalFormProps {
  proposal?: Proposal | null
  onSuccess?: () => void
}

export function ProposalForm({ proposal, onSuccess }: ProposalFormProps) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const createProposal = useCreateProposal()
  const updateProposal = useUpdateProposal()
  const isEditMode = !!proposal
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('proposal_submission')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const { toastSuccess, toastError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProposalFormSchema>({
    resolver: zodResolver(proposalFormSchema(t)),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (proposal) {
      reset({
        title: proposal.title || '',
        description: proposal.description || '',
      })
    }
  }, [proposal, reset])

  const onSubmit = async (data: ProposalFormSchema) => {
    if (!user) {
      toastError(t('proposal.authRequired'))
      return
    }

    // For edit mode, check if proposal can be modified
    if (isEditMode && proposal) {
      if (!proposal.canBeModified && proposal.status !== 'pending_review' && proposal.status !== 'requires_modification') {
        toastError(t('proposal.cannotEdit'))
        return
      }
    } else {
      // For create mode, check period
      if (!isPeriodActive) {
        toastError(t('proposal.periodClosed'))
        return
      }
    }

    try {
      if (isEditMode && proposal) {
        // Update existing proposal - only title and description in edit mode
        await updateProposal.mutateAsync({
          id: proposal.id,
          data: {
            title: data.title.trim(),
            description: data.description.trim(),
            // proposedSupervisorId and teamMembers are not editable
          },
        })
        toastSuccess('proposal.updateSuccess')
      } else {
        // Create new proposal
        await createProposal.mutateAsync({
          title: data.title.trim(),
          description: data.description.trim(),
          submitterId: user.id,
        })
        // Reset form and files
        reset()
        setAttachedFiles([])
        toastSuccess('proposal.createSuccess')
      }
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('proposal.submitError')
      toastError(errorMessage)
    }
  }

  const handleFileChange = (files: File[]) => {
    setAttachedFiles(files)
  }

  if (periodLoading) {
    return (<LoadingSpinner />)
  }

  // Only show period check for create mode, not edit mode
  if (!isEditMode && !isPeriodActive) {
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Removed inline error block */}

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
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset()
            setAttachedFiles([])
          }}
          disabled={createProposal.isPending || updateProposal.isPending}
          className='text-destructive hover:text-destructive/80'
        >
          <X className="size-4" />
          {t('common.cancel')}
        </Button>
        <Button
          type="submit"
          disabled={createProposal.isPending || updateProposal.isPending || (!isEditMode && !isPeriodActive)}
        >
          {(createProposal.isPending || updateProposal.isPending) ? (
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
