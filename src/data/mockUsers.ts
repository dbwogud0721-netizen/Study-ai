import { StudentUser, ParentUser } from '../types'
import { INITIAL_TOKENS, TOKEN_PACKAGES } from '../config/tokenConfig'
import { CURRENT_CURRICULUM_VERSION, getExamSystemVersion } from '../config/curriculumConfig'

const studentEntryYear = 2027

export const MOCK_STUDENT: StudentUser = {
  id: 'student_001',
  name: '박인성',
  email: 'insung@example.com',
  accountType: 'student',
  schoolLevel: 'middle',
  grade: 3,
  interests: ['math', 'sci'],
  tokens: 12,
  streak: 7,
  lastStudyDate: new Date().toISOString().split('T')[0],
  createdAt: '2024-03-01T00:00:00Z',
  parentId: 'parent_001',
  entryYear: studentEntryYear,
  curriculumVersion: CURRENT_CURRICULUM_VERSION,
  examSystemVersion: getExamSystemVersion(studentEntryYear).id,
  selectedSubjects: ['math', 'sci'],
  learningGoal: 'grade_up',
  onboardingCompleted: true,
}

export const MOCK_PARENT: ParentUser = {
  id: 'parent_001',
  name: '박철수',
  email: 'parent@example.com',
  accountType: 'parent',
  tokens: 0,
  streak: 0,
  createdAt: '2024-03-01T00:00:00Z',
  linkedStudentIds: ['student_001'],
  pendingPaymentRequests: [
    {
      id: 'pay_seed_001',
      studentId: 'student_001',
      studentName: '박인성',
      productId: TOKEN_PACKAGES[1].id,
      tokens: TOKEN_PACKAGES[1].tokens + TOKEN_PACKAGES[1].bonus,
      price: TOKEN_PACKAGES[1].price,
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ],
}

export const MOCK_ACCOUNTS = [
  { email: 'student@test.com', password: '1234', userId: 'student_001', type: 'student' },
  { email: 'parent@test.com', password: '1234', userId: 'parent_001', type: 'parent' },
]
