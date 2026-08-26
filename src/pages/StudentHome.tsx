import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HelpCircle, ChevronRight } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AdBanner } from '../components/ads/AdBanner'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { BottomSheet } from '../components/ui/BottomSheet'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { getExamHistory } from '../services/examService'
import { CORE_SUBJECTS } from '../config/curriculumConfig'
import { TOKEN_REWARDS } from '../config/tokenConfig'
import { StudentUser } from '../types'

const TOKEN_RULE_ROWS = [
  { label: '90점 이상', reward: TOKEN_REWARDS.score_90_plus },
  { label: '80~89점', reward: TOKEN_REWARDS.score_80_89 },
  { label: '60~79점', reward: TOKEN_REWARDS.score_60_79 },
  { label: '60점 미만', reward: TOKEN_REWARDS.score_below_60 },
]

export default function StudentHome() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const student = user as StudentUser

  const [showTokenRules, setShowTokenRules] = useState(false)
  const [currentSubject, setCurrentSubject] = useLocalStorage(
    `studyai_current_subject_${student.id}`,
    student.selectedSubjects[0] ?? CORE_SUBJECTS[0].id
  )

  const history = getExamHistory(student.id)
  const recent = history.slice(0, 3)
  const gradeLabel =
    student.schoolLevel === 'elementary'
      ? '초등학교 6학년'
      : `${student.schoolLevel === 'middle' ? '중학교' : '고등학교'} ${student.grade}학년`
  const subjectMeta = CORE_SUBJECTS.find((s) => s.id === currentSubject) ?? CORE_SUBJECTS[0]

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pt-12 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">안녕,</p>
              <h1 className="text-2xl font-black text-gray-900">{student.name} 👋</h1>
              <p className="text-xs text-gray-400 mt-0.5">{gradeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/tokens')} className="flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-chip">
                <span className="text-lg">🪙</span>
                <span className="font-black text-amber-600 text-sm">{student.tokens}</span>
              </button>
              <button onClick={() => setShowTokenRules(true)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <HelpCircle size={16} />
              </button>
            </div>
          </div>
          {student.streak > 0 && <p className="text-sm text-orange-500 font-bold mt-2">🔥 {student.streak}일 연속</p>}
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black text-gray-900 mb-3">오늘의 시험</h2>
          <div className="bg-gradient-to-br from-primary-500 to-violet-600 rounded-card p-5 text-white">
            <p className="text-sm opacity-80 mb-1">{subjectMeta.name}</p>
            <p className="text-lg font-black mb-4">새로운 AI 시험을 만들어볼까요?</p>
            <Button fullWidth variant="secondary" className="!bg-white !text-primary-600" onClick={() => navigate('/exam/new')}>
              시험 만들기
            </Button>
          </div>
        </div>

        <div className="px-5 mt-4 flex gap-2">
          {CORE_SUBJECTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentSubject(s.id)}
              className={`flex-1 py-2.5 rounded-chip text-sm font-bold transition-all ${
                currentSubject === s.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-gray-900">최근 시험</h2>
            <button onClick={() => navigate('/grades')} className="text-sm text-primary-500 flex items-center gap-0.5">
              전체 <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-2">
            {recent.map((h) => (
              <ExamHistoryItem
                key={h.examId}
                subject={h.config.subjectName}
                unit={h.config.targetMiddleArea || h.config.targetMajorArea || h.config.unitName || '전체'}
                date={h.completedAt}
                questionCount={h.questions.length}
                score={h.score}
                onClick={() => navigate('/grades')}
              />
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-400 text-center py-6">아직 응시한 시험이 없어요</p>}
          </div>
        </div>

        <div className="px-5 mt-6">
          <AdBanner slot="home" />
        </div>
      </div>

      <BottomNav />

      <BottomSheet open={showTokenRules} onClose={() => setShowTokenRules(false)} title="게임 토큰은 어떻게 얻나요?">
        <p className="text-sm text-gray-600 mb-4">시험을 완료하면 점수에 따라 게임 토큰을 받아요. 낮은 점수를 받아도 최소 토큰은 받을 수 있어요.</p>
        <div className="space-y-2">
          {TOKEN_RULE_ROWS.map((item) => (
            <div key={item.label} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700">{item.label}</span>
              <span className="font-bold text-amber-500">+{item.reward} 🪙</span>
            </div>
          ))}
        </div>
      </BottomSheet>
    </MobileLayout>
  )
}
