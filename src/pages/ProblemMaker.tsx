import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Sparkles } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { AppHeader } from '../components/layout/AppHeader'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { BottomSheet } from '../components/ui/BottomSheet'
import { useAppStore } from '../hooks/useAppStore'
import { getCurriculumSubjects } from '../config/curriculumConfig'
import { generateMathProblems } from '../services/problemGeneratorService'
import { GeneratedProblem } from '../types/problemGenerator'
import { StudentUser } from '../types'

type Step = 'home' | 'confirm' | 'settings' | 'generating' | 'result'

const DIFFICULTY_LEVELS = [1, 2, 3, 4]
const DIFFICULTY_WARNING = '(난이도 3 이상은 학습영역의 결합문제 또는\n주관식 문제로 출제될 수 있습니다.)'
const TIMEOUT_MS = 60000

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
    setStep('result')
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

        {/* 4. 결과 — 생성됨 표시만 */}
        {step === 'result' && problems && problems.length > 0 && (
          <div className="flex flex-col items-center justify-center pt-16 gap-4 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center text-3xl">✅</div>
            <p className="text-base font-black text-gray-900">생성됨</p>
            <p className="text-sm text-gray-500">{problems.length}문항이 생성되었습니다.</p>
            <Button variant="primary" className="w-full mt-4" onClick={() => setStep('settings')}>다시 생성</Button>
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
