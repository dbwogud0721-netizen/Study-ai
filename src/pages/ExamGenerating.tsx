import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { generateExam } from '../services/aiService'

const STEPS = [
  '교육과정 확인 중',
  '최근 학습 결과 분석 중',
  '취약 유형 분석 중',
  '난이도 조정 중',
  '문항 구성 중',
]

export default function ExamGenerating() {
  const navigate = useNavigate()
  const { pendingExamConfig, pendingBlueprint, setPendingQuestions } = useAppStore()

  const [stepIndex, setStepIndex] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!pendingExamConfig || !pendingBlueprint) {
      navigate('/exam/new')
      return
    }

    let cancelled = false
    const questionsPromise = generateExam(pendingExamConfig, pendingBlueprint)

    const tick = (i: number) => {
      if (cancelled) return
      setStepIndex(i)
      if (i < STEPS.length - 1) {
        setTimeout(() => tick(i + 1), 550)
      }
    }
    tick(0)

    const minAnimationTime = new Promise((r) => setTimeout(r, STEPS.length * 550 + 300))

    Promise.all([questionsPromise, minAnimationTime]).then(([qs]) => {
      if (cancelled) return
      setPendingQuestions(qs)
      setReady(true)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!pendingExamConfig || !pendingBlueprint) return null

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="text-6xl mb-6 animate-bounce-in">{ready ? '🎉' : '🤖'}</div>

        {!ready ? (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-1 text-center">AI가 모의고사를 만들고 있어요</h1>
            <p className="text-sm text-gray-500 mb-8 text-center">{pendingBlueprint.title}</p>
            <div className="w-full space-y-3">
              {STEPS.map((label, i) => {
                const done = i < stepIndex
                const active = i === stepIndex
                return (
                  <div key={label} className={`flex items-center gap-3 p-3 rounded-card transition-colors ${active ? 'bg-primary-50' : 'bg-transparent'}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-primary-500 text-white' : active ? 'border-2 border-primary-500' : 'border-2 border-gray-200'}`}>
                      {done ? <Check size={14} /> : active ? <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" /> : null}
                    </span>
                    <span className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : active ? 'text-gray-900 font-bold' : 'text-gray-300'}`}>
                      {label}{active ? '...' : done ? ' 완료' : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-black text-gray-900 mb-2 text-center">모의고사가 준비됐어요</h1>
            <p className="text-sm text-gray-500 mb-8 text-center">
              총 {pendingBlueprint.totalQuestions}문제 · 예상 {pendingBlueprint.estimatedMinutes}분
            </p>
            <Button fullWidth size="lg" onClick={() => navigate('/exam')}>
              <Sparkles size={18} /> 시험 시작
            </Button>
          </>
        )}
      </div>
    </MobileLayout>
  )
}
