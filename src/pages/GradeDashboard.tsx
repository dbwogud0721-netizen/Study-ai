import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart2, Target, Trophy, ListChecks, Timer, TrendingUp } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AdBanner } from '../components/ads/AdBanner'
import { StatCard } from '../components/ui/StatCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { ScoreChart } from '../components/ui/ScoreChart'
import { ExamHistoryItem } from '../components/features/ExamHistoryItem'
import { ExamCard } from '../components/features/ExamCard'
import { WeaknessCard } from '../components/features/WeaknessCard'
import { PositionHeatmap } from '../components/features/PositionHeatmap'
import { useAppStore } from '../hooks/useAppStore'
import { getSubjectTaxonomy } from '../config/curriculumConfig'
import { getExamHistory } from '../services/examService'
import { recordTransaction } from '../services/tokenService'
import { saveUser } from '../services/authService'
import {
  calculateOverallScore,
  calculateAreaAccuracy,
  calculateConceptAccuracy,
  calculateQuestionTypeAccuracy,
  calculateDifficultyAccuracy,
  calculatePositionAccuracy,
  calculateResponseTime,
  detectRepeatedWeakness,
  detectDifficultyWeakness,
  detectTimeManagementIssue,
  detectRushing,
  detectCarelessMistake,
  detectAnswerChangePattern,
  detectAnswerChangeWeakness,
  generateAIInsight,
  generateRecommendedExam,
} from '../services/analytics'
import { scoreColor } from '../utils/formatters'
import { StudentUser, ExamConfig, ExamBlueprint, ExamResult, AnalysisPeriod, WeaknessPattern } from '../types'

const PERIOD_OPTIONS: [AnalysisPeriod, string][] = [
  ['5', '최근 5회'],
  ['10', '최근 10회'],
  ['1m', '1개월'],
  ['3m', '3개월'],
  ['all', '전체'],
]

function filterByPeriod(history: ExamResult[], period: AnalysisPeriod): ExamResult[] {
  if (period === '5') return history.slice(0, 5)
  if (period === '10') return history.slice(0, 10)
  if (period === 'all') return history
  const days = period === '1m' ? 30 : 90
  const cutoff = Date.now() - days * 86400000
  return history.filter((r) => new Date(r.completedAt).getTime() >= cutoff)
}

