import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { useAppStore } from '../hooks/useAppStore'
import { generateExam, generateExamBlueprint } from '../services/aiService'
import { getCoreSubjectUnits } from '../config/curriculumConfig'

const MIN_LOADING_MS = 1000

export default function ExamGenerating() {
  const navigate = useNavigate()
  const { pendingExamConfig, pendingBlueprint, setPendingBlueprint, setPendingQuestions } = useAppStore()

  useEffect(() => {
    if (!pendingExamConfig) {
      navigate('/exam/new')
      return
    }

    let cancelled = false

    async function run() {
      const start = Date.now()
      // ExamBuilder는 blueprint를 미리 계산하지 않고 곧장 이 화면으로 온다(확인 단계 삭제).
      // GradeDashboard의 추천 시험처럼 blueprint를 이미 들고 온 경우엔 그걸 그대로 쓴다.
      const topicPool = getCoreSubjectUnits(pendingExamConfig!.schoolLevel, pendingExamConfig!.grade, pendingExamConfig!.subject).map((u) => u.name)
      const blueprint = pendingBlueprint ?? (await generateExamBlueprint(pendingExamConfig!, topicPool))
      const questions = await generateExam(pendingExamConfig!, blueprint)

      const elapsed = Date.now() - start
      if (elapsed < MIN_LOADING_MS) await new Promise((r) => setTimeout(r, MIN_LOADING_MS - elapsed))
      if (cancelled) return

      setPendingBlueprint(blueprint)
      setPendingQuestions(questions)
      navigate('/exam')
    }
    run()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <MobileLayout>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h1 className="text-lg font-black text-gray-900 text-center">AI가 문제를 준비하고 있어요</h1>
      </div>
    </MobileLayout>
  )
}
