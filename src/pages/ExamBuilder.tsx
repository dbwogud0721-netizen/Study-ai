import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronRight, Loader2 } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { TokenInsufficientSheet } from '../components/features/TokenInsufficientSheet'
import { useAppStore } from '../hooks/useAppStore'
import { getExamModes, getExamModeDef } from '../config/examModeConfig'
import { getCurriculumSubjects, getUnits, getExamAreas, DIFFICULTIES, getSubjectTaxonomy, getAreaMockDefaults } from '../config/curriculumConfig'
import { estimateMinutesForCount } from '../data/examBlueprints/koreanCsat'
import { generateExamBlueprint } from '../services/aiService'
import { getExamHistory } from '../services/examService'
import { recordTransaction } from '../services/tokenService'
import { saveUser } from '../services/authService'
import { TARGET_SCORE_BONUS } from '../config/tokenConfig'
import { StudentUser, ExamConfig, ExamMode, ExamBlueprint, ExamType, Question, QuestionAttempt } from '../types'

type Step = 'mode' | 'subject' | 'area_choice' | 'area_major' | 'area_middle' | 'semester' | 'unit' | 'settings' | 'preview'
type AreaChoice = 'full' | 'area' | 'weakness' | null

interface SubjectOption { id: string; name: string; icon?: string }

