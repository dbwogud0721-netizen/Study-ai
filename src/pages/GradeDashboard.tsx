import { BarChart2, Target, Trophy, ListChecks, Timer, TrendingUp } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { StatCard } from '../components/ui/StatCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ScoreChart } from '../components/ui/ScoreChart'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { AIInsightCard } from '../components/features/AIInsightCard'
import { MOCK_EXAM_HISTORY, MOCK_SUBJECT_STATS, MOCK_CONCEPT_STRENGTHS } from '../data/mockExamHistory'
import { scoreColor } from '../utils/formatters'

export default function GradeDashboard() {
  const history = MOCK_EXAM_HISTORY
  const recentScore = history[0]?.score ?? 0
  const recent5Avg = Math.round(history.slice(0, 5).reduce((s, h) => s + h.score, 0) / Math.min(5, history.length))
  const bestScore = Math.max(...history.map((h) => h.score))
  const examCount = history.length

  const trend = [...history].reverse().map((h) => ({ label: h.date.slice(5), score: h.score }))

  const timePerSubject = Object.values(
    history.reduce((acc, h) => {
      if (!acc[h.subject]) acc[h.subject] = { subject: h.subject, totalSec: 0, totalQ: 0 }
      acc[h.subject].totalSec += h.duration
      acc[h.subject].totalQ += h.questionCount
      return acc
    }, {} as Record<string, { subject: string; totalSec: number; totalQ: number }>)
  ).map((s) => ({ subject: s.subject, avgSecPerQ: Math.round(s.totalSec / s.totalQ) }))

  const weak = MOCK_CONCEPT_STRENGTHS.filter((c) => c.status === 'weak').sort((a, b) => a.accuracy - b.accuracy)
  const topWeak = weak[0]

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pt-12 pb-4">
          <h1 className="text-2xl font-black text-gray-900">성적 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">나의 학습 성장을 한눈에</p>
        </div>

        <div className="px-5 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Target size={20} className="text-primary-500" />} label="최근 모의고사" value={`${recentScore}점`} color="bg-primary-50" />
            <StatCard icon={<TrendingUp size={20} className="text-blue-500" />} label="최근 5회 평균" value={`${recent5Avg}점`} color="bg-blue-50" />
            <StatCard icon={<Trophy size={20} className="text-amber-500" />} label="최고 점수" value={`${bestScore}점`} color="bg-amber-50" />
            <StatCard icon={<ListChecks size={20} className="text-violet-500" />} label="시험 응시" value={`${examCount}회`} color="bg-violet-50" />
          </div>
        </div>

        <div className="px-5 mt-5">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 size={18} className="text-primary-500" />
              <h2 className="font-black text-gray-900">점수 추이</h2>
            </div>
            <ScoreChart data={trend} height={180} />
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h2 className="font-black text-gray-900 mb-4">과목별 성적</h2>
            <div className="space-y-3">
              {MOCK_SUBJECT_STATS.map((s) => (
                <div key={s.subject}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold text-gray-700">{s.subject}</span>
                    <span className={`font-bold ${scoreColor(s.accuracy)}`}>{s.accuracy}%</span>
                  </div>
                  <ProgressBar value={s.accuracy} color={s.accuracy >= 80 ? 'bg-green-400' : s.accuracy >= 70 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2.5" />
                  <p className="text-xs text-gray-400 mt-0.5">{s.count}문제 풀이</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h2 className="font-black text-gray-900 mb-4">단원별 정답률</h2>
            <div className="space-y-3">
              {MOCK_CONCEPT_STRENGTHS.map((c) => (
                <div key={c.concept}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{c.concept}</span>
                    <span className={`font-bold ${c.status === 'strong' ? 'text-green-500' : 'text-red-400'}`}>{c.accuracy}%</span>
                  </div>
                  <ProgressBar value={c.accuracy} color={c.status === 'strong' ? 'bg-green-400' : 'bg-red-400'} height="h-2" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <Timer size={18} className="text-primary-500" />
              <h2 className="font-black text-gray-900">풀이시간 분석</h2>
            </div>
            <div className="space-y-2">
              {timePerSubject.map((t) => (
                <div key={t.subject} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-gray-700">{t.subject}</span>
                  <span className="text-sm font-bold text-gray-900">문제당 평균 {t.avgSecPerQ}초</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {topWeak && (
          <div className="px-5 mt-4">
            <AIInsightCard
              title="AI가 분석한 취약점"
              message={`${topWeak.concept} 정답률이 ${topWeak.accuracy}%로 가장 낮아요. 관련 문제를 더 풀어보면 좋아요.`}
            />
          </div>
        )}

        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h2 className="font-black text-gray-900 mb-3">최근 시험 목록</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <ExamHistoryItem key={h.examId} subject={h.subject} unit={h.unit} date={h.date} questionCount={h.questionCount} score={h.score} tokensEarned={h.tokensEarned} />
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
