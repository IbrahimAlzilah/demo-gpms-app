import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { DataTable, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { AlertCircle, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants/constants'
import { createProjectsColumns } from '../components/table'
import { useProjectsList } from './ProjectsList.hook'
import { committeeProjectService } from '../../announce-projects/api/project.service'
import type { Project } from '@/types/project.types'

export function ProjectsList() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { toastSuccess, toastError } = useToast()
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

    const deleteProject = useMutation({
        mutationFn: (id: string) => committeeProjectService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['committee-projects'] })
            toastSuccess(t('committee.projectManagement.deleted'))
            setProjectToDelete(null)
        },
        onError: (e) => {
            toastError(e instanceof Error ? e.message : t('common.error'))
        },
    })

    const {
        data,
        state,
        setState,
        viewStatus,
        setViewStatus,
        totalCount,
        pageCount,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        globalFilter,
        setGlobalFilter,
        pagination,
        setPagination,
    } = useProjectsList()

    const columns = useMemo(
        () =>
            createProjectsColumns({
                onView: (project) => navigate(ROUTES.PROJECTS_COMMITTEE.PROJECT_DETAIL(project.id)),
                onEdit: (project) => navigate(ROUTES.PROJECTS_COMMITTEE.PROJECT_DETAIL(project.id)),
                onDelete: (project) => setProjectToDelete(project),
                t,
            }),
        [navigate, t]
    )

    const actions = (
        <Button asChild>
            <Link to={ROUTES.PROJECTS_COMMITTEE.ANNOUNCE_PROJECTS}>
                <Megaphone className="size-4" />
                {t('dashboard.committee.announceProjects', { defaultValue: 'Announce Projects' })}
            </Link>
        </Button>
    )

    return (
        <>
            <BlockContent title={t('nav.projects')} variant="data-table" actions={actions}>
                <DataTable
                    toolbarContent={
                        <Select
                            value={viewStatus}
                            onValueChange={(value) => setViewStatus(value as 'all' | 'draft' | 'available_for_registration' | 'in_progress')}
                        >
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder={t('common.filterByStatus')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    {t('common.all')}
                                </SelectItem>
                                <SelectItem value="draft">
                                    {t('committee.announce.approvedProjects')}
                                </SelectItem>
                                <SelectItem value="available_for_registration">
                                    {t('committee.announce.announcedProjects')}
                                </SelectItem>
                                <SelectItem value="in_progress">
                                    {t('status.in_progress', { defaultValue: 'In Progress' })}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    }
                    columns={columns}
                    data={data.projects}
                    isLoading={data.isLoading}
                    error={data.error}
                    pageCount={pageCount}
                    totalCount={totalCount}
                    pageIndex={pagination.pageIndex}
                    pageSize={pagination.pageSize}
                    onPaginationChange={(pageIndex, pageSize) => {
                        setPagination({ pageIndex, pageSize })
                    }}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    columnFilters={columnFilters}
                    onColumnFiltersChange={setColumnFilters}
                    searchValue={globalFilter}
                    onSearchChange={setGlobalFilter}
                    enableFiltering={true}
                    enableViews={true}
                    emptyMessage={t('committee.projects.noProjects', { defaultValue: 'No projects found' })}
                />
            </BlockContent>

            {data.error && (
                <BlockContent variant="container" className="border-destructive">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        <span>{t('committee.projects.loadError', { defaultValue: 'Error loading projects' })}</span>
                    </div>
                </BlockContent>
            )}

            <ConfirmDialog
                open={!!projectToDelete}
                onOpenChange={(open) => !open && setProjectToDelete(null)}
                onConfirm={() => projectToDelete && deleteProject.mutate(projectToDelete.id)}
                title={t('committee.projectManagement.confirmDelete', { defaultValue: 'Delete project?' })}
                description={projectToDelete ? t('committee.projectManagement.confirmDeleteDescription', { defaultValue: 'This project will be permanently removed. This action cannot be undone.' }) : undefined}
                confirmLabel={t('common.delete')}
                variant="destructive"
            />
        </>
    )
}
