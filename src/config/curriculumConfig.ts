import { CurriculumSubject, CurriculumUnit, ExamArea, SchoolLevel } from '../types/curriculum'
import { MIDDLE_SCHOOL_CURRICULUM, getMiddleSchoolSubjects } from '../data/curriculum/middleSchool'
import { HIGH_SCHOOL_CURRICULUM, getHighSchoolSubjects } from '../data/curriculum/highSchool'
import { EXAM_SYSTEM_VERSIONS, getExamSystemVersion } from '../data/curriculum/examSystem'

export { MIDDLE_SCHOOL_CURRICULUM, HIGH_SCHOOL_CURRICULUM, EXAM_SYSTEM_VERSIONS, getExamSystemVersion }

export const CURRENT_CURRICULUM_VERSION = '2022개정'

export function getCurriculumSubjects(schoolLevel: SchoolLevel, grade: number): CurriculumSubject[] {
  return schoolLevel === 'middle' ? getMiddleSchoolSubjects(grade) : getHighSchoolSubjects(grade)
}

export function getCurriculumSubject(schoolLevel: SchoolLevel, grade: number, subjectId: string): CurriculumSubject | undefined {
  return getCurriculumSubjects(schoolLevel, grade).find((s) => s.id === subjectId)
}

export function getUnits(schoolLevel: SchoolLevel, grade: number, subjectId: string): CurriculumUnit[] {
  return getCurriculumSubject(schoolLevel, grade, subjectId)?.units ?? []
}

export function getExamAreas(entryYear: number): ExamArea[] {
  return getExamSystemVersion(entryYear).areas
}

export const DIFFICULTIES = [
  { id: 'easy', label: '하 (쉬움)', color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'medium', label: '중 (보통)', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { id: 'hard', label: '상 (어려움)', color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'mixed', label: '혼합', color: 'text-primary-600', bg: 'bg-primary-50' },
] as const

export const QUESTION_COUNTS = [10, 20, 30] as const
