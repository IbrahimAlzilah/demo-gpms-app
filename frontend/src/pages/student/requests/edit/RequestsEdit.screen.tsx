import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { Button, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { AlertCircle, Edit, Loader2, User, Users, Briefcase, MoreHorizontal, Type } from 'lucide-react'
import { useRequestsEdit } from './RequestsEdit.hook'
import { useRequestContext } from '../hooks/useRequestContext'
import { isLeaderOnlyRequestType } from '../types/Requests.types'
import type { Request } from '@/types/request.types'

interface RequestsEditProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  request: Request | null
}

export function RequestsEdit({ open, onClose, onSuccess, request }: RequestsEditProps) {
  const { t } = useTranslation()
  const { data: context } = useRequestContext()
  const { form, isLoading, handleSubmit } = useRequestsEdit(request, () => {
    onSuccess?.()
    onClose()
  })
  const { register, watch, setValue, formState: { errors } } = form
  const selectedType = watch('type')
  const reason = watch('reason')

  const isGroupLeader = context?.isGroupLeader ?? true

  const allRequestTypes: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: 'change_supervisor', label: t('requests.change_supervisor'), icon: <User className="h-4 w-4" /> },
    { value: 'change_group', label: t('requests.change_group'), icon: <Users className="h-4 w-4" /> },
    { value: 'change_project', label: t('requests.change_project'), icon: <Briefcase className="h-4 w-4" /> },
    { value: 'change_project_title', label: t('requests.change_project_title'), icon: <Type className="h-4 w-4" /> },
    { value: 'other', label: t('requests.other'), icon: <MoreHorizontal className="h-4 w-4" /> },
  ]

  const requestTypes = allRequestTypes.filter((type) => {
    if (isLeaderOnlyRequestType(type.value)) {
      return isGroupLeader || (request && request.type === type.value)
    }
    return true
  })

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('request.editRequest')}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
            <p className="text-xs text-destructive flex items-center gap-1">
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
            <p className="text-xs text-destructive flex items-center gap-1">
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
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !selectedType}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('request.updating')}
              </>
            ) : (
              <>
                <Edit className="size-4" />
                {t('request.update')}
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
