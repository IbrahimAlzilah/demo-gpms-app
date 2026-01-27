import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, ConfirmDialog } from '@/components/common'
import { useToast } from '@/components/common'
import { CheckCircle2, Calendar, Edit, Trash2, PlusCircle, Flag } from 'lucide-react'
import { formatDate } from '@/lib/utils/format'
import { milestoneService } from '../api/milestone.service'
import { MilestoneForm } from './MilestoneForm'
import {
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  useMarkMilestoneCompleted,
} from '../hooks/useMilestoneOperations'
import type { ProjectMilestone } from '@/types/project.types'
import type { MilestoneFormData } from '../types/milestone.types'

interface MilestonesManagerProps {
  projectId: string
}

export function MilestonesManager({ projectId }: MilestonesManagerProps) {
  const { t } = useTranslation()
  const { toastSuccess, toastError } = useToast()
  const [showForm, setShowForm] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null)
  const [deletingMilestone, setDeletingMilestone] = useState<ProjectMilestone | null>(null)

  const { data: milestones, isLoading } = useQuery({
    queryKey: ['project-milestones', projectId],
    queryFn: () => milestoneService.getAll(projectId),
    enabled: !!projectId,
    staleTime: 0,
    refetchOnMount: true,
  })

  const createMilestone = useCreateMilestone(projectId)
  const updateMilestone = useUpdateMilestone(projectId)
  const deleteMilestone = useDeleteMilestone(projectId)
  const markCompleted = useMarkMilestoneCompleted(projectId)

  const handleCreate = async (data: MilestoneFormData) => {
    try {
      await createMilestone.mutateAsync({
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        type: data.type,
      })
      toastSuccess('milestone.createSuccess')
      setShowForm(false)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'milestone.createError')
    }
  }

  const handleUpdate = async (data: MilestoneFormData) => {
    if (!editingMilestone) return
    try {
      await updateMilestone.mutateAsync({
        milestoneId: editingMilestone.id,
        data: {
          title: data.title,
          description: data.description,
          due_date: data.dueDate,
          type: data.type,
        },
      })
      toastSuccess('milestone.updateSuccess')
      setEditingMilestone(null)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'milestone.updateError')
    }
  }

  const handleDelete = async () => {
    if (!deletingMilestone) return
    try {
      await deleteMilestone.mutateAsync(deletingMilestone.id)
      toastSuccess('milestone.deleteSuccess')
      setDeletingMilestone(null)
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'milestone.deleteError')
    }
  }

  const handleMarkCompleted = async (milestone: ProjectMilestone) => {
    try {
      await markCompleted.mutateAsync(milestone.id)
      toastSuccess('milestone.markCompletedSuccess')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'milestone.markCompletedError')
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-primary" />
              {t('milestone.management')}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => {
                setEditingMilestone(null)
                setShowForm(true)
              }}
            >
              <PlusCircle className="size-4" />
              {t('milestone.createMilestone')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {milestones && milestones.length > 0 ? (
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border ${milestone.completed
                    ? 'bg-muted/50 border-muted'
                    : 'bg-card border-border'
                    }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{milestone.title}</h4>
                        {milestone.completed && (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        )}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {milestone.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{t('milestone.dueDate')}: {formatDate(milestone.dueDate)}</span>
                        </div>
                        <span className="capitalize">{t(`milestone.types.${milestone.type}`)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!milestone.completed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkCompleted(milestone)}
                          disabled={markCompleted.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          {t('milestone.markCompleted')}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingMilestone(milestone)
                          setShowForm(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeletingMilestone(milestone)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {t('milestone.noMilestones')}
            </p>
          )}
        </CardContent>
      </Card>

      <MilestoneForm
        open={showForm}
        onClose={() => {
          setShowForm(false)
          setEditingMilestone(null)
        }}
        onSubmit={editingMilestone ? handleUpdate : handleCreate}
        milestone={editingMilestone}
        isPending={createMilestone.isPending || updateMilestone.isPending}
      />

      <ConfirmDialog
        open={!!deletingMilestone}
        onOpenChange={(open) => !open && setDeletingMilestone(null)}
        title={t('milestone.deleteTitle')}
        description={t('milestone.deleteDescription')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleDelete}
        variant="destructive"
      />
    </>
  )
}
