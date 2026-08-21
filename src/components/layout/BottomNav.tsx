import { useNavigate, useLocation } from 'react-router-dom'
import { Home, BookOpen, Sparkles, BarChart2, Coins, User } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/home', label: '홈', icon: Home },
  { path: '/exam/new', label: '시험', icon: BookOpen },
  { path: '/ai-learn', label: 'AI 학습', icon: Sparkles },
  { path: '/grades', label: '성적', icon: BarChart2 },
  { path: '/tokens', label: '토큰', icon: Coins },
  { path: '/my', label: 'MY', icon: User },
]

export function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 flex z-40">
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-2 pt-3 gap-1 transition-colors ${
              active ? 'text-primary-500' : 'text-gray-400'
            }`}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className={`text-[10px] font-semibold ${active ? 'text-primary-500' : 'text-gray-400'}`}>
              {label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
