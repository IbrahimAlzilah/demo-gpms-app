import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { ModalDialog, LoadingSpinner, useToast } from '@/components/common'
import { apiClient } from '@/lib/axios'
import { AlertCircle, Loader2 } from 'lucide-react'
import { committeeProposalService } from '../api/proposal.service'
import { proposalCreateSchema, type ProposalCreateSchema } from '../schema/proposal-create.schema'

interface Student {
    id: string
    name: string
    email: string
    university_id: string
}

interface ProposalCreateDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ProposalCreateDialog({ open, onOpenChange }: ProposalCreateDialogProps) {
    const { t } = useTranslation()
    const { toastSuccess, toastError } = useToast()
    const queryClient = useQueryClient()

    const form = useForm<ProposalCreateSchema>({
        resolver: zodResolver(proposalCreateSchema(t)),
        defaultValues: {
            submitterId: '',
            title: '',
            description: '',
        },
    })

    const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = form
    const submitterId = watch('submitterId')
    const [studentSearch, setStudentSearch] = useState('')

    // Search students query
    const { data: students, isLoading: loadingStudents } = useQuery({
        queryKey: ['students-search', studentSearch],
        queryFn: async () => {
            const response = await apiClient.get<Student[]>('/projects-committee/proposals/students/search', {
                params: { query: studentSearch }
            })
            return response.data
        },
        enabled: open,
        staleTime: 0,
        refetchOnMount: true,
    })

    const createMutation = useMutation({
        mutationFn: committeeProposalService.create,
        onSuccess: () => {
            toastSuccess('committee.proposal.createSuccess')
            queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
            queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
            reset()
            setStudentSearch('')
            onOpenChange(false)
        },
        onError: (err: any) => {
            const errorMsg = err?.response?.data?.message || err?.message || 'common.error'
            toastError(errorMsg)
        }
    })

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            reset()
            setStudentSearch('')
        }
    }, [open, reset])

    const onSubmit = async (data: ProposalCreateSchema) => {
        createMutation.mutate({
            title: data.title,
            description: data.description,
            submitterId: data.submitterId,
        })
    }

    const handleSearchChange = (val: string) => {
        setStudentSearch(val)
        if (val === '') {
            setValue('submitterId', '')
        }
    }

    return (
        <ModalDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t('committee.proposal.createTitle')}
            size="lg"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        onClick={() => onOpenChange(false)}
                        disabled={createMutation.isPending}
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? (
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
