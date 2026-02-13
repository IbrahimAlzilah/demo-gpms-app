import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataTable,
} from '@/components/ui'
import { BlockContent, ModalDialog, ConfirmDialog, LoadingSpinner } from '@/components/common'
import { useToast } from '@/components/common'
import { User, Building, TrendingUp } from 'lucide-react'
import type { CommitteeMemberProfile } from '../api/committee.service'
import type { ProjectForDiscussion } from '../api/committee.service'
import { useDistributeProjects, useRemoveCommitteeAssignment } from '../hooks/useDistributeCommitteesOperations'
import { useDistributeCommitteesList } from './DistributeCommitteesList.hook'
import { usePublicSettings } from '@/pages/admin/settings/hooks/useSettings'
import { useWindowsStatus } from '@/features/common/hooks/useTimeWindows'
import { ROUTES } from '@/lib/constants/constants'
import { createDistributeCommitteesColumns } from './columns'
import { AssignCommitteeModal } from '../components/AssignCommitteeModal'

export function DistributeCommitteesList() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toastSuccess, toastError } = useToast()
  const { data: systemSettings = {} } = usePublicSettings()
  const committeeMin = Number(systemSettings.discussion_committee_min_members ?? 2)
  const committeeMax = Number(systemSettings.discussion_committee_max_members ?? 3)

  const distributeProjects = useDistributeProjects()
  const removeAssignment = useRemoveCommitteeAssignment()
  const [removingId, setRemovingId] = useState<string | null>(null)

  const {
    data,
    state,
    setState,
    filterOptions,
    defensePhaseOptions,
  } = useDistributeCommitteesList()

  const { data: periodStatus } = useWindowsStatus(
    ['final_defense_phase_1', 'final_defense_phase_2'],
    true,
  )
  const isFd1PeriodActive = periodStatus?.['final_defense_phase_1']?.is_active ?? true
  const isFd2PeriodActive = periodStatus?.['final_defense_phase_2']?.is_active ?? true

  const handleFormCommittee = (project: ProjectForDiscussion) => {
    setState((prev) => ({
      ...prev,
      selectedProjectForAssign: project,
      showAssignModal: true,
    }))
  }

  const handleAssignCommittee = async (
    projectId: string,
    committeeMemberIds: string[],
    defenseStage: 'FD1' | 'FD2',
    defenseScheduledAt?: string | null,
  ) => {
    await distributeProjects.mutateAsync([
      { projectId, committeeMemberIds, defenseStage, defenseScheduledAt },
    ])
    toastSuccess(t('committee.distribute.success'))
  }

  const handleChangeCommittee = (project: ProjectForDiscussion) => {
    setState((prev) => ({
      ...prev,
      selectedProjectForAssign: project,
      showAssignModal: true,
    }))
  }

  const handleRemoveAssignment = async (project: ProjectForDiscussion) => {
    setRemovingId(project.id)
    try {
      await removeAssignment.mutateAsync(project.id)
      toastSuccess(t('committee.distribute.removeSuccess'))
      setState((prev) => ({ ...prev, projectToRemove: null }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.distribute.removeError'))
    } finally {
      setRemovingId(null)
    }
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-500'
      case 'moderate': return 'bg-yellow-500'
      case 'busy': return 'bg-orange-500'
      case 'unavailable': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return t('committee.distribute.available')
      case 'moderate': return t('committee.distribute.moderate')
      case 'busy': return t('committee.distribute.busy')
      case 'unavailable': return t('committee.distribute.unavailable')
      default: return availability
    }
  }

  const columns = useMemo(
    () =>
      createDistributeCommitteesColumns({
        t,
        onViewProject: (project) => navigate(ROUTES.PROJECTS_COMMITTEE.PROJECT_DETAIL(project.id)),
        onFormCommittee: handleFormCommittee,
        onChangeCommittee: handleChangeCommittee,
        onRemoveCommittee: (project) => setState((prev) => ({ ...prev, projectToRemove: project })),
        isRemovingId: removingId,
        isFd1PeriodActive,
        isFd2PeriodActive,
      }),
    [t, navigate, removingId, setState, isFd1PeriodActive, isFd2PeriodActive],
  )

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <BlockContent title={t('committee.distribute.title')} variant="data-table">
        <DataTable
          columns={columns}
          data={data.projects}
          isLoading={data.isLoading}
          error={data.error}
          searchValue={state.searchQuery}
          onSearchChange={(value) => setState((prev) => ({ ...prev, searchQuery: value }))}
          searchPlaceholder={t('committee.distribute.searchPlaceholder')}
          enableFiltering={true}
          enableViews={true}
          emptyMessage={t('committee.distribute.noProjects')}
          toolbarContent={
            <>
              <Select
                value={state.filterStatus}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, filterStatus: value as typeof prev.filterStatus }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('committee.distribute.filterByStatus')} />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={state.defensePhase}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, defensePhase: value as typeof prev.defensePhase }))
                }
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder={t('committee.distribute.filterByDefensePhase')} />
                </SelectTrigger>
                <SelectContent>
                  {defensePhaseOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {t(option.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          }
        />
      </BlockContent>

      {/* Assign Committee Modal */}
      <AssignCommitteeModal
        open={state.showAssignModal}
        onOpenChange={(open) =>
          setState((prev) => ({
            ...prev,
            showAssignModal: open,
            selectedProjectForAssign: open ? prev.selectedProjectForAssign : null,
          }))
        }
        project={state.selectedProjectForAssign}
        members={data.members}
        committeeMin={committeeMin}
        committeeMax={committeeMax}
        onAssign={handleAssignCommittee}
        isChangeMode={
          !!(state.selectedProjectForAssign?.hasCommitteeAssigned || (state.selectedProjectForAssign?.committeeCount ?? 0) > 0)
        }
      />

      {/* Remove Committee Confirmation */}
      <ConfirmDialog
        open={!!state.projectToRemove}
        onOpenChange={(open) => !open && setState((prev) => ({ ...prev, projectToRemove: null }))}
        onConfirm={() => state.projectToRemove && handleRemoveAssignment(state.projectToRemove)}
        title={t('committee.distribute.removeCommitteeConfirmTitle')}
        description={t('committee.distribute.removeCommitteeConfirmDescription')}
        confirmLabel={t('committee.distribute.removeCommittee')}
        variant="destructive"
      />

      {/* Member Details Dialog */}
      <ModalDialog
        open={state.showMemberDetailsDialog}
        onOpenChange={(open) =>
          setState((prev) => ({
            ...prev,
            showMemberDetailsDialog: open,
            selectedMemberForDetails: open ? prev.selectedMemberForDetails : null,
          }))
        }
        title={t('committee.distribute.memberDetails')}
      >
        {state.selectedMemberForDetails && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{state.selectedMemberForDetails.name}</h3>
                {state.selectedMemberForDetails.email && (
                  <p className="text-sm text-muted-foreground">{state.selectedMemberForDetails.email}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`size-3 rounded-full ${getAvailabilityColor(state.selectedMemberForDetails.availability)}`} />
                <span className="text-sm font-medium">{getAvailabilityLabel(state.selectedMemberForDetails.availability)}</span>
              </div>
            </div>
            {state.selectedMemberForDetails.profile && (
              <Card className="p-4 bg-muted/30">
                <h4 className="font-medium mb-3 text-sm">{t('committee.distribute.profileDetails')}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {state.selectedMemberForDetails.profile.department && (
                    <div className="flex items-start gap-2">
                      <Building className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t('committee.distribute.department')}</p>
                        <p className="font-medium">{state.selectedMemberForDetails.profile.department}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t('committee.distribute.currentAssignments')}</p>
                      <p className="font-medium">
                        {state.selectedMemberForDetails.statistics.currentAssignments}/{state.selectedMemberForDetails.statistics.maxAllowedProjects}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {state.selectedMemberForDetails.statistics.availableSlots} {t('committee.distribute.slotsAvailable')}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </ModalDialog>
    </>
  )
}