export default function GradeDashboard() {
  const navigate = useNavigate()
  const { user, setUser, setPendingExamConfig, setPendingBlueprint } = useAppStore()
  const student = user as StudentUser

  const allHistory = useMemo(() => getExamHistory(student.id), [student.id])
  const subjects = useMemo(() => Array.from(new Set(allHistory.map((r) => r.config.subjectName))), [allHistory])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [period, setPeriod] = useState<AnalysisPeriod>('10')
  const [selectedArea, setSelectedArea] = useState<string | undefined>(undefined)

  const activeSubject = selectedSubject || subjects[0] || ''
  const subjectHistory = useMemo(() => allHistory.filter((r) => r.config.subjectName === activeSubject), [allHistory, activeSubject])
  const history = useMemo(() => filterByPeriod(subjectHistory, period), [subjectHistory, period])

  const attempts = useMemo(() => history.flatMap((r) => r.attempts), [history])
  const questions = useMemo(() => history.flatMap((r) => r.questions), [history])
  const hasTaxonomy = !!getSubjectTaxonomy(activeSubject)

  const overall = calculateOverallScore(history)
  const areaAcc = calculateAreaAccuracy(attempts, questions)
  const activeArea = selectedArea ?? areaAcc[0]?.key
  const middleAcc = hasTaxonomy ? calculateConceptAccuracy(attempts, questions, activeArea) : []
  const typeAcc = hasTaxonomy ? calculateQuestionTypeAccuracy(attempts, questions, { majorArea: activeArea }) : []
  const diffAcc = calculateDifficultyAccuracy(attempts, questions)
  const posAcc = calculatePositionAccuracy(attempts, questions).filter((p) => p.sampleSize >= 3)
  const timeStats = calculateResponseTime(attempts)
  const changeStats = detectAnswerChangePattern(attempts)

  const weaknessPatterns: WeaknessPattern[] = useMemo(() => {
    const patterns = [
      ...detectRepeatedWeakness(attempts, questions),
      detectDifficultyWeakness(attempts, questions),
      detectTimeManagementIssue(attempts),
      detectRushing(attempts, questions),
      detectCarelessMistake(attempts, questions),
      detectAnswerChangeWeakness(attempts),
    ]
    return patterns.filter((p): p is WeaknessPattern => p !== null)
  }, [attempts, questions])

  const aiInsight = attempts.length >= 10 ? generateAIInsight(attempts, questions) : null
  const recommended = hasTaxonomy && attempts.length >= 10 ? generateRecommendedExam(attempts, questions, activeSubject, 15) : null

  const trend = [...history].reverse().map((h) => ({ label: h.completedAt.slice(5, 10), score: h.score }))

  function startFocusedPractice(label: string) {
    const config: ExamConfig = {
      schoolLevel: student.schoolLevel,
      grade: student.grade,
      examMode: 'unit_focus',
      examType: 'PRACTICE',
      subject: activeSubject,
      subjectName: activeSubject,
      targetMiddleArea: label,
      difficulty: 'mixed',
      questionCount: 10,
      timeLimitMinutes: 18,
    }
    const bp: ExamBlueprint = {
      title: `${label} 집중 훈련`,
      examModeLabel: '집중 훈련',
      totalQuestions: 10,
      distribution: [{ label, count: 10 }],
      estimatedMinutes: 18,
      tokenCost: 0,
    }
    setPendingExamConfig(config)
    setPendingBlueprint(bp)
    navigate('/exam/generating')
  }

  function startRecommendedExam() {
    if (!recommended || student.tokens < recommended.tokenCost) return
    const config: ExamConfig = {
      schoolLevel: student.schoolLevel,
      grade: student.grade,
      examMode: 'weakness_ai',
      examType: 'WEAKNESS_MOCK',
      subject: activeSubject,
      subjectName: activeSubject,
      difficulty: 'mixed',
      questionCount: recommended.totalQuestions,
      timeLimitMinutes: recommended.estimatedMinutes,
    }
    const { balanceAfter } = recordTransaction(student.id, student.tokens, 'SPEND', recommended.tokenCost, `${recommended.title} 응시`)
    const updatedUser: StudentUser = { ...student, tokens: balanceAfter }
    saveUser(updatedUser)
    setUser(updatedUser)
    setPendingExamConfig(config)
    setPendingBlueprint(recommended)
    navigate('/exam/generating')
  }

  if (allHistory.length === 0) {
    return (
      <MobileLayout>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-2">
          <p className="text-lg font-black text-gray-900">아직 응시한 시험이 없어요</p>
          <p className="text-sm text-gray-500">모의고사를 풀면 성적 분석이 여기에 쌓여요</p>
        </div>
        <BottomNav />
      </MobileLayout>
    )
  }

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pt-12 pb-4">
          <h1 className="text-2xl font-black text-gray-900">성적 대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">나의 학습 성장을 한눈에</p>
        </div>

        {subjects.length > 1 && (
          <div className="px-5 mt-2 flex gap-2 overflow-x-auto">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => { setSelectedSubject(s); setSelectedArea(undefined) }}
                className={`px-3.5 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                  activeSubject === s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="px-5 mt-3 flex gap-1.5 overflow-x-auto">
          {PERIOD_OPTIONS.map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                period === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 1. 현재 점수 */}
        <div className="px-5 mt-3">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={<Target size={20} className="text-primary-500" />} label="최근 모의고사" value={`${overall.recentScore}점`} color="bg-primary-50" />
            <StatCard icon={<TrendingUp size={20} className="text-blue-500" />} label="최근 5회 평균" value={`${overall.recent5Avg}점`} color="bg-blue-50" />
            <StatCard icon={<Trophy size={20} className="text-amber-500" />} label="최고 점수" value={`${overall.bestScore}점`} color="bg-amber-50" />
            <StatCard icon={<ListChecks size={20} className="text-violet-500" />} label="시험 응시" value={`${overall.examCount}회`} color="bg-violet-50" />
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

        {/* 2. 가장 취약한 영역 + 대영역 정답률 */}
        {areaAcc.length > 0 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <h2 className="font-black text-gray-900 mb-1">영역별 정답률</h2>
              {areaAcc[0] && <p className="text-xs text-red-500 font-semibold mb-3">가장 취약한 영역: {areaAcc[0].label} ({areaAcc[0].accuracy}%)</p>}
              <div className="space-y-3">
                {areaAcc.map((a) => (
                  <button key={a.key} onClick={() => setSelectedArea(a.key)} className="w-full text-left">
                    <div className="flex justify-between text-sm mb-1">
                      <span className={`font-semibold ${activeArea === a.key ? 'text-primary-600' : 'text-gray-700'}`}>{a.label}</span>
                      <span className={`font-bold ${scoreColor(a.accuracy)}`}>{a.accuracy}%</span>
                    </div>
                    <ProgressBar value={a.accuracy} color={a.accuracy >= 80 ? 'bg-green-400' : a.accuracy >= 60 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. 중영역 드릴다운 */}
        {hasTaxonomy && middleAcc.length > 0 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <h2 className="font-black text-gray-900 mb-4">{areaAcc.find((a) => a.key === activeArea)?.label ?? '세부'} 영역</h2>
              <div className="space-y-3">
                {middleAcc.map((m) => (
                  <div key={m.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{m.label}</span>
                      <span className={`font-bold ${scoreColor(m.accuracy)}`}>{m.accuracy}%</span>
                    </div>
                    <ProgressBar value={m.accuracy} color={m.accuracy >= 80 ? 'bg-green-400' : m.accuracy >= 60 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. 문제 유형 */}
        {hasTaxonomy && typeAcc.length > 0 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <h2 className="font-black text-gray-900 mb-4">문제 유형별 정답률</h2>
              <div className="space-y-3">
                {typeAcc.map((t) => (
                  <div key={t.key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{t.label}</span>
                      <span className={`font-bold ${scoreColor(t.accuracy)}`}>{t.accuracy}%</span>
                    </div>
                    <ProgressBar value={t.accuracy} color={t.accuracy >= 80 ? 'bg-green-400' : t.accuracy >= 60 ? 'bg-yellow-400' : 'bg-red-400'} height="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. 난이도 */}
        {diffAcc.length > 0 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <h2 className="font-black text-gray-900 mb-4">난이도별 정답률</h2>
              <div className="grid grid-cols-4 gap-2">
                {diffAcc.map((d) => (
                  <div key={d.key} className="text-center">
                    <p className={`text-lg font-black ${scoreColor(d.accuracy)}`}>{d.accuracy}%</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. 문항 위치 분석 */}
        {posAcc.length > 3 && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <h2 className="font-black text-gray-900 mb-1">문항 위치 분석</h2>
              <p className="text-xs text-gray-400 mb-3">정답률이 낮을수록 빨간색이에요</p>
              <PositionHeatmap positions={posAcc} />
              {posAcc[0] && posAcc[0].accuracy < 60 && (
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                  {posAcc[0].position}번 위치는 정답률 {posAcc[0].accuracy}%로 낮아요.
                  {posAcc[0].commonTags.majorArea && ` 주로 ${posAcc[0].commonTags.majorArea}`}
                  {posAcc[0].commonTags.minorArea && ` · ${posAcc[0].commonTags.minorArea}`}
                  {posAcc[0].commonTags.difficulty && ` · 난이도 ${posAcc[0].commonTags.difficulty}`} 문제가 반복 출제됐어요.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 답변경 + 시간관리 */}
        {(changeStats.sampleSize > 0 || timeStats.segments.length > 0) && (
          <div className="px-5 mt-4">
            <div className="bg-white rounded-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Timer size={18} className="text-primary-500" />
                <h2 className="font-black text-gray-900">학습 습관 분석</h2>
              </div>
              {timeStats.segments.length > 0 && (
                <div className="space-y-1.5 mb-3">
                  {timeStats.segments.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{s.label}</span>
                      <span className="font-bold text-gray-900">평균 {Math.floor(s.avgSeconds / 60)}분 {s.avgSeconds % 60}초</span>
                    </div>
                  ))}
                  {timeStats.slowingDown && <p className="text-xs text-amber-500 mt-1">후반부로 갈수록 풀이 시간이 늘고 있어요</p>}
                </div>
              )}
              {changeStats.sampleSize > 0 && (
                <div className="pt-3 border-t border-gray-50 text-sm space-y-1">
                  <div className="flex justify-between"><span className="text-gray-500">답 변경</span><span className="font-bold text-gray-900">{changeStats.totalChanges}문제</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">오답 → 정답</span><span className="font-bold text-green-500">{changeStats.wrongToCorrect}회</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">정답 → 오답</span><span className="font-bold text-red-500">{changeStats.correctToWrong}회</span></div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. AI 종합분석 */}
        {aiInsight && (
          <div className="px-5 mt-4">
            <div className="bg-gradient-to-br from-violet-500 to-primary-600 rounded-card p-4 text-white">
              <p className="text-xs font-bold opacity-90 mb-2">✨ AI 종합 분석</p>
              <div className="space-y-1.5">
                {aiInsight.chain.map((line, i) => (
                  <p key={i} className="text-sm leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 8. 취약점 카드 */}
        {weaknessPatterns.length > 0 && (
          <div className="px-5 mt-4">
            <h2 className="font-black text-gray-900 mb-3 px-1">취약점</h2>
            <div className="space-y-2.5">
              {weaknessPatterns.slice(0, 5).map((p, i) => (
                <WeaknessCard
                  key={`${p.kind}_${i}`}
                  label={p.label}
                  detail={p.detail}
                  accuracy={p.accuracy}
                  confidence={p.confidence}
                  actionLabel={p.kind === 'CONCEPT_WEAKNESS' && hasTaxonomy ? '집중 훈련' : undefined}
                  onAction={p.kind === 'CONCEPT_WEAKNESS' && hasTaxonomy ? () => startFocusedPractice(p.label) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* 9. AI 추천 모의고사 */}
        {recommended && (
          <div className="px-5 mt-4">
            <h2 className="font-black text-gray-900 mb-3 px-1">AI 추천 모의고사</h2>
            <ExamCard
              badge="AI 추천"
              title={recommended.title}
              subtitle={recommended.rationale}
              questionCount={recommended.totalQuestions}
              minutes={recommended.estimatedMinutes}
              tokenCost={recommended.tokenCost}
              size="lg"
              onClick={startRecommendedExam}
            />
            <div className="bg-white rounded-card p-4 mt-2 space-y-1.5">
              {recommended.distribution.map((d) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-gray-600">{d.label}</span>
                  <span className="font-bold text-gray-900">{d.count}문제</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. 최근 시험 목록 */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-card p-4">
            <h2 className="font-black text-gray-900 mb-3">최근 시험 목록</h2>
            <div className="space-y-2">
              {history.map((h) => (
                <ExamHistoryItem
                  key={h.examId}
                  subject={h.config.subjectName}
                  unit={h.config.targetMiddleArea || h.config.targetMajorArea || h.config.unitName || (h.examType === 'FULL_MOCK' ? '전체' : '연습')}
                  date={h.completedAt}
                  questionCount={h.questions.length}
                  score={h.score}
                  tokensEarned={h.tokensEarned}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4">
          <AdBanner slot="grades" />
        </div>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}
