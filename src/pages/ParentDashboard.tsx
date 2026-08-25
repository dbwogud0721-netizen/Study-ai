import { useNavigate } from 'react-router-dom'
import { LogOut, BookOpen, TrendingUp, Target, CreditCard } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ScoreChart } from '../components/ui/ScoreChart'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { useAppStore } from '../hooks/useAppStore'
import { logout } from '../services/authService'
import { getExamHistory } from '../services/examService'
import { calculateAreaAccuracy } from '../services/analytics'
import { getActiveRewardPool, getSubscriptionPayments } from '../services/tokenService'
import { MOCK_STUDENT } from '../data/mockUsers'
import { formatDuration, scoreColor } from '../utils/formatters'
import { ParentUser } from '../types'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const parent = user as ParentUser
  const student = MOCK_STUDENT

  const history = getExamHistory(student.id)
  const weeklyStudy = history.filter((h) => {
    const d = new Date(h.completedAt)
    const week = new Date()
    week.setDate(week.getDate() - 7)
    return d >= week
  })
  const weeklyAvg = weeklyStudy.length ? Math.round(weeklyStudy.reduce((s, h) => s + h.score, 0) / weeklyStudy.length) : 0
  const totalQ = weeklyStudy.reduce((s, h) => s + h.questions.length, 0)
  const totalDuration = weeklyStudy.reduce((s, h) => s + h.duration, 0)
  const trend = [...history].reverse().map((h) => ({ label: h.completedAt.slice(5, 10), score: h.score }))
  const areaAcc = calculateAreaAccuracy(history.flatMap((r) => r.attempts), history.flatMap((r) => r.questions))
  const strong = [...areaAcc].reverse().filter((a) => a.accuracy >= 70).slice(0, 2)
  const weak = areaAcc.slice(0, 2)

  const now = new Date()
  const monthlyHistory = history.filter((h) => {
    const d = new Date(h.completedAt)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const monthlyAvg = monthlyHistory.length ? Math.round(monthlyHistory.reduce((s, h) => s + h.score, 0) / monthlyHistory.length) : 0
  const monthlyGoalHits = monthlyHistory.filter((h) => h.targetScoreMet).length

  const pool = getActiveRewardPool(student.id)
  const payment = pool ? getSubscriptionPayments(student.id).find((p) => p.id === pool.paymentId) : undefined
  const poolPercent = pool && pool.totalPoolKrw > 0 ? Math.min(100, Math.round((pool.earnedKrw / pool.totalPoolKrw) * 100)) : 0

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-8">
        <div className="bg-white px-5 pt-12 pb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">보호자 대시보드</p>
              <h1 className="text-2xl font-black text-gray-900">안녕하세요 👋</h1>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 mt-3">
          <div className="bg-gradient-to-br from-primary-500 to-violet-600 rounded-card p-5 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">🎓</div>
              <div>
                <h2 className="text-lg font-black">{student.name}의 이번 주 학습</h2>
                <p className="text-sm opacity-80">🔥 {student.streak}일 연속 학습</p>
              </div>
            </div>
            <div className="grid grid-cols-4 divide-x divide-white/20 text-center">
              <div>
                <p className="text-xl font-black">{weeklyStudy.length}회</p>
                <p className="text-[11px] opacity-80 mt-1">시험 응시</p>
              </div>
              <div>
                <p className="text-xl font-black">{totalQ}</p>
                <p className="text-[11px] opacity-80 mt-1">푼 문제</p>
              </div>
              <div>
                <p className="text-xl font-black">{weeklyAvg}점</p>
                <p className="text-[11px] opacity-80 mt-1">평균 점수</p>
              </div>
              <div>
                <p className="text-xl font-black">{formatDuration(totalDuration)}</p>
                <p className="text-[11px] opacity-80 mt-1">학습시간</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">이번 달 학습 프로그램</h3>
            </div>
            {pool && payment ? (
              <>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-gray-500">결제</span>
                  <span className="text-xl font-black text-gray-900">₩{payment.totalPaymentKrw.toLocaleString()}</span>
                </div>
                <div className="bg-gray-50 rounded-2xl p-3 space-y-1.5 mb-4">
                  <Row label="AI 학습 서비스 이용료" value={`₩${payment.serviceFeeKrw.toLocaleString()}`} />
                  <Row label="학생 Reward 예산" value={`₩${payment.rewardPoolKrw.toLocaleString()}`} />
                </div>
                <div className="pt-3 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-900">이번 달 {student.name}이의 Reward</span>
                    <span className="text-xs text-gray-400">{poolPercent}%</span>
                  </div>
                  <ProgressBar value={poolPercent} color="bg-amber-400" height="h-2.5" />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-green-600 font-bold">획득 ₩{pool.earnedKrw.toLocaleString()}</span>
                    <span className="text-gray-400">남은 Reward ₩{pool.remainingKrw.toLocaleString()}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-4">이번 달 학습 프로그램 결제가 아직 없어요</p>
                <Button fullWidth onClick={() => navigate('/parent/payment')}>
                  이번 달 결제하기
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">학습 결과</h3>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center">
              <div>
                <p className="text-xl font-black text-gray-900">{monthlyHistory.length}회</p>
                <p className="text-[11px] text-gray-400 mt-1">시험</p>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{monthlyGoalHits}회</p>
                <p className="text-[11px] text-gray-400 mt-1">목표 점수 달성</p>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900">{monthlyAvg}점</p>
                <p className="text-[11px] text-gray-400 mt-1">평균점수</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">최근 성적</h3>
            </div>
            <ScoreChart data={trend} height={150} />
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-2xl p-3">
                <p className="text-xs font-semibold text-green-600 mb-2">✅ 잘하고 있는 영역</p>
                {strong.map((a) => (
                  <div key={a.key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{a.label}</span>
                    <span className="text-xs font-bold text-green-500">{a.accuracy}%</span>
                  </div>
                ))}
                {strong.length === 0 && <p className="text-xs text-gray-400 py-1">데이터 쌓이는 중</p>}
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-xs font-semibold text-red-500 mb-2">⚠️ 보완이 필요한 영역</p>
                {weak.map((a) => (
                  <div key={a.key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{a.label}</span>
                    <span className="text-xs font-bold text-red-400">{a.accuracy}%</span>
                  </div>
                ))}
                {weak.length === 0 && <p className="text-xs text-gray-400 py-1">데이터 쌓이는 중</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">과목별 정답률</h3>
            </div>
            <div className="space-y-3">
              {Object.values(
                history.reduce((acc, h) => {
                  const key = h.config.subjectName
                  if (!acc[key]) acc[key] = { subject: key, totalScore: 0, count: 0 }
                  acc[key].totalScore += h.score
                  acc[key].count++
                  return acc
                }, {} as Record<string, { subject: string; totalScore: number; count: number }>)
              )
                .map((s) => ({ subject: s.subject, accuracy: Math.round(s.totalScore / s.count) }))
                .map((s) => (
                  <div key={s.subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{s.subject}</span>
                      <span className={`font-bold ${scoreColor(s.accuracy)}`}>{s.accuracy}%</span>
                    </div>
                    <ProgressBar value={s.accuracy} color={s.accuracy >= 80 ? 'bg-green-400' : s.accuracy >= 70 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2" />
                  </div>
                ))}
              {history.length === 0 && <p className="text-sm text-gray-400 text-center py-4">데이터 쌓이는 중</p>}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">최근 학습 기록</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map((h) => (
                <ExamHistoryItem
                  key={h.examId}
                  subject={h.config.subjectName}
                  unit={h.config.targetMiddleArea || h.config.targetMajorArea || h.config.unitName || '전체'}
                  date={h.completedAt}
                  questionCount={h.questions.length}
                  score={h.score}
                />
              ))}
              {history.length === 0 && <p className="text-sm text-gray-400 text-center py-4">아직 학습 기록이 없어요</p>}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  )
}
