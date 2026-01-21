import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/common'
import { apiClient } from '@/lib/axios'
import { useToast } from '@/components/common'
import { committeeProposalService } from '../api/proposal.service'

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
    const { success, error } = useToast()
    const queryClient = useQueryClient()

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [requirements, setRequirements] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<string>('')
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
    })

    const createMutation = useMutation({
        mutationFn: committeeProposalService.create,
        onSuccess: () => {
            success('committee.proposal.createSuccess')
            queryClient.invalidateQueries({ queryKey: ['committee-proposals'] })
            queryClient.invalidateQueries({ queryKey: ['committee-proposals-table'] })
            onOpenChange(false)
            // Reset form
            setTitle('')
            setDescription('')
            setRequirements('')
            setSelectedStudent('')
            setStudentSearch('')
        },
        onError: (err: any) => {
            error(err?.message || 'common.error')
        }
    })

    // Debounce search input (simple implementation)
    const handleSearchChange = (val: string) => {
        setStudentSearch(val)
        if (val === '') setSelectedStudent('')
    }

    const handleSubmit = () => {
        if (!title || !description || !selectedStudent) {
            error('common.fillRequiredFields')
            return
        }

        createMutation.mutate({
            title,
            description,
            requirements,
            submitterId: selectedStudent,
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t('committee.proposal.createTitle', { defaultValue: 'Create Proposal on behalf of Student' })}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('committee.proposal.studentSearch', { defaultValue: 'Select Student' })}</Label>
                        <div className="relative">
                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('committee.proposal.searchStudentPlaceholder', { defaultValue: 'Search by name or ID...' })} />
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
                                        <div className="p-2 flex justify-center"><LoadingSpinner className="h-4 w-4" /></div>
                                    ) : students?.length === 0 ? (
                                        <div className="p-2 text-center text-muted-foreground text-sm">{t('common.noResults')}</div>
                                    ) : (
                                        students?.map((student) => (
                                            <SelectItem key={student.id} value={String(student.id)}>
                                                {student.name} ({student.university_id})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>{t('proposal.title')}</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('proposal.titlePlaceholder')}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('proposal.description')}</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('proposal.descriptionPlaceholder')}
                            rows={4}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>{t('proposal.requirements')} ({t('common.optional')})</Label>
                        <Textarea
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('common.cancel')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
                        {t('common.create')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
