import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MainLayout } from '../../app/layouts/MainLayout'
import { DocumentUpload } from '../../features/student/components/DocumentUpload'
import { useDocuments } from '../../features/student/hooks/useDocuments'
import { useProjects } from '../../features/student/hooks/useProjects'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { usePeriodCheck } from '../../hooks/usePeriodCheck'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { LoadingSpinner } from '../../components/common/LoadingSpinner'
import { EmptyState } from '../../components/common/EmptyState'
import { StatusBadge } from '../../components/common/StatusBadge'
import { StatusFilter, type FilterOption } from '../../components/common/StatusFilter'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { FolderOpen, Upload, File, CheckCircle2, XCircle, Clock, MessageSquare, Download, AlertTriangle, Calendar } from 'lucide-react'
import { formatDate, formatFileSize, formatRelativeTime } from '../../lib/utils/format'
import type { DocumentType } from '../../types/request.types'

export function DocumentsPage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { data: projects } = useProjects()
  const { isPeriodActive, isLoading: periodLoading } = usePeriodCheck('document_submission')
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()
  const [documentType, setDocumentType] = useState<DocumentType | undefined>()
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const { data: documents, isLoading } = useDocuments(selectedProjectId)

  // Get user's project
  const userProject = projects?.find((p) => p.students.some((s) => s.id === user?.id))

  // Set default project if user has one
  useEffect(() => {
    if (!selectedProjectId && userProject) {
      setSelectedProjectId(userProject.id)
    }
  }, [selectedProjectId, userProject])

  const documentTypeOptions: FilterOption[] = [
    { value: 'proposal', label: t('document.type.proposal') || 'المقترح' },
    { value: 'chapters', label: t('document.type.chapters') || 'الفصول' },
    { value: 'final_report', label: t('document.type.finalReport') || 'التقرير النهائي' },
    { value: 'code', label: t('document.type.code') || 'الأكواد' },
    { value: 'presentation', label: t('document.type.presentation') || 'العرض' },
    { value: 'other', label: t('document.type.other') || 'أخرى' },
  ]

  const statusOptions: FilterOption[] = [
    { value: 'pending', label: t('document.status.pending') || 'قيد المراجعة' },
    { value: 'approved', label: t('document.status.approved') || 'معتمد' },
    { value: 'rejected', label: t('document.status.rejected') || 'مرفوض' },
  ]

  const getDocumentTypeLabel = (type: DocumentType) => {
    return documentTypeOptions.find((opt) => opt.value === type)?.label || type
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-warning" />
    }
  }

  const selectedDocumentData = selectedDocument
    ? documents?.find((d) => d.id === selectedDocument)
    : null

  const filteredDocuments = documents?.filter((doc) => {
    const typeMatch = !documentType || doc.type === documentType
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(doc.reviewStatus)
    return typeMatch && statusMatch
  })

  if (isLoading || periodLoading) {
    return (
      <MainLayout>
        <LoadingSpinner />
      </MainLayout>
    )
  }

  if (!userProject) {
    return (
      <MainLayout>
        <EmptyState
          icon={FolderOpen}
          title={t('document.noProject') || 'لا يوجد مشروع مسجل'}
          description={t('document.noProjectDescription') || 'يجب أن تكون مسجلاً في مشروع لتتمكن من تسليم الوثائق'}
        />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FolderOpen className="h-8 w-8 text-primary" />
              {t('nav.documents') || 'تسليم الوثائق'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('document.pageDescription') || 'قم برفع الوثائق المطلوبة للمشروع'}
            </p>
          </div>
          {isPeriodActive && (
            <Button 
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="w-full sm:w-auto"
            >
              <Upload className="ml-2 h-4 w-4" />
              {showUploadForm ? (t('common.cancel') || 'إلغاء') : (t('document.uploadNew') || 'رفع وثيقة جديدة')}
            </Button>
          )}
        </div>

        {/* Period Status */}
        {!isPeriodActive && (
          <Card className="border-warning">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <CardTitle>{t('document.periodClosed') || 'فترة التسليم مغلقة'}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <Calendar className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-warning-foreground">
                    {t('document.periodClosedMessage') || 'فترة تسليم الوثائق غير مفتوحة حالياً'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('document.periodClosedDescription') || 'يرجى الانتظار حتى يتم فتح فترة التسليم من قبل لجنة المشاريع'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t('document.currentProject') || 'المشروع الحالي'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{userProject.title}</p>
            <p className="text-sm text-muted-foreground line-clamp-2">{userProject.description}</p>
          </CardContent>
        </Card>

        {/* Document Upload */}
        {showUploadForm && isPeriodActive && selectedProjectId && (
          <Card>
            <CardHeader>
              <CardTitle>{t('document.uploadNew') || 'رفع وثيقة جديدة'}</CardTitle>
              <CardDescription>
                {t('document.uploadDescription') || 'اختر نوع الوثيقة وارفع الملف'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload
                projectId={selectedProjectId}
                onSuccess={() => {
                  setShowUploadForm(false)
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {documents && documents.length > 0 && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('document.total') || 'المجموع'}</p>
                    <p className="text-2xl font-bold">{documents.length}</p>
                  </div>
                  <FolderOpen className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('document.status.pending') || 'قيد المراجعة'}</p>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => d.reviewStatus === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('document.status.approved') || 'معتمد'}</p>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => d.reviewStatus === 'approved').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('document.status.rejected') || 'مرفوض'}</p>
                    <p className="text-2xl font-bold">
                      {documents.filter((d) => d.reviewStatus === 'rejected').length}
                    </p>
                  </div>
                  <XCircle className="h-8 w-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {documents && documents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('common.filter') || 'الفلاتر'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">{t('document.type') || 'نوع الوثيقة'}</label>
                <StatusFilter
                  options={documentTypeOptions}
                  value={documentType ? [documentType] : []}
                  onChange={(values) => setDocumentType(values[0] as DocumentType | undefined)}
                  multiple={false}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('document.reviewStatus') || 'حالة المراجعة'}</label>
                <StatusFilter
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents List */}
        {filteredDocuments && filteredDocuments.length > 0 ? (
          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <File className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="mb-0">{document.fileName}</CardTitle>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          {getDocumentTypeLabel(document.type)}
                        </span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatRelativeTime(document.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(document.reviewStatus)}
                      <StatusBadge status={`reviewStatus_${document.reviewStatus}`} />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedDocument(document.id)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {document.reviewComments && (
                    <div className="rounded-lg bg-muted p-3 border border-muted-foreground/20">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-sm font-medium">{t('document.reviewComments') || 'ملاحظات المراجعة'}</h4>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{document.reviewComments}</p>
                      {document.reviewedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {t('document.reviewedAt') || 'تمت المراجعة في'} {formatDate(document.reviewedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title={t('document.noDocuments') || 'لا توجد وثائق'}
            description={t('document.noDocumentsDescription') || 'ابدأ برفع الوثائق المطلوبة للمشروع'}
            action={
              isPeriodActive
                ? {
                    label: t('document.uploadNew') || 'رفع وثيقة جديدة',
                    onClick: () => setShowUploadForm(true),
                  }
                : undefined
            }
          />
        )}

        {/* Document Detail Dialog */}
        {selectedDocumentData && (
          <Dialog open={!!selectedDocument} onOpenChange={(open) => !open && setSelectedDocument(null)}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <File className="h-5 w-5 text-primary" />
                  {selectedDocumentData.fileName}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getStatusIcon(selectedDocumentData.reviewStatus)}
                  <StatusBadge status={`reviewStatus_${selectedDocumentData.reviewStatus}`} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('document.type') || 'نوع الوثيقة'}</p>
                    <p className="text-sm font-medium">{getDocumentTypeLabel(selectedDocumentData.type)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('document.size') || 'الحجم'}</p>
                    <p className="text-sm font-medium">{formatFileSize(selectedDocumentData.fileSize)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('document.submittedAt') || 'تم الإرسال في'}</p>
                    <p className="text-sm font-medium">{formatDate(selectedDocumentData.createdAt)}</p>
                  </div>
                  {selectedDocumentData.reviewedAt && (
                    <div>
                      <p className="text-xs text-muted-foreground">{t('document.reviewedAt') || 'تمت المراجعة في'}</p>
                      <p className="text-sm font-medium">{formatDate(selectedDocumentData.reviewedAt)}</p>
                    </div>
                  )}
                </div>

                {selectedDocumentData.reviewComments && (
                  <div className="rounded-lg bg-muted p-4 border border-muted-foreground/20">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-medium">{t('document.reviewComments') || 'ملاحظات المراجعة'}</h4>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{selectedDocumentData.reviewComments}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedDocumentData.fileUrl) {
                        window.open(selectedDocumentData.fileUrl, '_blank')
                      }
                    }}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('document.download') || 'تحميل'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDocument(null)}
                  >
                    {t('common.close') || 'إغلاق'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  )
}
