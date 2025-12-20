import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../auth/store/auth.store'
import { useProjects } from '../hooks/useProjects'
import { usePeriodCheck } from '../../../hooks/usePeriodCheck'
import { DocumentUpload } from './DocumentUpload'
import type { Document } from '../../../types/request.types'
import { createDocumentColumns } from './DocumentTableColumns'
import { useDataTable } from '@/hooks/useDataTable'
import { documentService } from '../api/document.service'
import { DataTable, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BlockContent, ModalDialog, StatusBadge } from '@/components/common'
import { AlertCircle, PlusCircle, FolderOpen, CheckCircle2, XCircle, Clock, Calendar, AlertTriangle, Download, MessageSquare } from 'lucide-react'
import { formatDate, formatFileSize } from '@/lib/utils/format'

export function DocumentManagement() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: projects } = useProjects()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('document_submission')
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Get user's project
  const userProject = projects?.find((p) => p.students.some((s) => s.id === user?.id))

  // Set default project if user has one
  useEffect(() => {
    if (!selectedProjectId && userProject) {
      setTimeout(() => {
        setSelectedProjectId(userProject.id)
      }, 0)
    }
  }, [selectedProjectId, userProject])

  const {
    data: documents,
    pageCount,
    isLoading,
    error,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    globalFilter,
    setGlobalFilter,
    pagination,
    setPagination,
  } = useDataTable({
    queryKey: ['student-documents-table', selectedProjectId || ''],
    queryFn: (params) => documentService.getTableData(params, selectedProjectId),
    initialPageSize: 10,
    enableServerSide: true,
  })

  const columns = useMemo(
    () =>
      createDocumentColumns({
        onView: (document) => {
          setSelectedDocument(document)
        },
        t,
      }),
    [t]
  )

  const handleFormSuccess = () => {
    setShowUploadForm(false)
  }

  // Calculate statistics
  const stats = useMemo(() => {
    if (!documents) return { total: 0, pending: 0, approved: 0, rejected: 0 }

    return {
      total: documents.length,
      pending: documents.filter((d: Document) => d.reviewStatus === 'pending').length,
      approved: documents.filter((d: Document) => d.reviewStatus === 'approved').length,
      rejected: documents.filter((d: Document) => d.reviewStatus === 'rejected').length,
    }
  }, [documents])

  const actions = useMemo(() => (
    isPeriodActive && selectedProjectId ? (
      <Button onClick={() => setShowUploadForm(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {t('document.uploadNew')}
      </Button>
    ) : null
  ), [t, isPeriodActive, selectedProjectId])

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
          <p className="text-sm text-muted-foreground line-clamp-2">{userProject?.description}</p>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {stats.total > 0 && (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('document.total')}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('document.status.pending')}</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('document.status.approved')}</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('document.status.rejected')}</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </div>
        </div>
      )}

      <BlockContent title={t('nav.documents')} actions={actions}>
        <DataTable
          columns={columns}
          data={documents}
          isLoading={isLoading || periodLoading}
          error={error}
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

      {error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('document.loadError')}</span>
          </div>
        </BlockContent>
      )}

      <ModalDialog
        open={showUploadForm}
        onOpenChange={setShowUploadForm}
        title={t('document.uploadNew')}
      >
        {selectedProjectId && (
          <DocumentUpload
            projectId={selectedProjectId}
            onSuccess={handleFormSuccess}
          />
        )}
      </ModalDialog>

      {/* Document Detail Dialog */}
      {selectedDocument && (
        <ModalDialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)} title={selectedDocument.fileName}>
          <div className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <StatusBadge status={`reviewStatus_${selectedDocument.reviewStatus}`} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">{t('document.type')}</p>
                  <p className="text-sm font-medium">{selectedDocument.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('document.size')}</p>
                  <p className="text-sm font-medium">{formatFileSize(selectedDocument.fileSize)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('document.submittedAt')}</p>
                  <p className="text-sm font-medium">{formatDate(selectedDocument.createdAt)}</p>
                </div>
                {selectedDocument.reviewedAt && (
                  <div>
                    <p className="text-xs text-muted-foreground">{t('document.reviewedAt')}</p>
                    <p className="text-sm font-medium">{formatDate(selectedDocument.reviewedAt)}</p>
                  </div>
                )}
              </div>

              {selectedDocument.reviewComments && (
                <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium">{t('document.reviewComments')}</h4>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{selectedDocument.reviewComments}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedDocument.fileUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedDocument.fileUrl, '_blank')}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('document.download')}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setSelectedDocument(null)}
                >
                  {t('common.close')}
                </Button>
              </div>
            </div>
          </div>
        </ModalDialog>
      )}
    </>
  )
}



