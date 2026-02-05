import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalDialog } from '@/components/common'
import { Button, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Input } from '@/components/ui'
import { AlertCircle, FileCheck, Loader2, User, Users, Briefcase, MoreHorizontal, Type } from 'lucide-react'
import { useRequestsNew } from './RequestsNew.hook'
import { useRequestContext } from '../hooks/useRequestContext'
import type { RequestType } from '@/types/request.types'

interface RequestsNewProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function RequestsNew({ open, onClose, onSuccess }: RequestsNewProps) {
  const { t } = useTranslation()
  const { form, isLoading, handleSubmit } = useRequestsNew(onSuccess)
  const { register, watch, setValue, formState: { errors } } = form
  const selectedType = watch('type') as RequestType | undefined
  const reason = watch('reason')
  const title = watch('title')
  const proposedSupervisorId = watch('proposedSupervisorId')
  const targetGroupId = watch('targetGroupId')
  const targetProjectId = watch('targetProjectId')

  const { data: context, isLoading: contextLoading } = useRequestContext()

  useEffect(() => {
    if (!selectedType) {
      setValue('proposedSupervisorId', undefined)
      setValue('targetGroupId', undefined)
      setValue('targetProjectId', undefined)
      setValue('title', '')
    }
  }, [selectedType, setValue])

  const requestTypes: { value: RequestType; label: string; icon: React.ReactNode }[] = [
    { value: 'change_supervisor', label: t('requests.change_supervisor'), icon: <User className="h-4 w-4" /> },
    { value: 'change_group', label: t('requests.change_group'), icon: <Users className="h-4 w-4" /> },
    { value: 'change_project', label: t('requests.change_project'), icon: <Briefcase className="h-4 w-4" /> },
    { value: 'change_project_title', label: t('requests.change_project_title'), icon: <Type className="h-4 w-4" /> },
    { value: 'other', label: t('requests.other'), icon: <MoreHorizontal className="h-4 w-4" /> },
  ]

  const currentSupervisor = context?.currentSupervisor ?? null
  const currentGroup = context?.currentGroup ?? null
  const currentProject = context?.currentProject ?? null
  const availableSupervisors = context?.availableSupervisors ?? []
  const availableGroups = context?.availableGroups ?? []
  const availableProjects = context?.availableProjects ?? []
  const isGroupLeader = context?.isGroupLeader ?? false
  const requestSubmissionWindowActive = context?.requestSubmissionWindowActive ?? false
  const canSubmitLeaderOnlyRequests = context?.canSubmitLeaderOnlyRequests ?? false

  const leaderOnlyTypes: RequestType[] = ['change_supervisor', 'change_project', 'change_project_title']
  const filteredRequestTypes = requestTypes.filter((type) => {
    if (leaderOnlyTypes.includes(type.value)) {
      return isGroupLeader
    }
    return true
  })