export default function ExamBuilder() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { user, setUser, setPendingExamConfig, setPendingBlueprint } = useAppStore()
  const student = user as StudentUser
  const isMiddle = student.schoolLevel === 'middle'
  const grade = student.grade

  const modes = getExamModes(student.schoolLevel)
  const initialMode = (params.get('mode') as ExamMode | null) ?? null

  const [examMode, setExamMode] = useState<ExamMode | null>(initialMode)
  const [subjectId, setSubjectId] = useState('')
  const [subjectName, setSubjectName] = useState('')
  const [semester, setSemester] = useState<1 | 2 | null>(null)
  const [unitId, setUnitId] = useState('')
  const [unitName, setUnitName] = useState('')
  const [questionCount, setQuestionCount] = useState(20)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(40)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed')
  const [targetScore, setTargetScore] = useState<number | undefined>(undefined)

  // 영역별/AI 취약영역 흐름(섹션 1/24/25)에서만 쓰는 상태
  const [areaChoice, setAreaChoice] = useState<AreaChoice>(null)
  const [targetMajorAreaId, setTargetMajorAreaId] = useState('')
  const [targetMajorAreaName, setTargetMajorAreaName] = useState('')

  const [step, setStep] = useState<Step>('mode')
  const [blueprint, setBlueprint] = useState<ExamBlueprint | null>(null)
  const [previewConfig, setPreviewConfig] = useState<ExamConfig | null>(null)
  const [loadingBlueprint, setLoadingBlueprint] = useState(false)
  const [showTokenSheet, setShowTokenSheet] = useState(false)

  const modeDef = examMode ? getExamModeDef(student.schoolLevel, examMode) : undefined
  const subjectTaxonomy = subjectName ? getSubjectTaxonomy(subjectName) : undefined
  const selectedMajor = subjectTaxonomy?.find((m) => m.id === targetMajorAreaId)
  const areaDefaults = targetMajorAreaId ? getAreaMockDefaults(subjectName, targetMajorAreaId) : undefined

  const needsSemester = examMode === 'school_prep'

  // examMode state 갱신은 비동기이므로, 모드 선택 직후 다음 스텝으로 넘어갈 때는
  // state가 아니라 방금 고른 mode 값으로 직접 스텝 순서를 계산해야 한다.
  function stepsForMode(mode: ExamMode): Step[] {
    const s: Step[] = ['mode']
    if (mode !== 'weakness_ai' && mode !== 'mock_full') s.push('subject')
    if (mode === 'school_prep') s.push('semester')
    if (mode === 'unit_focus' || mode === 'school_prep') s.push('unit')
    s.push('settings', 'preview')
    return s
  }

  const steps: Step[] = useMemo(() => (examMode ? stepsForMode(examMode) : ['mode']), [examMode])

  useEffect(() => {
    if (initialMode) {
      applyMode(initialMode)
      setStep(stepsForMode(initialMode)[1])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const subjectOptions: SubjectOption[] = useMemo(() => {
    if (!examMode) return []
    if (isMiddle || examMode === 'school_prep') {
      return getCurriculumSubjects(student.schoolLevel, grade).map((s) => ({ id: s.id, name: s.name, icon: s.icon }))
    }
    // 고등 모의고사 계열: 수능 영역
    const areas = getExamAreas(student.entryYear)
    const options: SubjectOption[] = []
    areas.forEach((area) => {
      if (area.options && area.options.length > 0) {
        area.options.forEach((opt) => options.push({ id: `${area.id}:${opt.id}`, name: `탐구 · ${opt.name}` }))
      } else {
        options.push({ id: area.id, name: area.name })
      }
    })
    return options
  }, [examMode, isMiddle, student.schoolLevel, student.entryYear, grade])

  const unitOptions = useMemo(() => {
    if (!subjectId) return []
    const schoolLevelForUnits = examMode === 'school_prep' ? 'high' : student.schoolLevel
    const units = getUnits(schoolLevelForUnits, grade, subjectId)
    if (needsSemester && semester) return units.filter((u) => !u.semester || u.semester === semester)
    return units
  }, [subjectId, examMode, student.schoolLevel, grade, needsSemester, semester])

  const countPresets = useMemo(() => {
    if (!modeDef) return [5, 10, 20, 30]
    if (modeDef.defaultQuestionCount <= 10) return [5, 10, 15]
    if (modeDef.defaultQuestionCount >= 30) return [5, 20, 30, 40]
    return [5, 10, 20, 30]
  }, [modeDef])

  function applyMode(m: ExamMode) {
    const def = getExamModeDef(student.schoolLevel, m)
    setExamMode(m)
    setSubjectId('')
    setSubjectName('')
    setSemester(null)
    setUnitId('')
    setUnitName('')
    setAreaChoice(null)
    setTargetMajorAreaId('')
    setTargetMajorAreaName('')
    setTargetScore(undefined)
    if (def) {
      setQuestionCount(def.defaultQuestionCount)
      setTimeLimitMinutes(def.defaultTimeLimitMinutes)
    }
  }

  function handleCountChange(c: number) {
    setQuestionCount(c)
    if (modeDef) {
      const ratio = modeDef.defaultTimeLimitMinutes / modeDef.defaultQuestionCount
      setTimeLimitMinutes(Math.max(5, Math.round(c * ratio)))
    }
  }

  function goStep(delta: number) {
    const idx = steps.indexOf(step)
    const next = steps[idx + delta]
    if (next) setStep(next)
  }

  /** 영역별/AI 취약영역 흐름에서는 steps 배열에 없는 서브스텝을 오가므로 뒤로가기를 직접 처리한다 */
  function handleBack() {
    if (step === 'area_major') { setStep('area_choice'); return }
    if (step === 'area_middle') { setStep('area_major'); return }
    if (step === 'preview' && areaChoice === 'area') { setStep('area_middle'); return }
    if (step === 'preview' && (areaChoice === 'full' || areaChoice === 'weakness')) { setStep('area_choice'); return }
    goStep(-1)
  }

  function buildConfig(overrides: Partial<ExamConfig> = {}): ExamConfig {
    const defaultExamType: ExamType = examMode === 'weakness_ai' ? 'WEAKNESS_MOCK' : examMode === 'mock_mini' ? 'MINI_MOCK' : 'PRACTICE'
    return {
      schoolLevel: student.schoolLevel,
      grade,
      examMode: (examMode as ExamMode) ?? 'practice_full',
      examType: defaultExamType,
      subject: subjectId,
      subjectName: subjectName || modeDef?.label || '전 영역',
      unit: unitId || undefined,
      unitName: unitName || undefined,
      difficulty,
      questionCount,
      timeLimitMinutes,
      targetScore,
      ...overrides,
    }
  }

  /** weakness_ai 추천에 쓸 실 이력(attempts/questions). majorArea를 주면 그 영역으로 좁힌다. */
  function loadWeaknessSource(subjectNameArg: string, majorArea?: string): { attempts: QuestionAttempt[]; questions: Question[] } {
    const history = getExamHistory(student.id).filter((r) => r.config.subjectName === subjectNameArg)
    let attempts: QuestionAttempt[] = history.flatMap((r) => r.attempts)
    let questions: Question[] = history.flatMap((r) => r.questions)
    if (majorArea) {
      const qMap = new Map(questions.map((q) => [q.questionId, q]))
      attempts = attempts.filter((a) => qMap.get(a.questionId)?.majorArea === majorArea)
      questions = questions.filter((q) => q.majorArea === majorArea)
    }
    return { attempts, questions }
  }

  async function runPreview(overrides: Partial<ExamConfig>, weaknessMajorArea?: string) {
    const config = buildConfig(overrides)
    setLoadingBlueprint(true)
    setStep('preview')
    const topicPool = subjectId ? getUnits(examMode === 'school_prep' ? 'high' : student.schoolLevel, grade, subjectId).map((u) => u.name) : []
    const weaknessSource = config.examType === 'WEAKNESS_MOCK' ? loadWeaknessSource(config.subjectName, weaknessMajorArea) : undefined
    const bp = await generateExamBlueprint(config, topicPool, weaknessSource)
    setBlueprint(bp)
    setPreviewConfig({ ...config, questionCount: bp.totalQuestions, timeLimitMinutes: bp.estimatedMinutes })
    setLoadingBlueprint(false)
  }

  function chooseMiddleArea(middleName: string | null) {
    const count = middleName ? areaDefaults?.perMiddleAreaCount ?? 10 : areaDefaults?.fullCount ?? 15
    setAreaChoice('area')
    runPreview({
      examType: 'AREA_MOCK',
      targetMajorArea: targetMajorAreaName,
      targetMiddleArea: middleName ?? undefined,
      questionCount: count,
      timeLimitMinutes: estimateMinutesForCount(count),
    })
  }

  function chooseAreaWeakness() {
    const count = areaDefaults?.aiWeaknessCount ?? 15
    setAreaChoice('area')
    runPreview(
      { examType: 'WEAKNESS_MOCK', examMode: 'weakness_ai', targetMajorArea: targetMajorAreaName, questionCount: count, timeLimitMinutes: estimateMinutesForCount(count) },
      targetMajorAreaName
    )
  }

  function handleConfirm() {
    if (!blueprint || !previewConfig) return
    if (student.tokens < blueprint.tokenCost) {
      setShowTokenSheet(true)
      return
    }
    const { balanceAfter } = recordTransaction(student.id, student.tokens, 'SPEND', blueprint.tokenCost, `${blueprint.title} 응시`)
    const updatedUser: StudentUser = { ...student, tokens: balanceAfter }
    saveUser(updatedUser)
    setUser(updatedUser)

    setPendingExamConfig(previewConfig)
    setPendingBlueprint(blueprint)
    navigate('/exam/generating')
  }

  const stepIdx = Math.max(0, steps.indexOf(step))
  const progress = ((stepIdx + 1) / steps.length) * 100

  return (
    <MobileLayout>
      <PageHeader
        title="새 모의고사 만들기"
        onBack={step !== 'mode' ? handleBack : undefined}
      />
      <div className="px-5 mb-4">
        <div className="h-1 bg-gray-100 rounded-full">
          <div className="h-1 bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">STEP {stepIdx + 1} / {steps.length}</p>
      </div>

      <div className="flex-1 px-5 overflow-y-auto pb-8">
        {step === 'mode' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">시험 종류</h2>
            <p className="text-sm text-gray-500 mb-4">어떤 방식으로 응시할까요?</p>
            <div className="space-y-2.5">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { applyMode(m.id); setStep(stepsForMode(m.id)[1]) }}
                  className={`w-full flex items-center gap-3 p-4 rounded-card border-2 text-left transition-all
                    ${examMode === m.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
                >
                  <span className="text-2xl">{m.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{m.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'subject' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">과목 선택</h2>
            <p className="text-sm text-gray-500 mb-4">{modeDef?.label}에 응시할 과목이에요</p>
            <div className="grid grid-cols-2 gap-2.5">
              {subjectOptions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSubjectId(s.id); setSubjectName(s.name); setUnitId(''); setUnitName('')
                    const taxonomy = getSubjectTaxonomy(s.name)
                    if (examMode === 'mock_subject' && taxonomy) {
                      setStep('area_choice')
                    } else {
                      goStep(1)
                    }
                  }}
                  className={`p-3.5 rounded-card border-2 font-semibold text-sm text-left transition-all
                    ${subjectId === s.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                >
                  {s.icon && <span className="mr-1">{s.icon}</span>}{s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'area_choice' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">{subjectName} 모의고사</h2>
            <p className="text-sm text-gray-500 mb-4">어떤 방식으로 응시할까요?</p>
            <div className="space-y-2.5">
              <button
                onClick={() => { setAreaChoice('full'); setTargetMajorAreaName(''); setTargetMajorAreaId(''); runPreview({ examType: 'FULL_MOCK' }) }}
                className="w-full text-left p-4 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 transition-all"
              >
                <p className="font-bold text-gray-900 text-sm">전체 모의고사</p>
                <p className="text-xs text-gray-500 mt-0.5">실제 모의고사와 유사한 전체 구성으로 응시해요</p>
              </button>
              <button
                onClick={() => setStep('area_major')}
                className="w-full text-left p-4 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 transition-all"
              >
                <p className="font-bold text-gray-900 text-sm">영역별 모의고사</p>
                <p className="text-xs text-gray-500 mt-0.5">원하는 영역만 실전 스타일로 풀어요</p>
              </button>
              <button
                onClick={() => { setAreaChoice('weakness'); setTargetMajorAreaName(''); setTargetMajorAreaId(''); runPreview({ examType: 'WEAKNESS_MOCK', examMode: 'weakness_ai', questionCount: 15 }) }}
                className="w-full text-left p-4 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 transition-all"
              >
                <p className="font-bold text-gray-900 text-sm">🤖 AI 취약영역 모의고사</p>
                <p className="text-xs text-gray-500 mt-0.5">최근 오답을 분석해 취약 영역 비중을 자동으로 높여요</p>
              </button>
            </div>
          </div>
        )}

        {step === 'area_major' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">영역 선택</h2>
            <p className="text-sm text-gray-500 mb-4">어떤 영역을 집중적으로 풀까요?</p>
            <div className="space-y-2">
              {(subjectTaxonomy ?? []).map((major) => (
                <button
                  key={major.id}
                  onClick={() => { setTargetMajorAreaId(major.id); setTargetMajorAreaName(major.name); setStep('area_middle') }}
                  className="w-full text-left p-3.5 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 font-semibold text-sm text-gray-700 transition-all"
                >
                  {major.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'area_middle' && selectedMajor && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">{selectedMajor.name}</h2>
            <p className="text-sm text-gray-500 mb-4">전체를 풀거나 세부 영역을 골라보세요</p>
            <div className="space-y-2">
              <button
                onClick={() => chooseMiddleArea(null)}
                className="w-full flex items-center justify-between p-3.5 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 transition-all"
              >
                <span className="font-bold text-sm text-gray-900">전체 {selectedMajor.name}</span>
                <span className="text-xs text-gray-400">{areaDefaults?.fullCount ?? 15}문제</span>
              </button>
              {selectedMajor.middleAreas.map((mid) => (
                <button
                  key={mid.id}
                  onClick={() => chooseMiddleArea(mid.name)}
                  className="w-full flex items-center justify-between p-3.5 rounded-card border-2 border-gray-100 bg-white hover:border-primary-300 transition-all"
                >
                  <span className="font-semibold text-sm text-gray-700">{mid.name}</span>
                  <span className="text-xs text-gray-400">{areaDefaults?.perMiddleAreaCount ?? 5}문제</span>
                </button>
              ))}
              <button
                onClick={chooseAreaWeakness}
                className="w-full flex items-center justify-between p-3.5 rounded-card border-2 border-primary-200 bg-primary-50 hover:border-primary-400 transition-all"
              >
                <span className="font-bold text-sm text-primary-600">🤖 AI 약점 집중</span>
                <span className="text-xs text-primary-400">{areaDefaults?.aiWeaknessCount ?? 15}문제</span>
              </button>
            </div>
          </div>
        )}

        {step === 'semester' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">학기 선택</h2>
            <p className="text-sm text-gray-500 mb-4">{subjectName}의 어느 학기 범위인가요?</p>
            <div className="space-y-2.5">
              {[1, 2].map((sem) => (
                <button
                  key={sem}
                  onClick={() => { setSemester(sem as 1 | 2); goStep(1) }}
                  className={`w-full p-4 rounded-card border-2 text-left font-bold text-sm transition-all
                    ${semester === sem ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                >
                  {sem}학기
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'unit' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">단원 선택</h2>
            <p className="text-sm text-gray-500 mb-4">집중적으로 평가할 단원이에요</p>
            <div className="space-y-2">
              {unitOptions.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setUnitId(u.id); setUnitName(u.name); goStep(1) }}
                  className={`w-full text-left p-3.5 rounded-card border-2 font-medium text-sm transition-all
                    ${unitId === u.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                >
                  {u.name}
                </button>
              ))}
              {unitOptions.length === 0 && <p className="text-sm text-gray-400 text-center py-8">선택 가능한 단원이 없어요</p>}
            </div>
          </div>
        )}

        {step === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-3">문제 수</h2>
              <div className="grid grid-cols-4 gap-2">
                {countPresets.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCountChange(c)}
                    className={`py-3 rounded-card border-2 font-bold text-sm transition-all
                      ${questionCount === c ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                  >
                    {c}문제
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-3">제한 시간</h2>
              <div className="bg-white rounded-card p-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">예상 소요 시간</span>
                <span className="font-black text-gray-900">{timeLimitMinutes}분</span>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-3">난이도</h2>
              <div className="grid grid-cols-2 gap-2">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id as typeof difficulty)}
                    className={`p-3 rounded-card border-2 font-semibold text-sm transition-all
                      ${difficulty === d.id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className={d.color}>{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 mb-1">목표 점수 (선택)</h2>
              <p className="text-xs text-gray-500 mb-3">목표보다 높은 점수를 받으면 보너스 🪙 {TARGET_SCORE_BONUS.tokens} TOKEN (₩{TARGET_SCORE_BONUS.won.toLocaleString()} 상당)을 드려요</p>
              <div className="grid grid-cols-4 gap-2">
                {[70, 80, 90].map((s) => (
                  <button
                    key={s}
                    onClick={() => setTargetScore(targetScore === s ? undefined : s)}
                    className={`py-3 rounded-card border-2 font-bold text-sm transition-all
                      ${targetScore === s ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                  >
                    {s}점
                  </button>
                ))}
                <button
                  onClick={() => setTargetScore(undefined)}
                  className={`py-3 rounded-card border-2 font-bold text-sm transition-all
                    ${targetScore === undefined ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-400'}`}
                >
                  안 함
                </button>
              </div>
            </div>
            <Button fullWidth size="lg" onClick={() => runPreview({})}>
              시험 구성 미리보기
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">시험 구성 Preview</h2>
            <p className="text-sm text-gray-500 mb-4">AI가 구성한 시험 내용을 확인하세요</p>

            {loadingBlueprint || !blueprint ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <Loader2 className="animate-spin" size={28} />
                <p className="text-sm">시험 구성을 계산하는 중...</p>
              </div>
            ) : (
              <div className="bg-white rounded-card p-5 space-y-4">
                <div className="text-center pb-4 border-b border-gray-50">
                  <p className="text-sm text-gray-500">{blueprint.title}</p>
                  <p className="text-3xl font-black text-gray-900 mt-1">총 {blueprint.totalQuestions}문제</p>
                  {blueprint.rationale && <p className="text-xs text-primary-500 font-semibold mt-2">✨ {blueprint.rationale}</p>}
                </div>
                <div className="space-y-2">
                  {blueprint.distribution.map((d) => (
                    <div key={d.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{d.label}</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">{d.count}문제</span>
                        {d.targetAccuracyBefore !== undefined && d.targetAccuracyAfter !== undefined && (
                          <p className="text-[11px] text-primary-500">목표 {d.targetAccuracyBefore}% → {d.targetAccuracyAfter}%</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-sm text-gray-500">예상시간</span>
                  <span className="font-bold text-gray-900">{blueprint.estimatedMinutes}분</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">사용 토큰</span>
                  <span className="font-black text-amber-500">🪙 {blueprint.tokenCost} TOKEN</span>
                </div>
                {previewConfig?.targetScore !== undefined && (
                  <div className="pt-4 border-t border-gray-50 bg-amber-50 -mx-5 -mb-5 px-5 py-3 rounded-b-card">
                    <p className="text-xs font-semibold text-amber-700">
                      🎯 목표 점수 {previewConfig.targetScore}점 초과 달성 시 보너스 🪙 {TARGET_SCORE_BONUS.tokens} TOKEN (₩{TARGET_SCORE_BONUS.won.toLocaleString()} 상당)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {step === 'preview' && blueprint && !loadingBlueprint && (
        <div className="px-5 pb-6 pt-2 bg-gray-50">
          <Button fullWidth size="lg" onClick={handleConfirm}>
            이 구성으로 시험 생성
          </Button>
        </div>
      )}

      <TokenInsufficientSheet
        open={showTokenSheet}
        onClose={() => setShowTokenSheet(false)}
        currentTokens={student.tokens}
        required={blueprint?.tokenCost ?? 0}
      />
    </MobileLayout>
  )
}
