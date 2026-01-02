import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateRequest } from '../hooks/useRequests'
import { Button, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { AlertCircle, FileCheck, Loader2, User, Users, Briefcase, MoreHorizontal } from 'lucide-react'
import { requestSubmissionSchema, type RequestSubmissionSchema } from '../schema'

interface RequestSubmissionFormProps {
  onSuccess?: () => void
}

export function RequestSubmissionForm({ onSuccess }: RequestSubmissionFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<RequestSubmissionSchema>({
    resolver: zodResolver(requestSubmissionSchema(t)),
    defaultValues: {
      type: undefined,
      reason: '',
      projectId: undefined,
    },
  })
  const createRequest = useCreateRequest()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const selectedType = watch('type')
  const reason = watch('reason')

  const requestTypes: { value: string; label: string; icon: React.ReactNode }[] = [
    {
      value: 'change_supervisor',
      label: t('request.changeSupervisor'),
      icon: <User className="h-4 w-4" />,
    },
    {
      value: 'change_group',
      label: t('request.changeGroup'),
      icon: <Users className="h-4 w-4" />,
    },
    {
      value: 'change_project',
      label: t('request.changeProject'),
      icon: <Briefcase className="h-4 w-4" />,
    },
    {
      value: 'other',
      label: t('request.other'),
      icon: <MoreHorizontal className="h-4 w-4" />,
    },
  ]

  const onSubmit = async (data: RequestSubmissionSchema) => {
    setError('')
    setSuccess(false)

    try {
      await createRequest.mutateAsync({
        type: data.type,
        reason: data.reason.trim(),
        projectId: data.projectId,
      })
      setSuccess(true)
      reset()
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('request.submitError')
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3 text-sm text-success bg-success/10 border border-success/20 rounded-md">
          <FileCheck className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            {t('request.submitSuccess')}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="type">
          {t('request.type')} <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedType}
          onValueChange={(value) => setValue('type', value as "change_supervisor" | "change_group" | "change_project" | "other")}
        >
          <SelectTrigger
            id="type"
            className={errors.type ? 'border-destructive' : ''}
          >
            <SelectValue placeholder={t('request.selectType')} />
          </SelectTrigger>
          <SelectContent>
            {requestTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div className="flex items-center gap-2">
                  {type.icon}
                  {type.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.type.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">
          {t('request.reason')} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="reason"
          {...register('reason')}
          placeholder={t('request.reasonPlaceholder')}
          rows={5}
          className={errors.reason ? 'border-destructive' : ''}
          aria-invalid={!!errors.reason}
        />
        {errors.reason && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.reason.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {reason?.length || 0} / 20 {t('common.characters')}
        </p>
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset()
            setError('')
            setSuccess(false)
          }}
          disabled={createRequest.isPending}
          className="flex-1"
        >
          {t('common.reset')}
        </Button>
        <Button
          type="submit"
          disabled={createRequest.isPending || success || !selectedType}
          className="flex-1"
        >
          {createRequest.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('request.submitting')}
            </>
          ) : (
            <>
              <FileCheck className="mr-2 h-4 w-4" />
              {t('request.submit')}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

