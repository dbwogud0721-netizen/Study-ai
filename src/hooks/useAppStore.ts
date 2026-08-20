import { createContext, useContext } from 'react'
import { User, ExamResult, ExamConfig, ExamBlueprint, Question } from '../types'

export interface AppState {
  user: User | null
  setUser: (u: User | null) => void
  pendingExamConfig: ExamConfig | null
  setPendingExamConfig: (c: ExamConfig | null) => void
  pendingBlueprint: ExamBlueprint | null
  setPendingBlueprint: (b: ExamBlueprint | null) => void
  pendingQuestions: Question[] | null
  setPendingQuestions: (q: Question[] | null) => void
  currentExamResult: ExamResult | null
  setCurrentExamResult: (r: ExamResult | null) => void
}

export const AppContext = createContext<AppState>({
  user: null,
  setUser: () => {},
  pendingExamConfig: null,
  setPendingExamConfig: () => {},
  pendingBlueprint: null,
  setPendingBlueprint: () => {},
  pendingQuestions: null,
  setPendingQuestions: () => {},
  currentExamResult: null,
  setCurrentExamResult: () => {},
})

export function useAppStore() {
  return useContext(AppContext)
}
