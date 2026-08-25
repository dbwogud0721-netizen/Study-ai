import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobileLayout } from '../components/layout/MobileLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { TokenInsufficientSheet } from '../components/features/TokenInsufficientSheet'
import { AdBanner } from '../components/ads/AdBanner'
import { useAppStore } from '../hooks/useAppStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CORE_SUBJECTS, getCoreSubjectUnits } from '../config/curriculumConfig'
import { UNIFIED_EXAM_TYPES, mapUnifiedExamType, UnifiedExamType } from '../config/examModeConfig'
import { calculateExamTokenCost } from '../config/tokenConfig'
import { getExamHistory } from '../services/examService'
import { getTodayCashRewardCount } from '../services/cashRewardService'
import { checkRewardEligibility } from '../services/rewardEligibility'
import { recordTransaction } from '../services/tokenService'
import { saveUser } from '../services/authService'
import { StudentUser, ExamConfig, ExamType } from '../types'

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: '쉬움' },
  { id: 'medium', label: '보통' },
  { id: 'hard', label: '어려움' },
] as const

const SIMILARITY_OPTIONS = [
  { id: 'DIVERSE', label: '다양하게', desc: '여러 유형을 섞어서 출제' },
  { id: 'SIMILAR', label: '비슷하게', desc: '선택한 유형을 반복해서 연습' },
] as const

const QUESTION_COUNTS = [5, 10, 30] as const
const TARGET_SCORES = [70, 80, 90, 100] as const

