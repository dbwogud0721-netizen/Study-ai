import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, LogOut, BookOpen, TrendingUp, Clock } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ScoreChart } from '../components/ui/ScoreChart'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { useAppStore } from '../hooks/useAppStore'
import { logout } from '../services/authService'
import { getMonthlyStats } from '../services/tokenService'
import { getPendingRequestsForParent, approveRequest, rejectRequest } from '../services/paymentService'
import { TOKEN_PACKAGES } from '../config/tokenConfig'
import { MOCK_STUDENT } from '../data/mockUsers'
import { MOCK_EXAM_HISTORY, MOCK_SUBJECT_STATS, MOCK_CONCEPT_STRENGTHS } from '../data/mockExamHistory'
import { formatDuration, scoreColor } from '../utils/formatters'
import { ParentUser } from '../types'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const parent = user as ParentUser
  const student = MOCK_STUDENT
  const [refreshKey, setRefreshKey] = useState(0)

  const weeklyStudy = MOCK_EXAM_HISTORY.filter((h) => {
    const d = new Date(h.date)
    const week = new Date()
    week.setDate(week.getDate() - 7)
    return d >= week
  })
  const weeklyAvg = weeklyStudy.length ? Math.round(weeklyStudy.reduce((s, h) => s + h.score, 0) / weeklyStudy.length) : 0
  const totalQ = weeklyStudy.reduce((s, h) => s + h.questionCount, 0)
  const totalDuration = weeklyStudy.reduce((s, h) => s + h.duration, 0)
  const trend = [...MOCK_EXAM_HISTORY].reverse().map((h) => ({ label: h.date.slice(5), score: h.score }))
  const strong = MOCK_CONCEPT_STRENGTHS.filter((c) => c.status === 'strong').slice(0, 2)
  const weak = MOCK_CONCEPT_STRENGTHS.filter((c) => c.status === 'weak').slice(0, 2)
  const monthlyTokenUsage = getMonthlyStats(student.id).spent

  const pendingRequests = useMemo(
    () => getPendingRequestsForParent(parent?.linkedStudentIds ?? []),
    [parent, refreshKey]
  )

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  const handleReject = (id: string) => {
    rejectRequest(id)
    setRefreshKey((k) => k + 1)
  }

  const handleApprove = (id: string) => {
    approveRequest(id)
    navigate(`/parent/payment/${id}`)
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
                {strong.map((c) => (
                  <div key={c.concept} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{c.concept}</span>
                    <span className="text-xs font-bold text-green-500">{c.accuracy}%</span>
                  </div>
                ))}
              </div>
              <div className="bg-red-50 rounded-2xl p-3">
                <p className="text-xs font-semibold text-red-500 mb-2">⚠️ 보완이 필요한 영역</p>
                {weak.map((c) => (
                  <div key={c.concept} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{c.concept}</span>
                    <span className="text-xs font-bold text-red-400">{c.accuracy}%</span>
                  </div>
                ))}
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
              {MOCK_SUBJECT_STATS.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{s.subject}</span>
                    <span className={`font-bold ${scoreColor(s.accuracy)}`}>{s.accuracy}%</span>
                  </div>
                  <ProgressBar value={s.accuracy} color={s.accuracy >= 80 ? 'bg-green-400' : s.accuracy >= 70 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-primary-500" />
              <h3 className="font-bold text-gray-900">이번 달 토큰 사용</h3>
            </div>
            <span className="font-black text-amber-500">🪙 {monthlyTokenUsage} TOKEN</span>
          </div>
        </div>

        {pendingRequests.length > 0 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🪙</span>
                <h3 className="font-bold text-gray-900">결제 요청</h3>
                <span className="ml-auto bg-red-100 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequests.length}건</span>
              </div>
              <div className="space-y-3">
                {pendingRequests.map((req) => {
                  const pkg = TOKEN_PACKAGES.find((p) => p.id === req.productId)
                  return (
                    <div key={req.id} className="bg-amber-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-700 mb-1">{req.studentName}이(가) 토큰 충전을 요청했어요</p>
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-black text-gray-900">{pkg?.label ?? `${req.tokens} TOKEN`}</p>
                        <p className="font-black text-amber-600">{req.price.toLocaleString()}원</p>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">요청 시간 {new Date(req.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="danger" className="flex-1" onClick={() => handleReject(req.id)}>
                          <XCircle size={14} /> 거절
                        </Button>
                        <Button size="sm" variant="primary" className="flex-1" onClick={() => handleApprove(req.id)}>
                          <CheckCircle size={14} /> 결제 승인
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h3 className="font-bold text-gray-900 mb-3">최근 학습 기록</h3>
            <div className="space-y-2">
              {MOCK_EXAM_HISTORY.slice(0, 5).map((h) => (
                <ExamHistoryItem key={h.examId} subject={h.subject} unit={h.unit} date={h.date} questionCount={h.questionCount} score={h.score} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  )
}
