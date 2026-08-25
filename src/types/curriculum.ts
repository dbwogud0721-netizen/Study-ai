export type SchoolLevel = 'elementary' | 'middle' | 'high'
export type Grade = 1 | 2 | 3

export interface CurriculumUnit {
  id: string
  name: string
  semester?: 1 | 2
}

export interface CurriculumSubject {
  id: string
  name: string
  icon: string
  mainSubject: boolean
  units: CurriculumUnit[]
}

export interface ExamAreaOption {
  id: string
  name: string
}

export interface ExamArea {
  id: string
  name: string
  choiceCount?: number
  options?: ExamAreaOption[]
}

export interface ExamSystemVersion {
  id: string
  label: string
  entryYearFrom: number
  entryYearTo: number | null
  areas: ExamArea[]
}
