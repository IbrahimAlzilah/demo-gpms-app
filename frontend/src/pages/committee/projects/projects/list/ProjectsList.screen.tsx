import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { DataTable, Button, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui'
import { BlockContent } from '@/components/common'
import { AlertCircle, Megaphone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { createProjectsColumns } from '../components/table'
import { useProjectsList } from './ProjectsList.hook'

export function ProjectsList() {
    const { t } = useTranslation()
    const navigate = useNavigate()

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
        </>
    )
}
