import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppContext, AppState } from './hooks/useAppStore'
import { User, ExamConfig, ExamBlueprint, Question, StudentUser } from './types'
import type { ExamResult as ExamResultData } from './types'
import { getCurrentUser } from './services/authService'
import { seedDemoHistoryIfEmpty } from './services/examService'

import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import StudentHome from './pages/StudentHome'
import ExamBuilder from './pages/ExamBuilder'
import ExamGenerating from './pages/ExamGenerating'
import Exam from './pages/Exam'
import ExamResultPage from './pages/ExamResult'
import WrongAnswerAnalysis from './pages/WrongAnswerAnalysis'
import GradeDashboard from './pages/GradeDashboard'
import TokenPage from './pages/TokenPage'
import MyPage from './pages/MyPage'
import ProfileEdit from './pages/ProfileEdit'
import LearningSettings from './pages/LearningSettings'
import NotificationSettings from './pages/NotificationSettings'
import ParentLink from './pages/ParentLink'
import Help from './pages/Help'
import ParentDashboard from './pages/ParentDashboard'
import PaymentConfirm from './pages/PaymentConfirm'
import AILearn from './pages/AILearn'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function RequireStudent({ children }: { children: React.ReactNode }) {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/onboarding" replace />
  if (user.accountType === 'parent') return <Navigate to="/parent" replace />
  if (!(user as StudentUser).onboardingCompleted) return <Navigate to="/onboarding" replace />
  return <>{children}</>
}

function RootRedirect() {
  const user = getCurrentUser()
  if (!user) return <Navigate to="/onboarding" replace />
  if (user.accountType === 'parent') return <Navigate to="/parent" replace />
  if (!(user as StudentUser).onboardingCompleted) return <Navigate to="/onboarding" replace />
  return <Navigate to="/home" replace />
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => getCurrentUser())
  const [pendingExamConfig, setPendingExamConfig] = useState<ExamConfig | null>(null)
  const [pendingBlueprint, setPendingBlueprint] = useState<ExamBlueprint | null>(null)
  const [pendingQuestions, setPendingQuestions] = useState<Question[] | null>(null)
  const [currentExamResult, setCurrentExamResult] = useState<ExamResultData | null>(null)

  useEffect(() => {
    if (user && user.accountType !== 'parent') {
      seedDemoHistoryIfEmpty(user.id)
    }
  }, [user])

  const ctx: AppState = {
    user,
    setUser,
    pendingExamConfig,
    setPendingExamConfig,
    pendingBlueprint,
    setPendingBlueprint,
    pendingQuestions,
    setPendingQuestions,
    currentExamResult,
    setCurrentExamResult,
  }

  return (
    <AppContext.Provider value={ctx}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/login" element={<Login />} />

        <Route path="/home" element={<RequireStudent><StudentHome /></RequireStudent>} />
        <Route path="/exam/new" element={<RequireStudent><ExamBuilder /></RequireStudent>} />
        <Route path="/exam/generating" element={<RequireStudent><ExamGenerating /></RequireStudent>} />
        <Route path="/exam" element={<RequireStudent><Exam /></RequireStudent>} />
        <Route path="/result" element={<RequireStudent><ExamResultPage /></RequireStudent>} />
        <Route path="/wrong-analysis/:examId/:questionId" element={<RequireStudent><WrongAnswerAnalysis /></RequireStudent>} />
        <Route path="/grades" element={<RequireStudent><GradeDashboard /></RequireStudent>} />
        <Route path="/tokens" element={<RequireStudent><TokenPage /></RequireStudent>} />
        <Route path="/my" element={<RequireStudent><MyPage /></RequireStudent>} />
        <Route path="/my/profile" element={<RequireStudent><ProfileEdit /></RequireStudent>} />
        <Route path="/my/settings" element={<RequireStudent><LearningSettings /></RequireStudent>} />
        <Route path="/my/notifications" element={<RequireStudent><NotificationSettings /></RequireStudent>} />
        <Route path="/my/parent-link" element={<RequireStudent><ParentLink /></RequireStudent>} />
        <Route path="/my/help" element={<RequireStudent><Help /></RequireStudent>} />
        <Route path="/ai-learn" element={<RequireStudent><AILearn /></RequireStudent>} />

        <Route path="/parent" element={<RequireAuth><ParentDashboard /></RequireAuth>} />
        <Route path="/parent/payment/:requestId" element={<RequireAuth><PaymentConfirm /></RequireAuth>} />

        {/* 기존 경로 호환 */}
        <Route path="/questions" element={<Navigate to="/exam/new" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppContext.Provider>
  )
}
