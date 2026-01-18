import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, Card, CardContent, Button } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { AlertCircle, User, ArrowLeft } from 'lucide-react'
import { createProjectColumns } from '../components/table'
import { useProjectsList } from './ProjectsList.hook'
import { EvaluationForm } from '../../evaluation/components/EvaluationForm/EvaluationForm'
import type { Project } from '@/types/project.types'

interface ProjectsListProps {
  onProjectSelect?: (project: Project) => void
}

export function ProjectsList({ onProjectSelect }: ProjectsListProps = {}) {
  const navigate = useNavigate()
  const {
    data,
    state,
    openEvaluationModal,
    closeEvaluationModal,
    selectStudentForEvaluation,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
    t,
  } = useProjectsList()

  const columns = useMemo(
    () => createProjectColumns({
      t,
      onProjectSelect,
      navigate,
      onEvaluate: openEvaluationModal
    }),
    [t, onProjectSelect, navigate, openEvaluationModal]
  )

  const { evaluationModal } = state

  return (
    <>
      <BlockContent title={t('nav.projects')}>
        <DataTable
          columns={columns}
          data={data.projects}
          isLoading={data.isLoading}
          error={data.error}
          pageCount={pageCount}
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
          emptyMessage={t('supervisor.noProjects')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('supervisor.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* Evaluation Modal */}
      <ModalDialog
        open={evaluationModal.open}
        onOpenChange={(open) => !open && closeEvaluationModal()}
        title={
          evaluationModal.studentId
            ? t('supervisor.evaluateProject')
            : t('supervisor.selectStudentToEvaluate')
        }
        className="sm:max-w-[600px]"
      >
        {evaluationModal.project && (
          <div className="mt-2">
            {!evaluationModal.studentId ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  {t('supervisor.selectStudentDescription')}
                </p>
                <div className="grid gap-3">
                  {evaluationModal.project.students.map((student) => (
                    <Card
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors border-muted"
                      onClick={() => selectStudentForEvaluation(student.id)}
                    >
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            {student.email && (
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {t('nav.evaluation')}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mb-2 -ml-2 text-muted-foreground"
                  onClick={() => selectStudentForEvaluation('')} // Reset student selection
                >
                  <ArrowLeft className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                  {t('common.back')}
                </Button>

                <EvaluationForm
                  projectId={evaluationModal.project.id}
                  studentId={evaluationModal.studentId}
                  onSuccess={() => {
                    closeEvaluationModal()
                  }}
                />
              </div>
            )}
          </div>
        )}
      </ModalDialog>
    </>
  )
}
