import { useState } from 'react'
import { MainLayout } from '@/layouts/MainLayout'
import { ProjectsList } from './list/ProjectsList.screen'
import { SupervisorDefenseEvaluationModal } from './components/SupervisorDefenseEvaluationModal'
import type { Project } from '@/types/project.types'

export function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false)

  const handleEvaluate = (project: Project) => {
    setSelectedProject(project)
    setEvaluationModalOpen(true)
  }

  return (
    <MainLayout>
      <ProjectsList onEvaluate={handleEvaluate} />

      <SupervisorDefenseEvaluationModal
        open={evaluationModalOpen}
        onOpenChange={setEvaluationModalOpen}
        project={selectedProject}
      />
    </MainLayout>
  )
}
