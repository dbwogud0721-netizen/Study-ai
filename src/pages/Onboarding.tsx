import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, GraduationCap, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { getCurriculumSubjects } from '../config/curriculumConfig'
import { createStudentProfile } from '../services/authService'
import { SchoolLevel, Grade, LearningGoal } from '../types'

type Step = 'intro' | 'schoolLevel' | 'grade' | 'subjects' | 'goal' | 'summary'
const STEPS: Step[] = ['intro', 'schoolLevel', 'grade', 'subjects', 'goal', 'summary']

const GOALS: { id: LearningGoal; label: string; desc: string; icon: string }[] = [
  { id: 'grade_up', label: '성적 향상', desc: '내신·학교 성적을 올리고 싶어요', icon: '📈' },
  { id: 'exam_prep', label: '수능·입시 대비', desc: '모의고사로 실전 감각을 키우고 싶어요', icon: '🎯' },
  { id: 'review', label: '개념 복습', desc: '놓친 개념을 차근차근 정리하고 싶어요', icon: '📚' },
  { id: 'habit', label: '꾸준한 학습 습관', desc: '매일 조금씩 공부하는 습관을 만들고 싶어요', icon: '🔥' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { setUser } = useAppStore()

  const [step, setStep] = useState<Step>('intro')
  const [name, setName] = useState('')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [subjects, setSubjects] = useState<string[]>([])
  const [goal, setGoal] = useState<LearningGoal | null>(null)

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex) / (STEPS.length - 1)) * 100

  const availableSubjects = useMemo(() => {
    if (!schoolLevel || !grade) return []
    return getCurriculumSubjects(schoolLevel, grade)
  }, [schoolLevel, grade])

  const goNext = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)])
  const goBack = () => setStep(STEPS[Math.max(stepIndex - 1, 0)])

  const toggleSubject = (id: string) => {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleFinish = () => {
    if (!schoolLevel || !grade || subjects.length === 0) return
    const user = createStudentProfile({
      name: name.trim() || '학생',
      schoolLevel,
      grade,
      selectedSubjects: subjects,
      learningGoal: goal ?? undefined,
    })
    setUser(user)
    navigate('/home')
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <div className="w-full max-w-[390px] min-h-screen flex flex-col">
        {step !== 'intro' && (
          <div className="px-6 pt-12 pb-2">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-1.5 bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col px-6 pb-8">
          {step === 'intro' && <IntroStep name={name} setName={setName} onNext={goNext} />}

          {step === 'schoolLevel' && (
            <StepShell title="현재 학교급을 알려주세요" subtitle="학년에 맞는 시험과 과목을 준비할게요">
              <div className="space-y-3 mt-6">
                {([
                  { id: 'middle', label: '중학생', icon: '🎒' },
                  { id: 'high', label: '고등학생', icon: '🎓' },
                ] as { id: SchoolLevel; label: string; icon: string }[]).map((opt) => (
                  <OptionCard
                    key={opt.id}
                    selected={schoolLevel === opt.id}
                    onClick={() => { setSchoolLevel(opt.id); setGrade(null); goNext() }}
                    icon={opt.icon}
                    label={opt.label}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 'grade' && schoolLevel && (
            <StepShell title="현재 몇 학년인가요?" subtitle={schoolLevel === 'middle' ? '중학교 학년을 선택해주세요' : '고등학교 학년을 선택해주세요'}>
              <div className="space-y-3 mt-6">
                {[1, 2, 3].map((g) => (
                  <OptionCard
                    key={g}
                    selected={grade === g}
                    onClick={() => { setGrade(g as Grade); setSubjects([]); goNext() }}
                    icon={<GraduationCap size={20} />}
                    label={`${schoolLevel === 'middle' ? '중학교' : '고등학교'} ${g}학년`}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 'subjects' && (
            <StepShell title="어떤 과목을 공부하고 싶나요?" subtitle="여러 개 선택할 수 있어요">
              <div className="grid grid-cols-2 gap-2.5 mt-6">
                {availableSubjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubject(s.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-2
                      ${subjects.includes(s.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
                  >
                    <span className="text-lg">{s.icon}</span>
                    <span className={`text-sm font-semibold ${subjects.includes(s.id) ? 'text-primary-600' : 'text-gray-700'}`}>{s.name}</span>
                    {subjects.includes(s.id) && <Check size={14} className="ml-auto text-primary-500" />}
                  </button>
                ))}
              </div>
              <div className="flex-1" />
              <Button fullWidth size="lg" className="mt-6" disabled={subjects.length === 0} onClick={goNext}>
                다음
              </Button>
            </StepShell>
          )}

          {step === 'goal' && (
            <StepShell title="학습 목표를 알려주세요" subtitle="목표에 맞춰 AI가 시험을 추천해요">
              <div className="space-y-3 mt-6">
                {GOALS.map((g) => (
                  <OptionCard
                    key={g.id}
                    selected={goal === g.id}
                    onClick={() => { setGoal(g.id); goNext() }}
                    icon={g.icon}
                    label={g.label}
                    desc={g.desc}
                  />
                ))}
              </div>
            </StepShell>
          )}

          {step === 'summary' && schoolLevel && grade && (
            <StepShell title="이렇게 시작할게요" subtitle="프로필은 마이페이지에서 언제든 바꿀 수 있어요">
              <div className="bg-white rounded-3xl p-5 mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-2xl">
                    {schoolLevel === 'middle' ? '🎒' : '🎓'}
                  </div>
                  <div>
                    <p className="font-black text-gray-900">{name.trim() || '학생'}</p>
                    <p className="text-sm text-gray-500">{schoolLevel === 'middle' ? '중학교' : '고등학교'} {grade}학년</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">관심 과목</p>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSubjects.filter((s) => subjects.includes(s.id)).map((s) => (
                      <span key={s.id} className="bg-primary-50 text-primary-600 text-xs font-semibold px-2.5 py-1 rounded-full">{s.name}</span>
                    ))}
                  </div>
                </div>
                {goal && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 mb-2">학습 목표</p>
                    <p className="text-sm font-semibold text-gray-800">{GOALS.find((g) => g.id === goal)?.label}</p>
                  </div>
                )}
              </div>
              <div className="flex-1" />
              <Button fullWidth size="lg" className="mt-6" onClick={handleFinish}>
                <Sparkles size={18} /> 시작하기
              </Button>
            </StepShell>
          )}
        </div>
      </div>
    </div>
  )
}

function IntroStep({ name, setName, onNext }: { name: string; setName: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col justify-center items-center text-center pt-12">
      <div className="text-6xl mb-6">🤖</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2 leading-tight">AI 모의고사 플랫폼<br />StudyAI</h1>
      <p className="text-sm text-gray-500 mb-8">시험을 볼수록 나에게 딱 맞는<br />다음 시험이 준비돼요</p>
      <div className="w-full">
        <label className="text-sm font-semibold text-gray-700 mb-1.5 block text-left">이름을 알려주세요</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 박인성"
          className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <Button fullWidth size="lg" className="mt-6" onClick={onNext}>
        다음
      </Button>
    </div>
  )
}

function StepShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col pt-8">
      <h1 className="text-xl font-black text-gray-900 leading-snug">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
      {children}
    </div>
  )
}

function OptionCard({
  selected, onClick, icon, label, desc,
}: {
  selected: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  desc?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all
        ${selected ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
    >
      <span className="text-xl w-8 flex justify-center">{icon}</span>
      <div className="flex-1">
        <p className={`font-bold text-sm ${selected ? 'text-primary-600' : 'text-gray-800'}`}>{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {selected && <Check size={18} className="text-primary-500" />}
    </button>
  )
}
