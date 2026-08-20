import { MOCK_ACCOUNTS, MOCK_STUDENT, MOCK_PARENT } from '../data/mockUsers'
import { User, StudentUser, SchoolLevel, Grade, LearningGoal } from '../types'
import { INITIAL_TOKENS } from '../config/tokenConfig'
import { CURRENT_CURRICULUM_VERSION, getExamSystemVersion } from '../config/curriculumConfig'
import { estimateEntryYear } from '../utils/academicYear'

const SESSION_KEY = 'studyai_user'
const PROFILES_KEY = 'studyai_profiles'

function getProfiles(): Record<string, User> {
  try {
    return JSON.parse(localStorage.getItem(PROFILES_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveProfiles(profiles: Record<string, User>): void {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

export function getUserById(id: string): User | null {
  return getProfiles()[id] ?? null
}

// 계정 전환/재로그인 시에도 각 유저의 상태(토큰, 시험기록 등)가 유지되도록
// 세션(studyai_user)과 별개로 유저별 프로필 저장소를 둔다.
export function saveUser(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  const profiles = getProfiles()
  profiles[user.id] = user
  saveProfiles(profiles)
}

export function login(email: string, password: string): User | null {
  const account = MOCK_ACCOUNTS.find((a) => a.email === email && a.password === password)
  if (!account) return null

  const base = account.type === 'student' ? MOCK_STUDENT : MOCK_PARENT
  const user = getUserById(base.id) ?? base
  saveUser(user)
  return user
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getCurrentUser(): User | null {
  try {
    const stored = localStorage.getItem(SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export interface CreateStudentProfileInput {
  name: string
  schoolLevel: SchoolLevel
  grade: Grade
  selectedSubjects: string[]
  learningGoal?: LearningGoal
}

// 온보딩 완료 시 신규 학생 프로필을 생성한다.
export function createStudentProfile(input: CreateStudentProfileInput): StudentUser {
  const entryYear = estimateEntryYear(input.schoolLevel, input.grade)
  const examSystemVersion = getExamSystemVersion(entryYear).id
  const user: StudentUser = {
    id: `student_${Date.now()}`,
    name: input.name || '학생',
    email: `student_${Date.now()}@studyai.local`,
    accountType: 'student',
    schoolLevel: input.schoolLevel,
    grade: input.grade,
    interests: input.selectedSubjects,
    tokens: INITIAL_TOKENS,
    streak: 0,
    createdAt: new Date().toISOString(),
    entryYear,
    curriculumVersion: CURRENT_CURRICULUM_VERSION,
    examSystemVersion,
    selectedSubjects: input.selectedSubjects,
    learningGoal: input.learningGoal,
    onboardingCompleted: true,
  }
  saveUser(user)
  return user
}
