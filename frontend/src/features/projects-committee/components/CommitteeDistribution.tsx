import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsReadyForDiscussion, useDiscussionCommitteeMembers, useDistributeProjects } from '../hooks/useCommitteeDistribution'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, useToast } from '@/components/common'
import { Briefcase, Users, CheckCircle2, Loader2, UserCheck } from 'lucide-react'
import type { CommitteeAssignment } from '../api/committee.service'

export function CommitteeDistribution() {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const { data: projects, isLoading: projectsLoading } = useProjectsReadyForDiscussion()
  const { data: members, isLoading: membersLoading } = useDiscussionCommitteeMembers()
  const distributeProjects = useDistributeProjects()
  const [assignments, setAssignments] = useState<Map<string, string[]>>(new Map())

  const toggleMember = (projectId: string, memberId: string) => {
    const newAssignments = new Map(assignments)
    const currentMembers = newAssignments.get(projectId) || []

    if (currentMembers.includes(memberId)) {
      newAssignments.set(
        projectId,
        currentMembers.filter((id) => id !== memberId)
      )
    } else {
      newAssignments.set(projectId, [...currentMembers, memberId])
    }

    setAssignments(newAssignments)
  }

  const handleDistribute = async () => {
    if (assignments.size === 0) {
      showToast(t('committee.distribute.selectAtLeastOne'), 'warning')
      return
    }

    const assignmentArray: CommitteeAssignment[] = Array.from(assignments.entries()).map(
      ([projectId, committeeMemberIds]) => ({
        projectId,
        committeeMemberIds,
      })
    )

    try {
      await distributeProjects.mutateAsync(assignmentArray)
      showToast(t('committee.distribute.success'), 'success')
      setAssignments(new Map())
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : t('committee.distribute.error'),
        'error'
      )
    }
  }

  if (projectsLoading || membersLoading) {
    return <LoadingSpinner />
  }

  if (!projects || projects.length === 0) {
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
          disabled={assignments.size === 0 || distributeProjects.isPending}
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
        {projects.map((project) => {
          const assignedMembers = assignments.get(project.id) || []
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
                    {members && members.length > 0 ? (
                      members.map((member) => (
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
                                  <p className="text-xs text-muted-foreground">{member.email}</p>
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

