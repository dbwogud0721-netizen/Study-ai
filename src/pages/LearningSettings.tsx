import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { PageHeader } from '../components/layout/PageHeader'
import { Button } from '../components/ui/Button'
import { useAppStore } from '../hooks/useAppStore'
import { getCurriculumSubjects } from '../config/curriculumConfig'
import { updateLearningSettings } from '../services/authService'
import { StudentUser, SchoolLevel, Grade } from '../types'

export default function LearningSettings() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const student = user as StudentUser

  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>(student.schoolLevel)
  const [grade, setGrade] = useState<Grade>(student.grade)
  const [subjects, setSubjects] = useState<string[]>(
    schoolLevel === student.schoolLevel && grade === student.grade ? student.selectedSubjects : []
  )
  const [saved, setSaved] = useState(false)

  const availableSubjects = useMemo(() => getCurriculumSubjects(schoolLevel, grade), [schoolLevel, grade])
  const changed = schoolLevel !== student.schoolLevel || grade !== student.grade

  const changeSchoolLevel = (level: SchoolLevel) => {
    setSchoolLevel(level)
    setGrade(1)
    setSubjects(level === student.schoolLevel && student.grade === 1 ? student.selectedSubjects : [])
  }

  const changeGrade = (g: Grade) => {
    setGrade(g)
    setSubjects(schoolLevel === student.schoolLevel && g === student.grade ? student.selectedSubjects : [])
  }

  const toggleSubject = (id: string) => {
    setSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]))
  }

  const handleSave = () => {
    const updated = updateLearningSettings(student, { schoolLevel, grade, selectedSubjects: subjects })
    setUser(updated)
    setSaved(true)
    setTimeout(() => navigate('/my'), 700)
  }

  return (
    <MobileLayout>
      <PageHeader title="학습 설정" subtitle="학년이 바뀌면 시험·과목 범위도 새 학년 기준으로 바뀌어요" />

      <div className="flex-1 px-5 overflow-y-auto pb-8 space-y-6">
        {changed && (
          <div className="bg-amber-50 text-amber-700 text-xs font-semibold rounded-2xl px-4 py-3">
            {student.schoolLevel === 'middle' ? '중학교' : '고등학교'} {student.grade}학년 → {schoolLevel === 'middle' ? '중학교' : '고등학교'} {grade}학년으로 바뀌어요. 저장하면 바로 적용돼요.
          </div>
        )}

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">학교급</h2>
          <div className="grid grid-cols-2 gap-2.5">
            {([{ id: 'middle', label: '중학생', icon: '🎒' }, { id: 'high', label: '고등학생', icon: '🎓' }] as { id: SchoolLevel; label: string; icon: string }[]).map((opt) => (
              <button
                key={opt.id}
                onClick={() => changeSchoolLevel(opt.id)}
                className={`p-4 rounded-card border-2 font-bold text-sm flex items-center gap-2 justify-center transition-all
                  ${schoolLevel === opt.id ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
              >
                <span className="text-lg">{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-3">학년</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3].map((g) => (
              <button
                key={g}
                onClick={() => changeGrade(g as Grade)}
                className={`py-3.5 rounded-card border-2 font-bold text-sm transition-all
                  ${grade === g ? 'border-primary-500 bg-primary-50 text-primary-600' : 'border-gray-100 bg-white text-gray-700'}`}
              >
                {g}학년
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-1">관심 과목</h2>
          <p className="text-xs text-gray-400 mb-3">여러 개 선택할 수 있어요</p>
          <div className="grid grid-cols-2 gap-2.5">
            {availableSubjects.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSubject(s.id)}
                className={`p-3.5 rounded-card border-2 text-left transition-all flex items-center gap-2
                  ${subjects.includes(s.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white'}`}
              >
                <span className="text-lg">{s.icon}</span>
                <span className={`text-sm font-semibold ${subjects.includes(s.id) ? 'text-primary-600' : 'text-gray-700'}`}>{s.name}</span>
                {subjects.includes(s.id) && <Check size={14} className="ml-auto text-primary-500" />}
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth size="lg" disabled={subjects.length === 0} onClick={handleSave}>
          {saved ? '저장됐어요 ✓' : '저장하기'}
        </Button>
      </div>
    </MobileLayout>
  )
}
