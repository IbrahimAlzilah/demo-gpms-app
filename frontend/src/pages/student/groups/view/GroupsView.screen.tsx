import { useTranslation } from 'react-i18next'
import { ModalDialog, LoadingSpinner } from '@/components/common'
import { useGroupsView } from './GroupsView.hook'

interface GroupsViewProps {
  groupId: string
  open: boolean
  onClose: () => void
}

export function GroupsView({ open, onClose }: GroupsViewProps) {
  const { t } = useTranslation()
  const { group, isLoading, error } = useGroupsView()

  if (isLoading) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('groups.groupDetails')}>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </ModalDialog>
    )
  }

  if (error || !group) {
    return (
      <ModalDialog open={open} onOpenChange={onClose} title={t('groups.groupDetails')}>
        <div className="text-center py-8 text-destructive">
          {t('groups.loadError')}
        </div>
      </ModalDialog>
    )
  }

  return (
    <ModalDialog open={open} onOpenChange={onClose} title={t('groups.groupDetails')}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">{t('groups.membersCount')}</p>
          <p className="text-sm text-muted-foreground">
            {group.members.length}/{group.maxMembers}
          </p>
        </div>
      </div>
    </ModalDialog>
  )
}
