import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, User, Shield, Bell, HelpCircle, BookOpen, Sparkles } from 'lucide-react'
import { MobileLayout } from '../components/layout/MobileLayout'
import { BottomNav } from '../components/layout/BottomNav'
import { AdBanner } from '../components/ads/AdBanner'
import { useAppStore } from '../hooks/useAppStore'
import { logout } from '../services/authService'
import { getWallet } from '../services/tokenService'
import { StudentUser } from '../types'
import { MOCK_SUBJECT_STATS } from '../data/mockExamHistory'

export default function MyPage() {
  const navigate = useNavigate()
  const { user, setUser } = useAppStore()
  const student = user as StudentUser
  const wallet = getWallet(student.id)

  const grade = student?.schoolLevel === 'middle' ? `중학교 ${student.grade}학년` : `고등학교 ${student.grade}학년`
  const avgScore = 82

  const handleLogout = () => {
    logout()
    setUser(null)
    navigate('/login')
  }

  return (
    <MobileLayout>
      <div className="flex-1 overflow-y-auto pb-24">
        {/* 프로필 */}
        <div className="bg-white px-5 pt-12 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-3xl">
              🎓
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">{student?.name}</h1>
              <p className="text-sm text-gray-500">{grade}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-primary-100 text-primary-600 font-semibold px-2 py-0.5 rounded-full">
                  학생
                </span>
                <span className="text-xs text-gray-400">{student?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 학습 요약 */}
        <div className="px-5 mt-3">
          <div className="bg-gradient-to-r from-primary-500 to-violet-500 rounded-3xl p-4 text-white">
            <p className="text-sm opacity-80 mb-3">나의 학습 현황</p>
            <div className="grid grid-cols-3 divide-x divide-white/20 text-center">
              <div>
                <p className="text-2xl font-black">{avgScore}점</p>
                <p className="text-xs opacity-80 mt-1">평균 점수</p>
              </div>
              <div>
                <p className="text-2xl font-black">{student?.streak ?? 7}일</p>
                <p className="text-xs opacity-80 mt-1">연속 학습</p>
              </div>
              <div>
                <p className="text-2xl font-black">{wallet.balance}</p>
                <p className="text-xs opacity-80 mt-1">보유 Reward</p>
              </div>
            </div>
          </div>
        </div>

        {/* 관심 과목 */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-3xl p-4">
            <h3 className="font-bold text-gray-900 mb-3">학습 과목</h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_SUBJECT_STATS.map((s) => (
                <div key={s.subject} className="flex items-center gap-1.5 bg-gray-50 px-3 py-2 rounded-2xl">
                  <span className="text-sm">
                    {s.subject === '수학' ? '📐' : s.subject === '과학' ? '🔬' : s.subject === '영어' ? '🌎' : '📖'}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{s.subject}</span>
                  <span className="text-xs text-gray-400">{s.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-3xl overflow-hidden">
            <MenuItem icon={<User size={18} />} label="프로필 수정" onClick={() => navigate('/my/profile')} />
            <MenuItem icon={<BookOpen size={18} />} label="학습 설정" onClick={() => navigate('/my/settings')} />
            <MenuItem icon={<Bell size={18} />} label="알림 설정" onClick={() => navigate('/my/notifications')} />
            <MenuItem icon={<Shield size={18} />} label="보호자 연결" onClick={() => navigate('/my/parent-link')} />
            <MenuItem icon={<HelpCircle size={18} />} label="도움말" onClick={() => navigate('/my/help')} />
            <MenuItem icon={<Sparkles size={18} />} label="AI 문제 생성" onClick={() => navigate('/problem-maker')} />
          </div>
        </div>

        <div className="px-5 mt-3">
          <div className="bg-white rounded-3xl overflow-hidden">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-4 text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span className="font-semibold">로그아웃</span>
            </button>
          </div>
        </div>

        <div className="px-5 mt-4">
          <AdBanner slot="my" />
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 mb-4">StudyAI v0.1.0 · MVP</p>
      </div>
      <BottomNav />
    </MobileLayout>
  )
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
    >
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1 text-sm font-semibold text-gray-700 text-left">{label}</span>
      <ChevronRight size={16} className="text-gray-300" />
    </button>
  )
}
