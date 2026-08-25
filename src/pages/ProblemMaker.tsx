import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppStore } from '../hooks/useAppStore'
import { getCurriculumSubjects } from '../config/curriculumConfig'
import { generateMathProblems, computeSolutionSimilarity } from '../services/problemGeneratorService'
import { GeneratedProblem } from '../types/problemGenerator'
import { StudentUser } from '../types'

type Step = 'home' | 'confirm' | 'settings' | 'generating' | 'result'

const DIFFICULTY_LEVELS = [1, 2, 3, 4]
const DIFFICULTY_WARNING = '(난이도 3 이상은 학습영역의 결합문제 또는\n주관식 문제로 출제될 수 있습니다.)'
const TIMEOUT_MS = 60000
const CIRCLED_NUMS = ['①', '②', '③', '④', '⑤']

export default function ProblemMaker() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const student = user as StudentUser

  const [step, setStep] = useState<Step>('home')
  const [count, setCount] = useState(1)
  const [difficulty, setDifficulty] = useState(2)

  const [elapsed, setElapsed] = useState(0)
  const [timedOut, setTimedOut] = useState(false)

  const [problems, setProblems] = useState<GeneratedProblem[] | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [revealed, setRevealed] = useState<Record<string, number>>({}) // problemId -> 섹션3 유사도(%)

  const subjects = getCurriculumSubjects(student.schoolLevel, student.grade)

  useEffect(() => {
    if (step !== 'generating') return
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(timer)
  }, [step])

  async function startGeneration() {
    setTimedOut(false)
    setElapsed(0)
    setStep('generating')

    const genPromise = generateMathProblems({ subject: '수학', count, difficulty })
    const timeoutPromise = new Promise<'timeout'>((resolve) => setTimeout(() => resolve('timeout'), TIMEOUT_MS))
    const result = await Promise.race([genPromise, timeoutPromise])

    if (result === 'timeout') {
      setTimedOut(true)
      return
    }
    setProblems(result)
    setActiveTab(0)
    setRevealed({})
    setStep('result')
  }

  function revealSolution(id: string) {
    setRevealed((prev) => (id in prev ? prev : { ...prev, [id]: computeSolutionSimilarity() }))
  }

  function handleBack() {
    if (step === 'confirm') { setStep('home'); return }
    if (step === 'settings') { setStep('confirm'); return }
    navigate(-1)
  }

  return (
    <MobileLayout>
      <AppHeader title="AI 문제 생성" onBack={step === 'home' ? undefined : handleBack} />

      <div className="flex-1 px-5 pb-8 overflow-y-auto">
        {/* 1. 초기 화면 — 생성 가능한 과목만 활성화 */}
        {step === 'home' && (
          <div>
            <h2 className="text-lg font-black text-gray-900 mb-1">과목 선택</h2>
            <p className="text-sm text-gray-500 mb-4">AI로 새 문제를 생성할 과목을 골라주세요</p>
            <div className="grid grid-cols-2 gap-2.5">
              {subjects.map((s) => {
                const enabled = s.name === '수학'
                return (
                  <button
                    key={s.id}
                    disabled={!enabled}
                    onClick={() => setStep('confirm')}
                    className={`relative p-3.5 rounded-card border-2 font-semibold text-sm text-left transition-all
                      ${enabled ? 'border-gray-100 bg-white text-gray-700 hover:border-primary-300' : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                  >
                    <span className="mr-1">{s.icon}</span>{s.name}
                    {!enabled && <span className="absolute top-1.5 right-1.5 text-[10px] bg-gray-200 text-gray-400 px-1.5 py-0.5 rounded-full">준비 중</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 2. 생성 확인 */}
        {step === 'confirm' && (
          <div className="flex flex-col items-center text-center pt-10">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-3xl mb-4">📐</div>
            <h2 className="text-lg font-black text-gray-900 mb-8 leading-relaxed">2027학년도 수능 수학 문제를<br />출제할까요?</h2>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" onClick={() => setStep('home')}>아니오</Button>
              <Button variant="primary" className="flex-1" onClick={() => setStep('settings')}>예</Button>
            </div>
          </div>
        )}

        {/* 3. 생성 조건 */}
        {step === 'settings' && (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">몇 문항을 제조할까요?</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
                  className="w-24 px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-500">항</span>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">난이도의 범위를 정해 주세요</h2>
              <div className="grid grid-cols-4 gap-2">
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 rounded-card border-2 font-bold text-sm transition-all
                      ${difficulty === d ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-100 bg-white text-gray-700'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 leading-relaxed whitespace-pre-line">{DIFFICULTY_WARNING}</p>
            </div>

            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">문제 출제를 진행할까요?</p>
              <div className="flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setStep('confirm')}>아니오</Button>
                <Button variant="primary" className="flex-1" onClick={startGeneration}>예</Button>
              </div>
            </div>
          </div>
        )}

        {/* 3.5 생성 진행중 */}
        {step === 'generating' && (
          <div className="flex flex-col items-center justify-center pt-16 gap-5 text-center">
            <Sparkles className="text-primary-500 animate-pulse" size={32} />
            <p className="text-sm font-semibold text-gray-700">문제를 생성하는 중입니다...</p>
            <div className="w-full">
              <ProgressBar value={elapsed} max={60} showLabel />
              <p className="text-xs text-gray-400 mt-2">서버 응답을 기다리는 중 (최대 60초)</p>
            </div>
          </div>
        )}

        {/* 4. 결과 */}
        {step === 'result' && problems && problems.length > 0 && (
          <div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {problems.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(i)}
                  className={`flex-shrink-0 px-4 h-10 rounded-full font-bold text-sm transition-all
                    ${activeTab === i ? 'bg-primary-500 text-white' : 'bg-white text-gray-500 border border-gray-100'}`}
                >
                  문제{p.index}
                </button>
              ))}
            </div>

            <ResultPanel
              problem={problems[activeTab]}
              similarityAfterReveal={revealed[problems[activeTab].id]}
              onReveal={() => revealSolution(problems[activeTab].id)}
              onBackToSettings={() => setStep('settings')}
            />
          </div>
        )}
      </div>

      {/* 60초 타임아웃 에러 */}
      <BottomSheet open={timedOut} onClose={() => setTimedOut(false)} title="응답 지연">
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-2xl mb-4">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">서버로부터 60초 이상 응답이 없어요. 다시 시도해주세요.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => { setTimedOut(false); setStep('settings') }}>취소</Button>
          <Button variant="primary" className="flex-1" onClick={startGeneration}>다시 시도</Button>
        </div>
      </BottomSheet>
    </MobileLayout>
  )
}

function ResultPanel({
  problem,
  similarityAfterReveal,
  onReveal,
  onBackToSettings,
}: {
  problem: GeneratedProblem
  similarityAfterReveal: number | undefined
  onReveal: () => void
  onBackToSettings: () => void
}) {
  const revealed = similarityAfterReveal !== undefined

  const metaLines = [
    { code: '1.1', label: '출제영역', content: problem.area },
    { code: '1.2', label: '결합영역', content: problem.combo },
    { code: '1.3', label: '사용공식의 영역', content: problem.formulaArea },
    { code: '1.4', label: '사용공식', content: `${problem.formula}, 미지수 개수: ${problem.unknownCount}, 조건분기수: ${problem.conditionBranch}, 차수개수: ${problem.degreeCount}` },
    { code: '1.5', label: '난이도', content: `${problem.difficulty}, 연산지수: ${problem.opIndex}` },
    { code: '1.6', label: '기존 기출문제와의 유사도', content: `${problem.similarity}%` },
    { code: '1.7', label: '출제의도', content: problem.intent },
  ]

  return (
    <div className="space-y-4">
      {/* 1. 문항 + 지문/선택지 — 상하좌우 스크롤 */}
      <Card padding="none">
        <div className="overflow-auto max-h-72 p-4">
          <p className="text-xs font-bold text-primary-500 mb-2">1. 문항번호 {problem.index}</p>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap mb-3">{problem.problem}</p>
          <div className="space-y-1.5">
            {problem.choices.map((c, i) => (
              <p key={i} className="text-sm text-gray-700">{CIRCLED_NUMS[i]} {c}</p>
            ))}
          </div>
        </div>
      </Card>

      {/* 1.1 ~ 1.7 메타 정보 */}
      <Card>
        <div className="space-y-2">
          {metaLines.map((m) => (
            <p key={m.code} className="text-sm text-gray-700 leading-relaxed">
              <span className="font-bold text-gray-900">{m.code} {m.label}</span>
              <span className="text-gray-500"> : {m.content}</span>
            </p>
          ))}
        </div>
      </Card>

      {/* 2. 출제 경향 예측 */}
      <Card>
        <p className="font-bold text-gray-900 mb-2">2. 27학년도 출제 경향 예측</p>
        <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">2.1 출제영역</span> : {problem.trendArea}</p>
        <p className="text-sm text-gray-700">-<span className="font-semibold">2.2 결합영역의 내용</span> : {problem.trendCombo}</p>
        <div className="mt-3 bg-gray-100 rounded-xl px-3 py-2.5">
          <p className="text-sm text-gray-700">
            문항 번호 {problem.index}에 대한 27학년도 수능수학 문제의 출제 예측 확률은 <span className="font-bold">{problem.predictProb}%</span>입니다.
          </p>
        </div>
      </Card>

      {/* 검산 확인 */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-semibold text-gray-700">검산하여 풀이 할까요?</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={onBackToSettings}>아니오</Button>
          <Button size="sm" variant="primary" onClick={onReveal}>예</Button>
        </div>
      </div>

      {revealed && (
        <>
          <Card>
            <h3 className="font-bold text-gray-900 mb-2">문항번호 {problem.index} 풀이및 답</h3>
            <div className="overflow-auto max-h-56">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">{problem.solution}</p>
            </div>
            <div className="pt-3 border-t border-gray-50 flex items-center justify-between">
              <span className="text-sm text-gray-500">정답</span>
              <span className="font-black text-primary-600">{CIRCLED_NUMS[problem.answer - 1]} {problem.answer}번</span>
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-gray-900 mb-3">3. 기출문제와의 유사도</h3>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-700">유사도</span>
              <span className="font-bold text-gray-900">{similarityAfterReveal}%</span>
            </div>
            <ProgressBar value={similarityAfterReveal ?? 0} color={(similarityAfterReveal ?? 0) >= 70 ? 'bg-red-400' : (similarityAfterReveal ?? 0) >= 40 ? 'bg-yellow-400' : 'bg-green-400'} />
          </Card>
        </>
      )}
    </div>
  )
}
