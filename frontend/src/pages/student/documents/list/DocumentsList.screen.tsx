import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, Button } from '@/components/ui'
import { BlockContent, LoadingSpinner } from '@/components/common'
import { PlusCircle, FolderOpen, AlertCircle, ListOrdered } from 'lucide-react'
// import { StatisticsCards } from '../components/StatisticsCards'
import { DocumentWorkflowModal } from '../components/DocumentWorkflowModal'
import { ChapterStatusCards } from '../components/ChapterStatusCards'
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
    projectsLoading,
    isPhase1Active,
    isPhase2Active,
    isFinalDefense1Active,
    isFinalDefense2Active,
    isFinalActive,
    isPeriodActive,
    hasSupervisor,
    finalDefense1Completed,
    finalDefense2Completed,
  } = useDocumentsList()

  const handleFormSuccess = () => {
    setState((prev) => ({ ...prev, showUploadForm: false, selectedChapterForUpload: null }))
  }

  const openWorkflowModal = () => setState((prev) => ({ ...prev, showWorkflowModal: true }))
  const openUploadForm = () => setState((prev) => ({ ...prev, showUploadForm: true }))

  const actions = useMemo(
    () =>
      state.selectedProjectId ? (
        <div className="flex items-center gap-2">
          <Button onClick={openUploadForm} className="gap-2">
            <PlusCircle className="size-4" />
            {t('document.uploadNew')}
          </Button>
        </div>
      ) : null,
    [t, state.selectedProjectId]
  )

  // Show loading spinner while projects are being fetched
  if (projectsLoading) {
    return (
      <BlockContent title={t('nav.documents')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </BlockContent>
    )
  }

  // Show empty state only after loading is complete and no project exists
  if (!userProject) {
    return (
      <BlockContent title={t('nav.documents')}>
        <div className="text-center p-8">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium">{t('document.noProject')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('document.noProjectDescription')}
          </p>
        </div>
      </BlockContent>
    )
  }

  const handleChapterClick = (chapterNumber: number) => {
    setState((prev) => ({
      ...prev,
      showUploadForm: true,
      selectedChapterForUpload: chapterNumber,
    }))
  }

  return (
    <>
      <BlockContent title={t('nav.documents')} actions={actions}>
        {/* Workflow CTA card */}
        <Card className="border-dashed border-2 border-primary/20 bg-primary/3">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3">
            <div>
              <h3 className="font-semibold text-sm mb-1">{t('document.workflow.title')}</h3>
              <p className="text-xs text-muted-foreground">{t('document.workflow.description')}</p>
            </div>
            <Button onClick={openWorkflowModal} variant="outline" className="gap-2 shrink-0">
              <ListOrdered className="size-4" />
              {t('document.workflow.viewWorkflow')}
            </Button>
          </CardContent>
        </Card>

        {/* Chapter Status Cards (uses latest per chapter for resubmission support) */}
        <div className="mt-6">
          <ChapterStatusCards
            documents={data.documentsForChapterCards}
            isPhase1Active={isPhase1Active}
            isPhase2Active={isPhase2Active}
            finalDefense1Completed={finalDefense1Completed}
            onChapterClick={handleChapterClick}
            onViewDocument={(document) => setState((prev) => ({ ...prev, selectedDocument: document }))}
            t={t}
          />
        </div>

        {/* Statistics Cards */}
        {/* {data.statistics.total > 0 && (
          <div className="mt-6">
            <StatisticsCards statistics={data.statistics} t={t} />
          </div>
        )} */}
      </BlockContent>

      {/* Workflow modal */}
      <DocumentWorkflowModal
        open={state.showWorkflowModal}
        onOpenChange={(open) => setState((prev) => ({ ...prev, showWorkflowModal: open }))}
        onUploadNew={openUploadForm}
        documents={data.documentsForChapterCards}
        isPhase1Active={isPhase1Active}
        isPhase2Active={isPhase2Active}
        isFinalDefense1Active={isFinalDefense1Active}
        isFinalDefense2Active={isFinalDefense2Active}
        isFinalActive={isFinalActive}
        hasProject={!!userProject}
        hasSupervisor={hasSupervisor}
        finalDefense1Completed={finalDefense1Completed}
        finalDefense2Completed={finalDefense2Completed}
        canUpload={!!state.selectedProjectId && isPeriodActive}
      />

      {data.error && (
        <BlockContent variant="container" className="border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <span>{t('document.loadError')}</span>
          </div>
        </BlockContent>
      )}

      {/* Upload Document Modal (initialChapterNumber when resubmitting rejected or replacing pending) */}
      {state.selectedProjectId && (
        <DocumentsNew
          projectId={state.selectedProjectId}
          open={state.showUploadForm}
          onClose={() => setState((prev) => ({ ...prev, showUploadForm: false, selectedChapterForUpload: null }))}
          onSuccess={handleFormSuccess}
          initialChapterNumber={state.selectedChapterForUpload ?? undefined}
          replaceMode={
            state.selectedChapterForUpload != null &&
            data.documentsForChapterCards.some(
              (d) => d.chapterNumber === state.selectedChapterForUpload && d.reviewStatus === 'pending'
            )
          }
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
