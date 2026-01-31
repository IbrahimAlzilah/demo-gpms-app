import { useTranslation } from 'react-i18next'
import { ModalDialog, StatusBadge } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, IdCard, Building2, Briefcase, GraduationCap } from 'lucide-react'
import type { User as UserType } from '@/types/user.types'

interface UserViewDialogProps {
  user: UserType | null
  open: boolean
  onClose: () => void
}

export function UserViewDialog({ user, open, onClose }: UserViewDialogProps) {
  const { t } = useTranslation()

  if (!user) return null

  return (
    <ModalDialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={t('user.viewUser')}
      size="md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{user.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-primary/10 text-primary">
                {t(`roles.${user.role}`) || user.role}
              </span>
              <StatusBadge status={user.status} />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('user.userDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <IdCard className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">{t('user.username')}</p>
                <p className="text-sm font-mono">{user.username}</p>
              </div>
            </div>
            {user.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.email')}</p>
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>
            )}
            {user.studentId && (
              <div className="flex items-start gap-3">
                <IdCard className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('user.studentId')}</p>
                  <p className="text-sm font-mono">{user.studentId}</p>
                </div>
              </div>
            )}
            {user.empId && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.employeeId', { defaultValue: 'Employee ID' })}</p>
                  <p className="text-sm font-mono">{user.empId}</p>
                </div>
              </div>
            )}
            {user.department && (
              <div className="flex items-start gap-3">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">{t('user.department')}</p>
                  <p className="text-sm">{user.department}</p>
                </div>
              </div>
            )}
            {user.role === 'student' && (user.specialization || user.academicLevel) && (
              <div className="flex items-start gap-3">
                <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="space-y-2">
                  {user.specialization && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('user.specialization')}</p>
                      <p className="text-sm">{user.specialization}</p>
                    </div>
                  )}
                  {user.academicLevel && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('user.academicLevel')}</p>
                      <p className="text-sm">{user.academicLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ModalDialog>
  )
}
