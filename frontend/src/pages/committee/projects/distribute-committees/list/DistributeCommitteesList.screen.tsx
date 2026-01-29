import { useTranslation } from 'react-i18next'
import { useDistributeProjects, useRemoveCommitteeAssignment } from '../hooks/useDistributeCommitteesOperations'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { Progress } from '@/components/ui/progress'
import { BlockContent, ModalDialog } from '@/components/common'
import { LoadingSpinner, EmptyState } from '@/components/common'
import { useToast } from '@/components/common'
import {
  Briefcase,
  Users,
  CheckCircle2,
  Loader2,
  UserCheck,
  Search,
  FileText,
  User,
  Info,
  Building,
  XCircle,
  TrendingUp
} from 'lucide-react'
import type { CommitteeAssignment, CommitteeMemberProfile } from '../api/committee.service'
import { useDistributeCommitteesList } from './DistributeCommitteesList.hook'

export function DistributeCommitteesList() {
  const { t } = useTranslation()
  const { toastSuccess, toastError, toastWarning } = useToast()

  const distributeProjects = useDistributeProjects()
  const removeAssignment = useRemoveCommitteeAssignment()

  const {
    data,
    state,
    setState,
    filterOptions,
    defensePhaseOptions,
  } = useDistributeCommitteesList()

  const toggleMember = (projectId: string, memberId: string) => {
    const newAssignments = new Map(state.assignments)
    const currentMembers = newAssignments.get(projectId) || []

    if (currentMembers.includes(memberId)) {
      newAssignments.set(
        projectId,
        currentMembers.filter((id) => id !== memberId)
      )
    } else {
      // Limit to 3 members per project
      if (currentMembers.length >= 3) {
        toastWarning(t('committee.distribute.maxMembersReached'))
        return
      }
      newAssignments.set(projectId, [...currentMembers, memberId])
    }

    setState((prev) => ({ ...prev, assignments: newAssignments }))
  }

  const handleDistribute = async () => {
    if (state.assignments.size === 0) {
      toastWarning(t('committee.distribute.selectAtLeastOne'))
      return
    }

    // Validate minimum 2 members per project
    for (const [_projectId, members] of state.assignments.entries()) {
      if (members.length < 2) {
        toastWarning(t('committee.distribute.minMembersRequired'))
        return
      }
    }

    const assignmentArray: CommitteeAssignment[] = Array.from(state.assignments.entries()).map(
      ([projectId, committeeMemberIds]) => ({
        projectId,
        committeeMemberIds,
      })
    )

    try {
      await distributeProjects.mutateAsync(assignmentArray)
      toastSuccess(t('committee.distribute.success'))
      setState((prev) => ({ ...prev, assignments: new Map() }))
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.distribute.error'))
    }
  }

  const handleRemoveAssignment = async (projectId: string) => {
    try {
      await removeAssignment.mutateAsync(projectId)
      toastSuccess(t('committee.distribute.removeSuccess'))
    } catch (err) {
      toastError(err instanceof Error ? err.message : t('committee.distribute.removeError'))
    }
  }

  const showMemberDetails = (member: CommitteeMemberProfile) => {
    setState((prev) => ({
      ...prev,
      selectedMemberForDetails: member,
      showMemberDetailsDialog: true,
    }))
  }

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'bg-green-500'
      case 'moderate':
        return 'bg-yellow-500'
      case 'busy':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available':
        return t('committee.distribute.available')
      case 'moderate':
        return t('committee.distribute.moderate')
      case 'busy':
        return t('committee.distribute.busy')
      default:
        return availability
    }
  }

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  const actions = (
    <Button
      onClick={handleDistribute}
      disabled={state.assignments.size === 0 || distributeProjects.isPending}
      className="w-full sm:w-auto"
    >
      {distributeProjects.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('committee.distribute.distributing')}
        </>
      ) : (
        <>
          <Users className="size-4" />
          {t('committee.distribute.distributeProjects')}
        </>
      )}
    </Button>
  )

  return (
    <>
      <BlockContent title={t('committee.distribute.title')} actions={actions}>
        {/* Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('committee.distribute.searchPlaceholder')}
                value={state.searchQuery}
                onChange={(e) => setState((prev) => ({ ...prev, searchQuery: e.target.value }))}
                className="ps-9"
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 min-w-[200px] max-w-[280px]">
              <Select
                value={state.filterStatus}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, filterStatus: value as typeof prev.filterStatus }))
                }
              >
                <SelectTrigger className="w-full">
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
            </div>
            {/* Defense Phase Filter – Final Defense 1 vs 2 */}
            <div className="flex items-center gap-2 min-w-[200px] max-w-[280px]">
              <Select
                value={state.defensePhase}
                onValueChange={(value) =>
                  setState((prev) => ({ ...prev, defensePhase: value as typeof prev.defensePhase }))
                }
              >
                <SelectTrigger className="w-full">
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
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              {t('committee.distribute.projectsCount', { count: data.projects.length })}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {t('committee.distribute.membersCount', { count: data.members.length })}
            </span>
          </div>
        </div>

        {/* Projects List */}
        {data.projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t('committee.distribute.noProjects')}
            description={t('committee.distribute.noProjectsDescription')}
          />
        ) : (
          <div className="space-y-6">
            {data.projects.map((project) => {
              const assignedMembers = state.assignments.get(project.id) || []
              const existingCommittee = project.committeeCount > 0

              return (
                <Card key={project.id} className="hover:shadow-md transition-shadow border-border/60">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap gap-4 items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                      </div>

                      {/* Project Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        {existingCommittee && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            {t('committee.distribute.committeeAssigned', { count: project.committeeCount })}
                          </Badge>
                        )}
                        {project.documentCount > 0 && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {project.documentCount} {t('committee.distribute.documents')}
                          </Badge>
                        )}
                        {project.readyForDefensePhase === 'final_defense_1' && (
                          <Badge variant="outline" className="flex items-center gap-1 border-primary/50 text-primary">
                            {t('committee.distribute.readyForFD1')}
                          </Badge>
                        )}
                        {project.readyForDefensePhase === 'final_defense_2' && (
                          <Badge variant="outline" className="flex items-center gap-1 border-primary/50 text-primary">
                            {t('committee.distribute.readyForFD2')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Supervisor Info */}
                    {project.supervisor && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                        <User className="h-4 w-4" />
                        <span>{t('committee.distribute.supervisor')}: {project.supervisor.name}</span>
                      </div>
                    )}

                    {/* Evaluation Progress */}
                    {existingCommittee && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {t('committee.distribute.evaluationProgress')}
                          </span>
                          <span className="font-medium">
                            {project.evaluationProgress.evaluated}/{project.evaluationProgress.total}
                          </span>
                        </div>
                        <Progress value={project.evaluationProgress.percentage} className="h-2" />
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Existing Committee Info & Remove Button */}
                    {existingCommittee && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 text-sm">
                          <Info className="h-4 w-4 text-primary" />
                          <span>{t('committee.distribute.existingCommitteeInfo')}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveAssignment(project.id)}
                          disabled={removeAssignment.isPending}
                          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <XCircle className="h-4 w-4" />
                          {t('committee.distribute.removeCommittee')}
                        </Button>
                      </div>
                    )}

                    {/* Committee Members Selection */}
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        {t('committee.distribute.selectMembers')}
                        <span className="text-xs text-muted-foreground">
                          ({t('committee.distribute.minMaxMembers')})
                        </span>
                      </h4>

                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {data.members.length > 0 ? (
                          data.members.map((member) => (
                            <Card
                              key={member.id}
                              className={`cursor-pointer transition-all ${assignedMembers.includes(member.id)
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'hover:bg-muted hover:shadow-sm'
                                }`}
                              onClick={() => toggleMember(project.id, member.id)}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex items-start gap-2 flex-1">
                                    <div className={`mt-1 size-2 rounded-full shrink-0 ${getAvailabilityColor(member.availability)}`} />
                                    <div className="min-w-0">
                                      <p className="font-medium text-sm truncate">{member.name}</p>
                                      {member.department && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                          <Building className="h-3 w-3" />
                                          {member.department}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>{member.statistics.currentAssignments} {t('committee.distribute.current')}</span>
                                        <span>•</span>
                                        <span>{member.statistics.totalEvaluations} {t('committee.distribute.evaluations')}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        showMemberDetails(member)
                                      }}
                                    >
                                      <Info className="h-3 w-3" />
                                    </Button>
                                    {assignedMembers.includes(member.id) && (
                                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                    )}
                                    <input
                                      type="checkbox"
                                      checked={assignedMembers.includes(member.id)}
                                      onChange={() => toggleMember(project.id, member.id)}
                                      className="h-4 w-4 shrink-0"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <EmptyState
                            icon={Users}
                            title={t('committee.distribute.noMembers')}
                            description={t('committee.distribute.noMembersDescription')}
                          />
                        )}
                      </div>

                      {/* Selected Count */}
                      {assignedMembers.length > 0 && (
                        <p className="text-sm text-primary mt-3 flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4" />
                          {t('committee.distribute.membersSelected', { count: assignedMembers.length })}
                          {assignedMembers.length < 2 && (
                            <span className="text-warning ms-2">
                              ({t('committee.distribute.needMoreMembers')})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </BlockContent>

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
          <div className="space-y-6">
            {/* Member Info */}
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{state.selectedMemberForDetails.name}</h3>
                {state.selectedMemberForDetails.email && (
                  <p className="text-sm text-muted-foreground">{state.selectedMemberForDetails.email}</p>
                )}
                {state.selectedMemberForDetails.department && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <Building className="h-3 w-3" />
                    {state.selectedMemberForDetails.department}
                  </p>
                )}
              </div>
            </div>

            {/* Availability Badge */}
            <div className="flex items-center gap-2">
              <span className={`size-3 rounded-full ${getAvailabilityColor(state.selectedMemberForDetails.availability)}`} />
              <span className="font-medium">{getAvailabilityLabel(state.selectedMemberForDetails.availability)}</span>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {state.selectedMemberForDetails.statistics.currentAssignments}
                </p>
                <p className="text-xs text-muted-foreground">{t('committee.distribute.currentProjects')}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {state.selectedMemberForDetails.statistics.completedProjects}
                </p>
                <p className="text-xs text-muted-foreground">{t('committee.distribute.completedProjects')}</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">
                  {state.selectedMemberForDetails.statistics.totalEvaluations}
                </p>
                <p className="text-xs text-muted-foreground">{t('committee.distribute.totalEvaluations')}</p>
              </Card>
            </div>

            {/* Current Projects */}
            {state.selectedMemberForDetails.currentProjects.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  {t('committee.distribute.assignedProjects')}
                </h4>
                <div className="space-y-2">
                  {state.selectedMemberForDetails.currentProjects.map((project) => (
                    <div key={project.id} className="p-2 rounded border bg-muted/30 text-sm">
                      {project.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ModalDialog>
    </>
  )
}
