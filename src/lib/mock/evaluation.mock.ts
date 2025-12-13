import { v4 as uuidv4 } from 'uuid'
import type { Grade, EvaluationCriteria } from '../../types/evaluation.types'

// Mock grades database
export const mockGrades: Grade[] = [
  {
    id: '1',
    projectId: '2',
    studentId: '1',
    supervisorGrade: {
      score: 85,
      maxScore: 100,
      criteria: { quality: 40, presentation: 30, innovation: 15 },
      comments: 'مشروع جيد',
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: '2',
    },
    isApproved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// Mock evaluation criteria
export const mockEvaluationCriteria: EvaluationCriteria[] = [
  {
    id: '1',
    name: 'جودة المشروع',
    description: 'تقييم جودة العمل المنجز',
    weight: 0.4,
    maxScore: 40,
    category: 'both',
  },
  {
    id: '2',
    name: 'العرض والتقديم',
    description: 'تقييم طريقة العرض والتقديم',
    weight: 0.3,
    maxScore: 30,
    category: 'both',
  },
  {
    id: '3',
    name: 'الابتكار',
    description: 'تقييم الابتكار والأصالة',
    weight: 0.15,
    maxScore: 15,
    category: 'both',
  },
]

export const mockEvaluationService = {
  getGrades: async (projectId?: string, studentId?: string): Promise<Grade[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300))
    let grades = [...mockGrades]
    if (projectId) {
      grades = grades.filter((g) => g.projectId === projectId)
    }
    if (studentId) {
      grades = grades.filter((g) => g.studentId === studentId)
    }
    return grades
  },

  getGradeById: async (id: string): Promise<Grade | null> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return mockGrades.find((g) => g.id === id) || null
  },

  submitSupervisorGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, number>
      comments?: string
    },
    evaluatedBy: string
  ): Promise<Grade> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const existingGrade = mockGrades.find(
      (g) => g.projectId === projectId && g.studentId === studentId
    )

    if (existingGrade) {
      existingGrade.supervisorGrade = {
        ...grade,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy,
      }
      existingGrade.updatedAt = new Date().toISOString()
      return existingGrade
    }

    const newGrade: Grade = {
      id: uuidv4(),
      projectId,
      studentId,
      supervisorGrade: {
        ...grade,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy,
      },
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockGrades.push(newGrade)
    return newGrade
  },

  submitCommitteeGrade: async (
    projectId: string,
    studentId: string,
    grade: {
      score: number
      maxScore: number
      criteria: Record<string, number>
      comments?: string
    },
    evaluatedBy: string,
    committeeMembers: string[]
  ): Promise<Grade> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const existingGrade = mockGrades.find(
      (g) => g.projectId === projectId && g.studentId === studentId
    )

    if (existingGrade) {
      existingGrade.committeeGrade = {
        ...grade,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy,
        committeeMembers,
      }
      // Calculate final grade
      const supervisorScore = existingGrade.supervisorGrade?.score || 0
      const committeeScore = grade.score
      existingGrade.finalGrade = (supervisorScore * 0.5 + committeeScore * 0.5)
      existingGrade.updatedAt = new Date().toISOString()
      return existingGrade
    }

    const newGrade: Grade = {
      id: uuidv4(),
      projectId,
      studentId,
      committeeGrade: {
        ...grade,
        evaluatedAt: new Date().toISOString(),
        evaluatedBy,
        committeeMembers,
      },
      isApproved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    mockGrades.push(newGrade)
    return newGrade
  },

  getCriteria: async (): Promise<EvaluationCriteria[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return [...mockEvaluationCriteria]
  },
}

