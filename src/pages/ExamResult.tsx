import { useNavigate } from 'react-router-dom'
import { Trophy, RotateCcw, Home, ChevronRight } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { useAppStore } from '../hooks/useAppStore'
import { scoreColor } from '../utils/formatters'

export default function ExamResult() {
  const navigate = useNavigate()
  const { currentExamResult } = useAppStore()

  if (!currentExamResult) {
    navigate('/home')
    return null
  }

  const r = currentExamResult
  const strong = r.conceptAnalysis.filter((c) => c.accuracy >= 70)
  const weak = r.conceptAnalysis.filter((c) => c.accuracy < 70)

  const scoreEmoji = r.score >= 90 ? '🏆' : r.score >= 80 ? '🌟' : r.score >= 70 ? '👍' : '💪'
  const scoreMessage =
    r.score >= 90 ? '완벽해요! 최고예요!'
    : r.score >= 80 ? '잘했어요! 조금만 더!'
    : r.score >= 70 ? '괜찮아요, 계속 도전!'
    : '틀린 문제를 복습해봐요'

  return (
    <MobileLayout className="bg-gray-50">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* 점수 섹션 */}
        <div className="bg-gradient-to-br from-primary-500 to-violet-600 px-5 pt-14 pb-8 text-white text-center">
          <div className="text-5xl mb-2">{scoreEmoji}</div>
          <div className={`text-7xl font-black mb-2`}>{r.score}</div>
          <div className="text-xl opacity-80">점</div>
          {r.scoreDelta !== undefined && (
            <p className={`mt-1 text-sm font-bold ${r.scoreDelta >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              지난 시험보다 {r.scoreDelta >= 0 ? `+${r.scoreDelta}` : r.scoreDelta}점
            </p>
          )}
          <p className="mt-2 text-white/80 font-medium">{scoreMessage}</p>

          {/* 토큰 획득 */}
          <div className="mt-5 bg-white/20 rounded-3xl px-6 py-4 inline-flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <p className="text-xs opacity-80">획득 토큰</p>
              <p className="text-2xl font-black">+{r.tokensEarned} TOKEN</p>
            </div>
          </div>
        </div>

        {/* 정오답 통계 */}
        <div className="mx-5 mt-4">
          <div className="bg-white rounded-3xl p-5">
            <div className="grid grid-cols-3 divide-x divide-gray-100 text-center mb-4">
              <div className="pr-3">
                <p className="text-3xl font-black text-gray-900">{r.questions.length}</p>
                <p className="text-xs text-gray-500 mt-1">전체 문제</p>
              </div>
              <div className="px-3">
                <p className="text-3xl font-black text-green-500">{r.correctCount}</p>
                <p className="text-xs text-gray-500 mt-1">정답</p>
              </div>
              <div className="pl-3">
                <p className="text-3xl font-black text-red-400">{r.wrongCount}</p>
                <p className="text-xs text-gray-500 mt-1">오답</p>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">정답률</span>
                <span className={`font-bold ${scoreColor(r.score)}`}>{r.score}%</span>
              </div>
              <ProgressBar
                value={r.correctCount}
                max={r.questions.length}
                color={r.score >= 80 ? 'bg-green-500' : r.score >= 70 ? 'bg-yellow-500' : 'bg-red-400'}
                height="h-3"
              />
            </div>
          </div>
        </div>

        {/* 개념별 분석 */}
        {(strong.length > 0 || weak.length > 0) && (
          <div className="mx-5 mt-4 space-y-3">
            {strong.length > 0 && (
              <div className="bg-white rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">✅</span>
                  <h3 className="font-bold text-gray-900">잘하고 있어요</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {strong.map((c) => (
                    <span key={c.concept} className="bg-green-50 text-green-600 text-sm font-semibold px-3 py-1.5 rounded-xl">
                      {c.concept} {c.accuracy}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {weak.length > 0 && (
              <div className="bg-white rounded-3xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">⚠️</span>
                  <h3 className="font-bold text-gray-900">보완이 필요해요</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weak.map((c) => (
                    <span key={c.concept} className="bg-red-50 text-red-500 text-sm font-semibold px-3 py-1.5 rounded-xl">
                      {c.concept} {c.accuracy}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 틀린 문제 목록 */}
        {r.wrongCount > 0 && (
          <div className="mx-5 mt-4">
            <div className="bg-white rounded-3xl p-4">
              <h3 className="font-bold text-gray-900 mb-3">틀린 문제 분석</h3>
              <div className="space-y-2">
                {r.questions.map((q, i) => {
                  const isWrong = r.answers[q.questionId] !== q.correctAnswer
                  if (!isWrong) return null
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => navigate(`/wrong-analysis/${r.examId}/${q.questionId}`)}
                      className="w-full flex items-center gap-3 p-3 bg-red-50 rounded-2xl text-left"
                    >
                      <span className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-500">
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{q.question}</p>
                        <p className="text-xs text-gray-400">{q.concept}</p>
                      </div>
                      <ChevronRight size={16} className="text-gray-300" />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] p-5 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => navigate('/home')}>
            <Home size={16} /> 홈
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('/exam/new')}>
            <RotateCcw size={16} /> 새 모의고사
          </Button>
        </div>
      </div>
    </MobileLayout>
  )
}
