import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Lock, FileText, Users, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Document } from '@/types/request.types'

interface WorkflowStage {
  id: string
  title: string
  description: string
  icon: typeof CheckCircle2
  status: 'completed' | 'active' | 'locked' | 'pending'
  periodType?: 'chapter_submission_phase_1' | 'chapter_submission_phase_2' | 'final_defense_phase_1' | 'final_defense_phase_2' | 'final_project_document_submission'
}

interface DocumentWorkflowTimelineProps {
  documents?: Document[]
  isPhase1Active: boolean
  isPhase2Active: boolean
  isFinalDefense1Active: boolean
  isFinalDefense2Active: boolean
  isFinalActive: boolean
  hasProject: boolean
  hasSupervisor: boolean
  finalDefense1Completed: boolean
  finalDefense2Completed: boolean
  t: (key: string) => string
}

export function DocumentWorkflowTimeline({
  documents = [],
  isPhase1Active,
  isPhase2Active,
  isFinalDefense1Active,
  isFinalDefense2Active,
  isFinalActive,
  hasProject,
  hasSupervisor,
  finalDefense1Completed,
  finalDefense2Completed,
  t,
}: DocumentWorkflowTimelineProps) {
  // Get chapter documents
  const chapterDocs = documents.filter(
    (doc) => doc.type === 'chapters' && typeof doc.chapterNumber === 'number'
  )

  // Check chapter completion status
  const getChapterStatus = (chapterNum: number): 'completed' | 'pending' | 'rejected' | 'not_started' => {
    const chapterDoc = chapterDocs.find((doc) => doc.chapterNumber === chapterNum)
    if (!chapterDoc) return 'not_started'
    if (chapterDoc.reviewStatus === 'approved') return 'completed'
    if (chapterDoc.reviewStatus === 'rejected') return 'rejected'
    return 'pending'
  }

  // Determine workflow stages
  const stages: WorkflowStage[] = [
    {
      id: 'eligibility',
      title: t('document.workflow.eligibility.title'),
      description: hasProject && hasSupervisor
        ? t('document.workflow.eligibility.completed')
        : hasProject
          ? t('document.workflow.eligibility.noSupervisor')
          : t('document.workflow.eligibility.noProject'),
      icon: CheckCircle2,
      status: hasProject && hasSupervisor ? 'completed' : 'locked',
    },
    {
      id: 'phase1',
      title: t('document.workflow.phase1.title'),
      description: isPhase1Active
        ? t('document.workflow.phase1.active')
        : getChapterStatus(3) === 'completed'
          ? t('document.workflow.phase1.completed')
          : t('document.workflow.phase1.locked'),
      icon: FileText,
      status:
        getChapterStatus(3) === 'completed'
          ? 'completed'
          : isPhase1Active
            ? 'active'
            : 'locked',
      periodType: 'chapter_submission_phase_1',
    },
    {
      id: 'defense1',
      title: t('document.workflow.defense1.title'),
      description: finalDefense1Completed
        ? t('document.workflow.defense1.completed')
        : isFinalDefense1Active
          ? t('document.workflow.defense1.active')
          : getChapterStatus(3) === 'completed'
            ? t('document.workflow.defense1.pending')
            : t('document.workflow.defense1.locked'),
      icon: Users,
      status: finalDefense1Completed
        ? 'completed'
        : isFinalDefense1Active
          ? 'active'
          : getChapterStatus(3) === 'completed'
            ? 'pending'
            : 'locked',
      periodType: 'final_defense_phase_1',
    },
    {
      id: 'phase2',
      title: t('document.workflow.phase2.title'),
      description: isPhase2Active
        ? t('document.workflow.phase2.active')
        : getChapterStatus(6) === 'completed'
          ? t('document.workflow.phase2.completed')
          : finalDefense1Completed
            ? t('document.workflow.phase2.pending')
            : t('document.workflow.phase2.locked'),
      icon: FileText,
      status:
        getChapterStatus(6) === 'completed'
          ? 'completed'
          : isPhase2Active
            ? 'active'
            : finalDefense1Completed
              ? 'pending'
              : 'locked',
      periodType: 'chapter_submission_phase_2',
    },
    {
      id: 'defense2',
      title: t('document.workflow.defense2.title'),
      description: finalDefense2Completed
        ? t('document.workflow.defense2.completed')
        : isFinalDefense2Active
          ? t('document.workflow.defense2.active')
          : getChapterStatus(6) === 'completed'
            ? t('document.workflow.defense2.pending')
            : t('document.workflow.defense2.locked'),
      icon: Users,
      status: finalDefense2Completed
        ? 'completed'
        : isFinalDefense2Active
          ? 'active'
          : getChapterStatus(6) === 'completed'
            ? 'pending'
            : 'locked',
      periodType: 'final_defense_phase_2',
    },
    {
      id: 'final',
      title: t('document.workflow.final.title'),
      description: isFinalActive
        ? t('document.workflow.final.active')
        : finalDefense2Completed
          ? t('document.workflow.final.pending')
          : t('document.workflow.final.locked'),
      icon: Award,
      status: isFinalActive
        ? 'active'
        : finalDefense2Completed
          ? 'pending'
          : 'locked',
      periodType: 'final_project_document_submission',
    },
  ]

  const getStatusIcon = (stage: WorkflowStage) => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-success" />
      case 'active':
        return <Clock className="h-5 w-5 text-primary animate-pulse" />
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />
      case 'locked':
        return <Lock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (stage: WorkflowStage) => {
    switch (stage.status) {
      case 'completed':
        return 'border-success/20 bg-success/5'
      case 'active':
        return 'border-primary/30 bg-primary/5 ring-2 ring-primary/20'
      case 'pending':
        return 'border-warning/20 bg-warning/5'
      case 'locked':
        return 'border-muted bg-muted/30 opacity-60'
    }
  }

  return (
    <CardContent className="p-3">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{t('document.workflow.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('document.workflow.description')}</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute start-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6 relative">
          {stages.map((stage, index) => (
            <div key={stage.id} className="relative flex gap-4">
              {/* Icon circle */}
              <div
                className={cn(
                  'relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background transition-all',
                  getStatusColor(stage),
                  stage.status === 'active' && 'scale-110 shadow-lg'
                )}
              >
                <stage.icon className="h-6 w-6 text-muted-foreground" />
                <div className="absolute -right-1 -top-1">{getStatusIcon(stage)}</div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <div
                  className={cn(
                    'rounded-lg border p-4 transition-all',
                    getStatusColor(stage)
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{stage.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  )
}
