import { useNavigate } from 'react-router-dom'
import { Bell, Flame, ChevronRight } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { ExamCard } from '../components/features/ExamCard'
import { AIInsightCard } from '../components/features/AIInsightCard'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { ScoreChart } from '../components/ui/ScoreChart'
import { useAppStore } from '../hooks/useAppStore'
import { MOCK_RECOMMENDATIONS } from '../data/recommendations'
import { getExamHistory } from '../services/examService'
import { generateAIInsight } from '../services/analytics'
import { TOKEN_COSTS } from '../config/tokenConfig'
import { getCsatDday } from '../utils/academicYear'
import { StudentUser } from '../types'

export default function StudentHome() {
  const { user } = useAppStore()
  const student = user as StudentUser
  if (!student) return null

  return student.schoolLevel === 'middle' ? <MiddleHome student={student} /> : <HighHome student={student} />
}

function TopBar({ student }: { student: StudentUser }) {
  const navigate = useNavigate()
  return (
    <div className="bg-white px-5 pt-12 pb-4">
      <div className="flex items-center justify-between mb-1">
        <div>
          <p className="text-sm text-gray-500">안녕,</p>
          <h1 className="text-2xl font-black text-gray-900">{student.name} 👋</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/tokens')} className="flex items-center gap-1.5 bg-amber-50 px-3 py-2 rounded-chip">
            <span className="text-lg">🪙</span>
            <span className="font-black text-amber-600 text-sm">{student.tokens}</span>
          </button>
          <button className="w-9 h-9 bg-gray-100 rounded-chip flex items-center justify-center text-gray-500">
            <Bell size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function MiddleHome({ student }: { student: StudentUser }) {
  const navigate = useNavigate()
  const history = getExamHistory(student.id)
  const recent = history.slice(0, 3)
  const attempts = history.flatMap((r) => r.attempts)
  const questions = history.flatMap((r) => r.questions)
  const insight = attempts.length >= 10 ? generateAIInsight(attempts, questions) : null
  const rec = MOCK_RECOMMENDATIONS[0]

  return (
    <MobileLayout>
      <div className="flex-1 pb-24 overflow-y-auto">
        <TopBar student={student} />
        <p className="px-5 -mt-2 text-sm text-gray-500">오늘은 어떤 시험에 도전할까요?</p>

        {student.streak > 0 && (
          <div className="mx-5 mt-4">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-card p-4 flex items-center gap-3 text-white">
              <Flame size={28} />
              <div>
                <p className="text-sm opacity-80">연속 학습</p>
                <p className="text-xl font-black">{student.streak}일째 🔥</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs opacity-80">오늘 학습하면</p>
                <p className="text-sm font-bold">+2 보너스!</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-5 mt-6">
          <h2 className="font-black text-gray-900 mb-3">오늘의 추천 시험</h2>
          <ExamCard
            badge="AI 추천"
            title={rec.title}
            subtitle={rec.description}
            questionCount={rec.questionCount}
            minutes={rec.estimatedMinutes}
            tokenCost={rec.tokenCost}
            difficultyStars={rec.difficulty === 'hard' ? 4 : rec.difficulty === 'medium' ? 3 : 2}
            size="lg"
            onClick={() => navigate('/exam/new')}
          />
        </div>

        {insight && (
          <div className="px-5 mt-4">
            <AIInsightCard
              title="AI가 발견한 취약점"
              message={insight.chain[0]}
              action={{ label: '취약점 테스트', onClick: () => navigate('/exam/new?mode=weakness_ai') }}
            />
          </div>
        )}

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
                tokensEarned={h.tokensEarned}
                onClick={() => navigate('/grades')}
              />
            ))}
            {recent.length === 0 && <p className="text-sm text-gray-400 text-center py-6">아직 응시한 시험이 없어요</p>}
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}

function HighHome({ student }: { student: StudentUser }) {
  const navigate = useNavigate()
  const dday = getCsatDday(student.entryYear)
  const history = getExamHistory(student.id)
  const attempts = history.flatMap((r) => r.attempts)
  const questions = history.flatMap((r) => r.questions)
  const insight = attempts.length >= 10 ? generateAIInsight(attempts, questions) : null
  const trend = history.slice(0, 5).reverse().map((h) => ({ label: h.completedAt.slice(5, 10), score: h.score }))

  return (
    <MobileLayout>
      <div className="flex-1 pb-24 overflow-y-auto">
        <TopBar student={student} />

        <div className="px-5 -mt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-900 text-white font-bold px-2.5 py-1 rounded-full">D-{dday}</span>
            <span className="text-sm text-gray-500">수능까지</span>
          </div>
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black text-gray-900 mb-3">오늘의 AI 모의고사</h2>
          <ExamCard
            badge="수학"
            title="AI 실전 모의고사 #024"
            subtitle="함수 · 확률과 통계 · 수열"
            questionCount={30}
            minutes={60}
            tokenCost={TOKEN_COSTS.mock_full}
            difficultyStars={3}
            size="lg"
            onClick={() => navigate('/exam/new?mode=mock_full')}
          />
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black text-gray-900 mb-3">빠른 시작</h2>
          <div className="grid grid-cols-3 gap-3">
            <QuickStartButton emoji="⏱️" label="미니 모의고사" sub="10문제" onClick={() => navigate('/exam/new?mode=mock_mini')} />
            <QuickStartButton emoji="🤖" label="취약점 집중" sub="AI 맞춤" onClick={() => navigate('/exam/new?mode=weakness_ai')} />
            <QuickStartButton emoji="🎯" label="전체 범위" sub="실전 모의고사" onClick={() => navigate('/exam/new?mode=mock_full')} />
          </div>
        </div>

        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-gray-900">최근 성적 추이</h2>
            <button onClick={() => navigate('/grades')} className="text-sm text-primary-500 flex items-center gap-0.5">
              전체 <ChevronRight size={14} />
            </button>
          </div>
          <div className="bg-white rounded-card p-4">
            <ScoreChart data={trend} height={120} compact />
          </div>
        </div>

        {insight && (
          <div className="px-5 mt-4">
            <AIInsightCard
              title="AI 분석"
              message={insight.chain[0]}
              action={{ label: '분석 보기', onClick: () => navigate('/grades') }}
            />
          </div>
        )}
      </div>
      <BottomNav />
    </MobileLayout>
  )
}

function QuickStartButton({ emoji, label, sub, onClick }: { emoji: string; label: string; sub: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="bg-white rounded-card p-3 flex flex-col items-center text-center gap-1 shadow-sm active:scale-95 transition-transform">
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs font-bold text-gray-800">{label}</span>
      <span className="text-[10px] text-gray-400">{sub}</span>
    </button>
  )
}