  const selectedTypeIsLeaderOnly = selectedType && leaderOnlyTypes.includes(selectedType)
  const cannotSubmitLeaderOnly = selectedTypeIsLeaderOnly && !canSubmitLeaderOnlyRequests
  const cannotSubmitChangeSupervisor = selectedType === 'change_supervisor' && !currentSupervisor
  const submissionPeriodClosed = !requestSubmissionWindowActive
  const cannotSubmit =
    submissionPeriodClosed || cannotSubmitLeaderOnly || cannotSubmitChangeSupervisor

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('request.submitNew')}>
      {submissionPeriodClosed && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20 p-3 text-sm text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 rounded-full border border-current p-0.5" aria-hidden />
          <p className="flex-1">{t('request.conditions.submissionPeriodClosed')}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="type">
            {t('request.type')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedType ?? ''}
            onValueChange={(value) => setValue('type', value as RequestType)}
          >
            <SelectTrigger id="type" className={errors.type ? 'border-destructive' : ''}>
              <SelectValue placeholder={t('request.selectType')} />
            </SelectTrigger>
            <SelectContent>
              {filteredRequestTypes.map((type) => (
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

          {cannotSubmit && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="h-3 w-3 shrink-0 mt-0.5" />
              <div>
                {submissionPeriodClosed && (
                  <p>{t('request.conditions.submissionPeriodClosed')}</p>
                )}
                {!submissionPeriodClosed && cannotSubmitChangeSupervisor && (
                  <p>{t('request.conditions.noSupervisorAssigned')}</p>
                )}
                {!submissionPeriodClosed && !cannotSubmitChangeSupervisor && cannotSubmitLeaderOnly && !currentProject && (
                  <p>{t('request.conditions.groupMustHaveApprovedProject')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Change Supervisor: current supervisor + proposed supervisor select */}
        {selectedType === 'change_supervisor' && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label>{t('request.currentSupervisor')}</Label>
              <p className="text-sm text-muted-foreground">
                {contextLoading
                  ? t('common.loading')
                  : currentSupervisor
                    ? currentSupervisor.name
                    : t('request.noCurrentSupervisor')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proposedSupervisorId">
                {t('request.proposedSupervisor')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={proposedSupervisorId ?? ''}
                onValueChange={(value) => setValue('proposedSupervisorId', value)}
              >
                <SelectTrigger id="proposedSupervisorId" className={errors.proposedSupervisorId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('request.selectProposedSupervisor')} />
                </SelectTrigger>
                <SelectContent>
                  {availableSupervisors
                    .filter((s) => s.id !== currentSupervisor?.id)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.proposedSupervisorId && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.proposedSupervisorId.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Change Group: current group name only + target group select with members */}
        {selectedType === 'change_group' && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label>{t('request.currentGroup')}</Label>
              <p className="text-sm text-muted-foreground">
                {contextLoading
                  ? t('common.loading')
                  : currentGroup
                    ? (currentGroup.name || currentGroup.groupCode) ?? t('request.myGroup')
                    : t('request.noCurrentGroup')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetGroupId">
                {t('request.targetGroup')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetGroupId ?? ''}
                onValueChange={(value) => setValue('targetGroupId', value)}
              >
                <SelectTrigger id="targetGroupId" className={errors.targetGroupId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('request.selectTargetGroup')} />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      <div>
                        <span className="font-medium">{g.name || g.groupCode}</span>
                        {g.members?.length ? (
                          <span className="text-xs text-muted-foreground ml-2">
                            ({t('request.members')}: {g.members.map((m) => m.name).join(', ')})
                          </span>
                        ) : null}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetGroupId && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetGroupId.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Change Project: current project + target project select */}
        {selectedType === 'change_project' && (
          <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
            <div className="space-y-2">
              <Label>{t('request.currentProject')}</Label>
              <p className="text-sm text-muted-foreground">
                {contextLoading ? t('common.loading') : currentProject?.title ?? t('request.noCurrentProject')}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetProjectId">
                {t('request.targetProject')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={targetProjectId ?? ''}
                onValueChange={(value) => setValue('targetProjectId', value)}
              >
                <SelectTrigger id="targetProjectId" className={errors.targetProjectId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('request.selectTargetProject')} />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects
                    .filter((p) => p.id !== currentProject?.id)
                    .map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.targetProjectId && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.targetProjectId.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Change Project Title + Other: title field */}
        {(selectedType === 'change_project_title' || selectedType === 'other') && (
          <div className="space-y-2">
            <Label htmlFor="title">
              {selectedType === 'other' ? t('request.requestTitle') : t('request.newProjectTitle')}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              {...register('title')}
              placeholder={
                selectedType === 'other' ? t('request.requestTitlePlaceholder') : t('request.newProjectTitlePlaceholder')
              }
              className={errors.title ? 'border-destructive' : ''}
              maxLength={255}
            />
            {errors.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
          </div>
        )}

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
            onClick={() => form.reset()}
            disabled={isLoading}
            className="flex-1"
          >
            {t('common.reset')}
          </Button>
          <Button type="submit" disabled={isLoading || !selectedType || cannotSubmit} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('request.submitting')}
              </>
            ) : (
              <>
                <FileCheck className="size-4" />
                {t('request.submit')}
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalDialog>
  )
}
