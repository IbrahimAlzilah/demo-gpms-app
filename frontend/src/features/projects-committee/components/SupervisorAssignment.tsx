import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useProjectsWithoutSupervisor, useAvailableSupervisors, useAssignSupervisor } from '../hooks/useSupervisorAssignment'
import { Card, CardContent, Button } from '@/components/ui'
import { LoadingSpinner, EmptyState, useToast } from '@/components/common'
import { Briefcase, UserCheck, User, Loader2, CheckCircle2 } from 'lucide-react'
import type { Project } from '../../../types/project.types'

export function SupervisorAssignment() {
    const { t } = useTranslation()
    const { showToast } = useToast()
    const { data: projects, isLoading: projectsLoading } = useProjectsWithoutSupervisor()
    const { data: supervisors, isLoading: supervisorsLoading } = useAvailableSupervisors()
    const assignSupervisor = useAssignSupervisor()
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const [selectedSupervisor, setSelectedSupervisor] = useState<string>('')

    const handleAssign = async () => {
        if (!selectedProject || !selectedSupervisor) {
            showToast(t('committee.supervisors.selectBoth'), 'warning')
            return
        }

        try {
            await assignSupervisor.mutateAsync({
                projectId: selectedProject.id,
                supervisorId: selectedSupervisor,
            })
            showToast(t('committee.supervisors.assignmentSuccess'), 'success')
            setSelectedProject(null)
            setSelectedSupervisor('')
        } catch (err) {
            showToast(
                err instanceof Error ? err.message : t('committee.supervisors.assignmentError'),
                'error'
            )
        }
    }

    if (projectsLoading || supervisorsLoading) {
        return <LoadingSpinner />
    }

    if (!projects || projects.length === 0) {
        return (
            <EmptyState
                icon={Briefcase}
                title={t('committee.supervisors.noProjects')}
                description={t('committee.supervisors.noProjectsDescription')}
            />
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        {t('committee.supervisors.projectsWithoutSupervisor')}
                    </h3>
                    <div className="space-y-3">
                        {projects.map((project) => (
                            <Card
                                key={project.id}
                                className={`cursor-pointer transition-all ${
                                    selectedProject?.id === project.id
                                        ? 'border-primary bg-primary/5 shadow-md'
                                        : 'hover:bg-muted hover:shadow-sm'
                                }`}
                                onClick={() => {
                                    setSelectedProject(project)
                                    setSelectedSupervisor('')
                                }}
                            >
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-1">{project.title}</h4>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-primary" />
                        {t('committee.supervisors.availableSupervisors')}
                    </h3>
                    {selectedProject ? (
                        <div className="space-y-4">
                            <Card className="bg-muted">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground mb-1">
                                        {t('committee.supervisors.selectedProject')}
                                    </p>
                                    <p className="font-medium">{selectedProject.title}</p>
                                </CardContent>
                            </Card>

                            <div className="space-y-2">
                                {supervisors && supervisors.length > 0 ? (
                                    supervisors.map((supervisor) => (
                                        <Card
                                            key={supervisor.id}
                                            className={`cursor-pointer transition-all ${
                                                selectedSupervisor === supervisor.id
                                                    ? 'border-primary bg-primary/5 shadow-md'
                                                    : 'hover:bg-muted hover:shadow-sm'
                                            }`}
                                            onClick={() => setSelectedSupervisor(supervisor.id)}
                                        >
                                            <CardContent className="p-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <p className="font-medium">{supervisor.name}</p>
                                                            <p className="text-xs text-muted-foreground">{supervisor.email}</p>
                                                        </div>
                                                    </div>
                                                    {selectedSupervisor === supervisor.id && (
                                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                ) : (
                                    <EmptyState
                                        icon={User}
                                        title={t('committee.supervisors.noSupervisors')}
                                        description={t('committee.supervisors.noSupervisorsDescription')}
                                    />
                                )}
                            </div>

                            <Button
                                onClick={handleAssign}
                                disabled={!selectedSupervisor || assignSupervisor.isPending}
                                className="w-full"
                            >
                                {assignSupervisor.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t('committee.supervisors.assigning')}
                                    </>
                                ) : (
                                    <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        {t('committee.supervisors.assignSupervisor')}
                                    </>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6 text-center">
                                <p className="text-muted-foreground">
                                    {t('committee.supervisors.selectProjectFirst')}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}

