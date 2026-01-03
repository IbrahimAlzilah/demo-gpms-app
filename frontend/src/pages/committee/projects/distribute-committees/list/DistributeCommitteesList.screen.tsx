import { useTranslation } from 'react-i18next'
import { useDistributeProjects } from '../hooks/useDistributeCommitteesOperations'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, useToast } from '@/components/common'
import { Briefcase, Users, CheckCircle2, Loader2, UserCheck } from 'lucide-react'
import type { CommitteeAssignment } from '../api/committee.service'
import { useDistributeCommitteesList } from './DistributeCommitteesList.hook'

export function DistributeCommitteesList() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const distributeProjects = useDistributeProjects()
  
  const {
    data,
    state,
    setState,
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
      newAssignments.set(projectId, [...currentMembers, memberId])
    }

    setState((prev) => ({ ...prev, assignments: newAssignments }))
  }

  const handleDistribute = async () => {
    if (state.assignments.size === 0) {
      showToast(t('committee.distribute.selectAtLeastOne'), 'warning')
      return
    }

    const assignmentArray: CommitteeAssignment[] = Array.from(state.assignments.entries()).map(
      ([projectId, committeeMemberIds]) => ({
        projectId,
        committeeMemberIds,
      })
    )

    try {
      await distributeProjects.mutateAsync(assignmentArray)
      showToast(t('committee.distribute.success'), 'success')
      setState((prev) => ({ ...prev, assignments: new Map() }))
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.distribute.error'),
        'error'
      )
    }
  }

  if (data.isLoading) {
    return <LoadingSpinner />
  }

  if (!data.projects || data.projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={t('committee.distribute.noProjects')}
        description={t('committee.distribute.noProjectsDescription')}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
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
              <Users className="mr-2 h-4 w-4" />
              {t('committee.distribute.distributeProjects')}
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {data.projects.map((project) => {
          const assignedMembers = state.assignments.get(project.id) || []
          return (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{project.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" />
                    {t('committee.distribute.selectMembers')}
                  </h4>
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {data.members && data.members.length > 0 ? (
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
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{member.name}</p>
                                </div>
                              </div>
                              {assignedMembers.includes(member.id) && (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              )}
                              <input
                                type="checkbox"
                                checked={assignedMembers.includes(member.id)}
                                onChange={() => toggleMember(project.id, member.id)}
                                className="h-4 w-4"
                                onClick={(e) => e.stopPropagation()}
                              />
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
                  {assignedMembers.length > 0 && (
                    <p className="text-sm text-primary mt-3 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('committee.distribute.membersSelected', { count: assignedMembers.length })}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
