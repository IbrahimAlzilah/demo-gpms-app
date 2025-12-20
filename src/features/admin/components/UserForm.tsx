import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { useCreateUser, useUpdateUser } from '../hooks/useUsers'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { AlertCircle, Loader2, UserPlus, UserCog } from 'lucide-react'
import type { User, UserRole, UserStatus } from '../../../types/user.types'
import { userSchema, type UserSchema } from '../schema'

interface UserFormProps {
  user?: User | null
  onSuccess?: () => void
  onCancel?: () => void
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<UserSchema>({
    resolver: zodResolver(userSchema(t)),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          studentId: user.studentId,
          department: user.department,
          phone: user.phone,
        }
      : {
          status: 'active',
        },
  })
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isEditing = !!user
  const selectedRole = watch('role')
  const selectedStatus = watch('status')

  const onSubmit = async (data: UserSchema) => {
    try {
      if (isEditing && user) {
        await updateUser.mutateAsync({ id: user.id, data })
      } else {
        await createUser.mutateAsync(data)
      }
      onSuccess?.()
    } catch (err) {
      console.error('Error saving user:', err)
    }
  }

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'student', label: t('roles.student') || 'طالب' },
    { value: 'supervisor', label: t('roles.supervisor') || 'مشرف' },
    {
      value: 'discussion_committee',
      label: t('roles.discussion_committee') || 'لجنة المناقشة',
    },
    {
      value: 'projects_committee',
      label: t('roles.projects_committee') || 'لجنة المشاريع',
    },
    { value: 'admin', label: t('roles.admin') || 'مدير النظام' },
  ]

  const statusOptions: { value: UserStatus; label: string }[] = [
    { value: 'active', label: t('user.status.active') || 'نشط' },
    { value: 'inactive', label: t('user.status.inactive') || 'غير نشط' },
    { value: 'suspended', label: t('user.status.suspended') || 'معلق' },
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b">
        {isEditing ? (
          <UserCog className="h-5 w-5 text-primary" />
        ) : (
          <UserPlus className="h-5 w-5 text-primary" />
        )}
        <h3 className="text-lg font-semibold">
          {isEditing
            ? t('user.editUser') || 'تعديل المستخدم'
            : t('user.createUser') || 'إضافة مستخدم جديد'}
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">
            {t('common.name')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {t('common.email')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
            aria-invalid={!!errors.email}
            disabled={isEditing}
          />
          {errors.email && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
          {isEditing && (
            <p className="text-xs text-muted-foreground">
              {t('user.emailCannotBeChanged') || 'لا يمكن تغيير البريد الإلكتروني'}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">
            {t('user.role')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedRole}
            onValueChange={(value) => setValue('role', value as UserRole)}
          >
            <SelectTrigger
              id="role"
              className={errors.role ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={t('user.selectRole') || 'اختر الدور'} />
            </SelectTrigger>
            <SelectContent>
              {roleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.role.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">
            {t('common.status')} <span className="text-destructive">*</span>
          </Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setValue('status', value as UserStatus)}
          >
            <SelectTrigger
              id="status"
              className={errors.status ? 'border-destructive' : ''}
            >
              <SelectValue placeholder={t('user.selectStatus') || 'اختر الحالة'} />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {errors.status.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="studentId">{t('user.studentId') || 'رقم الطالب'}</Label>
          <Input
            id="studentId"
            {...register('studentId')}
            placeholder={t('user.studentIdPlaceholder') || 'رقم الطالب (اختياري)'}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">{t('user.department') || 'القسم'}</Label>
          <Input
            id="department"
            {...register('department')}
            placeholder={t('user.departmentPlaceholder') || 'القسم (اختياري)'}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('user.phone') || 'رقم الهاتف'}</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder={t('user.phonePlaceholder') || 'رقم الهاتف (اختياري)'}
          className={errors.phone ? 'border-destructive' : ''}
        />
        {errors.phone && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button
          type="submit"
          disabled={createUser.isPending || updateUser.isPending}
          className="flex-1"
        >
          {createUser.isPending || updateUser.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.saving') || 'جاري الحفظ...'}
            </>
          ) : isEditing ? (
            t('common.update') || 'تحديث'
          ) : (
            t('common.create') || 'إنشاء'
          )}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}

