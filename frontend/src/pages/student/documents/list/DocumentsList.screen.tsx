import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { DataTable, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BlockContent, ModalDialog } from '@/components/common'
import { PlusCircle, FolderOpen, AlertCircle, Calendar, AlertTriangle } from 'lucide-react'
import { createDocumentColumns } from '../components/table'
import { StatisticsCards } from '../components/StatisticsCards'
import { DocumentsNew } from '../new/DocumentsNew.screen'
import { DocumentsView } from '../view/DocumentsView.screen'
import { useDocumentsList } from './DocumentsList.hook'

export function DocumentsList() {
  const { t } = useTranslation()
  const {
    data,
    state,
    setState,
    userProject,
    isPeriodActive,
    periodLoading,
    pageCount,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDocumentsList()

  const columns = useMemo(
    () =>
      createDocumentColumns({
        onView: (document) => {
          setState((prev) => ({ ...prev, selectedDocument: document }))
        },
        t,
      }),
    [t, setState]
  )

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showUploadForm: false }))
  }

  const actions = useMemo(
    () =>
      isPeriodActive && state.selectedProjectId ? (
        <Button onClick={() => setState((prev) => ({ ...prev, showUploadForm: true }))}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('document.uploadNew')}
        </Button>
      ) : null,
    [t, isPeriodActive, state.selectedProjectId, setState]
  )

  if (!userProject) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">{t('document.noProject')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('document.noProjectDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Period Status */}
      {!isPeriodActive && !periodLoading && (
        <Card className="border-warning mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <CardTitle>{t('document.periodClosed')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <Calendar className="h-5 w-5 text-warning mt-0.5" />
              <div>
                <p className="text-sm font-medium text-warning-foreground">
                  {t('document.periodClosedMessage')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t('document.periodClosedDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('document.currentProject')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{userProject?.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {userProject?.description}
          </p>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <StatisticsCards statistics={data.statistics} t={t} />

      <BlockContent title={t('nav.documents')} actions={actions}>
        <DataTable
          columns={columns}
          data={data.documents}
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
          emptyMessage={t('document.noDocuments')}
        />
      </BlockContent>

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('document.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* Upload Document Modal */}
      {state.selectedProjectId && (
        <DocumentsNew
          projectId={state.selectedProjectId}
          open={state.showUploadForm}
          onClose={() => setState((prev) => ({ ...prev, showUploadForm: false }))}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* View Document Modal */}
      {state.selectedDocument && (
        <DocumentsView
          documentId={state.selectedDocument.id}
          open={!!state.selectedDocument}
          onClose={() => setState((prev) => ({ ...prev, selectedDocument: null }))}
        />
      )}
    </>
  )
}