export default function ExamBuilder() {
  const navigate = useNavigate()
  const { user, setUser, setPendingExamConfig, setPendingBlueprint } = useAppStore()
  const student = user as StudentUser

  const [currentSubject, setCurrentSubject] = useLocalStorage(
    `studyai_current_subject_${student.id}`,
    student.selectedSubjects[0] ?? CORE_SUBJECTS[0].id
  )
  const subjectMeta = CORE_SUBJECTS.find((s) => s.id === currentSubject) ?? CORE_SUBJECTS[0]

  const unitOptions = useMemo(() => {
    const units = getCoreSubjectUnits(student.schoolLevel, student.grade, currentSubject)
    return [{ id: 'ALL', name: '전체 범위' }, ...units]
  }, [student.schoolLevel, student.grade, currentSubject])

  const [unitId, setUnitId] = useState('ALL')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [similarity, setSimilarity] = useState<'DIVERSE' | 'SIMILAR'>('DIVERSE')
  const [examTypeId, setExamTypeId] = useState<UnifiedExamType>('real_exam')
  const [questionCount, setQuestionCount] = useState<number>(10)
  const [targetScore, setTargetScore] = useState<number>(80)
  const [showTokenSheet, setShowTokenSheet] = useState(false)
  const [starting, setStarting] = useState(false)

  // 과목이 바뀌면 그 과목 기준 단원 목록이 달라지므로 선택을 초기화한다.
  const changeSubject = (id: string) => {
    setCurrentSubject(id)
    setUnitId('ALL')
  }

  const selectedUnit = unitOptions.find((u) => u.id === unitId) ?? unitOptions[0]
  const tokenCost = calculateExamTokenCost(questionCount, examTypeId === 'weakness_ai')

  const config: ExamConfig = useMemo(() => {
    const examMode = mapUnifiedExamType(student.schoolLevel, examTypeId)
    const examType: ExamType =
      examTypeId === 'weakness_ai' ? 'WEAKNESS_MOCK' : student.schoolLevel === 'high' && examTypeId === 'real_exam' ? 'FULL_MOCK' : 'PRACTICE'
    return {
      schoolLevel: student.schoolLevel,
      grade: student.grade,
      examMode,
      examType,
      subject: currentSubject,
      subjectName: subjectMeta.name,
      unit: unitId !== 'ALL' ? unitId : undefined,
      unitName: unitId !== 'ALL' ? selectedUnit.name : undefined,
      difficulty,
      questionCount,
      timeLimitMinutes: questionCount * 3, // 학생에게는 노출하지 않음. 백그라운드 상한값일 뿐.
      targetScore,
      similarity,
    }
  }, [student.schoolLevel, student.grade, examTypeId, currentSubject, subjectMeta.name, unitId, selectedUnit.name, difficulty, questionCount, targetScore, similarity])

  const history = useMemo(() => getExamHistory(student.id), [student.id])
  const eligibility = useMemo(
    () => checkRewardEligibility({ config, history, todayCashRewardCount: getTodayCashRewardCount(student.id) }),
    [config, history, student.id]
  )

  const handleStart = () => {
    if (student.tokens < tokenCost) {
      setShowTokenSheet(true)
      return
    }
    setStarting(true)
    const { balanceAfter } = recordTransaction(student.id, student.tokens, 'SPEND', tokenCost, `${subjectMeta.name} ${UNIFIED_EXAM_TYPES.find((t) => t.id === examTypeId)?.label} 응시`)
    const updatedUser: StudentUser = { ...student, tokens: balanceAfter }
    saveUser(updatedUser)
    setUser(updatedUser)

    setPendingExamConfig(config)
    setPendingBlueprint(null)
    navigate('/exam/generating')
  }

  return (
    <MobileLayout>
      <PageHeader title="오늘의 시험" showBack={false} />

      <div className="flex-1 px-5 overflow-y-auto pb-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {CORE_SUBJECTS.map((s) => (
              <button
                key={s.id}
                onClick={() => changeSubject(s.id)}
                className={`flex-1 py-2.5 rounded-chip text-sm font-bold transition-all ${
                  currentSubject === s.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 border border-gray-100'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">단원</h2>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
            {unitOptions.map((u) => (
              <button
                key={u.id}
                onClick={() => setUnitId(u.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-chip text-sm font-bold whitespace-nowrap transition-all border-2 ${
                  unitId === u.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-600'
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">난이도</h2>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`py-2.5 rounded-chip text-sm font-bold border-2 transition-all ${
                  difficulty === d.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">문제 스타일</h2>
          <div className="grid grid-cols-2 gap-2">
            {SIMILARITY_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSimilarity(s.id)}
                className={`p-3 rounded-card text-left border-2 transition-all ${
                  similarity === s.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'
                }`}
              >
                <p className={`text-sm font-bold ${similarity === s.id ? 'text-primary-600' : 'text-gray-800'}`}>{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">시험 종류</h2>
          <div className="space-y-2">
            {UNIFIED_EXAM_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setExamTypeId(t.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-card text-left border-2 transition-all ${
                  examTypeId === t.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'
                }`}
              >
                <span className="text-xl">{t.icon}</span>
                <div>
                  <p className={`text-sm font-bold ${examTypeId === t.id ? 'text-primary-600' : 'text-gray-800'}`}>{t.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">문제 수</h2>
          <div className="grid grid-cols-3 gap-2">
            {QUESTION_COUNTS.map((c) => (
              <button
                key={c}
                onClick={() => setQuestionCount(c)}
                className={`py-2.5 rounded-chip text-sm font-bold border-2 transition-all ${
                  questionCount === c ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-600'
                }`}
              >
                {c}문제
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2">이번 목표</h2>
          <div className="grid grid-cols-4 gap-2">
            {TARGET_SCORES.map((s) => (
              <button
                key={s}
                onClick={() => setTargetScore(s)}
                className={`py-2.5 rounded-chip text-sm font-bold border-2 transition-all ${
                  targetScore === s ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <AdBanner slot="exam-builder" />
      </div>

      <div className="px-5 pt-3 pb-6 bg-white border-t border-gray-100 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">사용 Token</span>
          <span className="font-black text-amber-500">🪙 {tokenCost}</span>
        </div>
        {eligibility.eligible && (
          <div className="bg-amber-50 rounded-xl px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700">💸 CASH REWARD 획득 가능</span>
            <span className="text-xs font-black text-amber-700">최대 ₩{eligibility.maxCashReward.toLocaleString()}</span>
          </div>
        )}
        <Button fullWidth size="lg" loading={starting} onClick={handleStart}>
          시험 시작
        </Button>
      </div>

      <TokenInsufficientSheet open={showTokenSheet} onClose={() => setShowTokenSheet(false)} currentTokens={student.tokens} required={tokenCost} />
    </MobileLayout>
  )
}
