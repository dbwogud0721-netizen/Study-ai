import { useNavigate } from 'react-router-dom'
import { Sparkles, Target, BookOpen, ChevronRight } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { useAppStore } from '../hooks/useAppStore'
import { MOCK_CONCEPT_STRENGTHS } from '../data/mockExamHistory'
import { StudentUser } from '../types'

export default function AILearn() {
  const navigate = useNavigate()
  const { user } = useAppStore()
  const student = user as StudentUser
  const isMiddle = student.schoolLevel === 'middle'

  const weak = MOCK_CONCEPT_STRENGTHS.filter((c) => c.status === 'weak')

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="bg-white px-5 pt-12 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-primary-500" size={22} />
            <h1 className="text-2xl font-black text-gray-900">AI 맞춤학습</h1>
          </div>
          <p className="text-sm text-gray-500">내 데이터를 분석해 다음 시험을 추천해요</p>
        </div>

        <div className="mx-5 mt-3">
          <div className="bg-gradient-to-br from-violet-500 to-primary-600 rounded-card p-5 text-white">
            <p className="text-sm opacity-80 mb-2">AI 분석 결과</p>
            <p className="text-lg font-bold mb-3">지금 집중해야 할 개념</p>
            <div className="flex flex-wrap gap-2">
              {weak.map((c) => (
                <span key={c.concept} className="bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-xl">
                  {c.concept} {c.accuracy}%
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 mt-4 space-y-3">
          <h2 className="font-black text-gray-900">AI 학습 모드</h2>

          <button
            onClick={() => navigate('/exam/new?mode=weakness_ai')}
            className="w-full bg-white rounded-card p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 bg-red-50 rounded-chip flex items-center justify-center">
              <Target className="text-red-500" size={24} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold text-gray-900">{isMiddle ? 'AI 취약점 테스트' : 'AI 취약점 모의고사'}</p>
                <span className="text-xs bg-red-100 text-red-500 font-semibold px-2 py-0.5 rounded-full">추천</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">정답률 낮은 개념 집중 출제</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>

          <button
            onClick={() => navigate(`/exam/new?mode=${isMiddle ? 'unit_focus' : 'school_prep'}`)}
            className="w-full bg-white rounded-card p-4 flex items-center gap-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-chip flex items-center justify-center">
              <BookOpen className="text-blue-500" size={24} />
            </div>
            <div className="flex-1 text-left">
              <p className="font-bold text-gray-900">개념별 집중학습</p>
              <p className="text-xs text-gray-500 mt-0.5">특정 단원만 골라 훈련</p>
            </div>
            <ChevronRight size={18} className="text-gray-300" />
          </button>
        </div>

        <div className="px-5 mt-5">
          <h2 className="font-black text-gray-900 mb-3">개념별 현황</h2>
          <div className="bg-white rounded-card p-4 space-y-3">
            {MOCK_CONCEPT_STRENGTHS.map((c) => (
              <div key={c.concept} className="flex items-center gap-3">
                <span className={`w-1.5 h-6 rounded-full flex-shrink-0 ${c.status === 'strong' ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="flex-1 text-sm font-medium text-gray-700">{c.concept}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full">
                    <div
                      className={`h-1.5 rounded-full ${c.status === 'strong' ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${c.accuracy}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold w-8 text-right ${c.status === 'strong' ? 'text-green-500' : 'text-red-400'}`}>
                    {c.accuracy}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </MobileLayout>
  )
}
