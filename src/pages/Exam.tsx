import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Flag } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { QuestionNavigator } from '../components/features/QuestionNavigator'
import { useAppStore } from '../hooks/useAppStore'
import { useExamTimer, formatTime } from '../hooks/useExamTimer'
import { buildExamResult } from '../services/examService'
import { recordTransaction } from '../services/tokenService'
import { saveUser } from '../services/authService'
import { TARGET_SCORE_BONUS } from '../config/tokenConfig'
import { StudentUser, QuestionAttempt } from '../types'

interface AttemptTrack {
  firstSelectedAnswer?: number
  selectedAnswer?: number
  answerChangeCount: number
  accumulatedMs: number
}

export default function Exam() {
  const navigate = useNavigate()
  const { user, setUser, pendingExamConfig, pendingQuestions, setCurrentExamResult } = useAppStore()
  const student = user as StudentUser

  const questions = pendingQuestions ?? []
  const config = pendingExamConfig

  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [flaggedIds, setFlaggedIds] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showNav, setShowNav] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const [attemptTracker, setAttemptTracker] = useState<Record<string, AttemptTrack>>({})
  const enterTimeRef = useRef(Date.now())

  const timeLimit = (config?.timeLimitMinutes ?? 20) * 60
  const { seconds, pause } = useExamTimer(timeLimit, () => handleSubmit())

  if (!config || questions.length === 0) {
    navigate('/exam/new')
    return null
  }

  const q = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const isFlagged = flaggedIds.includes(q.questionId)

  /** 문항 이탈 시 그동안 머문 시간을 해당 문항에 누적한다 */
  const flushTime = (questionId: string) => {
    const now = Date.now()
    const elapsedMs = now - enterTimeRef.current
    enterTimeRef.current = now
    setAttemptTracker((prev) => {
      const cur = prev[questionId] ?? { answerChangeCount: 0, accumulatedMs: 0 }
      return { ...prev, [questionId]: { ...cur, accumulatedMs: cur.accumulatedMs + elapsedMs } }
    })
  }

  const goToIndex = (newIndex: number) => {
    flushTime(q.questionId)
    setCurrentIndex(newIndex)
  }

  const handleSelect = (choiceIndex: number) => {
    setAnswers((prev) => ({ ...prev, [q.questionId]: choiceIndex }))
    setAttemptTracker((prev) => {
      const cur = prev[q.questionId] ?? { answerChangeCount: 0, accumulatedMs: 0 }
      const hadPriorSelection = cur.selectedAnswer !== undefined
      const firstSelectedAnswer = cur.firstSelectedAnswer ?? choiceIndex
      const answerChangeCount = hadPriorSelection && cur.selectedAnswer !== choiceIndex ? cur.answerChangeCount + 1 : cur.answerChangeCount
      return { ...prev, [q.questionId]: { firstSelectedAnswer, selectedAnswer: choiceIndex, answerChangeCount, accumulatedMs: cur.accumulatedMs } }
    })
  }

  const toggleFlag = () => {
    setFlaggedIds((prev) => (prev.includes(q.questionId) ? prev.filter((id) => id !== q.questionId) : [...prev, q.questionId]))
  }

  const handleSubmit = async () => {
    if (submitting) return
    pause()
    flushTime(q.questionId)
    setSubmitting(true)
    const duration = Math.floor((Date.now() - startTime) / 1000)

    const attempts: QuestionAttempt[] = questions.map((qq, idx) => {
      const t = attemptTracker[qq.questionId]
      const selectedAnswer = answers[qq.questionId] ?? -1
      return {
        id: `att_${qq.questionId}_${idx}`,
        userId: student.id,
        examId: '',
        questionId: qq.questionId,
        selectedAnswer,
        firstSelectedAnswer: t?.firstSelectedAnswer,
        correctAnswer: qq.correctAnswer,
        isCorrect: selectedAnswer === qq.correctAnswer,
        responseTimeSeconds: Math.round((t?.accumulatedMs ?? 0) / 1000),
        answerChangeCount: t?.answerChangeCount ?? 0,
        flagged: flaggedIds.includes(qq.questionId),
        questionPosition: idx + 1,
        answeredAt: new Date().toISOString(),
      }
    })

    const result = await buildExamResult(config, questions, answers, student.id, duration, flaggedIds, attempts)

    const { balanceAfter: afterEarn } = recordTransaction(student.id, student.tokens, 'EARN', result.tokensEarned, `${config.subjectName} 시험 ${result.score}점 보상`)
    let finalBalance = afterEarn
    if (result.targetScoreMet && result.targetScoreBonusTokens) {
      const { balanceAfter: afterBonus } = recordTransaction(
        student.id,
        afterEarn,
        'BONUS',
        result.targetScoreBonusTokens,
        `목표 점수 ${result.targetScore}점 초과 달성 보너스 (₩${TARGET_SCORE_BONUS.won.toLocaleString()} 상당)`
      )
      finalBalance = afterBonus
    }
    const updatedUser: StudentUser = { ...student, tokens: finalBalance }
    setUser(updatedUser)
    saveUser(updatedUser)
    setCurrentExamResult(result)
    navigate('/result')
  }

  const selectedAnswer = answers[q.questionId]

  return (
    <MobileLayout className="bg-white">
      <div className="px-5 pt-12 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-bold text-primary-500">{config.subjectName}</span>
          <button
            onClick={() => setShowSubmitConfirm(true)}
            className="text-sm font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl"
          >
            제출하기
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black text-gray-900">
            {currentIndex + 1}
            <span className="text-base font-medium text-gray-400"> / {questions.length}</span>
          </span>
          <div className={`text-xl font-black tabular-nums ${seconds < 60 ? 'text-red-500 animate-pulse' : 'text-gray-700'}`}>
            ⏱ {formatTime(seconds)}
          </div>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mt-2">
          <div
            className="h-1 bg-primary-500 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {currentIndex + 1}번
          </span>
          <span className="text-xs text-gray-400">{q.unit} · {q.concept}</span>
          <button
            onClick={toggleFlag}
            className={`ml-auto flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${isFlagged ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}
          >
            <Flag size={12} fill={isFlagged ? 'currentColor' : 'none'} /> 나중에 다시보기
          </button>
        </div>

        {q.passage && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-sm text-gray-700 leading-relaxed border-l-4 border-primary-300">
            {q.passage}
          </div>
        )}

        <p className="text-base font-semibold text-gray-900 mb-5 leading-relaxed">{q.question}</p>

        <div className="space-y-2.5">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                ${selectedAnswer === i
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                ${selectedAnswer === i ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {i + 1}
              </span>
              <span className={`text-sm font-medium ${selectedAnswer === i ? 'text-primary-700' : 'text-gray-700'}`}>
                {choice}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Button
            variant="secondary"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => goToIndex(currentIndex - 1)}
            className="flex-1"
          >
            ← 이전
          </Button>
          <button
            onClick={() => setShowNav(true)}
            className="px-3 py-2 bg-gray-100 rounded-xl text-sm font-semibold text-gray-600"
          >
            {answeredCount}/{questions.length}
          </button>
          <Button
            variant={currentIndex < questions.length - 1 ? 'primary' : 'secondary'}
            size="sm"
            disabled={currentIndex === questions.length - 1}
            onClick={() => goToIndex(currentIndex + 1)}
            className="flex-1"
          >
            다음 →
          </Button>
        </div>
      </div>

      <BottomSheet open={showNav} onClose={() => setShowNav(false)} title="문제 번호">
        <QuestionNavigator
          questions={questions}
          answers={answers}
          currentIndex={currentIndex}
          flaggedIds={flaggedIds}
          onSelect={(i) => { goToIndex(i); setShowNav(false) }}
        />
      </BottomSheet>

      <BottomSheet open={showSubmitConfirm} onClose={() => setShowSubmitConfirm(false)} title="답안 제출">
        {unansweredCount > 0 && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl mb-4">
            <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              <strong>{unansweredCount}문제</strong>가 아직 답변되지 않았어요
            </p>
          </div>
        )}
        <p className="text-sm text-gray-600 mb-4">
          {answeredCount}/{questions.length}문제 답변 완료. 제출하시겠어요?
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setShowSubmitConfirm(false)}>
            계속 풀기
          </Button>
          <Button variant="primary" className="flex-1" loading={submitting} onClick={handleSubmit}>
            제출하기
          </Button>
        </div>
      </BottomSheet>
    </MobileLayout>
  )
}
