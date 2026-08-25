import { SchoolLevel, Grade } from './curriculum'

export type AccountType = 'student' | 'parent'
export type { SchoolLevel, Grade }
export type LearningGoal = 'grade_up' | 'exam_prep' | 'review' | 'habit'

export interface User {
  id: string
  name: string
  email: string
  accountType: AccountType
  schoolLevel?: SchoolLevel
  grade?: Grade
  interests?: string[]
  tokens: number
  streak: number
  lastStudyDate?: string
  createdAt: string
}

export interface StudentUser extends User {
  accountType: 'student'
  schoolLevel: SchoolLevel
  grade: Grade
  interests: string[]
  parentId?: string
  entryYear: number
  curriculumVersion: string
  examSystemVersion: string
  selectedSubjects: string[]
  learningGoals: LearningGoal[]
  onboardingCompleted: boolean
}

export interface ParentUser extends User {
  accountType: 'parent'
  linkedStudentIds: string[]
}
