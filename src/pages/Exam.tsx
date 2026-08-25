import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ChevronLeft, Flag } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppStore } from '../hooks/useAppStore'
import { useExamTimer } from '../hooks/useExamTimer'
import { buildExamResult } from '../services/examService'
import { getWallet } from '../services/tokenService'
import { saveUser } from '../services/authService'
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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showNavigator, setShowNavigator] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const [attemptTracker, setAttemptTracker] = useState<Record<string, AttemptTrack>>({})
  const enterTimeRef = useRef(Date.now())

  // 타이머는 화면에 노출하지 않는다(스펙: 제한시간 압박 없음). 다만 문제당 3분 정도의
  // 넉넉한 내부 상한을 안전장치로만 걸어두고, 실제 소요시간은 attemptTracker로 계속 측정한다.
  const timeLimit = (config?.timeLimitMinutes ?? 30) * 60
  const { pause } = useExamTimer(timeLimit, () => handleSubmit())

  if (!config || questions.length === 0) {
    navigate('/exam/new')
    return null
  }

  const q = questions[currentIndex]
  const answeredCount = Object.keys(answers).length
  const unansweredCount = questions.length - answeredCount
  const isFlagged = flaggedIds.includes(q.questionId)
  const isLastQuestion = currentIndex === questions.length - 1

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

    const wallet = getWallet(student.id)
    const updatedUser: StudentUser = { ...student, tokens: wallet.balance }
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
          <button onClick={() => setShowExitConfirm(true)} className="flex items-center gap-0.5 text-sm font-bold text-gray-500">
            <ChevronLeft size={18} /> 나가기
          </button>
          <span className="text-sm font-bold text-primary-500">{config.subjectName}</span>
          <button onClick={toggleFlag} className={isFlagged ? 'text-amber-500' : 'text-gray-300'}>
            <Flag size={20} fill={isFlagged ? 'currentColor' : 'none'} />
          </button>
        </div>
        <button onClick={() => setShowNavigator(true)} className="text-2xl font-black text-gray-900">
          {currentIndex + 1}
          <span className="text-base font-medium text-gray-400"> / {questions.length}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
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
        <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-none">
          {questions.map((qq, i) => {
            const answered = answers[qq.questionId] !== undefined
            const flagged = flaggedIds.includes(qq.questionId)
            const isCurrent = i === currentIndex
            return (
              <button
                key={qq.questionId}
                onClick={() => goToIndex(i)}
                className={`w-3 h-3 rounded-full flex-shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-primary-500 ring-2 ring-primary-200 scale-125'
                    : flagged
                      ? 'bg-amber-400'
                      : answered
                        ? 'bg-primary-200'
                        : 'bg-gray-200'
                }`}
                aria-label={`${i + 1}번 문제로 이동`}
              />
            )
          })}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" disabled={currentIndex === 0} onClick={() => goToIndex(currentIndex - 1)} className="flex-1">
            이전
          </Button>
          {isLastQuestion ? (
            <Button variant="primary" size="sm" className="flex-1" onClick={() => setShowSubmitConfirm(true)}>
              시험 제출
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => goToIndex(currentIndex + 1)} className="flex-1">
              다음
            </Button>
          )}
        </div>
      </div>

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

      <BottomSheet open={showNavigator} onClose={() => setShowNavigator(false)} title="문제 번호">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {questions.map((qq, i) => {
            const answered = answers[qq.questionId] !== undefined
            const flagged = flaggedIds.includes(qq.questionId)
            const isCurrent = i === currentIndex
            return (
              <button
                key={qq.questionId}
                onClick={() => { goToIndex(i); setShowNavigator(false) }}
                className={`aspect-square rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                  isCurrent
                    ? 'border-2 border-primary-600 bg-primary-50 text-primary-700'
                    : flagged
                      ? 'bg-amber-100 text-amber-700'
                      : answered
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary-500 inline-block" /> 답변 완료</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded border-2 border-primary-600 inline-block" /> 현재 문제</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> 미답변</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-100 inline-block" /> 검토 표시</span>
        </div>
      </BottomSheet>

      <BottomSheet open={showExitConfirm} onClose={() => setShowExitConfirm(false)} title="시험을 나갈까요?">
        <p className="text-sm text-gray-600 mb-4">현재까지의 답안은 임시 저장됩니다.</p>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setShowExitConfirm(false)}>
            계속 풀기
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => navigate('/home')}>
            시험 나가기
          </Button>
        </div>
      </BottomSheet>
    </MobileLayout>
  )
}
