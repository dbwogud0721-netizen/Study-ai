import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { getCoreSubjects, GRADE_OPTIONS, GradeOption } from '../config/curriculumConfig'
import { createStudentProfile } from '../services/authService'
import { LearningGoal } from '../types'

type Step = 1 | 2 | 3 | 4

const GOALS: { id: LearningGoal; label: string; desc: string; icon: string }[] = [
  { id: 'habit', label: '꾸준한 학습 습관', desc: '매일 조금씩 문제를 풀고 싶어요.', icon: '🔥' },
  { id: 'grade_up', label: '성적 향상', desc: '시험 점수를 집중적으로 올리고 싶어요.', icon: '📈' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser } = useAppStore()

  const [step, setStep] = useState<Step>(1)
  const [name, setName] = useState('')
  const [gradeOption, setGradeOption] = useState<GradeOption | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [goals, setGoals] = useState<LearningGoal[]>([])

  const progress = (step / 4) * 100

  const availableSubjects = getCoreSubjects()

  const toggleSubject = (id: string) => {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const toggleGoal = (id: LearningGoal) => {
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  const handleFinish = () => {
    if (!gradeOption || subjects.length === 0 || goals.length === 0) return
    const user = createStudentProfile({
      name: name.trim() || '학생',
      schoolLevel: gradeOption.schoolLevel,
      grade: gradeOption.grade,
      selectedSubjects: subjects,
      learningGoals: goals,
    })
    setUser(user)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col">
        <div className="px-6 pt-12 pb-2">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-1.5 bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="flex-1 flex flex-col px-6 pb-8">
          {step === 1 && (
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <div className="text-6xl mb-6">🪙</div>
              <h1 className="text-2xl font-black text-gray-900 mb-2 leading-tight">게임머니를 주는<br />AI 학습 플랫폼</h1>
              <p className="text-sm text-gray-500 mb-8">공부하고, 점수를 올리고, 보상받으세요.</p>
              <div className="w-full">
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block text-left">이름을 알려주세요</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="인성"
                  className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <Button fullWidth size="lg" className="mt-6" disabled={!name.trim()} onClick={() => setStep(2)}>
                다음
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 flex flex-col pt-8">
              <h1 className="text-xl font-black text-gray-900 leading-snug">현재 학년을 알려주세요</h1>
              <p className="text-sm text-gray-500 mt-1.5">학년에 맞는 시험과 과목을 준비할게요.</p>
              <div className="grid grid-cols-2 gap-2.5 mt-6">
                {GRADE_OPTIONS.map((opt) => (
                  <button
                    key={`${opt.schoolLevel}-${opt.grade}`}
                    onClick={() => { setGradeOption(opt); setSubjects([]); setStep(3) }}
                    className={`p-4 rounded-2xl border-2 text-center font-bold text-sm transition-all
                      ${gradeOption === opt ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 flex flex-col pt-8">
              <h1 className="text-xl font-black text-gray-900 leading-snug">어떤 과목을 공부하고 싶나요?</h1>
              <p className="text-sm text-gray-500 mt-1.5">원하는 과목을 모두 선택할 수 있어요.</p>
              <div className="grid grid-cols-2 gap-2.5 mt-6">
                {availableSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2
                      ${subjects.includes(s.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className="text-3xl">{s.icon}</span>
                    <span className={`text-sm font-bold ${subjects.includes(s.id) ? 'text-primary-600' : 'text-gray-700'}`}>{s.name}</span>
                    {subjects.includes(s.id) && <Check size={14} className="text-primary-500" />}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button fullWidth size="lg" className="mt-6" disabled={subjects.length === 0} onClick={() => setStep(4)}>
                다음
              </Button>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 flex flex-col pt-8">
              <h1 className="text-xl font-black text-gray-900 leading-snug">학습 목표를 알려주세요</h1>
              <div className="space-y-3 mt-6">
                {GOALS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
                      ${goals.includes(g.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className="text-xl w-8 flex justify-center">{g.icon}</span>
                    <div className="flex-1">
                      <p className={`font-bold text-sm ${goals.includes(g.id) ? 'text-primary-600' : 'text-gray-800'}`}>{g.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{g.desc}</p>
                    </div>
                    {goals.includes(g.id) && <Check size={18} className="text-primary-500" />}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button fullWidth size="lg" className="mt-6" disabled={goals.length === 0} onClick={handleFinish}>
                <Sparkles size={18} /> 시작하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
