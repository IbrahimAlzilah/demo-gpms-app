import { v4 as uuidv4 } from 'uuid'
import type {
  Project,
  ProjectStatus,
  Proposal,
  ProjectRegistration,
  SupervisorNote,
  ProjectMilestone,
  ProjectMeeting,
} from '../../types/project.types'

// Mock projects database
export const mockProjects: Project[] = [
  {
    id: '1',
    title: 'نظام إدارة المكتبات الرقمية',
    description: 'نظام متكامل لإدارة المكتبات الرقمية',
    status: 'available_for_registration',
    supervisorId: '2',
    students: [],
    maxStudents: 3,
    currentStudents: 0,
    specialization: 'Computer Science',
    keywords: ['library', 'digital', 'management'],
    documents: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'تطبيق ذكي لإدارة المرور',
    description: 'تطبيق لإدارة حركة المرور باستخدام الذكاء الاصطناعي',
    status: 'in_progress',
    supervisorId: '2',
    students: [],
    maxStudents: 4,
    currentStudents: 2,
    specialization: 'Computer Science',
    keywords: ['traffic', 'AI', 'smart'],
    documents: ['doc1', 'doc2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock proposals database
export const mockProposals: Proposal[] = [
  {
    id: '1',
    title: 'نظام إدارة المشاريع الأكاديمية',
    description: 'نظام شامل لإدارة مشاريع التخرج',
    objectives: 'تسهيل إدارة مشاريع التخرج',
    submitterId: '1',
    status: 'pending_review',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock project registrations database
export const mockProjectRegistrations: ProjectRegistration[] = []

// Mock supervisor notes database
export const mockSupervisorNotes: SupervisorNote[] = [
  {
    id: '1',
    projectId: '2',
    supervisorId: '2',
    content: 'يرجى مراجعة الفصل الأول وإرسال التعديلات المطلوبة',
    studentReplies: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock project milestones database
export const mockProjectMilestones: ProjectMilestone[] = [
  {
    id: '1',
    projectId: '2',
    title: 'تسليم الفصل الأول',
    description: 'تسليم الفصل الأول من المشروع',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'document_submission',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    projectId: '2',
    title: 'لقاء مع المشرف',
    description: 'مناقشة التقدم في المشروع',
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    type: 'meeting',
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock project meetings database
export const mockProjectMeetings: ProjectMeeting[] = [
  {
    id: '1',
    projectId: '2',
    scheduledBy: '2',
    scheduledDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    location: 'مكتب المشرف',
    agenda: 'مناقشة التقدم في المشروع',
    attendees: ['1', '2'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const mockProjectService = {
  getAll: async (): Promise<Project[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockProjects]
  },

  getById: async (id: string): Promise<Project | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProjects.find((p) => p.id === id) || null
  },

  getAvailable: async (): Promise<Project[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockProjects.filter(
      (p) => p.status === 'available_for_registration'
    )
  },

  getStudentRegistrations: async (studentId: string): Promise<ProjectRegistration[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProjectRegistrations.filter(
      (reg) => reg.studentId === studentId && reg.status === 'pending'
    )
  },

  getRegistrationByProject: async (
    projectId: string,
    studentId: string
  ): Promise<ProjectRegistration | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return (
      mockProjectRegistrations.find(
        (reg) => reg.projectId === projectId && reg.studentId === studentId
      ) || null
    )
  },

  register: async (projectId: string, studentId: string): Promise<ProjectRegistration> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Check if student already has a pending registration
    const existingPending = mockProjectRegistrations.find(
      (reg) => reg.studentId === studentId && reg.status === 'pending'
    )
    if (existingPending) {
      throw new Error('أنت مسجل بالفعل في مشروع آخر قيد المراجعة')
    }

    // Check if student is already registered in a project
    const existingApproved = mockProjectRegistrations.find(
      (reg) => reg.studentId === studentId && reg.status === 'approved'
    )
    if (existingApproved) {
      throw new Error('أنت مسجل بالفعل في مشروع آخر')
    }

    const project = mockProjects.find((p) => p.id === projectId)
    if (!project) throw new Error('المشروع غير موجود')
    
    if (project.status !== 'available_for_registration') {
      throw new Error('المشروع غير متاح للتسجيل')
    }

    if (project.currentStudents >= project.maxStudents) {
      throw new Error('المشروع ممتلئ')
    }

    const registration: ProjectRegistration = {
      id: uuidv4(),
      projectId,
      studentId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    mockProjectRegistrations.push(registration)
    return registration
  },

  cancelRegistration: async (registrationId: string, studentId: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const registration = mockProjectRegistrations.find((r) => r.id === registrationId)
    if (!registration) throw new Error('طلب التسجيل غير موجود')
    if (registration.studentId !== studentId) throw new Error('غير مصرح لك بإلغاء هذا الطلب')
    if (registration.status !== 'pending') {
      throw new Error('لا يمكن إلغاء الطلب بعد مراجعته')
    }
    registration.status = 'cancelled'
    registration.updatedAt = new Date().toISOString()
  },

  getSupervisorNotes: async (projectId: string): Promise<SupervisorNote[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockSupervisorNotes.filter((note) => note.projectId === projectId)
  },

  getMilestones: async (projectId: string): Promise<ProjectMilestone[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProjectMilestones.filter((milestone) => milestone.projectId === projectId)
  },

  getMeetings: async (projectId: string): Promise<ProjectMeeting[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProjectMeetings.filter((meeting) => meeting.projectId === projectId)
  },

  getProgressPercentage: async (projectId: string): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const milestones = mockProjectMilestones.filter((m) => m.projectId === projectId)
    if (milestones.length === 0) return 0
    const completed = milestones.filter((m) => m.completed).length
    return Math.round((completed / milestones.length) * 100)
  },
}

export const mockProposalService = {
  getAll: async (): Promise<Proposal[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return [...mockProposals]
  },

  getById: async (id: string): Promise<Proposal | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockProposals.find((p) => p.id === id) || null
  },

  create: async (data: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposal> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const proposal: Proposal = {
      ...data,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockProposals.push(proposal)
    return proposal
  },

  update: async (id: string, data: Partial<Proposal>): Promise<Proposal> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const index = mockProposals.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Proposal not found')
    mockProposals[index] = {
      ...mockProposals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    }
    return mockProposals[index]
  },
}

